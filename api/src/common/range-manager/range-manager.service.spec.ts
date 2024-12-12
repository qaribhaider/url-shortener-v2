import { Test, TestingModule } from '@nestjs/testing';
import { RangeManagerService } from './range-manager.service';
import { KeyValStoreService } from '../key-val-store/key-val-store.service';
import { Logger } from 'nestjs-pino';

describe('RangeManagerService', () => {
  let service: RangeManagerService;
  let keyValStore: jest.Mocked<KeyValStoreService>;
  let logger: jest.Mocked<Logger>;

  beforeEach(async () => {
    const keyValStoreMock = {
      get: jest.fn(),
      put: jest.fn(),
    };

    const loggerMock = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RangeManagerService,
        {
          provide: KeyValStoreService,
          useValue: keyValStoreMock,
        },
        {
          provide: Logger,
          useValue: loggerMock,
        },
      ],
    }).compile();

    service = module.get<RangeManagerService>(RangeManagerService);
    keyValStore = module.get(KeyValStoreService);
    logger = module.get(Logger);
  });

  it('should allocate initial range on module init', async () => {
    keyValStore.get.mockResolvedValue(null);
    await service.onModuleInit();

    expect(keyValStore.get).toHaveBeenCalledWith('url_range_max');
    expect(keyValStore.put).toHaveBeenCalledWith('url_range_max', '11000');
    expect(logger.log).toHaveBeenCalledWith({
      message: 'Allocated new range for URL shortening',
      currentMin: 10001,
      currentMax: 11000,
      rangeSize: 1000,
    });
  });

  it('should allocate next range when current range is exhausted', async () => {
    keyValStore.get.mockResolvedValueOnce('1000');
    await service.onModuleInit();

    keyValStore.get.mockResolvedValueOnce('1000');
    const nextNumber = await service.getNextNumber();
    expect(nextNumber).toBe(1001);
    expect(keyValStore.put).toHaveBeenCalledWith('url_range_max', '2000');
    expect(logger.log).toHaveBeenCalledWith({
      message: 'Allocated new range for URL shortening',
      currentMin: 1001,
      currentMax: 2000,
      rangeSize: 1000,
    });
  });

  it('should return healthy status when counter is within range', async () => {
    keyValStore.get.mockResolvedValue('1000');
    await service.onModuleInit();

    expect(service.isHealthy()).toBe(true);
  });

  it('should return current range', async () => {
    keyValStore.get.mockResolvedValue('1000');
    await service.onModuleInit();

    const range = service.getCurrentRange();
    expect(range).toEqual({ min: 1001, max: 2000 });
  });
});
