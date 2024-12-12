import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { URL_PROCESSING_QUEUE, UrlProcessingJob } from './shortener.types';

@Injectable()
export class ShortenerProducer {
  constructor(
    @InjectQueue(URL_PROCESSING_QUEUE)
    private urlQueue: Queue<UrlProcessingJob>,
  ) {}

  async addUrlProcessingJob(data: UrlProcessingJob) {
    return this.urlQueue.add(data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }
}
