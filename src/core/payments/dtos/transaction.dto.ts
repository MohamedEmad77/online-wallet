// src/payments/dto/transaction.dto.ts

import { Type } from 'class-transformer';
import { IsNumber, IsString, Matches, IsOptional } from 'class-validator';

export class TransactionDto {
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'amount must be a number with up to 2 decimal places' },
  )
  amount: number;

  @IsString({ message: 'reference must be a string' })
  @Matches(/^[A-Za-z0-9]+$/, {
    message: 'reference may only contain letters and numbers',
  })
  reference: string;

  @IsString({ message: 'date must be a string' })
  date: string;

  @IsOptional()
  details?: object;
}
