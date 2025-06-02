import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProdutoresModule } from './modules/produtores/produtores.module';
import { PropriedadesModule } from './modules/propriedades/propriedades.module';
import { SafrasModule } from './modules/safras/safras.module';
import { getTypeOrmConfig } from './config/typeorm.config';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { AuditLoggerService } from './services/audit-logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ProdutoresModule,
    PropriedadesModule,
    SafrasModule,
  ],
  providers: [
    // Global HTTP Logging Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Audit Logger Service
    AuditLoggerService,
  ],
})
export class AppModule {}
