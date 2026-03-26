import { z } from 'zod';

export const documentSchema = z.object({
  date: z.string().min(1, 'Date is required'),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
});
