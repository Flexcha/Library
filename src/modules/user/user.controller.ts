import { Request, Response } from 'express';
import { UserService } from './user.service.ts';
import { ApiResponse } from '../../common/ApiResponse.ts';
import { ForbiddenError } from '../../common/errors/AppError.ts';

export class UserController {
  static async list(req: Request, res: Response) {
    const result = await UserService.listUsers(req.query);
    return ApiResponse.success(res, result);
  }

  static async getById(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const currentUser = req.user!;

    if (currentUser.role !== 'ADMIN' && currentUser.id !== id) {
      throw new ForbiddenError('You can only view your own profile');
    }

    const user = await UserService.getUserById(id);
    return ApiResponse.success(res, user);
  }

  static async update(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const currentUser = req.user!;
    const isAdmin = currentUser.role === 'ADMIN';

    if (!isAdmin && currentUser.id !== id) {
      throw new ForbiddenError('You can only update your own profile');
    }

    const updated = await UserService.updateUser(id, req.body, isAdmin);
    return ApiResponse.success(res, updated, 'User updated successfully');
  }

  static async updateStatus(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const updated = await UserService.updateStatus(id, req.body.status);
    return ApiResponse.success(res, updated, 'User status updated successfully');
  }

  static async remove(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const result = await UserService.softDelete(id);
    return ApiResponse.success(res, result, 'User deactivated successfully');
  }
}
