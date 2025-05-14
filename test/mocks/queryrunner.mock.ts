import { QueryRunner } from 'typeorm';

export const mockQueryRunner: Partial<QueryRunner> = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  manager: {
    findOne: jest.fn().mockResolvedValue({ id: 101 }),
    createQueryBuilder: jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    }),
  },
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
} as any;
