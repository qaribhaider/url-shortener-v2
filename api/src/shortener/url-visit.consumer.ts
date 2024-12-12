import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Url, UrlDocument } from './schemas/url.schema';
import { URL_VISIT_QUEUE } from './url-visit.producer';

@Processor(URL_VISIT_QUEUE)
export class UrlVisitConsumer {
  private readonly logger = new Logger(UrlVisitConsumer.name);

  constructor(@InjectModel(Url.name) private urlModel: Model<UrlDocument>) {}

  @Process('process-visit')
  async processVisit(job: Job<{ shortCode: string; visitedAt: string }>) {
    const { shortCode, visitedAt } = job.data;
    this.logger.debug(`Processing URL visit - Short Code: ${shortCode} - Visited At: ${visitedAt}`);

    try {
      // Increment the visits counter for the URL
      const result = await this.urlModel.updateOne(
        { shortCode },
        {
          $inc: { visits: 1 },
        },
      );

      if (result.modifiedCount === 0) {
        this.logger.warn(`URL not found for visit processing: ${shortCode}`);
        return;
      }

      this.logger.debug(`Visit processed successfully for URL: ${shortCode}`);
    } catch (error) {
      this.logger.error(`Error processing URL visit: ${shortCode}`, error.stack);
      throw error;
    }
  }
}
