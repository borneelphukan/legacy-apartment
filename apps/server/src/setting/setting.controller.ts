import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SettingService } from './setting.service';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { PERMISSIONS } from '../auth/roles.config';
import { RolesGuard } from '../auth/roles.guard';

@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Public()
  @Get()
  getSettings(@Query('year') year?: string) {
    return this.settingService.getSettings(year ? parseInt(year) : undefined);
  }

  @Roles(...PERMISSIONS.UPDATE_SETTING)
  @UseGuards(RolesGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post()
  updateSettings(@Body() data: { year?: number; monthlyFee?: number; yearlyFee?: number; frontendPassword?: string }) {
    return this.settingService.updateSettings(data);
  }
}

