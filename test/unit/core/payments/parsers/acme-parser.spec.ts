import { TransactionDto } from '@/core/payments/dtos';
import { AcmeParser } from '@/core/payments/parsers';

describe('AcmeParser', () => {
  let parser: AcmeParser;

  beforeEach(() => {
    parser = new AcmeParser();
  });

  it('parses a valid Acme webhook line into TransactionDto', async () => {
    const sampleLine = '200.00//TXN456//20250516';
    const dto: TransactionDto = await parser.parseLine(sampleLine);

    expect(dto).toBeInstanceOf(TransactionDto);
    expect(dto.reference).toBe('TXN456');
    expect(dto.amount).toBe(20000);
    expect(dto.date).toBe('20250516');
  });
});
