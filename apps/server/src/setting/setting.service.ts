import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Ensure at least one setting record for the current year exists
    const currentYear = new Date().getFullYear();
    const count = await this.prisma.setting.count({ where: { year: currentYear } });
    if (count === 0) {
      await this.prisma.setting.create({
        data: {
          year: currentYear,
          monthlyFee: 1000,
          yearlyFee: 5000,
          frontendPassword: "",
        },
      });
    }
  }

  async getSettings(year?: number) {
    const targetYear = year || new Date().getFullYear();
    const setting = await this.prisma.setting.findUnique({
      where: { year: targetYear },
    });

    if (!setting) {
      return {
        year: targetYear,
        monthlyFee: 1000,
        yearlyFee: 5000,
        frontendPassword: "",
      };
    }

    return setting;
  }

  async updateSettings(data: { year?: number; monthlyFee?: number; yearlyFee?: number; frontendPassword?: string }) {
    const targetYear = data.year || new Date().getFullYear();
    const existing = await this.prisma.setting.findUnique({
      where: { year: targetYear },
    });

    if (!existing) {
      return this.prisma.setting.create({
        data: {
          year: targetYear,
          monthlyFee: data.monthlyFee || 1000,
          yearlyFee: data.yearlyFee || 5000,
          frontendPassword: data.frontendPassword || "",
        },
      });
    }

    return this.prisma.setting.update({
      where: { id: existing.id },
      data: {
        monthlyFee: data.monthlyFee !== undefined ? data.monthlyFee : undefined,
        yearlyFee: data.yearlyFee !== undefined ? data.yearlyFee : undefined,
        frontendPassword: data.frontendPassword !== undefined ? data.frontendPassword : undefined,
      },
    });
  }
}
