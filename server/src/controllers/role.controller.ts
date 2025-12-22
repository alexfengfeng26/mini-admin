import { Request, Response } from 'express';
import { RoleService } from '../services/role.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

const roleService = new RoleService();

export class RoleController {
  /**
   * 创建角色
   */
  async create(req: Request, res: Response) {
    try {
      const role = await roleService.create(req.body);
      return successResponse(res, role, '创建角色成功');
    } catch (error: any) {
      return errorResponse(res, 400, error.message || '创建角色失败');
    }
  }

  /**
   * 获取角色列表
   */
  async findAll(req: Request, res: Response) {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        sortBy: (req.query.sortBy as string) || 'id',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        name: req.query.name as string,
        code: req.query.code as string,
        status: req.query.status ? parseInt(req.query.status as string) : undefined,
      };

      const result = await roleService.findAll(query);
      return paginatedResponse(
        res,
        result.items,
        result.total,
        result.page,
        result.pageSize,
        '获取角色列表成功'
      );
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '获取角色列表失败');
    }
  }

  /**
   * 获取角色详情
   */
  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const role = await roleService.findById(id);
      return successResponse(res, role, '获取角色详情成功');
    } catch (error: any) {
      const status = error.message === '角色不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '获取角色详情失败');
    }
  }

  /**
   * 更新角色
   */
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const role = await roleService.update(id, req.body);
      return successResponse(res, role, '更新角色成功');
    } catch (error: any) {
      const status = error.message === '角色不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '更新角色失败');
    }
  }

  /**
   * 删除角色
   */
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await roleService.delete(id);
      return successResponse(res, null, '删除角色成功');
    } catch (error: any) {
      const status = error.message === '角色不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '删除角色失败');
    }
  }

  /**
   * 获取角色的菜单权限
   */
  async getRoleMenus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const menus = await roleService.getRoleMenus(id);
      return successResponse(res, menus, '获取角色菜单权限成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '获取角色菜单权限失败');
    }
  }

  /**
   * 更新角色的菜单权限
   */
  async updateRoleMenus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { menuIds } = req.body;

      if (!Array.isArray(menuIds)) {
        return errorResponse(res, 400, '菜单ID必须是数组');
      }

      await roleService.updateRoleMenus(id, menuIds);
      return successResponse(res, null, '更新角色菜单权限成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '更新角色菜单权限失败');
    }
  }
}
