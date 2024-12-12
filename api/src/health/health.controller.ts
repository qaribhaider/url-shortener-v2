import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health';
import { EtcdHealthIndicator } from './etcd.health';
import { RangeManagerHealthIndicator } from './range-manager.health';
import { MongoHealthIndicator } from './mongo.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private redisHealthIndicator: RedisHealthIndicator,
    private etcdHealthIndicator: EtcdHealthIndicator,
    private rangeManagerHealthIndicator: RangeManagerHealthIndicator,
    private mongoHealthIndicator: MongoHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.redisHealthIndicator.isHealthy('redis'),
      () => this.etcdHealthIndicator.isHealthy('etcd'),
      () => this.rangeManagerHealthIndicator.isHealthy('range_manager'),
      () => this.mongoHealthIndicator.isHealthy('mongodb'),
    ]);
  }
}
