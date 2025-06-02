import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @ApiProperty({
    description: 'ID único do usuário',
    example: 'f4b0951e-1a57-4464-9cfd-fa5896509869',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'usuario@exemplo.com',
  })
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João Silva',
  })
  @Column()
  name: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
