import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResidentService {
  constructor(private prisma: PrismaService) {}

  async create(data: { avatar?: string; name: string; residence: string; phone_no: string; monthlyRate?: number }) {
    return this.prisma.resident.create({
      data,
    });
  }

  async findAll(search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc') {
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { residence: { contains: search, mode: 'insensitive' as const } },
        { phone_no: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { name: 'asc' };

    return this.prisma.resident.findMany({
      where,
      orderBy,
      select: {
        id: true,
        avatar: true,
        name: true,
        residence: true,
        phone_no: true,
        monthlyRate: true,
        monthlyPayments: {
          select: {
            month: true,
            year: true,
            amount: true,
          }
        },
        securityPayments: {
          select: {
            year: true,
            amount: true,
            status: true,
          }
        },
      },
    });
  }

  async findOne(id: number) {
    const resident = await this.prisma.resident.findUnique({
      where: { id },
    });
    if (!resident) {
      throw new NotFoundException(`Resident with ID ${id} not found`);
    }
    return resident;
  }

  async update(id: number, data: { avatar?: string; name?: string; residence?: string; phone_no?: string; monthlyRate?: number }) {
    const exists = await this.prisma.resident.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Resident with ID ${id} not found`);
    }
    return this.prisma.resident.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    try {
      return await this.prisma.resident.delete({
        where: { id },
      });
    } catch (error) {
       throw new NotFoundException(`Resident with ID ${id} not found`);
    }
  }
}
