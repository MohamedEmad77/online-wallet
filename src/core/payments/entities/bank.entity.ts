import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTimestampEntity } from '@/common/entities';
import { Transaction } from './transaction.entity';

@Entity({ name: 'banks' })
export class Bank extends BaseTimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => Transaction, (transaction) => transaction.bank)
  transactions: Transaction[];
}
