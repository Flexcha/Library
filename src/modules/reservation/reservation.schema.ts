import { z } from 'zod';

export const createReservationSchema = z.object({
  bookId: z.number().int().positive('bookId must be a positive integer'),
});

export const reservationQuerySchema = z.object({
  page: z.string().optional(),
  size: z.string().optional(),
  sort: z.string().optional(),
  status: z.string().optional(),
  memberId: z.string().optional(),
  bookId: z.string().optional(),
});

export const updateReservationStatusSchema = z.object({
  status: z.enum(['PENDING', 'READY', 'FULFILLED', 'CANCELLED']),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
