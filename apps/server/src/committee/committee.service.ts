import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommitteeService {
  constructor(private prisma: PrismaService) {}

  async create(data: { avatar?: string; name: string; residence: string; phone_no: string; role: string }) {
    return this.prisma.committeeMember.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.committeeMember.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const member = await this.prisma.committeeMember.findUnique({
      where: { id },
    });
    if (!member) {
      throw new NotFoundException(`Committee member with ID ${id} not found`);
    }
    return member;
  }

  async update(id: number, data: { avatar?: string; name?: string; residence?: string; phone_no?: string; role?: string }) {
    try {
      return await this.prisma.committeeMember.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException(`Committee member with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.committeeMember.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Committee member with ID ${id} not found`);
    }
  }
}
