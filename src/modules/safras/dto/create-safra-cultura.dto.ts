import {
  IsString,
  IsNumber,
  IsDate,
  IsNotEmpty,
  Length,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSafraCulturaDto {
  @ApiProperty({
    description: 'ID da propriedade onde a cultura será plantada',
    example: 'f4b0951e-1a57-4464-9cfd-fa5896509869',
  })
  @IsUUID()
  @IsNotEmpty()
  propriedade_id: string;

  @ApiProperty({
    description: 'Nome da cultura plantada',
    example: 'Soja',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  nome_cultura: string;

  @ApiProperty({
    description: 'Ano da safra',
    example: 2024,
  })
  @IsNumber()
  @Min(2000)
  @Max(2100)
  ano_safra: number;

  @ApiProperty({
    description: 'Data de plantio',
    example: '2024-01-15',
  })
  @IsDate()
  @Type(() => Date)
  data_plantio: Date;

  @ApiProperty({
    description: 'Data prevista da colheita',
    example: '2024-05-15',
  })
  @IsDate()
  @Type(() => Date)
  data_colheita_prevista: Date;

  @ApiProperty({
    description: 'Área plantada em hectares',
    example: 500.0,
  })
  @IsNumber()
  @Min(0)
  @Max(1000000, {
    message: 'Área plantada não pode exceder 1 milhão de hectares',
  })
  area_plantada_hectares: number;
} 