import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ResidentService } from './resident.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PERMISSIONS } from '../auth/roles.config';
import { Public } from '../auth/public.decorator';

@Controller('residents')
export class ResidentController {
  constructor(private readonly residentService: ResidentService) {}

  @Post()
  @Roles(...PERMISSIONS.CREATE_RESIDENT)
  @UseGuards(RolesGuard)
  create(@Body() createResidentDto: { avatar?: string; name: string; residence: string; phone_no: string; monthlyRate?: number }) {
    return this.residentService.create(createResidentDto);
  }

  @Public()
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.residentService.findAll(search, sortBy, sortOrder);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.residentService.findOne(id);
  }

  @Patch(':id')
  @Roles(...PERMISSIONS.UPDATE_RESIDENT)
  @UseGuards(RolesGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateResidentDto: { avatar?: string; name?: string; residence?: string; phone_no?: string; monthlyRate?: number }) {
    return this.residentService.update(id, updateResidentDto);
  }

  @Delete(':id')
  @Roles(...PERMISSIONS.CREATE_RESIDENT)
  @UseGuards(RolesGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.residentService.remove(id);
  }
}

