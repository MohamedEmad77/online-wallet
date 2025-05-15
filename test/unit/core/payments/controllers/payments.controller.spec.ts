import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';
import { WebHookGuard } from '@/common/guards/webhook.guard';
import { PaymentsController } from '@/core/payments/controllers';
import { LoggerService } from '@/common/logger';
import { Queues } from '@/infrastructure/bull/utils';
import { PaymentService } from '@/core/payments/services/payment.service';
import { SendMoneyDto } from '@/core/payments/dtos/send-money.dto';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let mockQueue: Partial<Queue>;
  let mockLogger: Partial<LoggerService>;
  let mockPaymentService: Partial<PaymentService>;

  beforeEach(async () => {
    mockQueue = { add: jest.fn() };
    mockLogger = {
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
    };
    mockPaymentService = {
      sendMoney: jest.fn().mockReturnValue('<xml>OK</xml>'),
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
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
      ],
    })
      .overrideGuard(WebHookGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  describe('receiveMoney()', () => {
    it('enqueues the raw payload under the correct bank key', async () => {
      const req = { rawBody: Buffer.from('lineA\nlineB') } as any;
      await controller.receiveMoney('acme', req);
      expect(mockQueue.add).toHaveBeenCalledWith({
        bank: 'acme',
        transactions: 'lineA\nlineB',
      });
    });

    it('logs an error if queue.add throws but does not rethrow', async () => {
      (mockQueue.add as jest.Mock).mockRejectedValue(new Error('queue down'));
      const req = { rawBody: Buffer.from('foo') } as any;
      await controller.receiveMoney('foodics', req);
      expect(mockLogger.error).toHaveBeenCalledWith(
        `[PaymentsController.receiveMoney] Error adding transactions to queue`,
        expect.any(String),
        'PaymentsController.receiveMoney',
        { bank: 'foodics', raw: 'foo' },
      );
    });
  });

  describe('sendMoney()', () => {
    it('forwards the DTO to PaymentService and returns its XML', () => {
      const dto: SendMoneyDto = {
        reference: 'REFX',
        date: '2025-05-15 10:00:00+00',
        amount: 10,
        currency: 'EUR',
        senderAccount: 'SA1',
        receiverBankCode: 'BK2',
        receiverAccount: 'ACC2',
        receiverName: 'Bob',
      };

      const result = controller.sendMoney(dto);

      expect(mockPaymentService.sendMoney).toHaveBeenCalledWith(dto);
      expect(result).toBe('<xml>OK</xml>');
    });
  });
});
