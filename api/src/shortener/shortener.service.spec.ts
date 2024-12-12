import { Test, TestingModule } from '@nestjs/testing';
import { ShortenerService } from './shortener.service';
import { RandomizerService } from '../common/randomizer/randomizer.service';
import { ShortenerProducer } from './shortener.producer';
import { UrlVisitProducer } from './url-visit.producer';
import { RedisManagerService } from '../common/redis-manager/redis-manager.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Url } from './schemas/url.schema';
import { NotFoundException } from '@nestjs/common';

describe('ShortenerService', () => {
  let service: ShortenerService;
  let redisManagerService: RedisManagerService;
  let urlVisitProducer: UrlVisitProducer;
  let urlModel: Model<Url>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortenerService,
        {
          provide: RandomizerService,
          useValue: { generateShortString: jest.fn() },
        },
        {
          provide: ShortenerProducer,
          useValue: { addUrlProcessingJob: jest.fn() },
        },
        {
          provide: UrlVisitProducer,
          useValue: { addUrlVisitJob: jest.fn() },
        },
        {
          provide: RedisManagerService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: getModelToken(Url.name),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              sort: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              lean: jest.fn().mockReturnThis(),
              exec: jest.fn(),
              getQuery: jest.fn().mockReturnValue({}),
            })),
            countDocuments: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ShortenerService>(ShortenerService);
    redisManagerService = module.get<RedisManagerService>(RedisManagerService);
    urlVisitProducer = module.get<UrlVisitProducer>(UrlVisitProducer);
    urlModel = module.get<Model<Url>>(getModelToken(Url.name));
  });

  describe('getOriginalUrl', () => {
    it('should return URL from cache if found', async () => {
      const shortCode = 'abc123';
      const cachedUrl = 'https://example.com';
      jest.spyOn(redisManagerService, 'get').mockResolvedValue(cachedUrl);

      const result = await service.getOriginalUrl(shortCode);

      expect(redisManagerService.get).toHaveBeenCalledWith(`url:${shortCode}`);
      expect(result).toBe(cachedUrl);
      expect(urlVisitProducer.addUrlVisitJob).toHaveBeenCalledWith(shortCode);
    });

    it('should return URL from database and cache it if not found in cache', async () => {
      const shortCode = 'abc123';
      const originalUrl = 'https://example.com';
      jest.spyOn(redisManagerService, 'get').mockResolvedValue(null);
      jest.spyOn(urlModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ originalUrl }),
      } as any);
      jest.spyOn(redisManagerService, 'set').mockResolvedValue(null);

      const result = await service.getOriginalUrl(shortCode);

      expect(urlModel.findOne).toHaveBeenCalledWith({ shortCode });
      expect(redisManagerService.set).toHaveBeenCalledWith(`url:${shortCode}`, originalUrl, 365 * 24 * 60 * 60);
      expect(result).toBe(originalUrl);
    });

    it('should throw NotFoundException if short code does not exist', async () => {
      const shortCode = 'invalidCode';
      jest.spyOn(redisManagerService, 'get').mockResolvedValue(null);
      jest.spyOn(urlModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.getOriginalUrl(shortCode)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUrls', () => {
    it('should return paginated results', async () => {
      const mockUrls = [{ shortCode: 'abc123', originalUrl: 'https://example.com' }];
      jest.spyOn(urlModel, 'find').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUrls),
        getQuery: jest.fn().mockReturnValue({}),
      } as any);
      jest.spyOn(urlModel, 'countDocuments').mockResolvedValue(1);

      const dto = { page: 1, limit: 10 } as any;
      const result = await service.getUrls(dto);

      expect(result.urls).toEqual(mockUrls);
      expect(result.pagination.total).toBe(1);
    });
  });
});
