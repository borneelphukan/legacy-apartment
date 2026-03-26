import { z } from 'zod';

export const helpDeskSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  apartment: z.string().min(1, 'Apartment No. is required'),
  phone_no: z.string().min(10, 'Valid phone number is required'),
  complaint: z.string().min(10, 'Please provide more details (min 10 chars)')
});
