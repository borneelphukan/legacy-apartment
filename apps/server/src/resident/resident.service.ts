import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResidentService {
  constructor(private prisma: PrismaService) {}

  async create(data: { avatar?: string; name: string; residence: string; phone_no: string; showInWebsite?: boolean }) {
    return this.prisma.resident.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.resident.findMany({
      include: {
        monthlyPayments: true,
        securityPayments: true,
      },
      orderBy: { createdAt: 'desc' },
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

  async update(id: number, data: { avatar?: string; name?: string; residence?: string; phone_no?: string; showInWebsite?: boolean }) {
    try {
      return await this.prisma.resident.update({
        where: { id },
        data,
      });
    } catch (error) {
       throw new NotFoundException(`Resident with ID ${id} not found`);
    }
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
