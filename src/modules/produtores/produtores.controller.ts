import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProdutoresService } from './produtores.service';
import { CreateProdutorDto } from './dto/create-produtor.dto';
import { Produtor } from './entities/produtor.entity';

@Controller('produtores')
export class ProdutoresController {
  constructor(private readonly produtoresService: ProdutoresService) {}

  @Post()
  create(@Body() createProdutorDto: CreateProdutorDto): Promise<Produtor> {
    return this.produtoresService.create(createProdutorDto);
  }

  @Get()
  findAll(): Promise<Produtor[]> {
    return this.produtoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Produtor> {
    return this.produtoresService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProdutorDto: CreateProdutorDto,
  ): Promise<Produtor> {
    return this.produtoresService.update(id, updateProdutorDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.produtoresService.remove(id);
  }
}
