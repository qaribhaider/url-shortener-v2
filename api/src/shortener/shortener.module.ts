import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { ShortenerController } from './shortener.controller';
import { ShortenerService } from './shortener.service';
import { ShortenerConsumer } from './shortener.consumer';
import { ShortenerProducer } from './shortener.producer';
import { UrlVisitProducer, URL_VISIT_QUEUE } from './url-visit.producer';
import { UrlVisitConsumer } from './url-visit.consumer';
import { Url, UrlSchema } from './schemas/url.schema';
import { RedisManagerModule } from '../common/redis-manager/redis-manager.module';
import { RandomizerModule } from '../common/randomizer/randomizer.module';
import { URL_PROCESSING_QUEUE } from './shortener.types';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Url.name, schema: UrlSchema }]),
    BullModule.registerQueue(
      {
        name: URL_PROCESSING_QUEUE,
      },
      {
        name: URL_VISIT_QUEUE,
      },
    ),
    RedisManagerModule,
    RandomizerModule,
  ],
  controllers: [ShortenerController],
  providers: [ShortenerService, ShortenerConsumer, ShortenerProducer, UrlVisitProducer, UrlVisitConsumer],
  exports: [MongooseModule, ShortenerService],
})
export class ShortenerModule {}
