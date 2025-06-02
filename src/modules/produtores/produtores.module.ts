import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdutoresController } from './produtores.controller';
import { ProdutoresService } from './produtores.service';
import { Produtor } from './entities/produtor.entity';
import { AuditLoggerService } from '../../services/audit-logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Produtor])],
  controllers: [ProdutoresController],
  providers: [ProdutoresService, AuditLoggerService],
  exports: [ProdutoresService],
})
export class ProdutoresModule {}
