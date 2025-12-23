import { BaseService } from './base.service';
import { prisma } from '@/lib/prisma';
import { CmsQueryDto } from '@types/cms.types';

/**
 * CMS 服务基类
 * 扩展 BaseService，添加 CMS 特定功能：
 * - Slug 生成和唯一性检查
 * - 标签关联管理
 * - 关联数据加载（分类、标签等）
 */
export abstract class BaseCmsService<
  T,
  CreateDto,
  UpdateDto,
  QueryDto extends CmsQueryDto,
  Entity = any
> extends BaseService<T, CreateDto, UpdateDto, QueryDto, Entity> {
  /**
   * 内容类型（article, page, product, document）
   */
  protected abstract contentType: string;

  /**
   * 生成 URL 友好的 slug
   * @param text 原始文本
   * @returns slug 字符串
   */
  protected toSlug(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // 空格替换为连字符
      .replace(/[^\u4e00-\u9fa5a-z0-9-]/g, '') // 移除特殊字符（保留中文）
      .replace(/-+/g, '-') // 多个连字符替换为单个
      .replace(/^-+|-+$/g, ''); // 移除首尾连字符
  }

  /**
   * 生成唯一的 slug
   * @param title 标题
   * @param excludeId 排除的 ID（用于更新时检查）
   * @returns 唯一的 slug
   */
  protected async generateUniqueSlug(
    title: string,
    excludeId?: number
  ): Promise<string> {
    const baseSlug = this.toSlug(title);
    let slug = baseSlug;
    let counter = 1;

    while (await this.slugExists(slug, excludeId)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * 检查 slug 是否存在
   * @param slug slug 字符串
   * @param excludeId 排除的 ID
   * @returns 是否存在
   */
  protected async slugExists(slug: string, excludeId?: number): Promise<boolean> {
    const where: any = { slug };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.model.count({ where });
    return count > 0;
  }

  /**
   * 根据 slug 查找记录
   * @param slug slug 字符串
   * @returns 记录
   */
  async findBySlug(slug: string): Promise<T> {
    const item = await this.model.findUnique({ where: { slug } });
    if (!item) {
      throw new Error(`${this.getEntityName()}不存在`);
    }
    return item;
  }

  /**
   * 关联标签到内容
   * @param entityId 内容 ID
   * @param tagNames 标签名称数组
   * @param relationModel 关联模型名称
   * @param entityIdField 内容 ID 字段名
   */
  protected async associateTags(
    entityId: number,
    tagNames: string[] = [],
    relationModel: 'ArticleTag' | 'PageTag' | 'ProductTag' | 'DocumentTag',
    entityIdField: 'articleId' | 'pageId' | 'productId' | 'documentId'
  ): Promise<void> {
    if (!tagNames || tagNames.length === 0) {
      // 删除所有现有标签关联
      await (prisma[relationModel] as any).deleteMany({
        where: { [entityIdField]: entityId },
      });
      return;
    }

    await this.transaction(async (tx) => {
      // 1. 删除现有标签关联
      await (tx[relationModel] as any).deleteMany({
        where: { [entityIdField]: entityId },
      });

      // 2. 创建或获取标签
      const tagPromises = tagNames.map(async (tagName) => {
        const tagSlug = this.toSlug(tagName);

        // 查找或创建标签
        const tag = await (tx.tag as any).upsert({
          where: {
            type_slug: {
              type: this.contentType,
              slug: tagSlug,
            },
          },
          create: {
            name: tagName,
            slug: tagSlug,
            type: this.contentType,
          },
          update: {}, // 如果已存在则不更新
        });

        return tag;
      });

      const tags = await Promise.all(tagPromises);

      // 3. 创建新的标签关联
      const createPromises = tags.map((tag: any) =>
        (tx[relationModel] as any).create({
          data: {
            [entityIdField]: entityId,
            tagId: tag.id,
          },
        })
      );

      await Promise.all(createPromises);
    });
  }

  /**
   * 获取内容关联的标签
   * @param entityId 内容 ID
   * @param relationModel 关联模型名称
   * @param entityIdField 内容 ID 字段名
   * @returns 标签数组
   */
  protected async getAssociatedTags(
    entityId: number,
    relationModel: 'ArticleTag' | 'PageTag' | 'ProductTag' | 'DocumentTag',
    entityIdField: 'articleId' | 'pageId' | 'productId' | 'documentId'
  ): Promise<any[]> {
    const relations = await (prisma[relationModel] as any).findMany({
      where: { [entityIdField]: entityId },
      include: {
        tag: true,
      },
    });

    return relations.map((r: any) => r.tag);
  }

  /**
   * 增加浏览次数
   * @param id 内容 ID
   */
  async incrementViewCount(id: number): Promise<void> {
    await this.model.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * 切换推荐状态（用于文章）
   * @param id 内容 ID
   * @param featured 是否推荐
   */
  async toggleFeatured(id: number, featured: boolean): Promise<void> {
    await this.model.update({
      where: { id },
      data: { featured },
    });
  }

  /**
   * 批量更新发布状态
   * @param ids 内容 ID 数组
   * @param status 状态
   * @param publishedAt 发布时间（如果状态为已发布）
   */
  async updatePublishStatus(
    ids: number[],
    status: number,
    publishedAt?: Date
  ): Promise<void> {
    const data: any = { status };

    if (status === 1 && publishedAt) {
      data.publishedAt = publishedAt;
    }

    await this.model.updateMany({
      where: {
        id: { in: ids },
      },
      data,
    });
  }

  /**
   * 获取推荐内容
   * @param limit 数量限制
   * @returns 推荐内容列表
   */
  async getFeatured(limit: number = 10): Promise<T[]> {
    return this.model.findMany({
      where: {
        featured: true,
        status: 1,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 获取热门内容（按浏览量排序）
   * @param limit 数量限制
   * @returns 热门内容列表
   */
  async getPopular(limit: number = 10): Promise<T[]> {
    return this.model.findMany({
      where: {
        status: 1,
      },
      take: limit,
      orderBy: {
        viewCount: 'desc',
      },
    });
  }

  /**
   * 搜索内容
   * @param keyword 关键词
   * @param limit 数量限制
   * @returns 搜索结果
   */
  async search(keyword: string, limit: number = 20): Promise<T[]> {
    return this.model.findMany({
      where: {
        status: 1,
        OR: [
          {
            title: {
              contains: keyword,
            },
          },
          {
            content: {
              contains: keyword,
            },
          },
          {
            seoKeywords: {
              contains: keyword,
            },
          },
        ],
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 构建带分类和标签的查询条件
   * @param filters 查询过滤器
   * @returns Prisma where 条件
   */
  protected buildCmsWhereClause(filters: any): any {
    const where: any = {};

    // 状态过滤
    if (filters.status !== undefined) {
      where.status = filters.status;
    }

    // 分类过滤
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    // 标签过滤（需要通过关联表）
    if (filters.tagId) {
      where.tags = {
        some: {
          tagId: filters.tagId,
        },
      };
    }

    // 关键词搜索
    if (filters.keyword) {
      where.OR = [
        {
          title: {
            contains: filters.keyword,
          },
        },
        {
          content: {
            contains: filters.keyword,
          },
        },
        {
          seoKeywords: {
            contains: filters.keyword,
          },
        },
      ];
    }

    return where;
  }

  /**
   * 获取统计信息
   * @returns 统计数据
   */
  async getStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    archived: number;
  }> {
    const [total, published, draft, archived] = await Promise.all([
      this.model.count(),
      this.model.count({ where: { status: 1 } }),
      this.model.count({ where: { status: 0 } }),
      this.model.count({ where: { status: 2 } }),
    ]);

    return {
      total,
      published,
      draft,
      archived,
    };
  }
}
