import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { Request } from 'express';
import { BankEnum } from '@/core/payments/utils/enums';

@Injectable()
export class WebHookGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request & { rawBody: Buffer }>();
    const bankParam = (
      req.params.bank || ''
    ).toLowerCase() as keyof typeof BankEnum;

    if (!(bankParam in BankEnum)) {
      throw new UnauthorizedException(`Unknown bank "${req.params.bank}"`);
    }

    const secretKeyName = `${bankParam.toUpperCase()}_SECRET_KEY`;
    const secret = this.configService.get<string>(secretKeyName);
    if (!secret) {
      throw new UnauthorizedException(
        `No secret configured for bank "${bankParam}"`,
      );
    }

    const sigHeader = req.header('x-bank-signature');
    if (!sigHeader) {
      throw new UnauthorizedException('Missing X-Bank-Signature header');
    }
    const [algo, sigHash] = sigHeader.split('=');
    if (algo !== 'sha256' || !sigHash) {
      throw new UnauthorizedException('Invalid signature format');
    }

    const computed = createHmac('sha256', secret)
      .update(req.rawBody)
      .digest('hex');

    const sigBuf = Buffer.from(sigHash, 'hex');
    const cmpBuf = Buffer.from(computed, 'hex');
    if (sigBuf.length !== cmpBuf.length || !timingSafeEqual(sigBuf, cmpBuf)) {
      throw new UnauthorizedException('Signature mismatch');
    }

    return true;
  }
}
