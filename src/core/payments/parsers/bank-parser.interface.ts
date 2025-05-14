import { TransactionDto } from '../dtos';

export interface IBankParser {
  parseLine(line: string): Promise<TransactionDto>;
}
