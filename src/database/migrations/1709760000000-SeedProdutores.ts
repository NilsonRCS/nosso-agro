import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedProdutores1709760000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO produtores (
        cpf,
        nome_produtor,
        nome_fazenda,
        cidade,
        estado,
        area_total_hectares,
        area_agricultavel_hectares,
        area_vegetacao_hectares
      ) VALUES 
      (
        '123.456.789-00',
        'João Silva',
        'Fazenda Boa Esperança',
        'Ribeirão Preto',
        'SP',
        1500.00,
        1200.00,
        300.00
      ),
      (
        '987.654.321-00',
        'Maria Santos',
        'Fazenda Vale Verde',
        'Uberaba',
        'MG',
        2800.00,
        2000.00,
        800.00
      ),
      (
        '456.789.123-00',
        'Pedro Oliveira',
        'Fazenda Santa Clara',
        'Rio Verde',
        'GO',
        3500.00,
        2800.00,
        700.00
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM produtores 
      WHERE cpf IN (
        '123.456.789-00',
        '987.654.321-00',
        '456.789.123-00'
      );
    `);
  }
}
