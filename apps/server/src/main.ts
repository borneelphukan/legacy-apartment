import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3001',
        'http://localhost:3000',
        'https://admin.thelegacyapartment.co.in',
        'https://thelegacyapartment.co.in',
        'https://www.thelegacyapartment.co.in',
        'https://thelegacyapartment.netlify.app',
        'https://admin-thelegacyapartment.netlify.app'
      ];
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.netlify.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  await app.listen(process.env.PORT || 4000, '0.0.0.0');
}
bootstrap();
