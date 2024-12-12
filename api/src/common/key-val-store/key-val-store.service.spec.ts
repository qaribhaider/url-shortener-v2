import { Test, TestingModule } from '@nestjs/testing';
import { KeyValStoreService } from './key-val-store.service';
import { ConfigService } from '@nestjs/config';
import { mockConfig } from '../config/mock.config';

// Create mock implementation of etcd3
const mockEtcd = {
  maintenance: {
    status: jest.fn().mockResolvedValue({}),
  },
  get: jest.fn().mockReturnValue({
    string: jest.fn().mockResolvedValue('test-value'),
    number: jest.fn().mockResolvedValue(123),
  }),
  put: jest.fn().mockReturnValue({
    value: jest.fn().mockResolvedValue(undefined),
  }),
  delete: jest.fn().mockReturnValue({
    key: jest.fn().mockResolvedValue(undefined),
  }),
  close: jest.fn().mockResolvedValue({}),
};

jest.mock('etcd3', () => {
  return {
    Etcd3: jest.fn().mockImplementation(() => mockEtcd),
  };
});

describe('KeyValStoreService', () => {
  let service: KeyValStoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeyValStoreService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'etcd') {
                return mockConfig.etcd;
              }
              return mockConfig[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<KeyValStoreService>(KeyValStoreService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should check etcd connection on init', async () => {
      await service.onModuleInit();
      expect(mockEtcd.maintenance.status).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should get a value', async () => {
      const result = await service.get('test-key');
      expect(result).toBe('test-value');
      expect(mockEtcd.get).toHaveBeenCalledWith('test-key');
    });
  });

  describe('getNumber', () => {
    it('should get a number value', async () => {
      const result = await service.getNumber('test-key');
      expect(result).toBe(123);
      expect(mockEtcd.get).toHaveBeenCalledWith('test-key');
    });
  });

  describe('put', () => {
    it('should set a value', async () => {
      await service.put('test-key', 'test-value');
      expect(mockEtcd.put).toHaveBeenCalledWith('test-key');
      expect(mockEtcd.put().value).toHaveBeenCalledWith('test-value');
    });
  });

  describe('delete', () => {
    it('should delete a key', async () => {
      await service.delete('test-key');
      expect(mockEtcd.delete).toHaveBeenCalled();
      expect(mockEtcd.delete().key).toHaveBeenCalledWith('test-key');
    });
  });

  describe('onModuleDestroy', () => {
    it('should close etcd connection on destroy', async () => {
      await service.onModuleDestroy();
      expect(mockEtcd.close).toHaveBeenCalled();
    });
  });
});
