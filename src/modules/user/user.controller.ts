import { Request, Response } from 'express';
import { UserService } from './user.service.ts';
import { ApiResponse } from '../../common/ApiResponse.ts';
import { ForbiddenError } from '../../common/errors/AppError.ts';

export class UserController {
  static async list(req: Request, res: Response) {
    const result = await UserService.listUsers(req.query);
    return ApiResponse.success(res, result);
  }

  static async create(req: Request, res: Response) {
    const callerRole = req.user!.role;
    const user = await UserService.createUser(req.body, callerRole);
    return ApiResponse.created(res, user, 'User created successfully');
  }

  static async getById(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const currentUser = req.user!;
    const isStaff = currentUser.role === 'SUPERADMIN' || currentUser.role === 'ADMIN' || currentUser.role === 'LIBRARIAN';

    if (!isStaff && currentUser.id !== id) {
      throw new ForbiddenError('You can only view your own profile');
    }

    const user = await UserService.getUserById(id);
    return ApiResponse.success(res, user);
  }

  static async update(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const currentUser = req.user!;
    const isAdmin = currentUser.role === 'SUPERADMIN' || currentUser.role === 'ADMIN';

    if (!isAdmin && currentUser.id !== id) {
      throw new ForbiddenError('You can only update your own profile');
    }

    const updated = await UserService.updateUser(id, req.body, isAdmin);
    return ApiResponse.success(res, updated, 'User updated successfully');
  }

  static async updateStatus(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const callerRole = req.user!.role;
    const updated = await UserService.updateStatus(id, req.body.status, callerRole);
    return ApiResponse.success(res, updated, 'User status updated successfully');
  }

  static async updateRole(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const currentUser = req.user!;
    if (currentUser.id === id) {
      throw new ForbiddenError('Bạn không thể tự thay đổi quyền của chính mình');
    }
    const updated = await UserService.updateRole(id, req.body.role, currentUser.role);
    return ApiResponse.success(res, updated, 'Role updated successfully');
  }

  static async remove(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const result = await UserService.softDelete(id);
    return ApiResponse.success(res, result, 'User deactivated successfully');
  }
}
