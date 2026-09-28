import { z } from 'zod';

export const createReservationSchema = z.object({
  bookId: z.number().int().positive('bookId must be a positive integer'),
});

export const reservationQuerySchema = z.object({
  page: z.string().optional(),
  size: z.string().optional(),
  sort: z.string().optional(),
  status: z.enum(['PENDING', 'READY', 'FULFILLED', 'CANCELLED', 'EXPIRED']).optional(),
  memberId: z.string().optional(),
  bookId: z.string().optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
