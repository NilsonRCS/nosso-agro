import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProdutoresModule } from './modules/produtores/produtores.module';
import { SafrasModule } from './modules/safras/safras.module';
import { databaseConfig } from './config/database.config';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(databaseConfig),
    ProdutoresModule,
    SafrasModule,
    TerminusModule,
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
