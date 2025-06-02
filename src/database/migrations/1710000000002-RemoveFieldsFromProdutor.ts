import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveFieldsFromProdutor1710000000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "produtores"
      DROP COLUMN "nome_fazenda",
      DROP COLUMN "cidade",
      DROP COLUMN "estado",
      DROP COLUMN "area_total_hectares",
      DROP COLUMN "area_agricultavel_hectares",
      DROP COLUMN "area_vegetacao_hectares";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "produtores"
      ADD COLUMN "nome_fazenda" varchar(255),
      ADD COLUMN "cidade" varchar(100),
      ADD COLUMN "estado" varchar(2),
      ADD COLUMN "area_total_hectares" decimal(10,2),
      ADD COLUMN "area_agricultavel_hectares" decimal(10,2),
      ADD COLUMN "area_vegetacao_hectares" decimal(10,2);
    `);
  }
} 