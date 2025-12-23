import { Request, Response } from 'express';
import { TagService } from '../services/tag.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

const tagService = new TagService();

export class TagController {
  /**
   * 创建标签
   */
  async create(req: Request, res: Response) {
    try {
      const tag = await tagService.create(req.body);
      return successResponse(res, tag, '创建标签成功');
    } catch (error: any) {
      return errorResponse(res, 400, error.message || '创建标签失败');
    }
  }

  /**
   * 获取标签列表
   */
  async findAll(req: Request, res: Response) {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        sortBy: (req.query.sortBy as string) || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        type: req.query.type as string,
        keyword: req.query.keyword as string,
      };

      if (!query.type) {
        return errorResponse(res, 400, '标签类型不能为空');
      }

      const result = await tagService.findAll(query);
      return paginatedResponse(
        res,
        result.items,
        result.total,
        result.page,
        result.pageSize,
        '获取标签列表成功'
      );
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '获取标签列表失败');
    }
  }

  /**
   * 批量创建或获取标签
   */
  async findOrCreate(req: Request, res: Response) {
    try {
      const { tagNames, type } = req.body;

      if (!Array.isArray(tagNames) || tagNames.length === 0) {
        return errorResponse(res, 400, '请提供标签名称数组');
      }

      if (!type || typeof type !== 'string') {
        return errorResponse(res, 400, '标签类型不能为空');
      }

      const tags = await tagService.findOrCreate(tagNames, type);
      return successResponse(res, tags, '操作成功');
    } catch (error: any) {
      return errorResponse(res, 500, error.message || '操作失败');
    }
  }

  /**
   * 获取标签详情
   */
  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const tag = await tagService.findById(id);
      return successResponse(res, tag, '获取标签详情成功');
    } catch (error: any) {
      const status = error.message === '标签不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '获取标签详情失败');
    }
  }

  /**
   * 更新标签
   */
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const tag = await tagService.update(id, req.body);
      return successResponse(res, tag, '更新标签成功');
    } catch (error: any) {
      const status = error.message === '标签不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '更新标签失败');
    }
  }

  /**
   * 删除标签
   */
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await tagService.delete(id);
      return successResponse(res, null, '删除标签成功');
    } catch (error: any) {
      const status = error.message === '标签不存在' ? 404 : 500;
      return errorResponse(res, status, error.message || '删除标签失败');
    }
  }
}
