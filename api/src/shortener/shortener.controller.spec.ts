import { Test, TestingModule } from '@nestjs/testing';
import { ShortenerController } from './shortener.controller';
import { ShortenerService } from './shortener.service';
import { PaginatedUrlsResponse } from './shortener.service';
import { ShortenUrlDto } from './dto/shorten-url.dto';
import { GetUrlsDto } from './dto/get-urls.dto';

describe('ShortenerController', () => {
  let controller: ShortenerController;
  let service: ShortenerService;

  beforeEach(async () => {
    const mockShortenerService = {
      shortenUrl: jest.fn(),
      getUrls: jest.fn(),
      getOriginalUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortenerController],
      providers: [
        {
          provide: ShortenerService,
          useValue: mockShortenerService,
        },
      ],
    }).compile();

    controller = module.get<ShortenerController>(ShortenerController);
    service = module.get<ShortenerService>(ShortenerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('shortenUrl', () => {
    it('should return a shortened URL code', async () => {
      const mockShortenUrlDto: ShortenUrlDto = { url: 'https://example.com' };
      const mockShortCode = 'abc123';

      jest.spyOn(service, 'shortenUrl').mockResolvedValue(mockShortCode);

      const result = await controller.shortenUrl(mockShortenUrlDto);

      expect(result).toEqual({ shortCode: mockShortCode });
      expect(service.shortenUrl).toHaveBeenCalledWith(mockShortenUrlDto.url);
    });
  });

  describe('getUrls', () => {
    it('should return a paginated list of URLs', async () => {
      const mockGetUrlsDto: GetUrlsDto = { page: 1, limit: 10 };
      const mockPaginatedUrlsResponse: PaginatedUrlsResponse = {
        urls: [
          {
            shortCode: 'abc123',
            originalUrl: 'https://example.com',
            visits: 0, // Default value for visits
            createdAt: new Date(), // Default value for createdAt
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          pages: 1,
        },
      };

      jest.spyOn(service, 'getUrls').mockResolvedValue(mockPaginatedUrlsResponse);

      const result = await controller.getUrls(mockGetUrlsDto);

      expect(result).toEqual(mockPaginatedUrlsResponse);
      expect(service.getUrls).toHaveBeenCalledWith(mockGetUrlsDto);
    });
  });

  describe('getOriginalUrl', () => {
    it('should return the original URL for the given short code', async () => {
      const mockCode = 'abc123';
      const mockOriginalUrl = 'https://example.com';

      jest.spyOn(service, 'getOriginalUrl').mockResolvedValue(mockOriginalUrl);

      const result = await controller.getOriginalUrl(mockCode);

      expect(result).toEqual({ originalUrl: mockOriginalUrl });
      expect(service.getOriginalUrl).toHaveBeenCalledWith(mockCode);
    });

    it('should throw an error if the short code is not found', async () => {
      const mockCode = 'nonexistent';
      jest.spyOn(service, 'getOriginalUrl').mockResolvedValue(null);

      await expect(controller.getOriginalUrl(mockCode)).rejects.toThrowError('Short code not found');
    });
  });
});
