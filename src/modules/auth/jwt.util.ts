import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { env } from '../../config/env.ts';
import { UnauthorizedError } from '../../common/errors/AppError.ts';

export interface AuthUserPayload {
  sub: number;
  id: number;
  email: string;
  role: 'ADMIN' | 'LIBRARIAN' | 'MEMBER';
}

export class JwtUtil {
  static signAccessToken(payload: Omit<AuthUserPayload, 'sub'>): string {
    return jwt.sign(
      {
        sub: payload.id,
        id: payload.id,
        email: payload.email,
        role: payload.role,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRATION as any }
    );
  }

  static signRefreshToken(payload: Omit<AuthUserPayload, 'sub'>): string {
    return jwt.sign(
      {
        sub: payload.id,
        id: payload.id,
        email: payload.email,
        role: payload.role,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRATION as any }
    );
  }

  static verifyAccessToken(token: string): AuthUserPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      return {
        sub: decoded.sub || decoded.id,
        id: decoded.id || decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };
    } catch {
      throw new UnauthorizedError('Invalid or expired access token');
    }
  }

  static verifyRefreshToken(token: string): AuthUserPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      return {
        sub: decoded.sub || decoded.id,
        id: decoded.id || decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
