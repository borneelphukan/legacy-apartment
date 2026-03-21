import { z } from 'zod';

export const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  date: z.string().min(1, 'Date is required'),
});

export const photoSchema = z.object({
  src: z.string().min(1, 'Please upload a photo'),
});
