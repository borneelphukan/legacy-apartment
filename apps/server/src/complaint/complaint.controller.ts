import { Controller, Get, Post, Body, Delete, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ComplaintService } from './complaint.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('complaints')
export class ComplaintController {
  constructor(private readonly complaintService: ComplaintService) {}

  @Post()
  create(@Body() createComplaintDto: { name: string; apartment: string; phone_no: string; complaint: string }) {
    return this.complaintService.create(createComplaintDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.complaintService.findAll();
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.complaintService.remove(id);
  }
}
