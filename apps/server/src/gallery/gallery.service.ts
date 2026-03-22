import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class GalleryService {
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

  async createEvent(data: { name: string; date: string; year: number }) {
    return this.prisma.galleryEvent.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
    });
  }

  async findAllEvents() {
    return this.prisma.galleryEvent.findMany({
      include: {
        photos: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async updateEvent(id: number, data: { name?: string; date?: string; year?: number }) {
    return this.prisma.galleryEvent.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });
  }

  async removeEvent(id: number) {
    const event = await this.prisma.galleryEvent.findUnique({
      where: { id },
      include: { photos: true },
    });

    if (event) {
      for (const photo of event.photos) {
        if (photo.src && process.env.R2_PUBLIC_URL && photo.src.startsWith(process.env.R2_PUBLIC_URL)) {
          const key = photo.src.substring(process.env.R2_PUBLIC_URL.length + 1);
          try {
            await this.s3Client.send(new DeleteObjectCommand({
              Bucket: process.env.R2_BUCKET_NAME || 'legacy-apartment',
              Key: key,
            }));
          } catch (error) {
            console.error('Error deleting photo from R2:', error);
          }
        }
      }
    }

    return this.prisma.galleryEvent.delete({
      where: { id },
    });
  }

  async addPhoto(data: { eventId: number; src: string; alt?: string; className?: string }) {
    let finalSrc = data.src;

    if (data.src && data.src.startsWith('data:') && data.src.includes(';base64,')) {
      try {
        const parts = data.src.split(',');
        const header = parts[0]; 
        const base64Data = parts.slice(1).join(','); // join remaining parts in case of inner commas though unlikely
        
        let mimeType = header.split(':')[1].split(';')[0];
        let extension = mimeType.split('/')[1] || 'jpeg';
        if (extension === 'octet-stream' || !mimeType.startsWith('image/')) {
           extension = 'png';
           mimeType = 'image/png';
        }

        const event = await this.prisma.galleryEvent.findUnique({
          where: { id: data.eventId }
        });
        if (!event) throw new InternalServerErrorException('Event not found');

        const folderName = event.name.replace(/[^a-zA-Z0-9\s-_]/g, '').trim().replace(/\s+/g, '-');
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `gallery/${folderName}/${randomUUID()}.${extension}`;
        
        await this.s3Client.send(new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME || 'legacy-apartment',
          Key: filename,
          Body: buffer,
          ContentType: mimeType,
        }));
        
        finalSrc = `${process.env.R2_PUBLIC_URL}/${filename}`;
      } catch (error: any) {
        console.error('Error uploading to R2:', error);
        throw new InternalServerErrorException('Failed to upload image to storage: ' + (error?.message || 'Unknown R2 error'));
      }
    }

    return this.prisma.galleryPhoto.create({
      data: {
        ...data,
        src: finalSrc,
      },
    });
  }

  async removePhoto(id: number) {
    const photo = await this.prisma.galleryPhoto.findUnique({
      where: { id },
    });

    if (photo && photo.src && process.env.R2_PUBLIC_URL && photo.src.startsWith(process.env.R2_PUBLIC_URL)) {
      const key = photo.src.substring(process.env.R2_PUBLIC_URL.length + 1);
      try {
        await this.s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME || 'legacy-apartment',
          Key: key,
        }));
      } catch (error) {
        console.error('Error deleting photo from R2:', error);
      }
    }

    return this.prisma.galleryPhoto.delete({
      where: { id },
    });
  }
}
