import { Body, Controller, Post, HttpCode, HttpStatus, Get, Delete, Param, ParseIntPipe, UseGuards, Query, Patch } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
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
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  login(@Body() loginDto: Record<string, any>) {
    return this.usersService.login(loginDto.email, loginDto.password);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  register(@Body() userData: any) {
    return this.usersService.createUser(userData);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.usersService.forgotPassword(body.email);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('reset-password')
  resetPassword(@Body() body: Record<string, string>) {
    return this.usersService.resetPassword(body.token, body.password);
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

  @Get('pending')
  @Roles(...PERMISSIONS.READ_USERS)
  @UseGuards(RolesGuard)
  findPending() {
    return this.usersService.findPending();
  }

  @Patch(':id/approve')
  @Roles(...PERMISSIONS.READ_USERS) // President has this permission
  @UseGuards(RolesGuard)
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.approve(id);
  }

  @Delete(':id')
  @Roles(...PERMISSIONS.READ_USERS)
  @UseGuards(RolesGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
