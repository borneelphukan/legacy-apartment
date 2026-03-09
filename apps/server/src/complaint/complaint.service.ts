import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComplaintService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; apartment: string; phone_no: string; complaint: string }) {
    return this.prisma.complaint.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.complaint.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: number) {
    return this.prisma.complaint.delete({
      where: { id },
    });
  }
}
