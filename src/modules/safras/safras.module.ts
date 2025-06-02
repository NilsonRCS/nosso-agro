import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SafrasService } from './safras.service';
import { SafrasController } from './safras.controller';
import { SafraCultura } from './entities/safra-cultura.entity';
import { PropriedadesModule } from '../propriedades/propriedades.module';

@Module({
  imports: [TypeOrmModule.forFeature([SafraCultura]), PropriedadesModule],
  controllers: [SafrasController],
  providers: [SafrasService],
  exports: [SafrasService],
})
export class SafrasModule {}
