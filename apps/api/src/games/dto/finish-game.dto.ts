import { z } from 'zod';

export const finishGameSchema = z.object({
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
});

export type FinishGameDto = z.infer<typeof finishGameSchema>;
