import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTimestampEntity } from '@/common/entities';
import { Bank } from './bank.entity';
import { Client } from './client.entity';

@Entity({ name: 'transactions' })
@Index('idx_transactions_bank_ref', ['bankId', 'externalReference'], {
  unique: true,
})
export class Transaction extends BaseTimestampEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'external_reference', type: 'varchar', length: 100 })
  externalReference: string;

  @Column({ name: 'bank_id', type: 'int' })
  bankId: number;

  @Column({ name: 'client_id', type: 'bigint', nullable: true })
  clientId: number | null;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: string;

  @Column({ type: 'jsonb', nullable: true })
  details: object;

  @ManyToOne(() => Client, (client) => client.transactions)
  @JoinColumn({ name: 'client_id' })
  client: Client | null;

  @ManyToOne(() => Bank, (bank) => bank.transactions, { nullable: false })
  @JoinColumn({ name: 'bank_id' })
  bank: Bank;
}
