import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { createWinstonConfig } from './config/winston.config';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  // Criar diretório de logs se não existir
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'verbose'],
  });

  // Configurar Winston Logger
  const configService = app.get(ConfigService);
  const winstonLogger = createWinstonConfig(configService);
  app.useLogger(winstonLogger);

  // Logger para inicialização
  const logger = new Logger('Bootstrap');
  
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Nosso Agro API')
    .setDescription('API para gerenciamento de produtores rurais e suas safras')
    .setVersion('1.0')
    .addTag('auth', 'Endpoints de autenticação')
    .addTag('produtores', 'Endpoints de gerenciamento de produtores')
    .addTag('propriedades', 'Endpoints de gerenciamento de propriedades')
    .addTag('safras', 'Endpoints de gerenciamento de safras')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  logger.log(`🗂️  Logs directory: ${logsDir}`);
  logger.log(`📊 Log level: ${configService.get('LOG_LEVEL') || 'info'}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
