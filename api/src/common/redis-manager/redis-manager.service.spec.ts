import { Test, TestingModule } from '@nestjs/testing';
import { RedisManagerService } from './redis-manager.service';
import { ConfigService } from '@nestjs/config';
import { mockConfig } from '../config/mock.config';

// Create a mock Redis class
class RedisMock {
  private store: Map<string, string> = new Map();

  async get(key: string) {
    return this.store.get(key) || null;
  }

  async set(key: string, value: string) {
    this.store.set(key, value);
    return 'OK';
  }

  async setex(key: string, ttl: number, value: string) {
    this.store.set(key, value);
    return 'OK';
  }

  async del(key: string) {
    this.store.delete(key);
    return 1;
  }

  async ttl(key: string) {
    return this.store.has(key) ? 1000 : -2;
  }

  async exists(key: string) {
    return this.store.has(key) ? 1 : 0;
  }

  async ping() {
    return 'PONG';
  }

  async quit() {
    this.store.clear();
    return 'OK';
  }
}

// Mock ioredis
jest.mock('ioredis', () => {
  return {
    default: jest.fn().mockImplementation(() => new RedisMock()),
  };
});

describe('RedisManagerService', () => {
  let service: RedisManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisManagerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'redis') {
                return mockConfig.redis;
              }
              return mockConfig[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RedisManagerService>(RedisManagerService);

    // Initialize the module
    await service.onModuleInit();
  });

  afterEach(async () => {
    if (service) {
      await service.onModuleDestroy();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Cache Operations', () => {
    it('should set and get a value', async () => {
      const key = 'test-key';
      const value = 'test-value';

      await service.set(key, value);
      const result = await service.get(key);

      expect(result).toBe(value);
    });

    it('should set a value with TTL', async () => {
      const key = 'test-key-ttl';
      const value = 'test-value';
      const ttl = 60;

      await service.set(key, value, ttl);
      const remainingTtl = await service.ttl(key);

      expect(remainingTtl).toBeGreaterThan(0);
    });

    it('should delete a value', async () => {
      const key = 'test-key-del';
      const value = 'test-value';

      await service.set(key, value);
      await service.del(key);
      const result = await service.get(key);

      expect(result).toBeNull();
    });

    it('should check if a key exists', async () => {
      const key = 'test-key-exists';
      const value = 'test-value';

      await service.set(key, value);
      const exists = await service.exists(key);

      expect(exists).toBe(true);
    });
  });

  describe('Redis Client', () => {
    it('should provide access to Redis client', () => {
      const client = service.getClient();
      expect(client).toBeDefined();
      expect(client instanceof RedisMock).toBe(true);
    });
  });
});
