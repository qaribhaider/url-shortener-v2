import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RedisManagerModule } from '../common/redis-manager/redis-manager.module';
import { RedisHealthIndicator } from './redis.health';
import { MongoHealthIndicator } from './mongo.health';
import { EtcdHealthIndicator } from './etcd.health';
import { RangeManagerHealthIndicator } from './range-manager.health';
import { RangeManagerModule } from '../common/range-manager/range-manager.module';
import { KeyValStoreModule } from '../common/key-val-store/key-val-store.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TerminusModule, HttpModule, RedisManagerModule, RangeManagerModule, KeyValStoreModule],
  controllers: [HealthController],
  providers: [EtcdHealthIndicator, RedisHealthIndicator, RangeManagerHealthIndicator, MongoHealthIndicator],
})
export class HealthModule {}
