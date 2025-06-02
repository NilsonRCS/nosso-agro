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
import { SafrasService } from './safras.service';
import { CreateSafraCulturaDto } from './dto/create-safra-cultura.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('safras')
@Controller('safras')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SafrasController {
  constructor(private readonly safrasService: SafrasService) {}

  @Post()
  create(@Request() req, @Body() createSafraCulturaDto: CreateSafraCulturaDto) {
    return this.safrasService.create(req.user.id, createSafraCulturaDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.safrasService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.safrasService.findOne(id, req.user.id);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateSafraCulturaDto: CreateSafraCulturaDto,
  ) {
    return this.safrasService.update(id, req.user.id, updateSafraCulturaDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.safrasService.remove(id, req.user.id);
  }
}
