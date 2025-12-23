import { Request, Response } from 'express';
import { DocumentService } from '../services/document.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

const documentService = new DocumentService();

export class DocumentController {
  /**
   * 创建文档
   */
  async create(req: Request, res: Response) {
    try {
      const document = await documentService.create(req.body);
      return successResponse(res, document, '创建文档成功');
    } catch (error: any) {
      return errorResponse(res, 400, error.message || '创建文档失败');
    }
  }

  /**
   * 获取文档列表
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
        version: req.query.version as string,
      };

      const result = await documentService.findAll(query);
      return paginatedResponse(
        res,
        result.items,
        result.total,
        result.page,
        result.pageSize,
        '获取文档列表成功'
      );
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '获取文档列表失败');
    }
  }

  /**
   * 获取文档详情
   */
  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const document = await documentService.findById(id);
      return successResponse(res, document, '获取文档详情成功');
    } catch (error: any) {
      const status = error.message === '文档不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '获取文档详情失败');
    }
  }

  /**
   * 根据 slug 获取文档
   */
  async findBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const document = await documentService.findBySlug(slug);
      return successResponse(res, document, '获取文档成功');
    } catch (error: any) {
      const status = error.message === '文档不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '获取文档失败');
    }
  }

  /**
   * 更新文档
   */
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const document = await documentService.update(id, req.body);
      return successResponse(res, document, '更新文档成功');
    } catch (error: any) {
      const status = error.message === '文档不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '更新文档失败');
    }
  }

  /**
   * 删除文档
   */
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await documentService.delete(id);
      return successResponse(res, null, '删除文档成功');
    } catch (error: any) {
      const status = error.message === '文档不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '删除文档失败');
    }
  }

  /**
   * 批量删除文档
   */
  async deleteMany(req: Request, res: Response) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return errorResponse(res, 400, '请提供要删除的文档ID数组');
      }

      await documentService.deleteMany(ids);
      return successResponse(res, null, '批量删除文档成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '批量删除文档失败');
    }
  }

  /**
   * 更新文档状态
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (typeof status !== 'number') {
        return errorResponse(res, 400, '状态值必须是数字');
      }

      await documentService.updateStatus(id, status);
      return successResponse(res, null, '更新文档状态成功');
    } catch (error: any) {
      const status = error.message === '文档不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '更新文档状态失败');
    }
  }

  /**
   * 批量更新文档状态
   */
  async updateStatusMany(req: Request, res: Response) {
    try {
      const { ids, status } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return errorResponse(res, 400, '请提供要更新的文档ID数组');
      }

      if (typeof status !== 'number') {
        return errorResponse(res, 400, '状态值必须是数字');
      }

      await documentService.updateStatusMany(ids, status);
      return successResponse(res, null, '批量更新文档状态成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '批量更新文档状态失败');
    }
  }

  /**
   * 增加浏览次数
   */
  async incrementViewCount(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await documentService.incrementViewCount(id);
      return successResponse(res, null, '增加浏览次数成功');
    } catch (error: any) {
      const status = error.message === '文档不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '增加浏览次数失败');
    }
  }

  /**
   * 增加下载次数
   */
  async incrementDownloadCount(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await documentService.incrementDownloadCount(id);
      return successResponse(res, null, '增加下载次数成功');
    } catch (error: any) {
      const status = error.message === '文档不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '增加下载次数失败');
    }
  }

  /**
   * 搜索文档
   */
  async search(req: Request, res: Response) {
    try {
      const { keyword } = req.query;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!keyword || typeof keyword !== 'string') {
        return errorResponse(res, 400, '请提供搜索关键词');
      }

      const documents = await documentService.search(keyword, limit);
      return successResponse(res, documents, '搜索文档成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '搜索文档失败');
    }
  }

  /**
   * 获取文档统计
   */
  async getStats(req: Request, res: Response) {
    try {
      const stats = await documentService.getStats();
      return successResponse(res, stats, '获取文档统计成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '获取文档统计失败');
    }
  }
}
