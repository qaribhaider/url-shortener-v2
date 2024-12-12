import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/environment.config';

@Injectable()
export class RedisManagerService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisManagerService.name);

  constructor(private configService: ConfigService<AppConfig>) {
    const redisConfig = this.configService.get('redis', { infer: true });
    this.client = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      maxRetriesPerRequest: 3,
      lazyConnect: true, // This is important for testing
    });
  }

  async onModuleInit() {
    try {
      await this.client.ping();
      this.logger.log('Successfully connected to Redis');
    } catch (error) {
      this.logger.error(`Redis connection failed: ${error.message}`);
      throw new Error(`Redis connection failed: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  // Cache Operations
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  // Redis Client Access (for advanced operations)
  getClient(): Redis {
    return this.client;
  }
}
