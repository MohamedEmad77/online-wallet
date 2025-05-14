import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTimestampEntity } from '@/common/entities';
import { Transaction } from './transaction.entity';

@Entity({ name: 'clients' })
export class Client extends BaseTimestampEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 50,
  })
  name: string;

  @Column({
    name: 'reference',
    type: 'varchar',
    length: 20,
    unique: true,
  })
  @Index('idx_clients_reference')
  reference: string;

  @OneToMany(() => Transaction, (transactions) => transactions.client)
  transactions: Transaction[];
}
