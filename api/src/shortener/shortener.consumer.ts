import { Injectable } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { URL_PROCESSING_QUEUE, UrlProcessingJob } from './shortener.types';
import { Logger } from 'nestjs-pino';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Url, UrlDocument } from './schemas/url.schema';

@Injectable()
@Processor(URL_PROCESSING_QUEUE)
export class ShortenerConsumer {
  constructor(
    private readonly logger: Logger,
    @InjectModel(Url.name) private urlModel: Model<UrlDocument>,
  ) {}

  @Process()
  async processUrl(job: Job<UrlProcessingJob>) {
    const { shortCode, originalUrl } = job.data;

    this.logger.log(
      `Processing URL shortening - Short Code: ${shortCode} - Original URL: ${originalUrl} - Job ID: ${job.id}`,
    );

    try {
      // Save to MongoDB
      await this.urlModel.create({
        shortCode,
        originalUrl,
        createdAt: new Date(),
      });

      this.logger.log(`Successfully shortened URL - Short Code: ${shortCode} - Job ID: ${job.id}`);
    } catch (error) {
      this.logger.error(`Failed to process URL - Short Code: ${shortCode} - Error: ${error.message}`);
      throw error;
    }
  }
}
