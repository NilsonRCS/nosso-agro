import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProdutoresService } from './produtores.service';
import { CreateProdutorDto } from './dto/create-produtor.dto';
import { Produtor } from './entities/produtor.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('produtores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('produtores')
export class ProdutoresController {
  constructor(private readonly produtoresService: ProdutoresService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo produtor' })
  @ApiResponse({
    status: 201,
    description: 'Produtor criado com sucesso',
    type: Produtor,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  create(
    @Body() createProdutorDto: CreateProdutorDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Produtor> {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return this.produtoresService.create(createProdutorDto, req.user.id, ip);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtores' })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtores retornada com sucesso',
    type: [Produtor],
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  findAll(@Req() req: AuthenticatedRequest): Promise<Produtor[]> {
    return this.produtoresService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar produtor por ID' })
  @ApiResponse({
    status: 200,
    description: 'Produtor encontrado com sucesso',
    type: Produtor,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Produtor não encontrado' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Produtor> {
    return this.produtoresService.findOne(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar produtor' })
  @ApiResponse({
    status: 200,
    description: 'Produtor atualizado com sucesso',
    type: Produtor,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Produtor não encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProdutorDto: CreateProdutorDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Produtor> {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return this.produtoresService.update(id, updateProdutorDto, req.user.id, ip);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover produtor' })
  @ApiResponse({
    status: 200,
    description: 'Produtor removido com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Produtor não encontrado' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return this.produtoresService.remove(id, req.user.id, ip);
  }
}
