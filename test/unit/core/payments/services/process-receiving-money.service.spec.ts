import { IBankParser } from '@/core/payments/parsers';
import { BankParserContext } from '@/core/payments/parsers/bank-parser-context';
import { ProcessReceivingMoneyService } from '@/core/payments/services';
import { Test, TestingModule } from '@nestjs/testing';
import { mockQueryRunner } from '../../../../mocks/queryrunner.mock';
import { DataSource } from 'typeorm';
import { FailedJob } from '@/core/payments/entities/failed-job.entity';
import { Queues } from '@/infrastructure/bull/utils';

describe('ProcessReceivingMoneyService.process', () => {
  let service: ProcessReceivingMoneyService;
  let mockDataSource: Partial<DataSource>;
  let mockParserContext: Partial<BankParserContext>;
  let mockParser: Partial<IBankParser>;
  let mockFailedJobRepo: { insert: jest.Mock };

  beforeEach(async () => {
    mockParser = {
      parseLine: jest.fn().mockResolvedValue({
        reference: 'REF1',
        date: '20250515',
        amount: 50,
        details: { internal_reference: 'REF1' },
      }),
    };
    mockParserContext = {
      getParser: jest.fn().mockReturnValue(mockParser),
    } as any;
    mockFailedJobRepo = { insert: jest.fn() };
    mockDataSource = {
      createQueryRunner: () => mockQueryRunner,
      getRepository: jest.fn().mockImplementation((entity) => {
        if (entity === FailedJob) return mockFailedJobRepo;
        throw new Error('Unexpected repository');
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessReceivingMoneyService,
        { provide: BankParserContext, useValue: mockParserContext },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get(ProcessReceivingMoneyService);
  });

  it('parses each line and insert a transaction', async () => {
    const fakeJob: any = {
      id: 1,
      data: { bank: 'foodics', transactions: 'line1\nline2' },
      opts: { attempts: 3 },
      attemptsMade: 1,
    };
    await service.process(fakeJob);

    expect(mockQueryRunner.connect).toHaveBeenCalled();
    expect(mockParser.parseLine).toHaveBeenCalledTimes(2);
    expect(mockQueryRunner.manager.createQueryBuilder).toHaveBeenCalled();
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });

  it('records a FailedJob when attemptsMade ≥ opts.attempts', async () => {
    const fakeJob: any = {
      id: 42,
      name: 'parse',
      data: { bank: 'acme', transactions: 'foo' },
      opts: { attempts: 3 },
      attemptsMade: 3,
    };

    await service.processJobFailed(fakeJob, new Error('final failure'));

    expect(mockFailedJobRepo.insert).toHaveBeenCalledWith({
      queue: Queues.ReceiveMoneyQueue,
      jobName: 'parse',
      payload: fakeJob.data,
    });
  });

  it('does not record a FailedJob when there are retries remaining', async () => {
    const fakeJob: any = {
      id: 43,
      name: 'parse',
      data: { bank: 'acme', transactions: 'foo' },
      opts: { attempts: 5 },
      attemptsMade: 2,
    };

    await service.processJobFailed(fakeJob, new Error('temporary failure'));

    expect(mockFailedJobRepo.insert).not.toHaveBeenCalled();
  });
});
