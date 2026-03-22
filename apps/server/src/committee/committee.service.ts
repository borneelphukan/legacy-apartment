import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class CommitteeService {
  private s3Client: S3Client;

  constructor(private prisma: PrismaService) {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT || '',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
  }

  private async uploadAvatarToR2(avatarSrc: string): Promise<string> {
    if (avatarSrc && avatarSrc.startsWith('data:') && avatarSrc.includes(';base64,')) {
      try {
        const parts = avatarSrc.split(',');
        const header = parts[0]; 
        const base64Data = parts.slice(1).join(','); 
        
        let mimeType = header.split(':')[1].split(';')[0];
        let extension = mimeType.split('/')[1] || 'jpeg';
        if (extension === 'octet-stream' || !mimeType.startsWith('image/')) {
           extension = 'png';
           mimeType = 'image/png';
        }

        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `committee/${randomUUID()}.${extension}`;
        
        await this.s3Client.send(new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME || 'legacy-apartment',
          Key: filename,
          Body: buffer,
          ContentType: mimeType,
        }));
        
        return `${process.env.R2_PUBLIC_URL}/${filename}`;
      } catch (error) {
        console.error('Error uploading avatar to R2:', error);
        return avatarSrc;
      }
    }
    return avatarSrc;
  }

  async create(data: { avatar?: string; name: string; residence: string; phone_no: string; role: string }) {
    if (data.avatar) {
      data.avatar = await this.uploadAvatarToR2(data.avatar);
    }
    return this.prisma.committeeMember.create({
      data,
    });
  }

  async findAll(search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc') {
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { residence: { contains: search, mode: 'insensitive' as const } },
        { phone_no: { contains: search, mode: 'insensitive' as const } },
        { role: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' };

    return this.prisma.committeeMember.findMany({
      where,
      orderBy,
    });
  }

  async findOne(id: number) {
    const member = await this.prisma.committeeMember.findUnique({
      where: { id },
    });
    if (!member) {
      throw new NotFoundException(`Committee member with ID ${id} not found`);
    }
    return member;
  }

  async update(id: number, data: { avatar?: string; name?: string; residence?: string; phone_no?: string; role?: string }) {
    const exists = await this.prisma.committeeMember.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Committee member with ID ${id} not found`);
    }

    if (data.avatar !== undefined && data.avatar !== exists.avatar) {
      if (exists.avatar && process.env.R2_PUBLIC_URL && exists.avatar.startsWith(process.env.R2_PUBLIC_URL)) {
        const key = exists.avatar.substring(process.env.R2_PUBLIC_URL.length + 1);
        try {
          await this.s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || 'legacy-apartment',
            Key: key,
          }));
        } catch (error) {
          console.error('Error deleting old committee avatar from R2:', error);
        }
      }

      if (data.avatar) {
        data.avatar = await this.uploadAvatarToR2(data.avatar);
      }
    }

    try {
      return await this.prisma.committeeMember.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException(`Committee member with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      const member = await this.prisma.committeeMember.findUnique({
        where: { id },
      });

      if (member && member.avatar && process.env.R2_PUBLIC_URL && member.avatar.startsWith(process.env.R2_PUBLIC_URL)) {
        const key = member.avatar.substring(process.env.R2_PUBLIC_URL.length + 1);
        try {
          await this.s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || 'legacy-apartment',
            Key: key,
          }));
        } catch (error) {
           console.error('Error deleting committee avatar from R2:', error);
        }
      }

      return await this.prisma.committeeMember.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Committee member with ID ${id} not found`);
    }
  }
}
