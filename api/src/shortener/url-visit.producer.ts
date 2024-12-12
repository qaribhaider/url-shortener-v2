import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export const URL_VISIT_QUEUE = 'url-visit';

@Injectable()
export class UrlVisitProducer {
  constructor(@InjectQueue(URL_VISIT_QUEUE) private readonly urlVisitQueue: Queue) {}

  async addUrlVisitJob(shortCode: string) {
    await this.urlVisitQueue.add(
      'process-visit',
      {
        shortCode,
        visitedAt: new Date().toISOString(),
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );
  }
}
