import { z } from 'zod';

export const createGameSchema = z.object({
  rakeId: z
    .number()
    .positive('Rake ID must be positive'),
});

export type CreateGameDto = z.infer<typeof createGameSchema>;
