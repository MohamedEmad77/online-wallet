import { WebHookGuard } from '@/common/guards/webhook.guard';
import { LoggerService } from '@/common/logger';
import { Queues } from '@/infrastructure/bull/utils';
import { InjectQueue } from '@nestjs/bull';
import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Queue } from 'bull';
import { SendMoneyDto } from '../dtos';
import { PaymentService } from '../services';

@Controller('payments')
export class PaymentsController {
  constructor(
    @InjectQueue(Queues.ReceiveMoneyQueue)
    private readonly receiveMoneyQueue: Queue,
    private readonly loggerService: LoggerService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post('/receive/:bank')
  @UseGuards(WebHookGuard)
  @HttpCode(200)
  async receiveMoney(
    @Param('bank') bank: string,
    @Req() req: Request & { rawBody: Buffer },
  ) {
    const raw = req.rawBody.toString('utf-8');
    try {
      await this.receiveMoneyQueue.add({ bank, transactions: raw });
    } catch (error) {
      this.loggerService.error(
        `[PaymentsController.receiveMoney] Error adding transactions to queue`,
        error.stack,
        'PaymentsController.receiveMoney',
        { bank, raw },
      );
    }
  }

  @Post('/send')
  @HttpCode(200)
  sendMoney(@Body() sendMoneyDto: SendMoneyDto): string {
    return this.paymentService.sendMoney(sendMoneyDto);
  }
}
