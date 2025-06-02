import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PropriedadesService } from './propriedades.service';
import { CreatePropriedadeDto } from './dto/create-propriedade.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('propriedades')
@Controller('propriedades')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PropriedadesController {
  constructor(private readonly propriedadesService: PropriedadesService) {}

  @Post()
  create(@Request() req, @Body() createPropriedadeDto: CreatePropriedadeDto) {
    return this.propriedadesService.create(req.user.id, createPropriedadeDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.propriedadesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.propriedadesService.findOne(id, req.user.id);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePropriedadeDto: CreatePropriedadeDto,
  ) {
    return this.propriedadesService.update(id, req.user.id, updatePropriedadeDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.propriedadesService.remove(id, req.user.id);
  }
}
