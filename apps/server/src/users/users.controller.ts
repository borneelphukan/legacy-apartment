import { Body, Controller, Post, HttpCode, HttpStatus, Get, Delete, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public } from '../auth/public.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PERMISSIONS } from '../auth/roles.config';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: Record<string, any>) {
    return this.usersService.login(loginDto.email, loginDto.password);
  }

  @Public()
  @Post('register')
  register(@Body() userData: any) {
    return this.usersService.createUser(userData);
  }

  @Get()
  @Roles(...PERMISSIONS.READ_USERS)
  @UseGuards(RolesGuard)
  findAll(
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.usersService.findAll(search, sortBy, sortOrder);
  }

  @Delete(':id')
  @Roles(...PERMISSIONS.READ_USERS)
  @UseGuards(RolesGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
