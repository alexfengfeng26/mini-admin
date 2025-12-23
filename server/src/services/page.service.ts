import { BaseCmsService } from './base-cms.service';
import {
  CreatePageDto,
  UpdatePageDto,
  PageQueryDto,
  PageListItem,
} from '@types/cms.types';
import { PaginatedResponse } from '@types/shared.types';
import { prisma } from '@/lib/prisma';

export class PageService extends BaseCmsService<any, CreatePageDto, UpdatePageDto, PageQueryDto> {
  protected model = prisma.page;
  protected entityName = '页面';
  protected contentType = 'page';

  /**
   * 创建页面
   */
  async create(data: CreatePageDto): Promise<any> {
    // 如果没有提供 slug，从标题生成
    if (!data.slug) {
      data.slug = await this.generateUniqueSlug(data.title);
    } else {
      // 验证 slug 唯一性
      const exists = await this.slugExists(data.slug);
      if (exists) {
        throw new Error('Slug 已存在，请使用其他值');
      }
    }

    return await this.transaction(async (tx) => {
      // 创建页面
      const page = await tx.page.create({
        data: {
          title: data.title,
          slug: data.slug,
          content: data.content,
          template: data.template,
          categoryId: data.categoryId,
          status: data.status ?? 0,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          seoKeywords: data.seoKeywords,
          metadata: data.metadata || {},
        },
      });

      // 关联标签
      if (data.tagNames && data.tagNames.length > 0) {
        await this.associateTagsInTransaction(
          tx,
          page.id,
          data.tagNames
        );
      }

      return page;
    }).then(page => this.findById(page.id));
  }

  /**
   * 分页查询页面列表
   */
  async findAll(query: PageQueryDto): Promise<PaginatedResponse<PageListItem>> {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      ...filters
    } = query;

    const skip = (page - 1) * pageSize;
    const orderBy = { [sortBy]: sortOrder };

    // 构建查询条件
    const where = this.buildWhereClause(filters);

    // 总是包含关联信息
    const include = {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    };

    // 查询页面
    const [pages, total] = await Promise.all([
      this.model.findMany({
        where,
        include,
        skip,
        take: pageSize,
        orderBy,
      }),
      this.model.count({ where }),
    ]);

    // 转换为列表格式
    const pageItems = pages.map((page: any) => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      template: page.template,
      category: page.category?.name,
      status: page.status,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      tags: page.tags.map((pt: any) => pt.tag.name).join(', '),
    }));

    return {
      items: pageItems,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 根据ID查询页面详情
   */
  async findById(id: number): Promise<any> {
    const page = await this.model.findUnique({
      where: { id },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!page) {
      throw new Error(`${this.getEntityName()}不存在`);
    }

    // 转换标签格式
    return {
      ...page,
      tagNames: page.tags.map((pt: any) => pt.tag.name),
    };
  }

  /**
   * 更新页面
   */
  async update(id: number, data: UpdatePageDto): Promise<any> {
    const page = await this.findById(id);

    // 如果更新 slug，需要检查唯一性
    if (data.slug && data.slug !== page.slug) {
      const exists = await this.slugExists(data.slug, id);
      if (exists) {
        throw new Error('Slug 已存在，请使用其他值');
      }
    }

    // 如果更新标题但没有提供新 slug，重新生成
    if (data.title && !data.slug) {
      data.slug = await this.generateUniqueSlug(data.title, id);
    }

    // 构建更新数据
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.template !== undefined) updateData.template = data.template;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;
    if (data.seoKeywords !== undefined) updateData.seoKeywords = data.seoKeywords;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    // 更新页面
    await this.model.update({
      where: { id },
      data: updateData,
    });

    // 更新标签关联
    if (data.tagNames !== undefined) {
      await this.associateTags(id, data.tagNames, 'PageTag', 'pageId');
    }

    return this.findById(id);
  }

  /**
   * 删除页面
   */
  async delete(id: number): Promise<void> {
    await this.findById(id);

    // 删除会级联删除标签关联（已在 schema 中配置）
    await this.model.delete({
      where: { id },
    });
  }

  /**
   * 在事务中关联标签
   */
  private async associateTagsInTransaction(
    tx: any,
    pageId: number,
    tagNames: string[]
  ): Promise<void> {
    if (!tagNames || tagNames.length === 0) {
      return;
    }

    // 创建或获取标签
    const tagPromises = tagNames.map(async (tagName) => {
      const tagSlug = this.toSlug(tagName);

      return await tx.tag.upsert({
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
        update: {},
      });
    });

    const tags = await Promise.all(tagPromises);

    // 创建标签关联
    await Promise.all(
      tags.map((tag: any) =>
        tx.pageTag.create({
          data: {
            pageId,
            tagId: tag.id,
          },
        })
      )
    );
  }

  /**
   * 构建查询条件
   */
  protected buildWhereClause(filters: any): any {
    const where = this.buildCmsWhereClause(filters);

    // 页面特定过滤
    if (filters.template) {
      where.template = filters.template;
    }

    return where;
  }
}
