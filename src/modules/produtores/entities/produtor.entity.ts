import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Check,
} from 'typeorm';
import { SafraCultura } from '../../safras/entities/safra-cultura.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('produtores')
@Check(`"cpf" IS NOT NULL OR "cnpj" IS NOT NULL`)
@Check(`NOT ("cpf" IS NOT NULL AND "cnpj" IS NOT NULL)`)
export class Produtor {
  @ApiProperty({
    description: 'ID único do produtor',
    example: 'f4b0951e-1a57-4464-9cfd-fa5896509869',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'CPF do produtor',
    example: '123.456.789-00',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 14, nullable: true, unique: true })
  cpf: string | null;

  @ApiProperty({
    description: 'CNPJ do produtor',
    example: '12.345.678/0001-90',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 18, nullable: true, unique: true })
  cnpj: string | null;

  @ApiProperty({
    description: 'Nome do produtor',
    example: 'João Silva',
  })
  @Column({ type: 'varchar', length: 255 })
  nome_produtor: string;

  @ApiProperty({
    description: 'Nome da fazenda',
    example: 'Fazenda Boa Esperança',
  })
  @Column({ type: 'varchar', length: 255 })
  nome_fazenda: string;

  @ApiProperty({
    description: 'Cidade onde está localizada a fazenda',
    example: 'Ribeirão Preto',
  })
  @Column({ type: 'varchar', length: 100 })
  cidade: string;

  @ApiProperty({
    description: 'Estado onde está localizada a fazenda',
    example: 'SP',
  })
  @Column({ type: 'varchar', length: 2 })
  estado: string;

  @ApiProperty({
    description: 'Área total da fazenda em hectares',
    example: 1500.00,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  area_total_hectares: number;

  @ApiProperty({
    description: 'Área agricultável da fazenda em hectares',
    example: 1200.00,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  area_agricultavel_hectares: number;

  @ApiProperty({
    description: 'Área de vegetação da fazenda em hectares',
    example: 300.00,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  area_vegetacao_hectares: number;

  @OneToMany(() => SafraCultura, (safraCultura) => safraCultura.produtor)
  safras_culturas: SafraCultura[];
}
