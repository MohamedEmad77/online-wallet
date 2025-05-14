import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'failed_jobs' })
export class FailedJob {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  queue: string;

  @Column({ name: 'job_name', type: 'varchar', length: 100 })
  jobName: string;

  @Column({ type: 'jsonb' })
  payload: any;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
