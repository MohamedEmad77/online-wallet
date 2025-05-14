import { Module } from '@nestjs/common';
import { LoggerService } from './logger';

@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class CommonModule {}
