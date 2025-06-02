import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropriedadesService } from './propriedades.service';
import { PropriedadesController } from './propriedades.controller';
import { Propriedade } from './entities/propriedade.entity';
import { ProdutoresModule } from '../produtores/produtores.module';

@Module({
  imports: [TypeOrmModule.forFeature([Propriedade]), ProdutoresModule],
  controllers: [PropriedadesController],
  providers: [PropriedadesService],
  exports: [PropriedadesService],
})
export class PropriedadesModule {}
