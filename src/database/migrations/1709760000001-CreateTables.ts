import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1709760000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, enable the uuid-ossp extension if not already enabled
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS produtores (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        cpf VARCHAR(14) UNIQUE,
        cnpj VARCHAR(18) UNIQUE,
        nome_produtor VARCHAR(255) NOT NULL,
        nome_fazenda VARCHAR(255) NOT NULL,
        cidade VARCHAR(100) NOT NULL,
        estado CHAR(2) NOT NULL,
        area_total_hectares DECIMAL(10,2) NOT NULL,
        area_agricultavel_hectares DECIMAL(10,2) NOT NULL,
        area_vegetacao_hectares DECIMAL(10,2) NOT NULL,
        CONSTRAINT check_cpf_or_cnpj CHECK (
          (cpf IS NOT NULL AND cnpj IS NULL) OR
          (cpf IS NULL AND cnpj IS NOT NULL)
        )
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS safras_culturas (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        produtor_id UUID NOT NULL,
        nome_safra VARCHAR(50) NOT NULL,
        cultura_plantada VARCHAR(100) NOT NULL,
        ano_safra INTEGER NOT NULL,
        FOREIGN KEY (produtor_id) REFERENCES produtores(id) ON DELETE CASCADE,
        UNIQUE(produtor_id, nome_safra, cultura_plantada)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS safras_culturas;`);
    await queryRunner.query(`DROP TABLE IF EXISTS produtores;`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp";`);
  }
} 