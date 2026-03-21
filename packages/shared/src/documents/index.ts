import { z } from 'zod';

export const documentSchema = z.object({
  date: z.string().min(1, 'Date is required'),
});
