import { Injectable, Logger } from '@nestjs/common';

export interface AuditLogData {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLoggerService {
  private readonly logger = new Logger(AuditLoggerService.name);

  // Log de operações de autenticação
  logAuth(data: {
    userId?: string;
    action: 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'LOGIN_FAILED';
    ip?: string;
    userAgent?: string;
    details?: Record<string, any>;
  }) {
    this.logger.log({
      message: 'Authentication Event',
      category: 'AUTH',
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Log de operações CRUD
  logCrudOperation(data: {
    userId: string;
    action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
    ip?: string;
  }) {
    this.logger.log({
      message: 'CRUD Operation',
      category: 'CRUD',
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Log de operações de validação
  logValidation(data: {
    action: 'CPF_VALIDATION' | 'CNPJ_VALIDATION' | 'AREA_VALIDATION';
    resource: string;
    success: boolean;
    details?: Record<string, any>;
  }) {
    this.logger.log({
      message: 'Validation Event',
      category: 'VALIDATION',
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Log de erros de negócio
  logBusinessError(data: {
    userId?: string;
    action: string;
    resource: string;
    error: string;
    details?: Record<string, any>;
    ip?: string;
  }) {
    this.logger.error({
      message: 'Business Error',
      category: 'BUSINESS_ERROR',
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Log de performance
  logPerformance(data: {
    operation: string;
    duration: number;
    resource?: string;
    details?: Record<string, any>;
  }) {
    const level = data.duration > 5000 ? 'warn' : 'log';
    this.logger[level]({
      message: 'Performance Metric',
      category: 'PERFORMANCE',
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Log de acesso a dados sensíveis
  logDataAccess(data: {
    userId: string;
    action: 'READ' | 'export' | 'search';
    dataType: 'CPF' | 'CNPJ' | 'PRODUCER_DATA' | 'PROPERTY_DATA';
    count?: number;
    ip?: string;
  }) {
    this.logger.log({
      message: 'Sensitive Data Access',
      category: 'DATA_ACCESS',
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Log genérico de auditoria
  logAudit(data: AuditLogData) {
    this.logger.log({
      message: 'Audit Event',
      category: 'AUDIT',
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
} 