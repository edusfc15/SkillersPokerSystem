import { z } from 'zod';

export const cashoutSchema = z.object({
  playerId: z
    .number()
    .positive('Player ID must be positive'),
  
  amount: z
    .number()
    .positive('Cashout amount must be positive')
    .max(999999.99, 'Amount too large'),
  
  description: z
    .string()
    .max(255, 'Description must be less than 255 characters')
    .optional(),
});

export type CashoutDto = z.infer<typeof cashoutSchema>;
