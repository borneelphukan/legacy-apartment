import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Ensure at least one setting record exists
    const count = await this.prisma.setting.count();
    if (count === 0) {
      await this.prisma.setting.create({
        data: {
          monthlyFee: 1000,
          yearlyFee: 5000,
        },
      });
    }
  }

  async getSettings() {
    return this.prisma.setting.findFirst({
      orderBy: { id: 'asc' },
    });
  }

  async updateSettings(data: { monthlyFee?: number; yearlyFee?: number }) {
    const setting = await this.prisma.setting.findFirst({
      orderBy: { id: 'asc' },
    });

    if (!setting) {
      return this.prisma.setting.create({
        data: {
          monthlyFee: data.monthlyFee || 1000,
          yearlyFee: data.yearlyFee || 5000,
        },
      });
    }

    return this.prisma.setting.update({
      where: { id: setting.id },
      data: {
        monthlyFee: data.monthlyFee !== undefined ? data.monthlyFee : undefined,
        yearlyFee: data.yearlyFee !== undefined ? data.yearlyFee : undefined,
      },
    });
  }
}
