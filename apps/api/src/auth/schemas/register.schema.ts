import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password must be less than 100 characters'),
  
  displayName: z
    .string()
    .max(100, 'Display name must be less than 100 characters')
    .optional(),
  
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      return /^\+?[1-9]\d{1,14}$/.test(val);
    }, 'Invalid phone number format'),
});

export type RegisterDto = z.infer<typeof registerSchema>;
