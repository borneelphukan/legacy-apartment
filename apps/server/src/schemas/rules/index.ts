import { z } from 'zod';

export const ruleSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  rule: z.string().min(1, 'Rule content is required').refine(val => val !== '<p><br></p>' && val !== '<p></p>', { message: 'Rule content cannot be empty' }),
});
