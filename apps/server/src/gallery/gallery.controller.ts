import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Roles('president', 'cultural_head')
  @UseGuards(RolesGuard)
  @Post('events')
  createEvent(@Body() createEventDto: { name: string; date: string; year: number }) {
    return this.galleryService.createEvent(createEventDto);
  }

  @Public()
  @Get('events')
  findAllEvents() {
    return this.galleryService.findAllEvents();
  }

  @Roles('president', 'cultural_head')
  @UseGuards(RolesGuard)
  @Patch('events/:id')
  updateEvent(@Param('id', ParseIntPipe) id: number, @Body() updateEventDto: { name?: string; date?: string; year?: number }) {
    return this.galleryService.updateEvent(id, updateEventDto);
  }

  @Roles('president', 'cultural_head')
  @UseGuards(RolesGuard)
  @Delete('events/:id')
  removeEvent(@Param('id', ParseIntPipe) id: number) {
    return this.galleryService.removeEvent(id);
  }

  @Roles('president', 'cultural_head')
  @UseGuards(RolesGuard)
  @Post('photos')
  addPhoto(@Body() addPhotoDto: { eventId: number; src: string; alt?: string; className?: string }) {
    return this.galleryService.addPhoto(addPhotoDto);
  }

  @Roles('president', 'cultural_head')
  @UseGuards(RolesGuard)
  @Delete('photos/:id')
  removePhoto(@Param('id', ParseIntPipe) id: number) {
    return this.galleryService.removePhoto(id);
  }
}
