import { Request, Response } from 'express';
import { AuthService } from './auth.service.ts';
import { ApiResponse } from '../../common/ApiResponse.ts';

export class AuthController {
  static async register(req: Request, res: Response) {
    const user = await AuthService.register(req.body);
    return ApiResponse.created(res, user, 'User registered successfully');
  }

  static async login(req: Request, res: Response) {
    const result = await AuthService.login(req.body);
    return ApiResponse.success(res, result, 'Login successful');
  }

  static async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    const tokens = await AuthService.refresh(refreshToken);
    return ApiResponse.success(res, tokens, 'Tokens refreshed successfully');
  }

  static async logout(req: Request, res: Response) {
    const refreshToken = req.body?.refreshToken;
    const userId = req.user?.id;
    await AuthService.logout(refreshToken, userId);
    return ApiResponse.success(res, null, 'Logged out successfully');
  }

  static async me(req: Request, res: Response) {
    const user = await AuthService.getMe(req.user!.id);
    return ApiResponse.success(res, user, 'Profile retrieved successfully');
  }
}
