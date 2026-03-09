import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RuleService {
  constructor(private prisma: PrismaService) {}
 
   async create(data: { category: string; rule: string; icon?: string }) {
    return this.prisma.rule.create({
       data,
     });
   }
 
   async findAll() {
    return this.prisma.rule.findMany({
       orderBy: { createdAt: 'asc' },
     });
   }
 
   async findOne(id: number) {
    const rule = await this.prisma.rule.findUnique({
       where: { id },
     });
    if (!rule) {
       throw new NotFoundException(`Rule with ID ${id} not found`);
     }
    return rule;
   }
 
   async update(id: number, data: { category?: string; rule?: string; icon?: string }) {
     try {
      return await this.prisma.rule.update({
         where: { id },
         data,
       });
     } catch (error) {
       throw new NotFoundException(`Rule with ID ${id} not found`);
     }
   }
 
   async remove(id: number) {
     try {
      return await this.prisma.rule.delete({
         where: { id },
       });
     } catch (error) {
       throw new NotFoundException(`Rule with ID ${id} not found`);
     }
   }
 }
