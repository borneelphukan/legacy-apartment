import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getResidentFinance(residentId: number) {
    const resident = await this.prisma.resident.findUnique({
      where: { id: residentId },
      include: {
        monthlyPayments: true,
        securityPayments: true,
      },
    });

    if (!resident) {
      throw new NotFoundException(`Resident with ID ${residentId} not found`);
    }

    return resident;
  }

  async updateMonthlyPayment(residentId: number, data: { month: number; year: number; status: number; amount?: number }) {
    return this.prisma.monthlyPayment.upsert({
      where: {
        residentId_month_year: {
          residentId,
          month: data.month,
          year: data.year,
        },
      },
      update: {
        status: data.status,
        amount: data.amount !== undefined ? data.amount : undefined,
      },
      create: {
        residentId,
        month: data.month,
        year: data.year,
        status: data.status,
        amount: data.amount || 0,
      },
    });
  }

  async updateSecurityPayment(residentId: number, data: { year: number; status: number; amount?: number }) {
    return this.prisma.securityPayment.upsert({
      where: {
        residentId_year: {
          residentId,
          year: data.year,
        },
      },
      update: {
        status: data.status,
        amount: data.amount !== undefined ? data.amount : undefined,
      },
      create: {
        residentId,
        year: data.year,
        status: data.status,
        amount: data.amount || 0,
      },
    });
  }
}
