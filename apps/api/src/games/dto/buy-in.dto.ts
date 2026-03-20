import { z } from 'zod';

export const buyInSchema = z.object({
  playerId: z
    .number()
    .int('Player ID must be an integer')
    .min(0, 'Player ID must be non-negative'),
  
  amount: z
    .number()
    .min(0, 'Amount must be non-negative')
    .max(999999.99, 'Amount too large')
    .optional()
    .default(0),
  
  tip: z
    .number()
    .min(0, 'Tip cannot be negative')
    .max(999999.99, 'Tip too large')
    .optional()
    .default(0),
}).refine(
  (data) => {
    // For rake (playerId === 0), tip must be > 0
    if (data.playerId === 0) {
      return data.tip > 0;
    }
    // For normal buy-in (playerId > 0), amount must be > 0
    return data.amount > 0;
  },
  {
    message: 'For rake: amount must be positive. For normal buy-in: amount must be positive.',
    path: ['amount'], // This sets which field the error appears on
  }
);

export type BuyInDto = z.infer<typeof buyInSchema>;
