import {
  IsString,
  IsNumber,
  IsOptional,
  Length,
  Min,
  Max,
  ValidateIf,
  IsNotEmpty,
  Matches,
} from 'class-validator';

export class CreateProdutorDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF deve estar no formato: 000.000.000-00',
  })
  @ValidateIf((o: CreateProdutorDto) => !o.cnpj)
  cpf?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, {
    message: 'CNPJ deve estar no formato: 00.000.000/0000-00',
  })
  @ValidateIf((o: CreateProdutorDto) => !o.cpf)
  cnpj?: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  nome_produtor: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  nome_fazenda: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  cidade: string;

  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Z]{2}$/, {
    message: 'Estado deve ser uma sigla de 2 letras maiúsculas',
  })
  estado: string;

  @IsNumber()
  @Min(0)
  @Max(1000000, {
    message: 'Área total não pode exceder 1 milhão de hectares',
  })
  area_total_hectares: number;

  @IsNumber()
  @Min(0)
  @Max(1000000, {
    message: 'Área agricultável não pode exceder 1 milhão de hectares',
  })
  area_agricultavel_hectares: number;

  @IsNumber()
  @Min(0)
  @Max(1000000, {
    message: 'Área de vegetação não pode exceder 1 milhão de hectares',
  })
  area_vegetacao_hectares: number;
}
