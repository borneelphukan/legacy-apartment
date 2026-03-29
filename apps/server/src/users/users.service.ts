import { Injectable, UnauthorizedException, NotFoundException, Logger } from '@nestjs/common';
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
    const hashedPassword = await bcrypt.hash(data.password || process.env.DEFAULT_USER_PASSWORD || 'ChangeMe123!', 10);
    
    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    return {
      message: 'User created successfully',
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
    const resetLink = `${process.env.ADMIN_FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;
    
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
    const where = search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { role: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

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
}
