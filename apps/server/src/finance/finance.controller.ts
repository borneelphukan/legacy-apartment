import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FinanceService } from './finance.service';
import { Roles } from '../auth/roles.decorator';
import { PERMISSIONS } from '../auth/roles.config';
import { RolesGuard } from '../auth/roles.guard';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get()
  getAllFinance(
    @Query('sortBy') sortBy?: string, 
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    return this.financeService.getAllFinance(sortBy, sortOrder);
  }

  @Get('resident/:id')
  getResidentFinance(@Param('id', ParseIntPipe) id: number) {
    return this.financeService.getResidentFinance(id);
  }

  @Roles(...PERMISSIONS.UPDATE_FINANCE)
  @UseGuards(RolesGuard)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @Post('monthly/:id')
  updateMonthly(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { month: number; year: number; status: number; amount?: number; paymentType?: string; paymentDate?: string; lateFee?: number },
  ) {
    return this.financeService.updateMonthlyPayment(id, data);
  }

  @Roles(...PERMISSIONS.UPDATE_FINANCE)
  @UseGuards(RolesGuard)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @Post('security/:id')
  updateSecurity(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { year: number; status: number; yearlyRate?: number; amount?: number; paymentType?: string; paymentDate?: string; lateFee?: number },
  ) {
    return this.financeService.updateSecurityPayment(id, data);
  }
}

