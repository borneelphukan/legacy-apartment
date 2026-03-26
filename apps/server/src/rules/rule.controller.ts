import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RuleService } from './rule.service';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { PERMISSIONS } from '../auth/roles.config';
import { RolesGuard } from '../auth/roles.guard';

@Controller('rules')
@UseGuards(RolesGuard)
export class RuleController {
  constructor(private readonly ruleService: RuleService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post()
  @Roles(...PERMISSIONS.CREATE_RULE)
  create(@Body() createRuleDto: { category: string; rule: string; icon?: string }) {
    return this.ruleService.create(createRuleDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.ruleService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ruleService.findOne(id);
  }

  @Patch(':id')
  @Roles(...PERMISSIONS.CREATE_RULE)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRuleDto: { category?: string; rule?: string; icon?: string }) {
    return this.ruleService.update(id, updateRuleDto);
  }

  @Delete(':id')
  @Roles(...PERMISSIONS.CREATE_RULE)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ruleService.remove(id);
  }
}

