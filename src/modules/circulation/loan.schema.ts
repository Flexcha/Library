import { z } from 'zod';

export const checkoutSchema = z.object({
  memberId: z.number().int().positive('memberId must be a positive integer'),
  bookCopyId: z.number().int().positive('bookCopyId must be a positive integer'),
});

export const renewSchema = z.object({}).optional();

export const loanQuerySchema = z.object({
  page: z.string().optional(),
  size: z.string().optional(),
  sort: z.string().optional(),
  status: z.enum(['ONGOING', 'RETURNED', 'OVERDUE', 'LOST']).optional(),
  memberId: z.string().optional(),
});

export const reportLostSchema = z.object({
  type: z.enum(['LOST', 'DAMAGED']).default('LOST'),
  fineAmount: z.number().positive().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ReportLostInput = z.infer<typeof reportLostSchema>;
