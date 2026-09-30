import { z } from 'zod';

export const fineQuerySchema = z.object({
  page: z.string().optional(),
  size: z.string().optional(),
  sort: z.string().optional(),
  status: z.string().optional(),
  memberId: z.string().optional(),
});

export const waiveFineSchema = z.object({
  reason: z.string().optional(),
});
