import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response';

const authService = new AuthService();

export class AuthController {
  /**
   * 用户登录
   */
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return errorResponse(res, 400, '用户名和密码不能为空');
      }

      const result = await authService.login({ username, password });
      return successResponse(res, result, '登录成功');
    } catch (error: any) {
      return errorResponse(res, 401, error.message || '登录失败');
    }
  }

  /**
   * 获取当前用户信息
   */
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const user = await authService.getProfile(userId);
      return successResponse(res, user, '获取用户信息成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '获取用户信息失败');
    }
  }

  /**
   * 修改密码
   */
  async changePassword(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return errorResponse(res, 400, '旧密码和新密码不能为空');
      }

      await authService.changePassword(userId, oldPassword, newPassword);
      return successResponse(res, null, '修改密码成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '修改密码失败');
    }
  }
}
