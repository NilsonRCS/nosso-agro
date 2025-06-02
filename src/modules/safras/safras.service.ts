import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SafraCultura } from './entities/safra-cultura.entity';
import { CreateSafraCulturaDto } from './dto/create-safra-cultura.dto';
import { PropriedadesService } from '../propriedades/propriedades.service';

@Injectable()
export class SafrasService {
  constructor(
    @InjectRepository(SafraCultura)
    private readonly safraCulturaRepository: Repository<SafraCultura>,
    private readonly propriedadesService: PropriedadesService,
  ) {}

  async create(
    produtorId: string,
    createSafraCulturaDto: CreateSafraCulturaDto,
  ): Promise<SafraCultura> {
    const propriedade = await this.propriedadesService.findOne(
      createSafraCulturaDto.propriedade_id,
      produtorId,
    );

    await this.validateAreaPlantada(
      createSafraCulturaDto.area_plantada_hectares,
      propriedade.area_agricultavel_hectares,
      createSafraCulturaDto.propriedade_id,
      null,
    );

    this.validateDates(
      createSafraCulturaDto.data_plantio,
      createSafraCulturaDto.data_colheita_prevista,
    );

    const safraCultura = this.safraCulturaRepository.create({
      ...createSafraCulturaDto,
      propriedade,
    });

    return await this.safraCulturaRepository.save(safraCultura);
  }

  async findAll(produtorId: string): Promise<SafraCultura[]> {
    return await this.safraCulturaRepository.find({
      where: { propriedade: { produtor: { id: produtorId } } },
      relations: ['propriedade'],
    });
  }

  async findOne(id: string, produtorId: string): Promise<SafraCultura> {
    const safraCultura = await this.safraCulturaRepository.findOne({
      where: { id, propriedade: { produtor: { id: produtorId } } },
      relations: ['propriedade'],
    });

    if (!safraCultura) {
      throw new NotFoundException(`Safra/Cultura com ID ${id} não encontrada`);
    }

    return safraCultura;
  }

  async update(
    id: string,
    produtorId: string,
    updateSafraCulturaDto: CreateSafraCulturaDto,
  ): Promise<SafraCultura> {
    const safraCultura = await this.findOne(id, produtorId);

    const propriedade = await this.propriedadesService.findOne(
      updateSafraCulturaDto.propriedade_id,
      produtorId,
    );

    await this.validateAreaPlantada(
      updateSafraCulturaDto.area_plantada_hectares,
      propriedade.area_agricultavel_hectares,
      updateSafraCulturaDto.propriedade_id,
      id,
    );

    this.validateDates(
      updateSafraCulturaDto.data_plantio,
      updateSafraCulturaDto.data_colheita_prevista,
    );

    Object.assign(safraCultura, {
      ...updateSafraCulturaDto,
      propriedade,
    });

    return await this.safraCulturaRepository.save(safraCultura);
  }

  async remove(id: string, produtorId: string): Promise<void> {
    const safraCultura = await this.findOne(id, produtorId);
    await this.safraCulturaRepository.remove(safraCultura);
  }

  private validateDates(dataPlantio: Date, dataColheitaPrevista: Date): void {
    if (dataPlantio >= dataColheitaPrevista) {
      throw new BadRequestException(
        'A data de plantio deve ser anterior à data prevista de colheita',
      );
    }
  }

  private async validateAreaPlantada(
    areaPlantada: number,
    areaAgricultavel: number,
    propriedadeId: string,
    safraId: string | null,
  ): Promise<void> {
    const query = this.safraCulturaRepository
      .createQueryBuilder('safra')
      .select('SUM(safra.area_plantada_hectares)', 'total')
      .where('safra.propriedade_id = :propriedadeId', { propriedadeId });
    if (safraId) {
      query.andWhere('safra.id != :safraId', { safraId });
    }

    const result = await query.getRawOne();
    const areaTotal = Number(result.total) || 0;

    if (areaTotal + areaPlantada > areaAgricultavel) {
      throw new BadRequestException(
        'A soma das áreas plantadas não pode exceder a área agricultável da propriedade',
      );
    }
  }
}
