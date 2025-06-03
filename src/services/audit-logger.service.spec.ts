import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { AuditLoggerService } from './audit-logger.service';

describe('AuditLoggerService', () => {
  let service: AuditLoggerService;
  let logger: Logger;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditLoggerService],
    }).compile();

    service = module.get<AuditLoggerService>(AuditLoggerService);
    logger = service['logger'];
    jest.spyOn(logger, 'log').mockImplementation(mockLogger.log);
    jest.spyOn(logger, 'error').mockImplementation(mockLogger.error);
    jest.spyOn(logger, 'warn').mockImplementation(mockLogger.warn);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logAuth', () => {
    it('deve logar evento de autenticação com sucesso', () => {
      const authData = {
        userId: 'user-123',
        action: 'LOGIN' as const,
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        details: { email: 'test@example.com' },
      };

      service.logAuth(authData);

      expect(mockLogger.log).toHaveBeenCalledWith({
        message: 'Authentication Event',
        category: 'AUTH',
        ...authData,
        timestamp: expect.any(String) as string,
      });
    });

    it('deve logar evento de falha de login', () => {
      const authData = {
        action: 'LOGIN_FAILED' as const,
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        details: { email: 'test@example.com', reason: 'Invalid credentials' },
      };

      service.logAuth(authData);

      expect(mockLogger.log).toHaveBeenCalledWith({
        message: 'Authentication Event',
        category: 'AUTH',
        ...authData,
        timestamp: expect.any(String) as string,
      });
    });
  });

  describe('logCrudOperation', () => {
    it('deve logar operação CRUD', () => {
      const crudData = {
        userId: 'user-123',
        action: 'CREATE' as const,
        resource: 'PRODUTOR',
        resourceId: 'resource-456',
        details: { nome: 'João Silva' },
        ip: '127.0.0.1',
      };

      service.logCrudOperation(crudData);

      expect(mockLogger.log).toHaveBeenCalledWith({
        message: 'CRUD Operation',
        category: 'CRUD',
        ...crudData,
        timestamp: expect.any(String) as string,
      });
    });

    it('deve logar operação de leitura sem IP', () => {
      const crudData = {
        userId: 'user-123',
        action: 'READ' as const,
        resource: 'PRODUTOR',
        resourceId: 'resource-456',
      };

      service.logCrudOperation(crudData);

      expect(mockLogger.log).toHaveBeenCalledWith({
        message: 'CRUD Operation',
        category: 'CRUD',
        ...crudData,
        timestamp: expect.any(String) as string,
      });
    });
  });

  describe('logValidation', () => {
    it('deve logar validação de CPF bem-sucedida', () => {
      const validationData = {
        action: 'CPF_VALIDATION' as const,
        resource: 'PRODUTOR',
        success: true,
        details: { cpf: '123.456.789-01' },
      };

      service.logValidation(validationData);

      expect(mockLogger.log).toHaveBeenCalledWith({
        message: 'Validation Event',
        category: 'VALIDATION',
        ...validationData,
        timestamp: expect.any(String) as string,
      });
    });

    it('deve logar validação de área falhada', () => {
      const validationData = {
        action: 'AREA_VALIDATION' as const,
        resource: 'PRODUTOR',
        success: false,
        details: {
          area_total: 1000,
          area_agricultavel: 800,
          area_vegetacao: 300,
          soma: 1100,
        },
      };

      service.logValidation(validationData);

      expect(mockLogger.log).toHaveBeenCalledWith({
        message: 'Validation Event',
        category: 'VALIDATION',
        ...validationData,
        timestamp: expect.any(String) as string,
      });
    });
  });

  describe('logBusinessError', () => {
    it('deve logar erro de negócio', () => {
      const errorData = {
        userId: 'user-123',
        action: 'CREATE',
        resource: 'PRODUTOR',
        error: 'CPF já cadastrado no sistema',
        details: { cpf: '[REDACTED]' },
        ip: '127.0.0.1',
      };

      service.logBusinessError(errorData);

      expect(mockLogger.error).toHaveBeenCalledWith({
        message: 'Business Error',
        category: 'BUSINESS_ERROR',
        ...errorData,
        timestamp: expect.any(String) as string,
      });
    });

    it('deve logar erro sem userId', () => {
      const errorData = {
        action: 'DELETE',
        resource: 'PRODUTOR',
        error: 'Produtor não encontrado',
        details: { id: '999' },
      };

      service.logBusinessError(errorData);

      expect(mockLogger.error).toHaveBeenCalledWith({
        message: 'Business Error',
        category: 'BUSINESS_ERROR',
        ...errorData,
        timestamp: expect.any(String) as string,
      });
    });
  });

  describe('logPerformance', () => {
    it('deve logar métrica de performance normal', () => {
      const performanceData = {
        operation: 'CREATE_PRODUTOR',
        duration: 150,
        resource: 'PRODUTOR',
        details: { count: 1 },
      };

      service.logPerformance(performanceData);

      expect(mockLogger.log).toHaveBeenCalledWith({
        message: 'Performance Metric',
        category: 'PERFORMANCE',
        ...performanceData,
        timestamp: expect.any(String) as string,
      });
    });

    it('deve logar métrica de performance lenta como warning', () => {
      const performanceData = {
        operation: 'LIST_PRODUTORES',
        duration: 6000,
        resource: 'PRODUTOR',
        details: { count: 1000 },
      };

      service.logPerformance(performanceData);

      expect(mockLogger.warn).toHaveBeenCalledWith({
        message: 'Performance Metric',
        category: 'PERFORMANCE',
        ...performanceData,
        timestamp: expect.any(String) as string,
      });
    });

    it('deve logar performance sem resource', () => {
      const performanceData = {
        operation: 'DATABASE_CONNECTION',
        duration: 100,
      };

      service.logPerformance(performanceData);

      expect(mockLogger.log).toHaveBeenCalledWith({
        message: 'Performance Metric',
        category: 'PERFORMANCE',
        ...performanceData,
        timestamp: expect.any(String) as string,
      });
    });
  });

  describe('logDataAccess', () => {
    it('deve logar acesso a dados sensíveis', () => {
      const dataAccessData = {
        userId: 'user-123',
        action: 'READ' as const,
        dataType: 'CPF' as const,
        count: 5,
        ip: '127.0.0.1',
      };

      service.logDataAccess(dataAccessData);

      expect(mockLogger.log).toHaveBeenCalledWith({
        message: 'Sensitive Data Access',
        category: 'DATA_ACCESS',
        ...dataAccessData,
        timestamp: expect.any(String) as string,
      });
    });

    it('deve logar exportação de dados', () => {
      const dataAccessData = {
        userId: 'user-123',
        action: 'export' as const,
        dataType: 'PRODUCER_DATA' as const,
        count: 100,
      };

      service.logDataAccess(dataAccessData);

      expect(mockLogger.log).toHaveBeenCalledWith({
        message: 'Sensitive Data Access',
        category: 'DATA_ACCESS',
        ...dataAccessData,
        timestamp: expect.any(String) as string,
      });
    });
  });

  describe('logAudit', () => {
    it('deve logar evento de auditoria genérico', () => {
      const auditData = {
        userId: 'user-123',
        action: 'SYSTEM_MAINTENANCE',
        resource: 'SYSTEM',
        resourceId: 'config-1',
        details: { operation: 'database cleanup' },
        ip: '127.0.0.1',
        userAgent: 'Admin Tool',
      };

      service.logAudit(auditData);

      expect(mockLogger.log).toHaveBeenCalledWith({
        message: 'Audit Event',
        category: 'AUDIT',
        ...auditData,
        timestamp: expect.any(String) as string,
      });
    });

    it('deve logar auditoria mínima', () => {
      const auditData = {
        action: 'VIEW',
        resource: 'DASHBOARD',
      };

      service.logAudit(auditData);

      expect(mockLogger.log).toHaveBeenCalledWith({
        message: 'Audit Event',
        category: 'AUDIT',
        ...auditData,
        timestamp: expect.any(String) as string,
      });
    });
  });

  describe('timestamp generation', () => {
    it('deve gerar timestamp no formato ISO correto', () => {
      const authData = {
        action: 'LOGIN' as const,
      };

      service.logAuth(authData);

      const logCall = mockLogger.log.mock.calls[0] as unknown[];
      const logData = logCall[0] as Record<string, any>;
      const timestamp = logData.timestamp as string;

      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });
});
