import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class DocumentService {
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

  private async uploadDocumentToR2(documentSrc: string, originalName?: string): Promise<string> {
    if (documentSrc && documentSrc.startsWith('data:') && documentSrc.includes(';base64,')) {
      try {
        const parts = documentSrc.split(',');
        const header = parts[0]; 
        const base64Data = parts.slice(1).join(','); 
        
        let mimeType = header.split(':')[1].split(';')[0];
        let extension = 'bin';

        if (mimeType === 'application/pdf') {
           extension = 'pdf';
        } else if (mimeType.startsWith('image/')) {
           extension = mimeType.split('/')[1] || 'jpeg';
        }

        if (extension === 'octet-stream' || extension === 'bin') {
           extension = 'bin';
        }

        const buffer = Buffer.from(base64Data, 'base64');
        const safeOriginalName = originalName ? originalName.replace(/[^a-zA-Z0-9\s-_]/g, '').trim().replace(/\s+/g, '-') : 'doc';
        const filename = `documents/${safeOriginalName}-${randomUUID()}.${extension}`;
        
        await this.s3Client.send(new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME || 'legacy-apartment',
          Key: filename,
          Body: buffer,
          ContentType: mimeType,
        }));
        
        return `${process.env.R2_PUBLIC_URL}/${filename}`;
      } catch (error) {
        console.error('Error uploading document to R2:', error);
        return documentSrc;
      }
    }
    return documentSrc;
  }

  async create(data: { document: string; fileName?: string; date: string; description?: string; category: string }) {
    if (data.document) {
       data.document = await this.uploadDocumentToR2(data.document, data.fileName);
    }
    return this.prisma.document.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
    });
  }

  async getCategories() {
    return this.prisma.documentCategory.findMany({ orderBy: { name: 'asc' } });
  }

  async createCategory(name: string) {
    return this.prisma.documentCategory.create({ data: { name } });
  }

  async removeCategory(id: number) {
    return this.prisma.documentCategory.delete({ where: { id } });
  }

  async findAll() {
    return this.prisma.document.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: number) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  async update(id: number, data: { document?: string; fileName?: string; date?: string; description?: string; category?: string }) {
    const exists = await this.prisma.document.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    if (data.document !== undefined && data.document !== exists.document) {
      if (exists.document && process.env.R2_PUBLIC_URL && exists.document.startsWith(process.env.R2_PUBLIC_URL)) {
        const key = exists.document.substring(process.env.R2_PUBLIC_URL.length + 1);
        try {
          await this.s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || 'legacy-apartment',
            Key: key,
          }));
        } catch (error) {
          console.error('Error deleting old document from R2:', error);
        }
      }

      if (data.document) {
        data.document = await this.uploadDocumentToR2(data.document, data.fileName || exists.fileName || undefined);
      }
    }

    try {
      return await this.prisma.document.update({
        where: { id },
        data: {
          ...data,
          date: data.date ? new Date(data.date) : undefined,
        },
      });
    } catch (error) {
       throw new NotFoundException(`Document with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      const document = await this.prisma.document.findUnique({ where: { id } });
      if (document && document.document && process.env.R2_PUBLIC_URL && document.document.startsWith(process.env.R2_PUBLIC_URL)) {
        const key = document.document.substring(process.env.R2_PUBLIC_URL.length + 1);
        try {
          await this.s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || 'legacy-apartment',
            Key: key,
          }));
        } catch (error) {
           console.error('Error deleting document from R2:', error);
        }
      }

      return await this.prisma.document.delete({
        where: { id },
      });
    } catch (error) {
       throw new NotFoundException(`Document with ID ${id} not found`);
    }
  }
}
