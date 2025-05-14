import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './common/logger';
import { VERSION_NEUTRAL, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const logger = new LoggerService('online-wallet');
  const app = await NestFactory.create(AppModule, {
    logger: logger,
  });

  const configService = app.get(ConfigService);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });

  app.setGlobalPrefix('v1', { exclude: ['/admin/queues'] });

  await app.listen(configService.get('server.port'));
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
