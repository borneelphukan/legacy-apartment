import { z } from 'zod';

export const pwdSchema = z.object({
  password: z.string().min(1, 'Password is required')
});

export const settingSchema = z.object({
  year: z.number().optional(),
  monthlyFee: z.number().optional(),
  yearlyFee: z.number().optional(),
  frontendPassword: z.string().optional()
});
