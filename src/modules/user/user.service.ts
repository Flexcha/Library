import { prisma } from '../../config/prisma.ts';
import { NotFoundError } from '../../common/errors/AppError.ts';
import { parsePagination, toPageResponse } from '../../common/pagination.ts';
import { UpdateUserInput } from './user.schema.ts';

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

  static async updateStatus(id: number, status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE') {
    await this.getUserById(id);

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

  static async softDelete(id: number) {
    await this.getUserById(id);

    await prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });

    return { message: 'User deactivated successfully' };
  }
}
