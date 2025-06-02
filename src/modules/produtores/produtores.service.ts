import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produtor } from './entities/produtor.entity';
import { CreateProdutorDto } from './dto/create-produtor.dto';
import { AuditLoggerService } from '../../services/audit-logger.service';

interface PostgresError {
  code: string;
  detail: string;
}

@Injectable()
export class ProdutoresService {
  constructor(
    @InjectRepository(Produtor)
    private readonly produtorRepository: Repository<Produtor>,
    private readonly auditLogger: AuditLoggerService,
  ) {}

  async create(createProdutorDto: CreateProdutorDto, userId?: string, ip?: string): Promise<Produtor> {
    const startTime = Date.now();
    
    try {
      this.validateIdentificacao(createProdutorDto);
      this.validateAreas(createProdutorDto);
      
      const produtor = this.produtorRepository.create(createProdutorDto);
      const savedProdutor = await this.produtorRepository.save(produtor);
      
      const duration = Date.now() - startTime;
      
      // Log da operação de criação
      this.auditLogger.logCrudOperation({
        userId: userId || 'anonymous',
        action: 'CREATE',
        resource: 'PRODUTOR',
        resourceId: savedProdutor.id,
        details: {
          cpf: createProdutorDto.cpf ? '[REDACTED]' : undefined,
          cnpj: createProdutorDto.cnpj ? '[REDACTED]' : undefined,
          nome_produtor: createProdutorDto.nome_produtor,
        },
        ip,
      });

      // Log de performance se demorou mais que o normal
      if (duration > 1000) {
        this.auditLogger.logPerformance({
          operation: 'CREATE_PRODUTOR',
          duration,
          resource: 'PRODUTOR',
          details: { resourceId: savedProdutor.id },
        });
      }

      return savedProdutor;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log de erro na criação
      this.auditLogger.logBusinessError({
        userId: userId || 'anonymous',
        action: 'CREATE',
        resource: 'PRODUTOR',
        error: error.message,
        details: { duration },
        ip,
      });

      if (this.isPostgresError(error) && error.code === '23505') {
        if (error.detail.includes('(cpf)')) {
          throw new ConflictException('CPF já cadastrado no sistema');
        }
        if (error.detail.includes('(cnpj)')) {
          throw new ConflictException('CNPJ já cadastrado no sistema');
        }
      }
      throw error;
    }
  }

  async findAll(userId?: string): Promise<Produtor[]> {
    const startTime = Date.now();
    
    try {
      const produtores = await this.produtorRepository.find();
      const duration = Date.now() - startTime;

      // Log de acesso a dados sensíveis
      this.auditLogger.logDataAccess({
        userId: userId || 'anonymous',
        action: 'READ',
        dataType: 'PRODUCER_DATA',
        count: produtores.length,
      });

      // Log de performance
      this.auditLogger.logPerformance({
        operation: 'LIST_PRODUTORES',
        duration,
        resource: 'PRODUTOR',
        details: { count: produtores.length },
      });

      return produtores;
    } catch (error) {
      this.auditLogger.logBusinessError({
        userId: userId || 'anonymous',
        action: 'READ',
        resource: 'PRODUTOR',
        error: error.message,
      });
      throw error;
    }
  }

  async findOne(id: string, userId?: string): Promise<Produtor> {
    try {
      const produtor = await this.produtorRepository.findOne({ where: { id } });
      
      if (!produtor) {
        throw new NotFoundException(`Produtor com ID ${id} não encontrado`);
      }

      // Log de acesso a dados específicos
      this.auditLogger.logCrudOperation({
        userId: userId || 'anonymous',
        action: 'READ',
        resource: 'PRODUTOR',
        resourceId: id,
      });

      return produtor;
    } catch (error) {
      this.auditLogger.logBusinessError({
        userId: userId || 'anonymous',
        action: 'READ',
        resource: 'PRODUTOR',
        error: error.message,
        details: { resourceId: id },
      });
      throw error;
    }
  }

