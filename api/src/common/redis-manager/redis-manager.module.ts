import { Module } from '@nestjs/common';
import { RedisManagerService } from './redis-manager.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { AppConfig } from '../config/environment.config';

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const redisConfig = configService.get('redis', { infer: true });
        return {
          redis: {
            host: redisConfig.host,
            port: redisConfig.port,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [RedisManagerService],
  exports: [RedisManagerService, BullModule],
})
export class RedisManagerModule {}
