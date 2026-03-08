import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnnouncementService {
  constructor(private prisma: PrismaService) {}

  async create(data: { title: string; description: string; date?: Date }) {
    return this.prisma.announcement.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });
  }

  async findAll() {
    return this.prisma.announcement.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: number) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
    return announcement;
  }

  async update(id: number, data: { title?: string; description?: string; date?: Date }) {
    try {
      return await this.prisma.announcement.update({
        where: { id },
        data: {
          ...data,
          date: data.date ? new Date(data.date) : undefined,
        },
      });
    } catch (error) {
       throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.announcement.delete({
        where: { id },
      });
    } catch (error) {
       throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
  }
}
