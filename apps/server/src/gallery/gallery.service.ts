import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GalleryService {
  constructor(private prisma: PrismaService) {}

  async createEvent(data: { name: string; date: string; year: number }) {
    return this.prisma.galleryEvent.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
    });
  }

  async findAllEvents() {
    return this.prisma.galleryEvent.findMany({
      include: {
        photos: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async updateEvent(id: number, data: { name?: string; date?: string; year?: number }) {
    return this.prisma.galleryEvent.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });
  }

  async removeEvent(id: number) {
    return this.prisma.galleryEvent.delete({
      where: { id },
    });
  }

  async addPhoto(data: { eventId: number; src: string; alt?: string; className?: string }) {
    return this.prisma.galleryPhoto.create({
      data,
    });
  }

  async removePhoto(id: number) {
    return this.prisma.galleryPhoto.delete({
      where: { id },
    });
  }
}
