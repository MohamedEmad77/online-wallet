import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { WebHookGuard } from '@/common/guards/webhook.guard';

describe('WebHookGuard', () => {
  let guard: WebHookGuard;
  let mockContext: ExecutionContext;
  let mockRequest: any;
  let configService: Partial<ConfigService>;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) =>
        key === 'FOODICS_SECRET_KEY' ? 'MYSECRET' : undefined,
      ),
    };
    guard = new WebHookGuard(configService as ConfigService);

    mockRequest = {
      params: { bank: 'foodics' },
      rawBody: Buffer.from('test-payload'),
      header: jest.fn(),
    };
    mockContext = {
      switchToHttp: () => ({ getRequest: () => mockRequest }),
    } as any;
  });

  it('allows when HMAC matches', () => {
    const hmac = createHmac('sha256', 'MYSECRET')
      .update('test-payload')
      .digest('hex');
    mockRequest.header.mockReturnValue(`sha256=${hmac}`);

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('rejects missing signature header', () => {
    mockRequest.header.mockReturnValue(undefined);
    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it('rejects when HMAC does not match', () => {
    mockRequest.header.mockReturnValue('sha256=invalidhash');
    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });
});
