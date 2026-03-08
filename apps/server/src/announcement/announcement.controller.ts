import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createAnnouncementDto: { title: string; description: string; date?: string }) {
    return this.announcementService.create({
        ...createAnnouncementDto,
        date: createAnnouncementDto.date ? new Date(createAnnouncementDto.date) : undefined
    });
  }

  @Get()
  findAll() {
    return this.announcementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.announcementService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAnnouncementDto: { title?: string; description?: string; date?: string }) {
    return this.announcementService.update(id, {
        ...updateAnnouncementDto,
        date: updateAnnouncementDto.date ? new Date(updateAnnouncementDto.date) : undefined
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.announcementService.remove(id);
  }
}
