import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { IBankParser } from './bank-parser.interface';
import { TransactionDto } from '../dtos';

@Injectable()
export class FoodicsParser implements IBankParser {
  async parseLine(line: string): Promise<TransactionDto> {
    const [dateAndAmount, reference, keyValuePairs] = line.split('#');

    const [date, amount] = dateAndAmount.split(',');

    const details: object = {};

    if (keyValuePairs) {
      for (const pair of keyValuePairs.split(' ')) {
        const [metaKey, metaValue] = pair.split('/');
        if (metaKey && metaValue) {
          details[metaKey] = metaValue;
        }
      }
    }

    const transactionPlain = {
      reference: reference.trim(),
      date: date.trim(),
      amount: parseFloat(amount) * 100,
      details,
    };

    const transactionDto = plainToClass(TransactionDto, transactionPlain);
    await validateOrReject(transactionDto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    return transactionDto;
  }
}
