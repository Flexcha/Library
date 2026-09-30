import { prisma } from '../../config/prisma.ts';
import { NotFoundError, ConflictError, ForbiddenError } from '../../common/errors/AppError.ts';
import { parsePagination, toPageResponse } from '../../common/pagination.ts';
import { CreateUserInput, UpdateUserInput } from './user.schema.ts';
import { JwtUtil } from '../auth/jwt.util.ts';

export class UserService {
  static async listUsers(query: any) {
    const { skip, take, page, size, orderBy } = parsePagination(query, 'createdAt', 'desc');

    const where: any = {};
    if (query.role) {
      where.role = query.role;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search } },
        { email: { contains: query.search } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          address: true,
          role: true,
          status: true,
          membershipExpiryDate: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return toPageResponse(users, total, page, size);
  }

  static async createUser(data: CreateUserInput, callerRole: string) {
    // Cannot create SUPERADMIN accounts via management API
    if (data.role === 'SUPERADMIN') {
      throw new ForbiddenError('Không thể tạo tài khoản SUPERADMIN mới từ trang quản lý', 'FORBIDDEN');
    }
    // ADMIN cannot create ADMIN accounts
    if (data.role === 'ADMIN' && callerRole === 'ADMIN') {
      throw new ForbiddenError('Admin chỉ có thể tạo tài khoản Thủ thư hoặc Bạn đọc', 'FORBIDDEN');
    }

    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      throw new ConflictError('Email này đã được sử dụng', 'DUPLICATE_EMAIL');
    }

    const passwordHash = await JwtUtil.hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        passwordHash,
        phone: data.phone,
        address: data.address,
        role: data.role,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return user;
  }

  static async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        status: true,
        membershipExpiryDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }

    return user;
  }

  static async updateUser(id: number, data: UpdateUserInput, isAdmin: boolean) {
    await this.getUserById(id);

    const updateData: any = {};
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;

    // Only admin can change role, status, expiry
    if (isAdmin) {
      if (data.role !== undefined) updateData.role = data.role;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.membershipExpiryDate !== undefined) updateData.membershipExpiryDate = data.membershipExpiryDate;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        status: true,
        membershipExpiryDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  static async updateStatus(id: number, status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE', callerRole: string) {
    const target = await this.getUserById(id);

    // Permission guard: ADMIN cannot change status of SUPERADMIN or other ADMINs
    if (callerRole === 'ADMIN') {
      if (target.role === 'SUPERADMIN' || target.role === 'ADMIN') {
        throw new ForbiddenError(
          'Admin chỉ có thể điều chỉnh trạng thái của Tủ thư và Bạn đọc',
          'FORBIDDEN'
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return updated;
  }

  static async updateRole(id: number, role: 'SUPERADMIN' | 'ADMIN' | 'LIBRARIAN' | 'MEMBER', callerRole: string) {
    const target = await this.getUserById(id);

    // Cannot assign SUPERADMIN role via management API
    if (role === 'SUPERADMIN') {
      throw new ForbiddenError('Không thể gán vai trò SUPERADMIN từ trang quản lý', 'FORBIDDEN');
    }
    if (target.role === 'SUPERADMIN' && callerRole !== 'SUPERADMIN') {
      throw new ForbiddenError('Chỉ SUPERADMIN mới có thể thay đổi quyền của tài khoản SUPERADMIN', 'FORBIDDEN');
    }
    // ADMIN cannot promote to ADMIN or change other ADMINs
    if (callerRole === 'ADMIN') {
      if (role === 'ADMIN' || target.role === 'ADMIN') {
        throw new ForbiddenError(
          'Admin không thể cấp hoặc thu hồi quyền Admin',
          'FORBIDDEN'
        );
      }
    }

    return prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
      },
    });
  }

  static async softDelete(id: number) {
    await this.getUserById(id);

    await prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });

    return { message: 'User deactivated successfully' };
  }
}
