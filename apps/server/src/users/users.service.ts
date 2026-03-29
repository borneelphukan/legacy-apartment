import { Injectable, UnauthorizedException, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import * as nodemailer from 'nodemailer';
const mjml2html = require('mjml');

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isApproved) {
      throw new UnauthorizedException('Your request is pending approval by the President');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      sub: user.id, 
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      residence: user.residence,
      phone_no: user.phone_no,
    };

    return {
      token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        residence: user.residence,
        phone_no: user.phone_no,
        // @ts-ignore
        role: user.role,
      },
      message: 'Login successful'
    };
  }

  async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    residence: string;
    phone_no: string;
    password?: string;
  }) {
    // Define role limits
    const ROLE_LIMITS: Record<string, number> = {
      'president': 1,
      'secretary': 1,
      'joint_secretary': 2,
      'treasurer': 1,
      'advisor': 5,
      'technical_advisor': 3,
      'cultural_head': 2,
      'welfare_head': 2,
      'gym_head': 2,
      'gardening': 2,
      'catering': 2,
    };

    const role = data.role.toLowerCase();
    const limit = ROLE_LIMITS[role];

    if (limit !== undefined) {
      const currentCount = await this.prisma.user.count({
        where: { role: role },
      });

      if (currentCount >= limit) {
        throw new BadRequestException('Role position cannot exceed committees decision. Cannot add a new memeber to this role');
      }
    }

    const hashedPassword = await bcrypt.hash(data.password || process.env.DEFAULT_USER_PASSWORD || 'ChangeMe123!', 10);
    const isApproved = role === 'president';
    
    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        isApproved,
      },
    });

    return {
      message: isApproved ? 'User created successfully' : 'Your request has been sent. You will join the admin when the President approves it',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        residence: user.residence,
        phone_no: user.phone_no,
        // @ts-ignore
        role: user.role,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't leak whether the user exists or not, standard security practice
      return { message: 'If the email exists, a reset link will be sent.' };
    }

    // Generate a reset token valid for 15 minutes
    const payload = { sub: user.id, email: user.email, type: 'reset' };
    const resetToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });

    // The reset link points to the admin frontend
    const adminUrl = process.env.ADMIN_FRONTEND_URL || 'https://admin.thelegacyapartment.co.in';
    const resetLink = `${adminUrl}/reset-password?token=${resetToken}`;
    
    // Read and parse the MJML template
    const templatePath = path.join(process.cwd(), 'src', 'templates', 'forgot-password.mjml');
    let htmlOutput = '';
    
    try {
      if (fs.existsSync(templatePath)) {
        let template = fs.readFileSync(templatePath, 'utf8');
        template = template.replace('{{userName}}', user.firstName || 'User');
        template = template.replace('{{resetLink}}', resetLink);
        
        const mjmlParseResults = mjml2html(template);
        htmlOutput = mjmlParseResults.html;
      } else {
        htmlOutput = `<p>Hello ${user.firstName},</p><p>Please reset your password using this link: <a href="${resetLink}">${resetLink}</a></p>`;
      }

      // Configure a transporter (for demo, you might want to configure via env vars)
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      if (process.env.SMTP_HOST) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || '"Legacy Apartment" <noreply@legacyapartment.com>',
          to: user.email,
          subject: 'Password Reset Request',
          html: htmlOutput,
        });
        this.logger.log(`Password reset email sent to ${user.email}`);
      } else {
        this.logger.warn(`No SMTP host configured. Generated reset link for ${user.email}: ${resetLink}`);
      }
    } catch (error) {
      this.logger.error('Error sending forgot password email', error);
      // Still return success to not leak email existence even if email system fails
    }

    return { message: 'If the email exists, a reset link will be sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      
      if (payload.type !== 'reset') {
        throw new UnauthorizedException('Invalid token type');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { password: hashedPassword },
      });

      return { message: 'Password has been successfully reset' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  async findAll(search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc') {
    const where: any = search ? {
      isApproved: true,
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { role: { contains: search, mode: 'insensitive' as const } },
      ],
    } : { isApproved: true };

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' };

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        residence: true,
        phone_no: true,
        createdAt: true,
      },
      orderBy,
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async findPending() {
    return this.prisma.user.findMany({
      where: { isApproved: false },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        residence: true,
        phone_no: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: number) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isApproved: true },
    });

    // Read and parse the MJML template
    const templatePath = path.join(process.cwd(), 'src', 'templates', 'admin-approved.mjml');
    let htmlOutput = '<p>Your request for admin membership has been approved. You may login.</p>';

    if (fs.existsSync(templatePath)) {
      let template = fs.readFileSync(templatePath, 'utf8');
      template = template.replace('{{userName}}', user.firstName || 'User');
      const adminUrl = process.env.ADMIN_FRONTEND_URL || 'https://admin.thelegacyapartment.co.in';
      template = template.replace('{{loginLink}}', `${adminUrl}/login`);
      
      const mjmlParseResults = mjml2html(template);
      htmlOutput = mjmlParseResults.html;
    }

    // Send approval email
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      if (process.env.SMTP_HOST) {
        await transporter.sendMail({
          from: '"Legacy Apartment" <legacy.sixmile@gmail.com>',
          to: user.email,
          subject: 'Admin Membership Approved',
          text: 'Your request for admin membership has been approved. You may login.',
          html: htmlOutput,
        });
        this.logger.log(`Approval email sent to ${user.email}`);
      } else {
        this.logger.warn(`No SMTP host configured. Approval email simulated for ${user.email}`);
      }
    } catch (error) {
      this.logger.error('Error sending approval email', error);
    }

    return user;
  }
}
