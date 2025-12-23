import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

const categoryService = new CategoryService();

export class CategoryController {
  /**
   * 创建分类
   */
  async create(req: Request, res: Response) {
    try {
      const category = await categoryService.create(req.body);
      return successResponse(res, category, '创建分类成功');
    } catch (error: any) {
      return errorResponse(res, 400, error.message || '创建分类失败');
    }
  }

  /**
   * 获取分类列表
   */
  async findAll(req: Request, res: Response) {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        sortBy: (req.query.sortBy as string) || 'sort',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
        type: req.query.type as string,
        status: req.query.status ? parseInt(req.query.status as string) : undefined,
        parentId: req.query.parentId ? parseInt(req.query.parentId as string) : undefined,
        keyword: req.query.keyword as string,
      };

      if (!query.type) {
        return errorResponse(res, 400, '分类类型不能为空');
      }

      const result = await categoryService.findAll(query);
      return paginatedResponse(
        res,
        result.items,
        result.total,
        result.page,
        result.pageSize,
        '获取分类列表成功'
      );
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '获取分类列表失败');
    }
  }

  /**
   * 获取分类树
   */
  async findTree(req: Request, res: Response) {
    try {
      const { type } = req.query;

      if (!type || typeof type !== 'string') {
        return errorResponse(res, 400, '分类类型不能为空');
      }

      const tree = await categoryService.findTree(type);
      return successResponse(res, tree, '获取分类树成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '获取分类树失败');
    }
  }

  /**
   * 获取分类详情
   */
  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const category = await categoryService.findById(id);
      return successResponse(res, category, '获取分类详情成功');
    } catch (error: any) {
      const status = error.message === '分类不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '获取分类详情失败');
    }
  }

  /**
   * 更新分类
   */
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const category = await categoryService.update(id, req.body);
      return successResponse(res, category, '更新分类成功');
    } catch (error: any) {
      const status = error.message === '分类不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '更新分类失败');
    }
  }

  /**
   * 删除分类
   */
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await categoryService.delete(id);
      return successResponse(res, null, '删除分类成功');
    } catch (error: any) {
      const status = error.message === '分类不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '删除分类失败');
    }
  }

  /**
   * 更新分类状态
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (typeof status !== 'number') {
        return errorResponse(res, 400, '状态值必须是数字');
      }

      await categoryService.updateStatus(id, status);
      return successResponse(res, null, '更新分类状态成功');
    } catch (error: any) {
      const status = error.message === '分类不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '更新分类状态失败');
    }
  }
}
