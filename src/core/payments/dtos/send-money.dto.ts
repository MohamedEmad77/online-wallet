import { Type } from 'class-transformer';
import {
  IsNumber,
  IsString,
  IsOptional,
  ArrayNotEmpty,
  IsArray,
} from 'class-validator';

export class SendMoneyDto {
  @IsString()
  reference: string;

  @IsString()
  date: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  senderAccount: string;

  @IsString()
  receiverBankCode: string;

  @IsString()
  receiverAccount: string;

  @IsString()
  receiverName: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  notes?: string[];

  @IsOptional()
  @IsNumber()
  paymentType?: number;

  @IsOptional()
  @IsString()
  chargeDetails?: string;
}
