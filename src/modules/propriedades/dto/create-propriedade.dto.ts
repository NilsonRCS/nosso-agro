import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Length,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePropriedadeDto {
  @ApiProperty({
    description: 'Nome da propriedade rural',
    example: 'Fazenda São João',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  nome: string;

  @ApiProperty({
    description: 'Cidade onde está localizada a propriedade',
    example: 'Ribeirão Preto',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  cidade: string;

  @ApiProperty({
    description: 'Estado onde está localizada a propriedade',
    example: 'SP',
  })
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Z]{2}$/, {
    message: 'Estado deve ser uma sigla de 2 letras maiúsculas',
  })
  estado: string;

  @ApiProperty({
    description: 'Área total da propriedade em hectares',
    example: 1500.0,
  })
  @IsNumber()
  @Min(0)
  @Max(1000000, {
    message: 'Área total não pode exceder 1 milhão de hectares',
  })
  area_total_hectares: number;

  @ApiProperty({
    description: 'Área agricultável da propriedade em hectares',
    example: 1200.0,
  })
  @IsNumber()
  @Min(0)
  @Max(1000000, {
    message: 'Área agricultável não pode exceder 1 milhão de hectares',
  })
  area_agricultavel_hectares: number;

  @ApiProperty({
    description: 'Área de vegetação da propriedade em hectares',
    example: 300.0,
  })
  @IsNumber()
  @Min(0)
  @Max(1000000, {
    message: 'Área de vegetação não pode exceder 1 milhão de hectares',
  })
  area_vegetacao_hectares: number;
} 