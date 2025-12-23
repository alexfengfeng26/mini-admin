import { Request, Response } from 'express';
import { ArticleService } from '../services/article.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

const articleService = new ArticleService();

export class ArticleController {
  /**
   * 创建文章
   */
  async create(req: Request, res: Response) {
    try {
      const article = await articleService.create(req.body);
      return successResponse(res, article, '创建文章成功');
    } catch (error: any) {
      return errorResponse(res, 400, error.message || '创建文章失败');
    }
  }

  /**
   * 获取文章列表
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
        featured: req.query.featured ? req.query.featured === 'true' : undefined,
        authorId: req.query.authorId ? parseInt(req.query.authorId as string) : undefined,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const result = await articleService.findAll(query);
      return paginatedResponse(
        res,
        result.items,
        result.total,
        result.page,
        result.pageSize,
        '获取文章列表成功'
      );
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '获取文章列表失败');
    }
  }

  /**
   * 获取文章详情
   */
  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const article = await articleService.findById(id);
      return successResponse(res, article, '获取文章详情成功');
    } catch (error: any) {
      const status = error.message === '文章不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '获取文章详情失败');
    }
  }

  /**
   * 根据 slug 获取文章
   */
  async findBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const article = await articleService.findBySlug(slug);
      return successResponse(res, article, '获取文章成功');
    } catch (error: any) {
      const status = error.message === '文章不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '获取文章失败');
    }
  }

  /**
   * 更新文章
   */
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const article = await articleService.update(id, req.body);
      return successResponse(res, article, '更新文章成功');
    } catch (error: any) {
      const status = error.message === '文章不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '更新文章失败');
    }
  }

  /**
   * 更新文章标签
   */
  async updateTags(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { tagIds } = req.body;
      const article = await articleService.updateTags(id, tagIds);
      return successResponse(res, article, '更新文章标签成功');
    } catch (error: any) {
      const status = error.message === '文章不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '更新文章标签失败');
    }
  }

  /**
   * 删除文章
   */
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await articleService.delete(id);
      return successResponse(res, null, '删除文章成功');
    } catch (error: any) {
      const status = error.message === '文章不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '删除文章失败');
    }
  }

  /**
   * 批量删除文章
   */
  async deleteMany(req: Request, res: Response) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return errorResponse(res, 400, '请提供要删除的文章ID数组');
      }

      await articleService.deleteMany(ids);
      return successResponse(res, null, '批量删除文章成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '批量删除文章失败');
    }
  }

  /**
   * 更新文章状态
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (typeof status !== 'number') {
        return errorResponse(res, 400, '状态值必须是数字');
      }

      await articleService.updateStatus(id, status);
      return successResponse(res, null, '更新文章状态成功');
    } catch (error: any) {
      const status = error.message === '文章不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '更新文章状态失败');
    }
  }

  /**
   * 批量更新文章状态
   */
  async updateStatusMany(req: Request, res: Response) {
    try {
      const { ids, status } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return errorResponse(res, 400, '请提供要更新的文章ID数组');
      }

      if (typeof status !== 'number') {
        return errorResponse(res, 400, '状态值必须是数字');
      }

      await articleService.updateStatusMany(ids, status, status === 1 ? new Date() : undefined);
      return successResponse(res, null, '批量更新文章状态成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '批量更新文章状态失败');
    }
  }

  /**
   * 切换推荐状态
   */
  async toggleFeatured(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { featured } = req.body;

      if (typeof featured !== 'boolean') {
        return errorResponse(res, 400, 'featured 值必须是布尔类型');
      }

      await articleService.toggleFeatured(id, featured);
      return successResponse(res, null, '切换推荐状态成功');
    } catch (error: any) {
      const status = error.message === '文章不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '切换推荐状态失败');
    }
  }

  /**
   * 增加浏览次数
   */
  async incrementViewCount(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await articleService.incrementViewCount(id);
      return successResponse(res, null, '增加浏览次数成功');
    } catch (error: any) {
      const status = error.message === '文章不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '增加浏览次数失败');
    }
  }

  /**
   * 获取推荐文章
   */
  async getFeatured(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const articles = await articleService.getFeatured(limit);
      return successResponse(res, articles, '获取推荐文章成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '获取推荐文章失败');
    }
  }

  /**
   * 获取热门文章
   */
  async getPopular(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const articles = await articleService.getPopular(limit);
      return successResponse(res, articles, '获取热门文章成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '获取热门文章失败');
    }
  }

  /**
   * 搜索文章
   */
  async search(req: Request, res: Response) {
    try {
      const { keyword } = req.query;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!keyword || typeof keyword !== 'string') {
        return errorResponse(res, 400, '请提供搜索关键词');
      }

      const articles = await articleService.search(keyword, limit);
      return successResponse(res, articles, '搜索文章成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '搜索文章失败');
    }
  }

  /**
   * 获取文章统计
   */
  async getStats(req: Request, res: Response) {
    try {
      const stats = await articleService.getStats();
      return successResponse(res, stats, '获取文章统计成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '获取文章统计失败');
    }
  }
}
