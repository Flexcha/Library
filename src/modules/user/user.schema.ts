import { z } from 'zod';

export const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['ADMIN', 'LIBRARIAN', 'MEMBER']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'INACTIVE']).optional(),
  membershipExpiryDate: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'INACTIVE']),
});

export const userQuerySchema = z.object({
  page: z.string().optional(),
  size: z.string().optional(),
  sort: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
