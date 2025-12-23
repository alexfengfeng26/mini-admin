import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

const productService = new ProductService();

export class ProductController {
  /**
   * 创建产品
   */
  async create(req: Request, res: Response) {
    try {
      const product = await productService.create(req.body);
      return successResponse(res, product, '创建产品成功');
    } catch (error: any) {
      return errorResponse(res, 400, error.message || '创建产品失败');
    }
  }

  /**
   * 获取产品列表
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
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        inStock: req.query.inStock ? req.query.inStock === 'true' : undefined,
      };

      const result = await productService.findAll(query);
      return paginatedResponse(
        res,
        result.items,
        result.total,
        result.page,
        result.pageSize,
        '获取产品列表成功'
      );
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '获取产品列表失败');
    }
  }

  /**
   * 获取产品详情
   */
  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const product = await productService.findById(id);
      return successResponse(res, product, '获取产品详情成功');
    } catch (error: any) {
      const status = error.message === '产品不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '获取产品详情失败');
    }
  }

  /**
   * 根据 slug 获取产品
   */
  async findBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const product = await productService.findBySlug(slug);
      return successResponse(res, product, '获取产品成功');
    } catch (error: any) {
      const status = error.message === '产品不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '获取产品失败');
    }
  }

  /**
   * 更新产品
   */
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const product = await productService.update(id, req.body);
      return successResponse(res, product, '更新产品成功');
    } catch (error: any) {
      const status = error.message === '产品不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '更新产品失败');
    }
  }

  /**
   * 删除产品
   */
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await productService.delete(id);
      return successResponse(res, null, '删除产品成功');
    } catch (error: any) {
      const status = error.message === '产品不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '删除产品失败');
    }
  }

  /**
   * 批量删除产品
   */
  async deleteMany(req: Request, res: Response) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return errorResponse(res, 400, '请提供要删除的产品ID数组');
      }

      await productService.deleteMany(ids);
      return successResponse(res, null, '批量删除产品成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '批量删除产品失败');
    }
  }

  /**
   * 更新产品状态
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (typeof status !== 'number') {
        return errorResponse(res, 400, '状态值必须是数字');
      }

      await productService.updateStatus(id, status);
      return successResponse(res, null, '更新产品状态成功');
    } catch (error: any) {
      const status = error.message === '产品不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '更新产品状态失败');
    }
  }

  /**
   * 批量更新产品状态
   */
  async updateStatusMany(req: Request, res: Response) {
    try {
      const { ids, status } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return errorResponse(res, 400, '请提供要更新的产品ID数组');
      }

      if (typeof status !== 'number') {
        return errorResponse(res, 400, '状态值必须是数字');
      }

      await productService.updateStatusMany(ids, status);
      return successResponse(res, null, '批量更新产品状态成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '批量更新产品状态失败');
    }
  }

  /**
   * 增加浏览次数
   */
  async incrementViewCount(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await productService.incrementViewCount(id);
      return successResponse(res, null, '增加浏览次数成功');
    } catch (error: any) {
      const status = error.message === '产品不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '增加浏览次数失败');
    }
  }

  /**
   * 获取热门产品
   */
  async getPopular(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const products = await productService.getPopular(limit);
      return successResponse(res, products, '获取热门产品成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '获取热门产品失败');
    }
  }

  /**
   * 搜索产品
   */
  async search(req: Request, res: Response) {
    try {
      const { keyword } = req.query;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!keyword || typeof keyword !== 'string') {
        return errorResponse(res, 400, '请提供搜索关键词');
      }

      const products = await productService.search(keyword, limit);
      return successResponse(res, products, '搜索产品成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '搜索产品失败');
    }
  }

  /**
   * 获取产品统计
   */
  async getStats(req: Request, res: Response) {
    try {
      const stats = await productService.getStats();
      return successResponse(res, stats, '获取产品统计成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '获取产品统计失败');
    }
  }
}
