import { Module } from '@nestjs/common';
import { PaymentsController } from './controllers';
import { QueuesModule } from '@/infrastructure/bull/queues.module';
import { CommonModule } from '@/common/common.module';
import { ProcessReceivingMoneyService } from './services';
import { AcmeParser, FoodicsParser } from './parsers';
import { BankParserContext } from './parsers/bank-parser-context';

@Module({
  imports: [QueuesModule.register(), CommonModule],
  controllers: [PaymentsController],
  providers: [
    ProcessReceivingMoneyService,
    FoodicsParser,
    AcmeParser,
    BankParserContext,
  ],
})
export class PaymentsModule {}
