import { z } from 'zod';

export const committeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  residence: z.string().min(1, 'Apartment Number is required'),
  phone_no: z.string().min(10, 'Valid phone number is required'),
  role: z.string().min(1, 'Role is required')
});
