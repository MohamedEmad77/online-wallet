import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';
import { WebHookGuard } from '@/common/guards/webhook.guard';
import { PaymentsController } from '@/core/payments/controllers';
import { LoggerService } from '@/common/logger';
import { Queues } from '@/infrastructure/bull/utils';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let mockQueue: Partial<Queue>;
  let mockLogger: Partial<LoggerService>;

  beforeEach(async () => {
    mockQueue = { add: jest.fn() };
    mockLogger = {
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: getQueueToken(Queues.ReceiveMoneyQueue),
          useValue: mockQueue,
        },

        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    })
      .overrideGuard(WebHookGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<PaymentsController>(PaymentsController);
  });

  it('enqueues the raw payload under the correct bank key', async () => {
    const req = { rawBody: Buffer.from('lineA\nlineB') } as any;
    await controller.receiveMoney('acme', req);
    expect(mockQueue.add).toHaveBeenCalledWith({
      bank: 'acme',
      transactions: 'lineA\nlineB',
    });
  });

  it('logs an error if queue.add throws', async () => {
    (mockQueue.add as jest.Mock).mockRejectedValue(new Error('queue down'));
    const req = { rawBody: Buffer.from('foo') } as any;
    await controller.receiveMoney('foodics', req);
  });
});
