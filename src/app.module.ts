import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import typeorm from './config/typeorm';
import server from './config/server';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm, server],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
