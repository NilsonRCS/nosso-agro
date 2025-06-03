import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PropriedadesService } from './propriedades.service';
import { Propriedade } from './entities/propriedade.entity';
import { CreatePropriedadeDto } from './dto/create-propriedade.dto';
import { ProdutoresService } from '../produtores/produtores.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PropriedadesService', () => {
  let service: PropriedadesService;

  const mockPropriedadeRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockProdutoresService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropriedadesService,
        {
          provide: getRepositoryToken(Propriedade),
          useValue: mockPropriedadeRepository,
        },
        {
          provide: ProdutoresService,
          useValue: mockProdutoresService,
        },
      ],
    }).compile();

    service = module.get<PropriedadesService>(PropriedadesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const produtorId = 'produtor-123';
    const createPropriedadeDto: CreatePropriedadeDto = {
      nome: 'Fazenda Teste',
      cidade: 'Cidade Teste',
      estado: 'SP',
      area_total_hectares: 1000,
      area_agricultavel_hectares: 600,
      area_vegetacao_hectares: 400,
    };

    it('deve criar propriedade com sucesso', async () => {
      const produtor = { id: produtorId, nome_produtor: 'João Silva' };
      const propriedade = { id: 'prop-123', ...createPropriedadeDto, produtor };

      mockProdutoresService.findOne.mockResolvedValue(produtor);
      mockPropriedadeRepository.create.mockReturnValue(propriedade);
      mockPropriedadeRepository.save.mockResolvedValue(propriedade);

      const result = await service.create(produtorId, createPropriedadeDto);

      expect(result).toEqual(propriedade);
      expect(mockProdutoresService.findOne).toHaveBeenCalledWith(produtorId);
      expect(mockPropriedadeRepository.create).toHaveBeenCalledWith({
        ...createPropriedadeDto,
        produtor,
      });
      expect(mockPropriedadeRepository.save).toHaveBeenCalledWith(propriedade);
    });

    it('deve falhar quando produtor não existe', async () => {
      mockProdutoresService.findOne.mockRejectedValue(
        new NotFoundException('Produtor não encontrado'),
      );

      await expect(
        service.create(produtorId, createPropriedadeDto),
      ).rejects.toThrow(NotFoundException);

      expect(mockProdutoresService.findOne).toHaveBeenCalledWith(produtorId);
      expect(mockPropriedadeRepository.create).not.toHaveBeenCalled();
    });

    it('deve falhar quando soma das áreas excede área total', async () => {
      const invalidDto = {
        ...createPropriedadeDto,
        area_total_hectares: 1000,
        area_agricultavel_hectares: 700,
        area_vegetacao_hectares: 400,
      };

      const produtor = { id: produtorId, nome_produtor: 'João Silva' };
      mockProdutoresService.findOne.mockResolvedValue(produtor);

      await expect(service.create(produtorId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(produtorId, invalidDto)).rejects.toThrow(
        'A soma das áreas agricultável e de vegetação não pode exceder a área total',
      );

      expect(mockPropriedadeRepository.create).not.toHaveBeenCalled();
    });

    it('deve aceitar quando soma das áreas é igual à área total', async () => {
      const validDto = {
        ...createPropriedadeDto,
        area_total_hectares: 1000,
        area_agricultavel_hectares: 600,
        area_vegetacao_hectares: 400,
      };

      const produtor = { id: produtorId, nome_produtor: 'João Silva' };
      const propriedade = { id: 'prop-123', ...validDto, produtor };

      mockProdutoresService.findOne.mockResolvedValue(produtor);
      mockPropriedadeRepository.create.mockReturnValue(propriedade);
      mockPropriedadeRepository.save.mockResolvedValue(propriedade);

      const result = await service.create(produtorId, validDto);

      expect(result).toEqual(propriedade);
    });
  });

  describe('findAll', () => {
    const produtorId = 'produtor-123';

    it('deve retornar todas as propriedades do produtor', async () => {
      const propriedades = [
        { id: 'prop-1', nome: 'Fazenda 1', produtor: { id: produtorId } },
        { id: 'prop-2', nome: 'Fazenda 2', produtor: { id: produtorId } },
      ];

      mockPropriedadeRepository.find.mockResolvedValue(propriedades);

      const result = await service.findAll(produtorId);

      expect(result).toEqual(propriedades);
      expect(mockPropriedadeRepository.find).toHaveBeenCalledWith({
        where: { produtor: { id: produtorId } },
        relations: ['safras_culturas'],
      });
    });

    it('deve retornar array vazio quando produtor não tem propriedades', async () => {
      mockPropriedadeRepository.find.mockResolvedValue([]);

      const result = await service.findAll(produtorId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    const produtorId = 'produtor-123';
    const propriedadeId = 'prop-123';

    it('deve retornar propriedade quando encontrada', async () => {
      const propriedade = {
        id: propriedadeId,
        nome: 'Fazenda Teste',
        produtor: { id: produtorId },
      };

      mockPropriedadeRepository.findOne.mockResolvedValue(propriedade);

      const result = await service.findOne(propriedadeId, produtorId);

      expect(result).toEqual(propriedade);
      expect(mockPropriedadeRepository.findOne).toHaveBeenCalledWith({
        where: { id: propriedadeId, produtor: { id: produtorId } },
        relations: ['safras_culturas'],
      });
    });

    it('deve lançar NotFoundException quando propriedade não existe', async () => {
      mockPropriedadeRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999', produtorId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('999', produtorId)).rejects.toThrow(
        'Propriedade com ID 999 não encontrada',
      );
    });

    it('deve lançar NotFoundException quando propriedade não pertence ao produtor', async () => {
      mockPropriedadeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(propriedadeId, 'outro-produtor'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const produtorId = 'produtor-123';
    const propriedadeId = 'prop-123';
    const updateDto: CreatePropriedadeDto = {
      nome: 'Fazenda Atualizada',
      cidade: 'Nova Cidade',
      estado: 'RJ',
      area_total_hectares: 1500,
      area_agricultavel_hectares: 900,
      area_vegetacao_hectares: 600,
    };

    it('deve atualizar propriedade com sucesso', async () => {
      const propriedadeExistente = {
        id: propriedadeId,
        nome: 'Fazenda Antiga',
        produtor: { id: produtorId },
      };
      const propriedadeAtualizada = { ...propriedadeExistente, ...updateDto };

      mockPropriedadeRepository.findOne.mockResolvedValue(propriedadeExistente);
      mockPropriedadeRepository.save.mockResolvedValue(propriedadeAtualizada);

      const result = await service.update(propriedadeId, produtorId, updateDto);

      expect(result).toEqual(propriedadeAtualizada);
      expect(mockPropriedadeRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateDto),
      );
    });

    it('deve falhar quando propriedade não existe', async () => {
      mockPropriedadeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('999', produtorId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve falhar quando áreas são inválidas', async () => {
      const propriedadeExistente = {
        id: propriedadeId,
        nome: 'Fazenda Antiga',
        produtor: { id: produtorId },
      };
      const invalidUpdateDto = {
        ...updateDto,
        area_total_hectares: 1000,
        area_agricultavel_hectares: 800,
        area_vegetacao_hectares: 300,
      };

      mockPropriedadeRepository.findOne.mockResolvedValue(propriedadeExistente);

      await expect(
        service.update(propriedadeId, produtorId, invalidUpdateDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    const produtorId = 'produtor-123';
    const propriedadeId = 'prop-123';

    it('deve remover propriedade com sucesso', async () => {
      const propriedade = {
        id: propriedadeId,
        nome: 'Fazenda Teste',
        produtor: { id: produtorId },
      };

      mockPropriedadeRepository.findOne.mockResolvedValue(propriedade);
      mockPropriedadeRepository.remove.mockResolvedValue(propriedade);

      await service.remove(propriedadeId, produtorId);

      expect(mockPropriedadeRepository.remove).toHaveBeenCalledWith(
        propriedade,
      );
    });

    it('deve falhar quando propriedade não existe', async () => {
      mockPropriedadeRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999', produtorId)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPropriedadeRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('validateAreas', () => {
    it('deve validar áreas corretas', () => {
      const dto = {
        area_total_hectares: 1000,
        area_agricultavel_hectares: 600,
        area_vegetacao_hectares: 400,
      } as CreatePropriedadeDto;

      expect(() => service['validateAreas'](dto)).not.toThrow();
    });

    it('deve falhar quando soma excede total', () => {
      const dto = {
        area_total_hectares: 1000,
        area_agricultavel_hectares: 700,
        area_vegetacao_hectares: 400,
      } as CreatePropriedadeDto;

      expect(() => service['validateAreas'](dto)).toThrow(BadRequestException);
    });

    it('deve permitir soma igual ao total', () => {
      const dto = {
        area_total_hectares: 1000,
        area_agricultavel_hectares: 600,
        area_vegetacao_hectares: 400,
      } as CreatePropriedadeDto;

      expect(() => service['validateAreas'](dto)).not.toThrow();
    });

    it('deve permitir soma menor que o total', () => {
      const dto = {
        area_total_hectares: 1000,
        area_agricultavel_hectares: 500,
        area_vegetacao_hectares: 300,
      } as CreatePropriedadeDto;

      expect(() => service['validateAreas'](dto)).not.toThrow();
    });
  });
});
