import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AuthMiddleware } from './utils';
import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from '@/common/common.module';

@Module({})
export class QueuesModule implements NestModule {
  static register(): DynamicModule {
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
      ],
      providers: [],
      exports: [],
    };
  }

  constructor() {}

  configure(consumer: MiddlewareConsumer) {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');

    createBullBoard({
      queues: [],
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
