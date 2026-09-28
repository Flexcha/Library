import { prisma } from '../../config/prisma.ts';
import { JwtUtil } from './jwt.util.ts';
import { RegisterInput, LoginInput } from './auth.schema.ts';
import { ConflictError, UnauthorizedError, ForbiddenError, NotFoundError } from '../../common/errors/AppError.ts';

export class AuthService {
  static async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictError('Email is already registered', 'DUPLICATE_EMAIL');
    }

    const passwordHash = await JwtUtil.hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        passwordHash,
        phone: data.phone,
        address: data.address,
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    });

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }

  static async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password', 'UNAUTHENTICATED');
    }

    const isValidPassword = await JwtUtil.comparePassword(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password', 'UNAUTHENTICATED');
    }

    if (user.status === 'SUSPENDED') {
      throw new ForbiddenError('Account is suspended. Please contact library staff.', 'MEMBER_BLOCKED');
    }

    if (user.status === 'INACTIVE') {
      throw new ForbiddenError('Account is deactivated.', 'FORBIDDEN');
    }

    const role = user.role as 'ADMIN' | 'LIBRARIAN' | 'MEMBER';
    const accessToken = JwtUtil.signAccessToken({ id: user.id, email: user.email, role });
    const refreshToken = JwtUtil.signRefreshToken({ id: user.id, email: user.email, role });

    // Store refresh token in DB
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiryDate,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async refresh(token: string) {
    const payload = JwtUtil.verifyRefreshToken(token);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiryDate < new Date()) {
      if (storedToken) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      }
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = storedToken.user;
    if (user.status !== 'ACTIVE') {
      throw new ForbiddenError('Account is not active', 'FORBIDDEN');
    }

    // Invalidate old token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const role = user.role as 'ADMIN' | 'LIBRARIAN' | 'MEMBER';
    const newAccessToken = JwtUtil.signAccessToken({ id: user.id, email: user.email, role });
    const newRefreshToken = JwtUtil.signRefreshToken({ id: user.id, email: user.email, role });

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: newRefreshToken,
        expiryDate,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(token?: string, userId?: number) {
    if (token) {
      await prisma.refreshToken.deleteMany({
        where: { token },
      });
    } else if (userId) {
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });
    }
  }

  static async getMe(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      throw new NotFoundError('User not found');
    }

    return user;
  }
}
