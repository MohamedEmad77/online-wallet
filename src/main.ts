import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './common/logger';
import {
  ValidationPipe,
  VERSION_NEUTRAL,
  VersioningType,
} from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const logger = new LoggerService('online-wallet');
  const app = await NestFactory.create(AppModule, {
    logger: logger,
  });

  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe());
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });

  app.setGlobalPrefix('v1', { exclude: ['/admin/queues'] });
  app.use(
    '/v1/payments/receive',
    express.raw({
      type: 'text/plain',
      limit: '1mb',
      verify: (req, _res, buf: Buffer) => {
        (req as any).rawBody = buf;
      },
    }),
  );
  await app.listen(configService.get('server.port'));
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
