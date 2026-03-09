import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { RuleService } from './rule.service';
import { AuthGuard } from '../auth/auth.guard';
 
 @Controller('rules')
 export class RuleController {
  constructor(private readonly ruleService: RuleService) {}
 
   @Post()
   @UseGuards(AuthGuard)
  create(@Body() createRuleDto: { category: string; rule: string; icon?: string }) {
    return this.ruleService.create(createRuleDto);
   }
 
   @Get()
   findAll() {
    return this.ruleService.findAll();
   }
 
   @Get(':id')
   findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ruleService.findOne(id);
   }
 
   @Patch(':id')
   @UseGuards(AuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRuleDto: { category?: string; rule?: string; icon?: string }) {
    return this.ruleService.update(id, updateRuleDto);
   }
 
   @Delete(':id')
   @UseGuards(AuthGuard)
   remove(@Param('id', ParseIntPipe) id: number) {
    return this.ruleService.remove(id);
   }
 }
