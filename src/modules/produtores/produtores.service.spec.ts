import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProdutoresService } from './produtores.service';
import { Produtor } from './entities/produtor.entity';
import { CreateProdutorDto } from './dto/create-produtor.dto';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { AuditLoggerService } from '../../services/audit-logger.service';

describe('ProdutoresService', () => {
  let service: ProdutoresService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockAuditLogger = {
    logCrudOperation: jest.fn(),
    logDataAccess: jest.fn(),
    logPerformance: jest.fn(),
    logBusinessError: jest.fn(),
    logValidation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutoresService,
        {
          provide: getRepositoryToken(Produtor),
          useValue: mockRepository,
        },
        {
          provide: AuditLoggerService,
          useValue: mockAuditLogger,
        },
      ],
    }).compile();

    service = module.get<ProdutoresService>(ProdutoresService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const baseProdutorDto: Omit<CreateProdutorDto, 'cpf' | 'cnpj'> = {
      nome_produtor: 'João Silva',
      nome_fazenda: 'Fazenda Teste',
      cidade: 'Cidade Teste',
      estado: 'SP',
      area_total_hectares: 1000,
      area_agricultavel_hectares: 800,
      area_vegetacao_hectares: 200,
    };

    it('deve criar produtor com CPF válido', async () => {
      const dto = {
        ...baseProdutorDto,
        cpf: '529.982.247-25',
      };

      const savedProdutor = { id: 'test-id', ...dto };
      mockRepository.create.mockReturnValue(dto);
      mockRepository.save.mockResolvedValue(savedProdutor);

      const result = await service.create(dto, 'user-123', '127.0.0.1');

      expect(result).toEqual(savedProdutor);
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(dto);
      expect(mockAuditLogger.logCrudOperation).toHaveBeenCalledWith({
        userId: 'user-123',
        action: 'CREATE',
        resource: 'PRODUTOR',
        resourceId: 'test-id',
        details: {
          cpf: '[REDACTED]',
          cnpj: undefined,
          nome_produtor: 'João Silva',
        },
        ip: '127.0.0.1',
      });
    });

    it('deve criar produtor com CNPJ válido', async () => {
      const dto = {
        ...baseProdutorDto,
        cnpj: '11.444.777/0001-61',
      };

      const savedProdutor = { id: 'test-id', ...dto };
      mockRepository.create.mockReturnValue(dto);
      mockRepository.save.mockResolvedValue(savedProdutor);

      const result = await service.create(dto, 'user-123');

      expect(result).toEqual(savedProdutor);
      expect(mockAuditLogger.logCrudOperation).toHaveBeenCalledWith({
        userId: 'user-123',
        action: 'CREATE',
        resource: 'PRODUTOR',
        resourceId: 'test-id',
        details: {
          cpf: undefined,
          cnpj: '[REDACTED]',
          nome_produtor: 'João Silva',
        },
        ip: undefined,
      });
    });

    it('deve criar produtor com userId anonymous quando não fornecido', async () => {
      const dto = {
        ...baseProdutorDto,
        cpf: '529.982.247-25',
      };

      const savedProdutor = { id: 'test-id', ...dto };
      mockRepository.create.mockReturnValue(dto);
      mockRepository.save.mockResolvedValue(savedProdutor);

      await service.create(dto);

      expect(mockAuditLogger.logCrudOperation).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'anonymous',
        })
      );
    });

    it('deve logar performance quando operação demora mais que 1 segundo', async () => {
      const dto = {
        ...baseProdutorDto,
        cpf: '529.982.247-25',
      };

      const savedProdutor = { id: 'test-id', ...dto };
      mockRepository.create.mockReturnValue(dto);
      
      mockRepository.save.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(savedProdutor), 1100))
      );

      await service.create(dto, 'user-123');

      expect(mockAuditLogger.logPerformance).toHaveBeenCalledWith({
        operation: 'CREATE_PRODUTOR',
        duration: expect.any(Number),
        resource: 'PRODUTOR',
        details: { resourceId: 'test-id' },
      });
    });

    it('deve rejeitar quando nenhum documento é fornecido', async () => {
      const dto = {
        ...baseProdutorDto,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'É necessário fornecer pelo menos um documento de identificação (CPF ou CNPJ)',
      );

      expect(mockAuditLogger.logValidation).toHaveBeenCalledWith({
        action: 'CNPJ_VALIDATION',
        resource: 'PRODUTOR',
        success: false,
        details: { hasCpf: false, hasCnpj: false },
      });
    });

    it('deve rejeitar quando CPF e CNPJ são fornecidos juntos', async () => {
      const dto = {
        ...baseProdutorDto,
        cpf: '529.982.247-25',
        cnpj: '11.444.777/0001-61',
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'Não é permitido fornecer CPF e CNPJ simultaneamente',
      );

      expect(mockAuditLogger.logValidation).toHaveBeenCalledWith({
        action: 'CPF_VALIDATION',
        resource: 'PRODUTOR',
        success: false,
        details: { hasCpf: true, hasCnpj: true },
      });
    });

    it('deve rejeitar quando soma das áreas excede área total', async () => {
      const dto = {
        ...baseProdutorDto,
        cpf: '529.982.247-25',
        area_total_hectares: 1000,
        area_agricultavel_hectares: 800,
        area_vegetacao_hectares: 300,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'A soma das áreas agricultável e de vegetação não pode exceder a área total',
      );

      expect(mockAuditLogger.logValidation).toHaveBeenCalledWith({
        action: 'AREA_VALIDATION',
        resource: 'PRODUTOR',
        success: false,
        details: {
          area_total: 1000,
          area_agricultavel: 800,
          area_vegetacao: 300,
          soma: 1100,
        },
      });
    });

    it('deve rejeitar CPF duplicado', async () => {
      const dto = {
        ...baseProdutorDto,
        cpf: '529.982.247-25',
      };

      const postgresError = {
        code: '23505',
        detail: 'Key (cpf)=(529.982.247-25) already exists.',
        message: 'duplicate key value violates unique constraint',
      };

      mockRepository.create.mockReturnValue(dto);
      mockRepository.save.mockRejectedValue(postgresError);

      await expect(service.create(dto, 'user-123')).rejects.toThrow(ConflictException);
      await expect(service.create(dto, 'user-123')).rejects.toThrow(
        'CPF já cadastrado no sistema',
      );

      expect(mockAuditLogger.logBusinessError).toHaveBeenCalledWith({
        userId: 'user-123',
        action: 'CREATE',
        resource: 'PRODUTOR',
        error: 'duplicate key value violates unique constraint',
        details: { duration: expect.any(Number) },
        ip: undefined,
      });
    });

    it('deve rejeitar CNPJ duplicado', async () => {
      const dto = {
        ...baseProdutorDto,
        cnpj: '11.444.777/0001-61',
      };

      mockRepository.create.mockReturnValue(dto);
      mockRepository.save.mockRejectedValue({
        code: '23505',
        detail: 'Key (cnpj)=(11.444.777/0001-61) already exists.',
      });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(
        'CNPJ já cadastrado no sistema',
      );
    });

    it('deve relançar erro não relacionado ao PostgreSQL', async () => {
      const dto = {
        ...baseProdutorDto,
        cpf: '529.982.247-25',
      };

      const genericError = new Error('Database connection failed');
      mockRepository.create.mockReturnValue(dto);
      mockRepository.save.mockRejectedValue(genericError);

      await expect(service.create(dto)).rejects.toThrow('Database connection failed');

      expect(mockAuditLogger.logBusinessError).toHaveBeenCalledWith({
        userId: 'anonymous',
        action: 'CREATE',
        resource: 'PRODUTOR',
        error: 'Database connection failed',
        details: { duration: expect.any(Number) },
        ip: undefined,
      });
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de produtores', async () => {
      const produtores = [
        { id: '1', nome_produtor: 'João' },
        { id: '2', nome_produtor: 'Maria' },
      ];

      mockRepository.find.mockResolvedValue(produtores);

      const result = await service.findAll('user-123');

      expect(result).toEqual(produtores);
      expect(mockAuditLogger.logDataAccess).toHaveBeenCalledWith({
        userId: 'user-123',
        action: 'READ',
        dataType: 'PRODUCER_DATA',
        count: 2,
      });
      expect(mockAuditLogger.logPerformance).toHaveBeenCalledWith({
        operation: 'LIST_PRODUTORES',
        duration: expect.any(Number),
        resource: 'PRODUTOR',
        details: { count: 2 },
      });
    });

    it('deve lidar com erro na busca', async () => {
      const error = new Error('Database error');
      mockRepository.find.mockRejectedValue(error);

      await expect(service.findAll('user-123')).rejects.toThrow('Database error');

      expect(mockAuditLogger.logBusinessError).toHaveBeenCalledWith({
        userId: 'user-123',
        action: 'read',
        resource: 'PRODUTOR',
        error: 'Database error',
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar produtor quando encontrado', async () => {
      const produtor = { id: '1', nome_produtor: 'João' };
      mockRepository.findOne.mockResolvedValue(produtor);

      const result = await service.findOne('1', 'user-123');

      expect(result).toEqual(produtor);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(mockAuditLogger.logCrudOperation).toHaveBeenCalledWith({
        userId: 'user-123',
        action: 'READ',
        resource: 'PRODUTOR',
        resourceId: '1',
      });
    });

    it('deve lançar NotFoundException quando produtor não existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999', 'user-123')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('999', 'user-123')).rejects.toThrow(
        'Produtor com ID 999 não encontrado'
      );

      expect(mockAuditLogger.logBusinessError).toHaveBeenCalledWith({
        userId: 'user-123',
        action: 'READ',
        resource: 'PRODUTOR',
        error: 'Produtor com ID 999 não encontrado',
        details: { resourceId: '999' },
      });
    });
  });

  describe('update', () => {
    const baseProdutorDto: CreateProdutorDto = {
      nome_produtor: 'João Silva Atualizado',
      nome_fazenda: 'Fazenda Teste',
      cidade: 'Cidade Teste',
      estado: 'SP',
      area_total_hectares: 1000,
      area_agricultavel_hectares: 800,
      area_vegetacao_hectares: 200,
      cpf: '529.982.247-25',
    };

    it('deve atualizar produtor com sucesso', async () => {
      const existingProdutor = { id: '1', nome_produtor: 'João' };
      const updatedProdutor = { ...existingProdutor, ...baseProdutorDto };

      mockRepository.findOne.mockResolvedValue(existingProdutor);
      mockRepository.save.mockResolvedValue(updatedProdutor);

      const result = await service.update('1', baseProdutorDto, 'user-123', '127.0.0.1');

      expect(result).toEqual(updatedProdutor);
      expect(mockAuditLogger.logCrudOperation).toHaveBeenCalledWith({
        userId: 'user-123',
        action: 'UPDATE',
        resource: 'PRODUTOR',
        resourceId: '1',
        details: {
          cpf: '[REDACTED]',
          cnpj: undefined,
          nome_produtor: 'João Silva Atualizado',
          duration: expect.any(Number),
        },
        ip: '127.0.0.1',
      });
    });

    it('deve falhar ao atualizar produtor inexistente', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('999', baseProdutorDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover produtor com sucesso', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('1', 'user-123', '127.0.0.1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
      expect(mockAuditLogger.logCrudOperation).toHaveBeenCalledWith({
        userId: 'user-123',
        action: 'DELETE',
        resource: 'PRODUTOR',
        resourceId: '1',
        ip: '127.0.0.1',
      });
    });

    it('deve lançar NotFoundException quando produtor não existe', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
      await expect(service.remove('999')).rejects.toThrow(
        'Produtor com ID 999 não encontrado'
      );

      expect(mockAuditLogger.logBusinessError).toHaveBeenCalledWith({
        userId: 'anonymous',
        action: 'DELETE',
        resource: 'PRODUTOR',
        error: 'Produtor com ID 999 não encontrado',
        details: { resourceId: '999' },
        ip: undefined,
      });
    });
  });

  describe('validateAreas', () => {
    it('deve validar áreas corretamente quando válidas', () => {
      const dto = {
        area_total_hectares: 1000,
        area_agricultavel_hectares: 600,
        area_vegetacao_hectares: 400,
      } as CreateProdutorDto;

      expect(() => service['validateAreas'](dto)).not.toThrow();

      expect(mockAuditLogger.logValidation).toHaveBeenCalledWith({
        action: 'AREA_VALIDATION',
        resource: 'PRODUTOR',
        success: true,
        details: {
          area_total: 1000,
          area_agricultavel: 600,
          area_vegetacao: 400,
          soma: 1000,
        },
      });
    });
  });

  describe('validateIdentificacao', () => {
    it('deve validar identificação corretamente com CPF', () => {
      const dto = { cpf: '123.456.789-01' } as CreateProdutorDto;

      expect(() => service['validateIdentificacao'](dto)).not.toThrow();

      expect(mockAuditLogger.logValidation).toHaveBeenCalledWith({
        action: 'CPF_VALIDATION',
        resource: 'PRODUTOR',
        success: true,
        details: { hasCpf: true, hasCnpj: false },
      });
    });

    it('deve validar identificação corretamente com CNPJ', () => {
      const dto = { cnpj: '11.444.777/0001-61' } as CreateProdutorDto;

      expect(() => service['validateIdentificacao'](dto)).not.toThrow();

      expect(mockAuditLogger.logValidation).toHaveBeenCalledWith({
        action: 'CNPJ_VALIDATION',
        resource: 'PRODUTOR',
        success: true,
        details: { hasCpf: false, hasCnpj: true },
      });
    });
  });
}); 