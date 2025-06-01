import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Check,
} from 'typeorm';
import { SafraCultura } from '../../safras/entities/safra-cultura.entity';

@Entity('produtores')
@Check(`"cpf" IS NOT NULL OR "cnpj" IS NOT NULL`)
@Check(`NOT ("cpf" IS NOT NULL AND "cnpj" IS NOT NULL)`)
export class Produtor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 14, nullable: true, unique: true })
  cpf: string | null;

  @Column({ type: 'varchar', length: 18, nullable: true, unique: true })
  cnpj: string | null;

  @Column({ type: 'varchar', length: 255 })
  nome_produtor: string;

  @Column({ type: 'varchar', length: 255 })
  nome_fazenda: string;

  @Column({ type: 'varchar', length: 255 })
  cidade: string;

  @Column({ type: 'varchar', length: 2 })
  estado: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  area_total_hectares: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  area_agricultavel_hectares: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  area_vegetacao_hectares: number;

  @OneToMany(() => SafraCultura, (safraCultura) => safraCultura.produtor)
  safras_culturas: SafraCultura[];
}
