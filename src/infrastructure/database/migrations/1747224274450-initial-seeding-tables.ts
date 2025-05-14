import { randomBytes } from 'crypto';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertInitialSeedingTables1747224274450
  implements MigrationInterface
{
  name = 'InsertInitialSeedingTables1747224274450';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          INSERT INTO banks (id, name, created_at, updated_at) VALUES
            (1, 'foodics', NOW(), NOW()),
            (2, 'acme', NOW(), NOW())
          ON CONFLICT (id) DO NOTHING;
        `);

    const clientTuples = Array.from({ length: 50 }, (_, idx) => {
      const id = idx + 1;
      const ref = randomBytes(4).toString('hex').toUpperCase();
      return `(${id}, 'Client ${id}', '${ref}', NOW(), NOW())`;
    }).join(',\n    ');

    await queryRunner.query(`
          INSERT INTO clients (id, name, reference, created_at, updated_at) VALUES
            ${clientTuples}
          ON CONFLICT (id) DO NOTHING;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM clients WHERE id BETWEEN 1 AND 50;`);
    await queryRunner.query(`DELETE FROM banks WHERE id IN (1,2);`);
  }
}
