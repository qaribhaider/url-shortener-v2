import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { RedisManagerService } from '../common/redis-manager/redis-manager.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redisManager: RedisManagerService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Try to set and get a test value
      const testKey = 'health-check';
      await this.redisManager.set(testKey, 'ok', 5); // 5 seconds TTL
      const value = await this.redisManager.get(testKey);

      if (value !== 'ok') {
        throw new Error('Redis read/write test failed');
      }

      return this.getStatus(key, true);
    } catch (e) {
      return this.getStatus(key, false, { message: e.message });
    }
  }
}
