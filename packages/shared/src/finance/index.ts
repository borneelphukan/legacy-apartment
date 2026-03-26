import { z } from 'zod';

export const monthlySchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  month: z.string().min(1, 'Month is required'),
  year: z.number().min(2000, 'Invalid year'),
});

export const securitySchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
});
