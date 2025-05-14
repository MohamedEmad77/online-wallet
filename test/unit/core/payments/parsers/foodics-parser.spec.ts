import { TransactionDto } from '@/core/payments/dtos';
import { FoodicsParser } from '@/core/payments/parsers';

describe('FoodicsParser', () => {
  let parser: FoodicsParser;

  beforeEach(() => {
    parser = new FoodicsParser();
  });

  it('correctly converts a valid Foodics webhook line into a TransactionDto', async () => {
    const sampleLine =
      '20250515,156.50#TXN123#note/debt internal_reference/ABC123';
    const result: TransactionDto = await parser.parseLine(sampleLine);

    expect(result).toBeInstanceOf(TransactionDto);
    expect(result.reference).toBe('TXN123');
    expect(result.amount).toBe(15650);
    expect(result.date).toBe('20250515');
    expect(result.details).toEqual({
      note: 'debt',
      internal_reference: 'ABC123',
    });
  });
});
