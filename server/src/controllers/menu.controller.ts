import { Request, Response } from 'express';
import { MenuService } from '../services/menu.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

const menuService = new MenuService();

export class MenuController {
  /**
   * 创建菜单
   */
  async create(req: Request, res: Response) {
    try {
      const menu = await menuService.create(req.body);
      return successResponse(res, menu, '创建菜单成功');
    } catch (error: any) {
      return errorResponse(res, 400, error.message || '创建菜单失败');
    }
  }

  /**
   * 获取菜单列表
   */
  async findAll(req: Request, res: Response) {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined,
        sortBy: (req.query.sortBy as string) || 'sort',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
        name: req.query.name as string,
        type: req.query.type ? parseInt(req.query.type as string) : undefined,
        status: req.query.status ? parseInt(req.query.status as string) : undefined,
        parentId: req.query.parentId ? parseInt(req.query.parentId as string) : undefined,
      };

      const result = await menuService.findAll(query);
      return paginatedResponse(
        res,
        result.items,
        result.total,
        result.page,
        result.pageSize,
        '获取菜单列表成功'
      );
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '获取菜单列表失败');
    }
  }

  /**
   * 获取菜单树形结构
   */
  async findTree(req: Request, res: Response) {
    try {
      const tree = await menuService.findTree();
      return successResponse(res, tree, '获取菜单树成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '获取菜单树失败');
    }
  }

  /**
   * 获取菜单详情
   */
  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const menu = await menuService.findById(id);
      return successResponse(res, menu, '获取菜单详情成功');
    } catch (error: any) {
      const status = error.message === '菜单不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '获取菜单详情失败');
    }
  }

  /**
   * 更新菜单
   */
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const menu = await menuService.update(id, req.body);
      return successResponse(res, menu, '更新菜单成功');
    } catch (error: any) {
      const status = error.message === '菜单不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '更新菜单失败');
    }
  }

  /**
   * 删除菜单
   */
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await menuService.delete(id);
      return successResponse(res, null, '删除菜单成功');
    } catch (error: any) {
      const status = error.message === '菜单不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '删除菜单失败');
    }
  }

  /**
   * 获取用户菜单权限
   */
  async getUserMenus(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const menus = await menuService.getUserMenus(userId);
      return successResponse(res, menus, '获取用户菜单成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '获取用户菜单失败');
    }
  }
}
