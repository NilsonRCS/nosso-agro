import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SafraCultura } from './entities/safra-cultura.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SafraCultura])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class SafrasModule {} 