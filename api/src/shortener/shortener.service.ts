import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RandomizerService } from '../common/randomizer/randomizer.service';
import { ShortenerProducer } from './shortener.producer';
import { UrlVisitProducer } from './url-visit.producer';
import { RedisManagerService } from '../common/redis-manager/redis-manager.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Url, UrlDocument } from './schemas/url.schema';
import { GetUrlsDto, SortOrder } from './dto/get-urls.dto';

export interface PaginatedUrlsResponse {
  urls: Url[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

@Injectable()
export class ShortenerService {
  private readonly logger = new Logger(ShortenerService.name);

  constructor(
    private readonly randomizerService: RandomizerService,
    private readonly shortenerProducer: ShortenerProducer,
    private readonly urlVisitProducer: UrlVisitProducer,
    private readonly redisManagerService: RedisManagerService,
    @InjectModel(Url.name) private urlModel: Model<UrlDocument>,
  ) {}

  async getOriginalUrl(shortCode: string): Promise<string> {
    // Try to get from cache first
    const cachedUrl = await this.redisManagerService.get(`url:${shortCode}`);
    if (cachedUrl) {
      // Queue visit tracking asynchronously
      await this.urlVisitProducer.addUrlVisitJob(shortCode);
      this.logger.debug(`Cache hit for shortCode: ${shortCode}`);
      return cachedUrl;
    }

    // If not in cache, try database
    this.logger.debug(`Cache miss for shortCode: ${shortCode}, checking database`);
    const urlDoc = await this.urlModel.findOne({ shortCode }).exec();
    if (!urlDoc) {
      throw new NotFoundException(`URL not found for code: ${shortCode}`);
    }

    // Add back to cache
    await this.redisManagerService.set(
      `url:${shortCode}`,
      urlDoc.originalUrl,
      365 * 24 * 60 * 60, // Cache for 365 days
    );

    // Queue visit tracking asynchronously
    await this.urlVisitProducer.addUrlVisitJob(shortCode);

    return urlDoc.originalUrl;
  }

  async findExistingUrl(originalUrl: string): Promise<string | null> {
    const existingUrl = await this.urlModel.findOne({ originalUrl }).exec();
    return existingUrl?.shortCode || null;
  }

  async shortenUrl(originalUrl: string): Promise<string> {
    // Check if URL already exists
    const existingShortCode = await this.findExistingUrl(originalUrl);
    if (existingShortCode) {
      this.logger.debug(`URL already exists with shortCode: ${existingShortCode}`);
      return existingShortCode;
    }

    const shortCode = await this.randomizerService.generateShortString();

    try {
      // First, store in Redis for immediate availability
      await this.redisManagerService.set(
        `url:${shortCode}`,
        originalUrl,
        365 * 24 * 60 * 60, // Cache for 365 days
      );

      // Then queue for DB persistence
      await this.shortenerProducer.addUrlProcessingJob({
        shortCode,
        originalUrl,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`URL shortened: ${originalUrl} -> ${shortCode} (cached and queued)`);

      return shortCode;
    } catch (error) {
      this.logger.error(`Error shortening URL: ${originalUrl}`, error.stack);
      throw error;
    }
  }

  async getUrls(dto: GetUrlsDto): Promise<PaginatedUrlsResponse> {
    const { startDate, endDate, sortBy, sortOrder, page = 1, limit = 10 } = dto;

    const query = this.urlModel.find();

    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      query.where('createdAt', dateFilter);
    }

    const sortOptions: any = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === SortOrder.DESC ? -1 : 1;
    } else {
      sortOptions.createdAt = -1; // Default sort by createdAt desc
    }

    const skip = (page - 1) * limit;

    const [urls, total] = await Promise.all([
      query.sort(sortOptions).skip(skip).limit(limit).lean().exec(),
      this.urlModel.countDocuments(query.getQuery()),
    ]);

    return {
      urls,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
