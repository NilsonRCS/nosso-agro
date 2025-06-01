import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Produtor } from '../../produtores/entities/produtor.entity';

@Entity('safras_culturas')
@Unique(['produtor_id', 'nome_safra', 'cultura_plantada'])
export class SafraCultura {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'produtor_id' })
  produtor_id: number;

  @ManyToOne(() => Produtor, (produtor) => produtor.safras_culturas)
  @JoinColumn({ name: 'produtor_id' })
  produtor: Produtor;

  @Column({ type: 'varchar', length: 50 })
  nome_safra: string;

  @Column({ type: 'varchar', length: 100 })
  cultura_plantada: string;

  @Column({ type: 'integer' })
  ano_safra: number;
}
