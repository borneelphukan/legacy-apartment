import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';

import { UsersModule } from './users/users.module';
import { AnnouncementModule } from './announcement/announcement.module';
import { ResidentModule } from './resident/resident.module';
import { FinanceModule } from './finance/finance.module';
import { SettingModule } from './setting/setting.module';
import { RuleModule } from './rules/rule.module';
import { ComplaintModule } from './complaint/complaint.module';
import { CommitteeModule } from './committee/committee.module';
import { AuthGuard } from './auth/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'supersecretjwtkey',
      signOptions: { expiresIn: '1d' },
    }),
    PrismaModule,
    UsersModule,
    AnnouncementModule,
    ResidentModule,
    FinanceModule,
    SettingModule,
    RuleModule,
    ComplaintModule,
    CommitteeModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}

