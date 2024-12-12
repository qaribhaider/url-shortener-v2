import { Test, TestingModule } from '@nestjs/testing';
import { RandomizerService } from './randomizer.service';
import { RangeManagerService } from '../range-manager/range-manager.service';

describe('RandomizerService', () => {
  let service: RandomizerService;
  let rangeManager: jest.Mocked<RangeManagerService>;

  beforeEach(async () => {
    const rangeManagerMock = {
      getNextNumber: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RandomizerService,
        {
          provide: RangeManagerService,
          useValue: rangeManagerMock,
        },
      ],
    }).compile();

    service = module.get<RandomizerService>(RandomizerService);
    rangeManager = module.get(RangeManagerService);
  });

  it('should generate base62 string for small numbers', async () => {
    rangeManager.getNextNumber.mockResolvedValue(1);
    const result = await service.generateShortString();
    expect(result).toBe('B');
    expect(rangeManager.getNextNumber).toHaveBeenCalled();
  });

  it('should generate different strings for different numbers', async () => {
    rangeManager.getNextNumber.mockResolvedValueOnce(100);
    rangeManager.getNextNumber.mockResolvedValueOnce(200);

    const result1 = await service.generateShortString();
    const result2 = await service.generateShortString();

    expect(result1).not.toBe(result2);
    expect(result1).toBe('Bm');
    expect(result2).toBe('DO');
    expect(rangeManager.getNextNumber).toHaveBeenCalledTimes(2);
  });

  it('should generate correct base62 string for large numbers', async () => {
    rangeManager.getNextNumber.mockResolvedValue(1000000);
    const result = await service.generateShortString();
    expect(result).toBe('EMJC');
    expect(rangeManager.getNextNumber).toHaveBeenCalled();
  });

  it('should generate strings using only base62 characters', async () => {
    rangeManager.getNextNumber.mockResolvedValue(12345);
    const result = await service.generateShortString();
    expect(result).toMatch(/^[A-Za-z0-9]+$/);
    expect(rangeManager.getNextNumber).toHaveBeenCalled();
  });

  it('should handle initial range starting from 10000', async () => {
    rangeManager.getNextNumber.mockResolvedValue(10000);
    const result = await service.generateShortString();
    expect(result).toBe('ClS');
    expect(result.length).toBe(3);
    expect(rangeManager.getNextNumber).toHaveBeenCalled();
  });
});
