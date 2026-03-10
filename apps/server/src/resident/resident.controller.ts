import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ResidentService } from './resident.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';

@Controller('residents')
export class ResidentController {
  constructor(private readonly residentService: ResidentService) {}

  @Post()
  @Roles('president')
  @UseGuards(RolesGuard)
  create(@Body() createResidentDto: { avatar?: string; name: string; residence: string; phone_no: string; designation?: string }) {
    return this.residentService.create(createResidentDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.residentService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.residentService.findOne(id);
  }

  @Patch(':id')
  @Roles('president')
  @UseGuards(RolesGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateResidentDto: { avatar?: string; name?: string; residence?: string; phone_no?: string; designation?: string }) {
    return this.residentService.update(id, updateResidentDto);
  }

  @Delete(':id')
  @Roles('president')
  @UseGuards(RolesGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.residentService.remove(id);
  }
}

