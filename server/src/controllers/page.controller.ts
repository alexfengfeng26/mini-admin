import { Request, Response } from 'express';
import { PageService } from '../services/page.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

const pageService = new PageService();

export class PageController {
  /**
   * 创建页面
   */
  async create(req: Request, res: Response) {
    try {
      const page = await pageService.create(req.body);
      return successResponse(res, page, '创建页面成功');
    } catch (error: any) {
      return errorResponse(res, 400, error.message || '创建页面失败');
    }
  }

  /**
   * 获取页面列表
   */
  async findAll(req: Request, res: Response) {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        sortBy: (req.query.sortBy as string) || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        status: req.query.status ? parseInt(req.query.status as string) : undefined,
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        tagId: req.query.tagId ? parseInt(req.query.tagId as string) : undefined,
        keyword: req.query.keyword as string,
        template: req.query.template as string,
      };

      const result = await pageService.findAll(query);
      return paginatedResponse(
        res,
        result.items,
        result.total,
        result.page,
        result.pageSize,
        '获取页面列表成功'
      );
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '获取页面列表失败');
    }
  }

  /**
   * 获取页面详情
   */
  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const page = await pageService.findById(id);
      return successResponse(res, page, '获取页面详情成功');
    } catch (error: any) {
      const status = error.message === '页面不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '获取页面详情失败');
    }
  }

  /**
   * 根据 slug 获取页面
   */
  async findBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const page = await pageService.findBySlug(slug);
      return successResponse(res, page, '获取页面成功');
    } catch (error: any) {
      const status = error.message === '页面不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '获取页面失败');
    }
  }

  /**
   * 更新页面
   */
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const page = await pageService.update(id, req.body);
      return successResponse(res, page, '更新页面成功');
    } catch (error: any) {
      const status = error.message === '页面不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '更新页面失败');
    }
  }

  /**
   * 删除页面
   */
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await pageService.delete(id);
      return successResponse(res, null, '删除页面成功');
    } catch (error: any) {
      const status = error.message === '页面不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '删除页面失败');
    }
  }

  /**
   * 批量删除页面
   */
  async deleteMany(req: Request, res: Response) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return errorResponse(res, 400, '请提供要删除的页面ID数组');
      }

      await pageService.deleteMany(ids);
      return successResponse(res, null, '批量删除页面成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '批量删除页面失败');
    }
  }

  /**
   * 更新页面状态
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (typeof status !== 'number') {
        return errorResponse(res, 400, '状态值必须是数字');
      }

      await pageService.updateStatus(id, status);
      return successResponse(res, null, '更新页面状态成功');
    } catch (error: any) {
      const status = error.message === '页面不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '更新页面状态失败');
    }
  }

  /**
   * 批量更新页面状态
   */
  async updateStatusMany(req: Request, res: Response) {
    try {
      const { ids, status } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return errorResponse(res, 400, '请提供要更新的页面ID数组');
      }

      if (typeof status !== 'number') {
        return errorResponse(res, 400, '状态值必须是数字');
      }

      await pageService.updateStatusMany(ids, status);
      return successResponse(res, null, '批量更新页面状态成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '批量更新页面状态失败');
    }
  }

  /**
   * 搜索页面
   */
  async search(req: Request, res: Response) {
    try {
      const { keyword } = req.query;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!keyword || typeof keyword !== 'string') {
        return errorResponse(res, 400, '请提供搜索关键词');
      }

      const pages = await pageService.search(keyword, limit);
      return successResponse(res, pages, '搜索页面成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '搜索页面失败');
    }
  }

  /**
   * 获取页面统计
   */
  async getStats(req: Request, res: Response) {
    try {
      const stats = await pageService.getStats();
      return successResponse(res, stats, '获取页面统计成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '获取页面统计失败');
    }
  }
}
