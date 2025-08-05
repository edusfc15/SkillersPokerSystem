import { z } from 'zod';

export const loginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, 'Email or username is required')
    .max(255, 'Email or username must be less than 255 characters'),
  
  password: z
    .string()
    .min(1, 'Password is required')
    .max(100, 'Password must be less than 100 characters'),
});

export type LoginDto = z.infer<typeof loginSchema>;
