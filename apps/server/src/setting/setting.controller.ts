import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SettingService } from './setting.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  getSettings() {
    return this.settingService.getSettings();
  }

  @Post()
  @UseGuards(AuthGuard)
  updateSettings(@Body() data: { monthlyFee?: number; yearlyFee?: number }) {
    return this.settingService.updateSettings(data);
  }
}
