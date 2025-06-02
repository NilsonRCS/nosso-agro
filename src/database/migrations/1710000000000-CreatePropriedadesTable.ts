import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey
} from 'typeorm';

export class CreatePropriedadesTable1710000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'propriedades',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'nome',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'cidade',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'estado',
            type: 'varchar',
            length: '2',
          },
          {
            name: 'area_total_hectares',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'area_agricultavel_hectares',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'area_vegetacao_hectares',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'produtor_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'propriedades',
      new TableForeignKey({
        name: 'PropriedadeProdutor',
        columnNames: ['produtor_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'produtores',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('propriedades', 'PropriedadeProdutor');
    await queryRunner.dropTable('propriedades');
  }
}