  async update(
    id: string,
    updateProdutorDto: CreateProdutorDto,
    userId?: string,
    ip?: string,
  ): Promise<Produtor> {
    const startTime = Date.now();
    
    try {
      this.validateIdentificacao(updateProdutorDto);
      this.validateAreas(updateProdutorDto);
      
      const produtor = await this.findOne(id, userId);
      Object.assign(produtor, updateProdutorDto);
      
      const updatedProdutor = await this.produtorRepository.save(produtor);
      const duration = Date.now() - startTime;

      // Log da operação de atualização
      this.auditLogger.logCrudOperation({
        userId: userId || 'anonymous',
        action: 'UPDATE',
        resource: 'PRODUTOR',
        resourceId: id,
        details: {
          cpf: updateProdutorDto.cpf ? '[REDACTED]' : undefined,
          cnpj: updateProdutorDto.cnpj ? '[REDACTED]' : undefined,
          nome_produtor: updateProdutorDto.nome_produtor,
          duration,
        },
        ip,
      });

      return updatedProdutor;
    } catch (error) {
      this.auditLogger.logBusinessError({
        userId: userId || 'anonymous',
        action: 'UPDATE',
        resource: 'PRODUTOR',
        error: error.message,
        details: { resourceId: id },
        ip,
      });

      if (this.isPostgresError(error) && error.code === '23505') {
        if (error.detail.includes('(cpf)')) {
          throw new ConflictException('CPF já cadastrado no sistema');
        }
        if (error.detail.includes('(cnpj)')) {
          throw new ConflictException('CNPJ já cadastrado no sistema');
        }
      }
      throw error;
    }
  }

  async remove(id: string, userId?: string, ip?: string): Promise<void> {
    try {
      const result = await this.produtorRepository.delete(id);
      
      if (result.affected === 0) {
        throw new NotFoundException(`Produtor com ID ${id} não encontrado`);
      }

      // Log da operação de exclusão
      this.auditLogger.logCrudOperation({
        userId: userId || 'anonymous',
        action: 'DELETE',
        resource: 'PRODUTOR',
        resourceId: id,
        ip,
      });
    } catch (error) {
      this.auditLogger.logBusinessError({
        userId: userId || 'anonymous',
        action: 'DELETE',
        resource: 'PRODUTOR',
        error: error.message,
        details: { resourceId: id },
        ip,
      });
      throw error;
    }
  }

  private validateAreas(dto: CreateProdutorDto): void {
    const {
      area_total_hectares,
      area_agricultavel_hectares,
      area_vegetacao_hectares,
    } = dto;
    
    const isValid = area_agricultavel_hectares + area_vegetacao_hectares <= area_total_hectares;
    
    // Log da validação de área
    this.auditLogger.logValidation({
      action: 'AREA_VALIDATION',
      resource: 'PRODUTOR',
      success: isValid,
      details: {
        area_total: area_total_hectares,
        area_agricultavel: area_agricultavel_hectares,
        area_vegetacao: area_vegetacao_hectares,
        soma: area_agricultavel_hectares + area_vegetacao_hectares,
      },
    });

    if (!isValid) {
      throw new BadRequestException(
        'A soma das áreas agricultável e de vegetação não pode exceder a área total',
      );
    }
  }

  private validateIdentificacao(dto: CreateProdutorDto): void {
    const hasCpf = !!dto.cpf;
    const hasCnpj = !!dto.cnpj;
    
    // Log da validação de identificação
    this.auditLogger.logValidation({
      action: hasCpf ? 'CPF_VALIDATION' : 'CNPJ_VALIDATION',
      resource: 'PRODUTOR',
      success: hasCpf !== hasCnpj, // XOR - deve ter exatamente um
      details: { hasCpf, hasCnpj },
    });

    if (!hasCpf && !hasCnpj) {
      throw new BadRequestException(
        'É necessário fornecer pelo menos um documento de identificação (CPF ou CNPJ)',
      );
    }
    if (hasCpf && hasCnpj) {
      throw new BadRequestException(
        'Não é permitido fornecer CPF e CNPJ simultaneamente',
      );
    }
  }

  private isPostgresError(error: any): error is PostgresError {
    return error && typeof error.code === 'string' && typeof error.detail === 'string';
  }
}
