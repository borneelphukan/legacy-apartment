import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AnnouncementService } from './announcement.service';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { PERMISSIONS } from '../auth/roles.config';
import { RolesGuard } from '../auth/roles.guard';

@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Roles(...PERMISSIONS.CREATE_ANNOUNCEMENT)
  @UseGuards(RolesGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post()
  create(@Body() createAnnouncementDto: { title: string; description: string; date?: string }) {
    return this.announcementService.create({
        ...createAnnouncementDto,
        date: createAnnouncementDto.date ? new Date(createAnnouncementDto.date) : undefined
    });
  }

  @Public()
  @Get()
  findAll() {
    return this.announcementService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.announcementService.findOne(id);
  }

  @Roles(...PERMISSIONS.CREATE_ANNOUNCEMENT)
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAnnouncementDto: { title?: string; description?: string; date?: string }) {
    return this.announcementService.update(id, {
        ...updateAnnouncementDto,
        date: updateAnnouncementDto.date ? new Date(updateAnnouncementDto.date) : undefined
    });
  }

  @Roles(...PERMISSIONS.CREATE_ANNOUNCEMENT)
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.announcementService.remove(id);
  }
}

