import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['SUPERADMIN', 'ADMIN', 'LIBRARIAN', 'MEMBER']).default('MEMBER'),
});

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

export const updateRoleSchema = z.object({
  role: z.enum(['SUPERADMIN', 'ADMIN', 'LIBRARIAN', 'MEMBER']),
});

export const userQuerySchema = z.object({
  page: z.string().optional(),
  size: z.string().optional(),
  sort: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type UserRoleType = 'SUPERADMIN' | 'ADMIN' | 'LIBRARIAN' | 'MEMBER';

