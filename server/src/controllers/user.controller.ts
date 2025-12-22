import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { validateInput, userValidationSchema } from '../middleware/validation';

const userService = new UserService();

export class UserController {
  /**
   * 创建用户
   */
  async create(req: Request, res: Response) {
    try {
      const user = await userService.create(req.body);
      return successResponse(res, user, '创建用户成功');
    } catch (error: any) {
      return errorResponse(res, 400, error.message || '创建用户失败');
    }
  }

  /**
   * 获取用户列表
   */
  async findAll(req: Request, res: Response) {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        sortBy: (req.query.sortBy as string) || 'id',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        username: req.query.username as string,
        email: req.query.email as string,
        status: req.query.status ? parseInt(req.query.status as string) : undefined,
        roleId: req.query.roleId ? parseInt(req.query.roleId as string) : undefined,
      };

      const result = await userService.findAll(query);
      return paginatedResponse(
        res,
        result.items,
        result.total,
        result.page,
        result.pageSize,
        '获取用户列表成功'
      );
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '获取用户列表失败');
    }
  }

  /**
   * 获取用户详情
   */
  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const user = await userService.findById(id);
      return successResponse(res, user, '获取用户详情成功');
    } catch (error: any) {
      const status = error.message === '用户不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '获取用户详情失败');
    }
  }

  /**
   * 更新用户
   */
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const user = await userService.update(id, req.body);
      return successResponse(res, user, '更新用户成功');
    } catch (error: any) {
      const status = error.message === '用户不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '更新用户失败');
    }
  }

  /**
   * 删除用户
   */
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await userService.delete(id);
      return successResponse(res, null, '删除用户成功');
    } catch (error: any) {
      const status = error.message === '用户不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '删除用户失败');
    }
  }

  /**
   * 更新用户状态
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (typeof status !== 'number') {
        return errorResponse(res, 400, '状态值必须是数字');
      }

      await userService.updateStatus(id, status);
      return successResponse(res, null, '更新用户状态成功');
    } catch (error: any) {
      const status = error.message === '用户不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '更新用户状态失败');
    }
  }
}
