import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProdutoresService } from './produtores.service';
import { Produtor } from './entities/produtor.entity';
import { CreateProdutorDto } from './dto/create-produtor.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProdutoresService', () => {
  let service: ProdutoresService;
  let repository: Repository<Produtor>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutoresService,
        {
          provide: getRepositoryToken(Produtor),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProdutoresService>(ProdutoresService);
    repository = module.get<Repository<Produtor>>(getRepositoryToken(Produtor));

    // Limpa os mocks entre os testes
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Validação de CPF/CNPJ', () => {
    const baseProdutorDto: Omit<CreateProdutorDto, 'cpf' | 'cnpj'> = {
      nome_produtor: 'João Silva',
      nome_fazenda: 'Fazenda Teste',
      cidade: 'Cidade Teste',
      estado: 'SP',
      area_total_hectares: 1000,
      area_agricultavel_hectares: 800,
      area_vegetacao_hectares: 200,
    };

    describe('Criação de Produtor', () => {
      it('deve criar produtor com CPF válido', async () => {
        const dto = {
          ...baseProdutorDto,
          cpf: '529.982.247-25',
        };

        mockRepository.create.mockReturnValue(dto);
        mockRepository.save.mockResolvedValue({ id: '1', ...dto });

        const result = await service.create(dto);
        expect(result).toBeDefined();
        expect(result.cpf).toBe('529.982.247-25');
      });

      it('deve criar produtor com CNPJ válido', async () => {
        const dto = {
          ...baseProdutorDto,
          cnpj: '11.444.777/0001-61',
        };

        mockRepository.create.mockReturnValue(dto);
        mockRepository.save.mockResolvedValue({ id: '1', ...dto });

        const result = await service.create(dto);
        expect(result).toBeDefined();
        expect(result.cnpj).toBe('11.444.777/0001-61');
      });

      it('deve rejeitar quando nenhum documento é fornecido', async () => {
        const dto = {
          ...baseProdutorDto,
        };

        await expect(service.create(dto)).rejects.toThrow(BadRequestException);
        await expect(service.create(dto)).rejects.toThrow(
          'É necessário fornecer pelo menos um documento de identificação (CPF ou CNPJ)',
        );
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
      });

      it('deve rejeitar CPF duplicado', async () => {
        const dto = {
          ...baseProdutorDto,
          cpf: '529.982.247-25',
        };

        mockRepository.save.mockRejectedValue({
          code: '23505', // Código de erro do PostgreSQL para unique_violation
          detail: 'Key (cpf)=(529.982.247-25) already exists.',
        });

        await expect(service.create(dto)).rejects.toThrow(
          'CPF já cadastrado no sistema',
        );
      });

      it('deve rejeitar CNPJ duplicado', async () => {
        const dto = {
          ...baseProdutorDto,
          cnpj: '11.444.777/0001-61',
        };

        mockRepository.save.mockRejectedValue({
          code: '23505',
          detail: 'Key (cnpj)=(11.444.777/0001-61) already exists.',
        });

        await expect(service.create(dto)).rejects.toThrow(
          'CNPJ já cadastrado no sistema',
        );
      });
    });

    describe('Atualização de Produtor', () => {
      const existingProdutor = {
        id: '1',
        ...baseProdutorDto,
        cpf: '529.982.247-25',
      };

      beforeEach(() => {
        mockRepository.findOne.mockResolvedValue(existingProdutor);
      });

      it('deve atualizar produtor mantendo o mesmo CPF', async () => {
        const updateDto = {
          ...baseProdutorDto,
          cpf: '529.982.247-25',
          nome_produtor: 'João Silva Atualizado',
        };

        mockRepository.save.mockResolvedValue({ ...existingProdutor, ...updateDto });

        const result = await service.update('1', updateDto);
        expect(result.nome_produtor).toBe('João Silva Atualizado');
        expect(result.cpf).toBe('529.982.247-25');
      });

      it('deve permitir trocar CPF por CNPJ', async () => {
        const updateDto = {
          ...baseProdutorDto,
          cnpj: '11.444.777/0001-61',
        };

        mockRepository.save.mockResolvedValue({
          ...existingProdutor,
          cpf: null,
          ...updateDto,
        });

        const result = await service.update('1', updateDto);
        expect(result.cpf).toBeNull();
        expect(result.cnpj).toBe('11.444.777/0001-61');
      });

      it('deve rejeitar atualização com CPF e CNPJ simultaneamente', async () => {
        const updateDto = {
          ...baseProdutorDto,
          cpf: '529.982.247-25',
          cnpj: '11.444.777/0001-61',
        };

        await expect(service.update('1', updateDto)).rejects.toThrow(
          'Não é permitido fornecer CPF e CNPJ simultaneamente',
        );
      });

      it('deve rejeitar atualização sem nenhum documento', async () => {
        const updateDto = {
          ...baseProdutorDto,
        };

        await expect(service.update('1', updateDto)).rejects.toThrow(
          'É necessário fornecer pelo menos um documento de identificação (CPF ou CNPJ)',
        );
      });

      it('deve rejeitar quando produtor não existe', async () => {
        mockRepository.findOne.mockResolvedValue(null);

        await expect(
          service.update('999', {
            ...baseProdutorDto,
            cpf: '529.982.247-25',
          }),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });
}); 