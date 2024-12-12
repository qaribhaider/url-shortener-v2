import { Test, TestingModule } from '@nestjs/testing';
import { ShortenerProducer } from './shortener.producer';
import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';
import { URL_PROCESSING_QUEUE, UrlProcessingJob } from './shortener.types';

describe('ShortenerProducer', () => {
  let producer: ShortenerProducer;
  let mockQueue: jest.Mocked<Queue<UrlProcessingJob>>;

  beforeEach(async () => {
    // Create a mock Queue
    mockQueue = {
      add: jest.fn(),
    } as unknown as jest.Mocked<Queue<UrlProcessingJob>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortenerProducer,
        {
          provide: getQueueToken(URL_PROCESSING_QUEUE),
          useValue: mockQueue,
        },
      ],
    }).compile();

    producer = module.get<ShortenerProducer>(ShortenerProducer);
  });

  it('should be defined', () => {
    expect(producer).toBeDefined();
  });

  it('should add a job to the queue with correct options', async () => {
    const mockJobData: UrlProcessingJob = {
      shortCode: 'abc123',
      originalUrl: 'https://example.com',
      timestamp: new Date().toISOString(),
    };
    const mockJobOptions = {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    };

    await producer.addUrlProcessingJob(mockJobData);

    expect(mockQueue.add).toHaveBeenCalledWith(mockJobData, mockJobOptions);
  });

  it('should throw an error if adding a job fails', async () => {
    const mockJobData: UrlProcessingJob = {
      shortCode: 'abc123',
      originalUrl: 'https://example.com',
      timestamp: new Date().toISOString(),
    };
    const error = new Error('Queue failure');
    mockQueue.add.mockRejectedValueOnce(error);

    await expect(producer.addUrlProcessingJob(mockJobData)).rejects.toThrow('Queue failure');
  });
});
