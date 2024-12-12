import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import environmentConfig, { configValidationSchema } from './common/config/environment.config';
import { LoggerConfig } from './common/logger/logger.config';
import { TraceIdMiddleware } from './common/middleware/trace-id.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { KeyValStoreModule } from './common/key-val-store/key-val-store.module';
import { HealthModule } from './health/health.module';
import { ShortenerModule } from './shortener/shortener.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [environmentConfig],
      validationSchema: configValidationSchema,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('mongodbUri'),
        autoCreate: true,
        autoIndex: true,
      }),
      inject: [ConfigService],
    }),
    LoggerConfig,
    KeyValStoreModule,
    HealthModule,
    ShortenerModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceIdMiddleware).forRoutes('*');
  }
}
