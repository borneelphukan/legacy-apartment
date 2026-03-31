import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class AnnouncementService {
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

  private async uploadFileToR2(fileSrc: string, originalName?: string): Promise<string> {
    if (fileSrc && fileSrc.startsWith('data:') && fileSrc.includes(';base64,')) {
      try {
        const parts = fileSrc.split(',');
        const header = parts[0]; 
        const base64Data = parts.slice(1).join(','); 
        
        let mimeType = header.split(':')[1].split(';')[0];
        let extension = 'pdf';

        if (mimeType !== 'application/pdf') {
          // If it's not a PDF, we'll still try to determine extension but default is pdf based on requirement
          extension = mimeType.split('/')[1] || 'pdf';
        }

        const buffer = Buffer.from(base64Data, 'base64');
        const safeOriginalName = originalName ? originalName.replace(/[^a-zA-Z0-9\s-_]/g, '').trim().replace(/\s+/g, '-') : 'announcement';
        const filename = `announcements/${safeOriginalName}-${randomUUID()}.${extension}`;
        
        await this.s3Client.send(new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME || 'legacy-apartment',
          Key: filename,
          Body: buffer,
          ContentType: mimeType,
        }));
        
        return `${process.env.R2_PUBLIC_URL}/${filename}`;
      } catch (error) {
        console.error('Error uploading announcement file to R2:', error);
        return fileSrc;
      }
    }
    return fileSrc;
  }

  async create(data: { title: string; description: string; date?: Date; fileUrl?: string; fileName?: string }) {
    if (data.fileUrl) {
      data.fileUrl = await this.uploadFileToR2(data.fileUrl, data.fileName);
    }
    
    return this.prisma.announcement.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });
  }

  async findAll() {
    return this.prisma.announcement.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: number) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
    return announcement;
  }

  async update(id: number, data: { title?: string; description?: string; date?: Date; fileUrl?: string; fileName?: string }) {
    const exists = await this.prisma.announcement.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    if (data.fileUrl !== undefined && data.fileUrl !== exists.fileUrl) {
      // Delete old file if it exists and is on R2
      if (exists.fileUrl && process.env.R2_PUBLIC_URL && exists.fileUrl.startsWith(process.env.R2_PUBLIC_URL)) {
        const key = exists.fileUrl.substring(process.env.R2_PUBLIC_URL.length + 1);
        try {
          await this.s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || 'legacy-apartment',
            Key: key,
          }));
        } catch (error) {
          console.error('Error deleting old announcement file from R2:', error);
        }
      }

      if (data.fileUrl) {
        data.fileUrl = await this.uploadFileToR2(data.fileUrl, data.fileName);
      }
    }



    try {
      return await this.prisma.announcement.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          date: data.date,
          fileUrl: data.fileUrl === '' ? null : data.fileUrl,
          fileName: data.fileName === '' ? null : data.fileName,
        },
      });
    } catch (error) {
      console.error(`Error updating announcement ${id}:`, error);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const announcement = await this.prisma.announcement.findUnique({ where: { id } });
      if (announcement && announcement.fileUrl && process.env.R2_PUBLIC_URL && announcement.fileUrl.startsWith(process.env.R2_PUBLIC_URL)) {
        const key = announcement.fileUrl.substring(process.env.R2_PUBLIC_URL.length + 1);
        try {
          await this.s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || 'legacy-apartment',
            Key: key,
          }));
        } catch (error) {
           console.error('Error deleting announcement file from R2:', error);
        }
      }

      return await this.prisma.announcement.delete({
        where: { id },
      });
    } catch (error) {
       throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
  }
}
