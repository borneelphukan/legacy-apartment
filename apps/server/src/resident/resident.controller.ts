import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ResidentService } from './resident.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('residents')
export class ResidentController {
  constructor(private readonly residentService: ResidentService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createResidentDto: { avatar?: string; name: string; residence: string; phone_no: string; designation?: string }) {
    return this.residentService.create(createResidentDto);
  }

  @Get()
  findAll() {
    return this.residentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.residentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateResidentDto: { avatar?: string; name?: string; residence?: string; phone_no?: string; designation?: string }) {
    return this.residentService.update(id, updateResidentDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.residentService.remove(id);
  }
}
