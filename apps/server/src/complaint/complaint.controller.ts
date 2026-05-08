import { Controller, Get, Post, Body, Delete, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ComplaintService } from './complaint.service';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { PERMISSIONS } from '../auth/roles.config';
import { RolesGuard } from '../auth/roles.guard';

@Controller('complaints')
export class ComplaintController {
  constructor(private readonly complaintService: ComplaintService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post()
  create(@Body() createComplaintDto: { name: string; apartment: string; phone_no: string; complaint: string }) {
    return this.complaintService.create(createComplaintDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.complaintService.findAll();
  }

  @Roles(...PERMISSIONS.READ_COMPLAINT)
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.complaintService.remove(id);
  }

  @Roles(...PERMISSIONS.REPLY_COMPLAINT)
  @UseGuards(RolesGuard)
  @Post(':id/reply')
  reply(@Param('id', ParseIntPipe) id: number, @Body() replyDto: { reply: string }) {
    return this.complaintService.reply(id, replyDto.reply);
  }
}

