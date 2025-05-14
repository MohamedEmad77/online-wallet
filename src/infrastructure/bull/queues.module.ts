import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { AuthMiddleware, Queues } from './utils';
import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from '@/common/common.module';
import { Queue } from 'bull';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({})
export class QueuesModule implements NestModule {
  static register(): DynamicModule {
    const receiveMoneyQueue = BullModule.registerQueue({
      name: Queues.ReceiveMoneyQueue,
    });
    return {
      module: QueuesModule,
      imports: [
        BullModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            redis: {
              host: configService.get('bull.host'),
              port: configService.get('bull.port'),
              db: configService.get('bull.db'),
            },
            defaultJobOptions: {
              attempts: configService.get('bull.attempts'),
            },
          }),
          inject: [ConfigService],
        }),
        CommonModule,
        receiveMoneyQueue,
      ],
      providers: [...receiveMoneyQueue.providers],
      exports: [...receiveMoneyQueue.exports],
    };
  }

  constructor(
    @InjectQueue(Queues.ReceiveMoneyQueue)
    private readonly receiveMoneyQueue: Queue,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');

    createBullBoard({
      queues: [new BullMQAdapter(this.receiveMoneyQueue)],
      serverAdapter,
      options: {
        uiConfig: {
          boardTitle: 'Wallet Board',
        },
      },
    });

    consumer
      .apply(AuthMiddleware, serverAdapter.getRouter())
      .forRoutes('/admin/queues');
  }
}
