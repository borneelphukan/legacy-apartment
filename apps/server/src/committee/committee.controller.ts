import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CommitteeService } from './committee.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PERMISSIONS } from '../auth/roles.config';
import { Public } from '../auth/public.decorator';

@Controller('committee')
export class CommitteeController {
  constructor(private readonly committeeService: CommitteeService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post()
  @Roles(...PERMISSIONS.CREATE_COMMITTEE)
  @UseGuards(RolesGuard)
  create(@Body() data: { avatar?: string; name: string; residence: string; phone_no: string; role: string }) {
    return this.committeeService.create(data);
  }

  @Public()
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.committeeService.findAll(search, sortBy, sortOrder);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.committeeService.findOne(id);
  }

  @Patch(':id')
  @Roles(...PERMISSIONS.CREATE_COMMITTEE)
  @UseGuards(RolesGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() data: { avatar?: string; name?: string; residence?: string; phone_no?: string; role?: string }) {
    return this.committeeService.update(id, data);
  }

  @Delete(':id')
  @Roles(...PERMISSIONS.CREATE_COMMITTEE)
  @UseGuards(RolesGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.committeeService.remove(id);
  }
}
