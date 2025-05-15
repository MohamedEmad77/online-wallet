import { Injectable } from '@nestjs/common';
import { SendMoneyXmlBuilder } from '../builders';
import { SendMoneyDto } from '../dtos';

@Injectable()
export class PaymentService {
  private sendMoneyXmlBuilder: SendMoneyXmlBuilder;
  constructor() {}

  sendMoney(sendMoneyDto: SendMoneyDto) {
    this.sendMoneyXmlBuilder = new SendMoneyXmlBuilder(sendMoneyDto);
    return this.sendMoneyXmlBuilder.build();
  }
}
