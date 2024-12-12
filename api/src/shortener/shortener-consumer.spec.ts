import { Test, TestingModule } from '@nestjs/testing';
import { ShortenerConsumer } from './shortener.consumer';
import { getModelToken } from '@nestjs/mongoose';
import { Url } from './schemas/url.schema';
import { Model } from 'mongoose';
import { Job } from 'bull';
import { Logger } from 'nestjs-pino';

describe('ShortenerConsumer', () => {
  let consumer: ShortenerConsumer;
  let logger: Logger;
  let urlModel: Model<Url>;

  beforeEach(async () => {
    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
    };

    const mockUrlModel = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortenerConsumer,
        {
          provide: Logger,
          useValue: mockLogger,
        },
        {
          provide: getModelToken(Url.name),
          useValue: mockUrlModel,
        },
      ],
    }).compile();

    consumer = module.get<ShortenerConsumer>(ShortenerConsumer);
    logger = module.get<Logger>(Logger);
    urlModel = module.get<Model<Url>>(getModelToken(Url.name));
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  describe('processUrl', () => {
    it('should log and save the URL successfully', async () => {
      const mockJob: Job = {
        data: { shortCode: 'abc123', originalUrl: 'https://example.com' },
        id: 'job-id-1',
      } as Job;

      jest.spyOn(urlModel, 'create').mockResolvedValueOnce({} as any);

      await expect(consumer.processUrl(mockJob)).resolves.not.toThrow();

      expect(logger.log).toHaveBeenCalledWith(
        `Processing URL shortening - Short Code: abc123 - Original URL: https://example.com - Job ID: job-id-1`,
      );
      expect(urlModel.create).toHaveBeenCalledWith({
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
        createdAt: expect.any(Date),
      });
      expect(logger.log).toHaveBeenCalledWith(`Successfully shortened URL - Short Code: abc123 - Job ID: job-id-1`);
    });

    it('should log and throw an error when saving fails', async () => {
      const mockJob: Job = {
        data: { shortCode: 'abc123', originalUrl: 'https://example.com' },
        id: 'job-id-1',
      } as Job;

      jest.spyOn(urlModel, 'create').mockRejectedValueOnce(new Error('Database error'));

      await expect(consumer.processUrl(mockJob)).rejects.toThrow('Database error');

      expect(logger.log).toHaveBeenCalledWith(
        `Processing URL shortening - Short Code: abc123 - Original URL: https://example.com - Job ID: job-id-1`,
      );
      expect(logger.error).toHaveBeenCalledWith(`Failed to process URL - Short Code: abc123 - Error: Database error`);
    });
  });
});
