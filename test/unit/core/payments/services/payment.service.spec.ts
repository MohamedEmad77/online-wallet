import { SendMoneyXmlBuilder } from '@/core/payments/builders';
import { SendMoneyDto } from '@/core/payments/dtos';
import { PaymentService } from '@/core/payments/services';
import { Test, TestingModule } from '@nestjs/testing';
import { xmlMock } from '../../../../mocks/xml.mock';

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let xmlBuilder: Partial<SendMoneyXmlBuilder>;

  beforeEach(async () => {
    xmlBuilder = {
      build: jest.fn().mockReturnValue(xmlMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: SendMoneyXmlBuilder,
          useValue: xmlBuilder,
        },
      ],
    }).compile();

    paymentService = module.get(PaymentService);
  });

  it('should return xml', () => {
    const dto: SendMoneyDto = {
      reference: 'REF123',
      date: '2025-05-15 10:00:00+00',
      amount: 42.5,
      currency: 'USD',
      senderAccount: 'SA1',
      receiverBankCode: 'BK1',
      receiverAccount: 'RA2',
      receiverName: 'Alice',
      notes: ['n1', 'n2'],
      paymentType: 200,
      chargeDetails: 'RB',
    };
    jest.spyOn(xmlBuilder, 'build').mockReturnValue(xmlMock);
    const result = paymentService.sendMoney(dto);

    expect(result).toBe(xmlMock);
  });
});
