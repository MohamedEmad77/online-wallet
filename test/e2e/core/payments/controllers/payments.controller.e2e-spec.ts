/* eslint-disable @typescript-eslint/no-unused-vars */

import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { raw, json } from 'express';
import * as request from 'supertest';
import { createHmac } from 'crypto';
import { DataSource } from 'typeorm';

import { AppModule } from '@/app.module';
import { Bank, Transaction } from '@/core/payments/entities';

describe('Payments Controller E2E', () => {
  let app: INestApplication;
  let ds: DataSource;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    app.use(
      '/v1/payments/receive',
      raw({
        type: 'text/plain',
        verify: (req, _res, buf) => ((req as any).rawBody = buf),
      }),
    );
    app.use('/v1/payments/send', json());

    app.setGlobalPrefix('v1', { exclude: ['/admin/queues'] });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );

    await app.init();

    ds = app.get(DataSource);

    await ds.synchronize(true);
    await ds.getRepository(Bank).save([
      { id: 1, name: 'foodics' },
      { id: 2, name: 'acme' },
    ]);
  });

  afterAll(async () => {
    await ds.dropDatabase();
    await ds.destroy();
    await app.close();
  });

  it('/v1/payments/send → XML', async () => {
    const payload = {
      reference: 'e0f4763d-28ea-42d4-ac1c-c4013c242105',
      date: '2025-02-25 06:33:00+03',
      amount: 177.39,
      currency: 'SAR',
      senderAccount: 'SA6980000204608016212908',
      receiverBankCode: 'FDCSSARI',
      receiverAccount: 'SA6980000204608016211111',
      receiverName: 'Jane Doe',
      notes: ['Lorem Epsum', 'Dolor Sit Amet'],
      paymentType: 421,
      chargeDetails: 'RB',
    };

    const res = await request(app.getHttpServer())
      .post('/v1/payments/send')
      .send(payload)
      .expect(200);

    expect(res.text).toContain('<PaymentRequestMessage>');
    expect(res.text).toContain(`<Reference>${payload.reference}</Reference>`);
  });

  it('/v1/payments/receive/:bank → enqueued & processed', async () => {
    const lines = Array.from({ length: 1000 }, (_, i) => {
      const ref = `BULK${i}`;
      return `20250515,1.00#${ref}#`;
    }).join('\n');

    const sig = createHmac('sha256', process.env.FOODICS_SECRET_KEY!)
      .update(lines)
      .digest('hex');

    await request(app.getHttpServer())
      .post('/v1/payments/receive/foodics')
      .set('Content-Type', 'text/plain')
      .set('X-Bank-Signature', `sha256=${sig}`)
      .send(lines)
      .expect(200);

    // 1000 transactions lines take 600 ms
    await new Promise((r) => setTimeout(r, 600));
    const count = await ds.getRepository(Transaction).count();
    expect(count).toBe(1000);
  });
});
