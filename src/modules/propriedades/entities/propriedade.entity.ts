import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Check,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Produtor } from '../../produtores/entities/produtor.entity';
import { SafraCultura } from '../../safras/entities/safra-cultura.entity';

@Entity('propriedades')
@Check(`"area_agricultavel_hectares" + "area_vegetacao_hectares" <= "area_total_hectares"`)
export class Propriedade {
  @ApiProperty({
    description: 'ID único da propriedade',
    example: 'f4b0951e-1a57-4464-9cfd-fa5896509869',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nome da propriedade rural',
    example: 'Fazenda São João',
  })
  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @ApiProperty({
    description: 'Cidade onde está localizada a propriedade',
    example: 'Ribeirão Preto',
  })
  @Column({ type: 'varchar', length: 100 })
  cidade: string;

  @ApiProperty({
    description: 'Estado onde está localizada a propriedade',
    example: 'SP',
  })
  @Column({ type: 'varchar', length: 2 })
  estado: string;

  @ApiProperty({
    description: 'Área total da propriedade em hectares',
    example: 1500.0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  area_total_hectares: number;

  @ApiProperty({
    description: 'Área agricultável da propriedade em hectares',
    example: 1200.0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  area_agricultavel_hectares: number;

  @ApiProperty({
    description: 'Área de vegetação da propriedade em hectares',
    example: 300.0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  area_vegetacao_hectares: number;

  @ManyToOne(() => Produtor, (produtor) => produtor.propriedades)
  produtor: Produtor;

  @OneToMany(() => SafraCultura, (safraCultura) => safraCultura.propriedade)
  safras_culturas: SafraCultura[];
} 