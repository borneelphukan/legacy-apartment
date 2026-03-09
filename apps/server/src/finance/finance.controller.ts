import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('finance')
@UseGuards(AuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('resident/:id')
  getResidentFinance(@Param('id', ParseIntPipe) id: number) {
    return this.financeService.getResidentFinance(id);
  }

  @Post('monthly/:id')
  updateMonthly(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { month: number; year: number; status: number; amount?: number },
  ) {
    return this.financeService.updateMonthlyPayment(id, data);
  }

  @Post('security/:id')
  updateSecurity(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { year: number; status: number; amount?: number },
  ) {
    return this.financeService.updateSecurityPayment(id, data);
  }
}
