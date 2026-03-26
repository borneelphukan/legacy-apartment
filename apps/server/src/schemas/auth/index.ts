import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required')
});

export const registerSchema = loginSchema.extend({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  residence: z.string().min(1, 'Apartment Number is required'),
  phone_no: z.string().min(10, 'Valid phone number is required')
});

export const unlockSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});
