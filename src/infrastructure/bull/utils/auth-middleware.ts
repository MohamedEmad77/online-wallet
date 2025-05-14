import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
export class AuthMiddleware implements NestMiddleware {
  user: string;
  password: string;
  encodedCredentials: string;

  constructor(private readonly configService = new ConfigService()) {
    this.user = this.configService.get('BULL_BOARD_USER');
    this.password = this.configService.get('BULL_BOARD_PASSWORD');
    this.encodedCredentials = Buffer.from(
      this.user + ':' + this.password,
    ).toString('base64');
  }

  use(req: Request, res: Response, next: NextFunction) {
    const reqCredentials =
      req.get('authorization')?.split('Basic ')?.[1] ?? null;

    if (!reqCredentials || reqCredentials !== this.encodedCredentials) {
      res.setHeader(
        'WWW-Authenticate',
        'Basic realm="Online Wallet", charset="UTF-8"',
      );
      res.sendStatus(401);
    } else {
      next();
    }
  }
}
