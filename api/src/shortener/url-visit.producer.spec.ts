import { Test, TestingModule } from '@nestjs/testing';
import { UrlVisitProducer, URL_VISIT_QUEUE } from './url-visit.producer';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';

describe('UrlVisitProducer', () => {
  let producer: UrlVisitProducer;
  let queue: Queue;

  beforeEach(async () => {
    const mockQueue = {
      add: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlVisitProducer,
        {
          provide: getQueueToken(URL_VISIT_QUEUE),
          useValue: mockQueue,
        },
      ],
    }).compile();

    producer = module.get<UrlVisitProducer>(UrlVisitProducer);
    queue = module.get<Queue>(getQueueToken(URL_VISIT_QUEUE));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(producer).toBeDefined();
  });

  it('should add a job to the queue', async () => {
    const shortCode = 'test123';

    await producer.addUrlVisitJob(shortCode);

    expect(queue.add).toHaveBeenCalledWith(
      'process-visit',
      {
        shortCode,
        visitedAt: expect.any(String),
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );
  });

  it('should throw an error if queue fails to add a job', async () => {
    const shortCode = 'test123';
    jest.spyOn(queue, 'add').mockRejectedValueOnce(new Error('Queue error'));

    await expect(producer.addUrlVisitJob(shortCode)).rejects.toThrow('Queue error');
  });
});
