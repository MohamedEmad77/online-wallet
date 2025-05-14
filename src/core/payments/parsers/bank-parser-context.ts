// src/payments/parsers/parser.context.ts

import { Injectable } from '@nestjs/common';
import { FoodicsParser } from './foodics-parser';
import { AcmeParser } from './acme-parser';
import { IBankParser } from './bank-parser.interface';

export type BankKey = 'foodics' | 'acme';

@Injectable()
export class BankParserContext {
  private readonly bankParsers: Record<BankKey, IBankParser>;

  constructor(
    private readonly foodicsParser: FoodicsParser,
    private readonly acmeParser: AcmeParser,
  ) {
    this.bankParsers = {
      foodics: this.foodicsParser,
      acme: this.acmeParser,
    };
  }

  getParser(bank: string): IBankParser {
    return this.bankParsers[bank];
  }
}
