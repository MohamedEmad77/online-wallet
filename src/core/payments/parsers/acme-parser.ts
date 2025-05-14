// src/payments/parsers/acme.parser.ts

import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { IBankParser } from './bank-parser.interface';
import { TransactionDto } from '../dtos';

@Injectable()
export class AcmeParser implements IBankParser {
  async parseLine(line: string): Promise<TransactionDto> {
    const [amount, reference, date] = line.split('//');

    const transactionPlain = {
      reference: reference.trim(),
      date: date.trim(),
      amount: parseFloat(amount) * 100,
    };

    const transactionDto = plainToClass(TransactionDto, transactionPlain);
    await validateOrReject(transactionDto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    return transactionDto;
  }
}
