import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Propriedade } from './entities/propriedade.entity';
import { CreatePropriedadeDto } from './dto/create-propriedade.dto';
import { ProdutoresService } from '../produtores/produtores.service';

@Injectable()
export class PropriedadesService {
  constructor(
    @InjectRepository(Propriedade)
    private readonly propriedadeRepository: Repository<Propriedade>,
    private readonly produtoresService: ProdutoresService,
  ) {}

  async create(
    produtorId: string,
    createPropriedadeDto: CreatePropriedadeDto,
  ): Promise<Propriedade> {
    // Verifica se o produtor existe
    const produtor = await this.produtoresService.findOne(produtorId);

    // Valida as áreas
    this.validateAreas(createPropriedadeDto);

    // Cria a propriedade
    const propriedade = this.propriedadeRepository.create({
      ...createPropriedadeDto,
      produtor,
    });

    return await this.propriedadeRepository.save(propriedade);
  }

  async findAll(produtorId: string): Promise<Propriedade[]> {
    return await this.propriedadeRepository.find({
      where: { produtor: { id: produtorId } },
      relations: ['safras_culturas'],
    });
  }

  async findOne(id: string, produtorId: string): Promise<Propriedade> {
    const propriedade = await this.propriedadeRepository.findOne({
      where: { id, produtor: { id: produtorId } },
      relations: ['safras_culturas'],
    });

    if (!propriedade) {
      throw new NotFoundException(`Propriedade com ID ${id} não encontrada`);
    }

    return propriedade;
  }

  async update(
    id: string,
    produtorId: string,
    updatePropriedadeDto: CreatePropriedadeDto,
  ): Promise<Propriedade> {
    // Verifica se a propriedade existe e pertence ao produtor
    const propriedade = await this.findOne(id, produtorId);

    // Valida as áreas
    this.validateAreas(updatePropriedadeDto);

    // Atualiza a propriedade
    Object.assign(propriedade, updatePropriedadeDto);
    return await this.propriedadeRepository.save(propriedade);
  }

  async remove(id: string, produtorId: string): Promise<void> {
    // Verifica se a propriedade existe e pertence ao produtor
    const propriedade = await this.findOne(id, produtorId);
    await this.propriedadeRepository.remove(propriedade);
  }

  private validateAreas(dto: CreatePropriedadeDto): void {
    const {
      area_total_hectares,
      area_agricultavel_hectares,
      area_vegetacao_hectares,
    } = dto;

    if (
      area_agricultavel_hectares + area_vegetacao_hectares >
      area_total_hectares
    ) {
      throw new BadRequestException(
        'A soma das áreas agricultável e de vegetação não pode exceder a área total',
      );
    }
  }
} 