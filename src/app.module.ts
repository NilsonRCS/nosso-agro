import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdutoresModule } from './modules/produtores/produtores.module';
import { SafrasModule } from './modules/safras/safras.module';
import { databaseConfig } from './config/database.config';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    ProdutoresModule,
    SafrasModule,
    TerminusModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
