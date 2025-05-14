import { WebHookGuard } from '@/common/guards/webhook.guard';
import { LoggerService } from '@/common/logger';
import { Queues } from '@/infrastructure/bull/utils';
import { InjectQueue } from '@nestjs/bull';
import {
  Controller,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Queue } from 'bull';

@Controller('payments')
export class PaymentsController {
  constructor(
    @InjectQueue(Queues.ReceiveMoneyQueue)
    private readonly receiveMoneyQueue: Queue,
    private readonly loggerService: LoggerService,
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
}
