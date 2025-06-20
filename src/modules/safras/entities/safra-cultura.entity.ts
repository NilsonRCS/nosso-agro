import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Propriedade } from '../../propriedades/entities/propriedade.entity';

@Entity('safras_culturas')
export class SafraCultura {
  @ApiProperty({
    description: 'ID único da safra/cultura',
    example: 'f4b0951e-1a57-4464-9cfd-fa5896509869',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nome da cultura plantada',
    example: 'Soja',
  })
  @Column({ type: 'varchar', length: 100 })
  nome_cultura: string;

  @ApiProperty({
    description: 'Ano da safra',
    example: 2024,
  })
  @Column({ type: 'integer' })
  ano_safra: number;

  @ApiProperty({
    description: 'Data de plantio',
    example: '2024-01-15',
  })
  @Column({ type: 'date' })
  data_plantio: Date;

  @ApiProperty({
    description: 'Data prevista da colheita',
    example: '2024-05-15',
  })
  @Column({ type: 'date' })
  data_colheita_prevista: Date;

  @ApiProperty({
    description: 'Área plantada em hectares',
    example: 500.0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  area_plantada_hectares: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Propriedade, (propriedade) => propriedade.safras_culturas)
  propriedade: Propriedade;
}
