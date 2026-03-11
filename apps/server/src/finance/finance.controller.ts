import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { FinanceService } from './finance.service';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get()
  getAllFinance() {
    return this.financeService.getAllFinance();
  }

  @Get('resident/:id')
  getResidentFinance(@Param('id', ParseIntPipe) id: number) {
    return this.financeService.getResidentFinance(id);
  }

  @Post('monthly/:id')
  updateMonthly(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { month: number; year: number; status: number; amount?: number; paymentType?: string; paymentDate?: string; lateFee?: number },
  ) {
    return this.financeService.updateMonthlyPayment(id, data);
  }

  @Post('security/:id')
  updateSecurity(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { year: number; status: number; yearlyRate?: number; amount?: number; paymentType?: string; paymentDate?: string; lateFee?: number },
  ) {
    return this.financeService.updateSecurityPayment(id, data);
  }
}

