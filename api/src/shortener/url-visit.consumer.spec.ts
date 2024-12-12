import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UrlVisitConsumer } from './url-visit.consumer';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Model } from 'mongoose';
import { Url } from './schemas/url.schema';

describe('UrlVisitConsumer', () => {
  let consumer: UrlVisitConsumer;
  let urlModel: Model<Url>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlVisitConsumer,
        {
          provide: getModelToken(Url.name),
          useValue: {
            updateOne: jest.fn(),
          },
        },
      ],
    }).compile();

    consumer = module.get<UrlVisitConsumer>(UrlVisitConsumer);
    urlModel = module.get<Model<Url>>(getModelToken(Url.name));

    // Suppress Logger error logs during tests
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  describe('processVisit', () => {
    it('should process the visit successfully and increment visits count', async () => {
      const mockJob = {
        data: {
          shortCode: 'abc123',
          visitedAt: new Date().toISOString(),
        },
      } as Job<{ shortCode: string; visitedAt: string }>;

      jest.spyOn(urlModel, 'updateOne').mockResolvedValue({ modifiedCount: 1 } as any);

      await consumer.processVisit(mockJob);

      expect(urlModel.updateOne).toHaveBeenCalledWith({ shortCode: mockJob.data.shortCode }, { $inc: { visits: 1 } });
      // You can also spy on the logger if you want to ensure a successful log was written
    });

    it('should log a warning if the short code does not exist in the database', async () => {
      const mockJob = {
        data: {
          shortCode: 'nonexistent',
          visitedAt: new Date().toISOString(),
        },
      } as Job<{ shortCode: string; visitedAt: string }>;

      jest.spyOn(urlModel, 'updateOne').mockResolvedValue({ modifiedCount: 0 } as any);
      const loggerSpy = jest.spyOn(Logger.prototype, 'warn');

      await consumer.processVisit(mockJob);

      expect(urlModel.updateOne).toHaveBeenCalledWith({ shortCode: mockJob.data.shortCode }, { $inc: { visits: 1 } });
      expect(loggerSpy).toHaveBeenCalledWith(`URL not found for visit processing: ${mockJob.data.shortCode}`);
    });

    it('should log an error and rethrow if an exception occurs', async () => {
      const mockJob = {
        data: {
          shortCode: 'abc123',
          visitedAt: new Date().toISOString(),
        },
      } as Job<{ shortCode: string; visitedAt: string }>;

      const mockError = new Error('Database error');
      jest.spyOn(urlModel, 'updateOne').mockRejectedValue(mockError);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(consumer.processVisit(mockJob)).rejects.toThrow(mockError);

      expect(urlModel.updateOne).toHaveBeenCalledWith({ shortCode: mockJob.data.shortCode }, { $inc: { visits: 1 } });
      expect(loggerSpy).toHaveBeenCalledWith(`Error processing URL visit: ${mockJob.data.shortCode}`, mockError.stack);
    });
  });
});
