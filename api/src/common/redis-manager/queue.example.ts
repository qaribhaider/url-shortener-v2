import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

// Example queue implementation
export const URL_PROCESSING_QUEUE = 'url-processing';

interface UrlProcessingJob {
  url: string;
  userId: string;
}

@Injectable()
export class UrlProcessingProducer {
  constructor(
    @InjectQueue(URL_PROCESSING_QUEUE)
    private urlQueue: Queue<UrlProcessingJob>,
  ) {}

  async addUrl(data: UrlProcessingJob) {
    return this.urlQueue.add(data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }
}

// Example consumer implementation
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor(URL_PROCESSING_QUEUE)
export class UrlProcessingConsumer {
  @Process()
  async process(job: Job<UrlProcessingJob>) {
    const { url, userId } = job.data;
    // Process the URL here
    console.log(`Processing URL ${url} for user ${userId}`);
    return { processed: true };
  }
}
