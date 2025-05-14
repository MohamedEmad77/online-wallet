import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMainTables1747224274349 implements MigrationInterface {
  name = 'CreateMainTables1747224274349';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "banks" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, CONSTRAINT "PK_3975b5f684ec241e3901db62d77" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "clients" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" BIGSERIAL NOT NULL, "name" character varying(50) NOT NULL, "reference" character varying(20) NOT NULL, CONSTRAINT "UQ_c7edaf5401587567318dc328cc2" UNIQUE ("reference"), CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_clients_reference" ON "clients" ("reference") `,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" BIGSERIAL NOT NULL, "external_reference" character varying(100) NOT NULL, "bank_id" integer NOT NULL, "client_id" bigint, "amount" numeric(18,2) NOT NULL, "details" jsonb, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_transactions_bank_ref" ON "transactions" ("bank_id", "external_reference") `,
    );
    await queryRunner.query(
      `CREATE TABLE "failed_jobs" ("id" BIGSERIAL NOT NULL, "queue" character varying(100) NOT NULL, "job_name" character varying(100) NOT NULL, "payload" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_11f22f1f6ab8927d72c0ccb700b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_ebb352c973d8a85e8779a15ff35" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_006f5894681e98d68fa2a829a4d" FOREIGN KEY ("bank_id") REFERENCES "banks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_006f5894681e98d68fa2a829a4d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_ebb352c973d8a85e8779a15ff35"`,
    );
    await queryRunner.query(`DROP TABLE "failed_jobs"`);
    await queryRunner.query(`DROP INDEX "public"."idx_transactions_bank_ref"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP INDEX "public"."idx_clients_reference"`);
    await queryRunner.query(`DROP TABLE "clients"`);
    await queryRunner.query(`DROP TABLE "banks"`);
  }
}
