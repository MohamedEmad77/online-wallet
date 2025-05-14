import { LoggerService } from '@/common/logger';
import { Queues } from '@/infrastructure/bull/utils';
import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';

import { DataSource } from 'typeorm';
import { BankParserContext } from '../parsers/bank-parser-context';
import { TransactionDto } from '../dtos';
import { IBankParser } from '../parsers';
import { Client, Transaction } from '../entities';
import { BankEnum } from '../utils/enums';
import { FailedJob } from '../entities/failed-job.entity';

@Injectable()
@Processor(Queues.ReceiveMoneyQueue)
export class ProcessReceivingMoneyService {
  private readonly loggerService = new LoggerService(
    ProcessReceivingMoneyService.name,
  );
  constructor(
    private readonly bankParserContext: BankParserContext,
    private readonly dataSource: DataSource,
  ) {}

  @Process()
  async process(job: Job) {
    this.loggerService.info(
      `[ProcessReceivingMoneyService.process] | starting process message with id: ${job.id}`,
    );
    const { bank, transactions } = job.data;
    const bankParser: IBankParser = this.bankParserContext.getParser(bank);
    const transactionsLines = transactions
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const transaction of transactionsLines) {
        let transactionDto: TransactionDto;
        try {
          transactionDto = await bankParser.parseLine(transaction);
        } catch (error) {
          this.loggerService.warning(
            '[ProcessReceivingMoneyService.process] | Not valid transaction line',
            'ProcessReceivingMoneyService.process',
          );
          continue;
        }

        const clientId = transactionDto.details['internal_reference']
          ? await queryRunner.manager
              .findOne(Client, {
                where: {
                  reference: transactionDto.details['internal_reference'],
                },
                select: ['id'],
              })
              .then((c) => c?.id ?? null)
          : null;

        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(Transaction)
          .values({
            externalReference: transactionDto.reference,
            bankId: BankEnum[bank as keyof typeof BankEnum],
            clientId,
            amount: transactionDto.amount.toString(),
            details: transactionDto.details,
          })
          .orIgnore()
          .execute();
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.loggerService.error(
        `[ProcessReceivingMoneyService.process] | error in processing message with id ${job.id}`,
        error,
      );
      throw error;
    } finally {
      await queryRunner.release();
      this.loggerService.info(
        `[ProcessReceivingMoneyService.process] | message with id: ${job.id} processed successfully`,
      );
    }
  }

  @OnQueueFailed()
  async processJobFailed(job: Job, error: Error) {
    const maxAttempts = job.opts.attempts ?? 1;
    if (job.attemptsMade >= maxAttempts) {
      this.loggerService.error(
        `[ProcessReceivingMoneyService.processJobFailed] | Job ${job.id} exhausted after ${job.attemptsMade} attempts`,
        error.stack,
      );
      try {
        await this.dataSource.getRepository(FailedJob).insert({
          queue: Queues.ReceiveMoneyQueue,
          jobName: job.name,
          payload: job.data,
        });
      } catch (error) {
        this.loggerService.error(
          `[ProcessReceivingMoneyService.processJobFailed] | Failed to record job ${job.id} in failed_jobs`,
          error.stack,
        );
      }
    }
  }
}
