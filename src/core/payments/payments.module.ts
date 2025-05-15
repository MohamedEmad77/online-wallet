import { Module } from '@nestjs/common';
import { PaymentsController } from './controllers';
import { QueuesModule } from '@/infrastructure/bull/queues.module';
import { CommonModule } from '@/common/common.module';
import { PaymentService, ProcessReceivingMoneyService } from './services';
import { AcmeParser, FoodicsParser } from './parsers';
import { BankParserContext } from './parsers/bank-parser-context';
import { SendMoneyXmlBuilder } from './builders';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bank, Client, Transaction } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, Bank, Transaction]),
    QueuesModule.register(),
    CommonModule,
  ],
  controllers: [PaymentsController],
  providers: [
    ProcessReceivingMoneyService,
    FoodicsParser,
    AcmeParser,
    BankParserContext,
    SendMoneyXmlBuilder,
    PaymentService,
  ],
})
export class PaymentsModule {}
