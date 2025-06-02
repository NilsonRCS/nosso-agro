import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { ConfigService } from '@nestjs/config';

export const createWinstonConfig = (configService: ConfigService) => {
  const logLevel: string = configService.get('LOG_LEVEL') || 'info';
  const nodeEnv: string = configService.get('NODE_ENV') || 'development';

  const transports: winston.transport[] = [];

  // Console transport (sempre ativo)
  transports.push(
    new winston.transports.Console({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );

  // File transports (apenas em produção ou quando especificado)
  if (
    nodeEnv === 'production' ||
    configService.get('ENABLE_FILE_LOGS') === 'true'
  ) {
    // Logs gerais com rotação diária
    transports.push(
      new DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        level: logLevel,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    );

    // Logs de erro separados
    transports.push(
      new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    );
  }

  return WinstonModule.createLogger({
    level: logLevel,
    transports,
    exitOnError: false,
    silent: nodeEnv === 'test',
  });
}; 