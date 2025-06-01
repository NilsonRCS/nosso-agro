import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produtor } from './entities/produtor.entity';
import { CreateProdutorDto } from './dto/create-produtor.dto';

@Injectable()
export class ProdutoresService {
  constructor(
    @InjectRepository(Produtor)
    private readonly produtorRepository: Repository<Produtor>,
  ) {}

  async create(createProdutorDto: CreateProdutorDto): Promise<Produtor> {
    this.validateAreas(createProdutorDto);
    const produtor = this.produtorRepository.create(createProdutorDto);
    return await this.produtorRepository.save(produtor);
  }

  async findAll(): Promise<Produtor[]> {
    return await this.produtorRepository.find();
  }

  async findOne(id: string): Promise<Produtor> {
    const produtor = await this.produtorRepository.findOne({ where: { id } });
    if (!produtor) {
      throw new NotFoundException(`Produtor com ID ${id} não encontrado`);
    }
    return produtor;
  }

  async update(
    id: string,
    updateProdutorDto: CreateProdutorDto,
  ): Promise<Produtor> {
    this.validateAreas(updateProdutorDto);
    const produtor = await this.findOne(id);
    Object.assign(produtor, updateProdutorDto);
    return await this.produtorRepository.save(produtor);
  }

  async remove(id: string): Promise<void> {
    const result = await this.produtorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Produtor com ID ${id} não encontrado`);
    }
  }

  private validateAreas(dto: CreateProdutorDto): void {
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
