import { BaseService } from './base.service';
import {
  CreateTagDto,
  UpdateTagDto,
  TagQueryDto,
} from '@types/cms.types';
import { PaginatedResponse } from '@types/shared.types';
import { prisma } from '@/lib/prisma';

export class TagService extends BaseService<any, CreateTagDto, UpdateTagDto, TagQueryDto> {
  protected model = prisma.tag;
  protected entityName = '标签';

  /**
   * 创建标签
   */
  async create(data: CreateTagDto): Promise<any> {
    // 生成 slug
    if (!data.slug) {
      data.slug = this.toSlug(data.name);
    }

    // 验证同类型下 slug 唯一性
    const existing = await this.model.findFirst({
      where: {
        type: data.type,
        slug: data.slug,
      },
    });

    if (existing) {
      throw new Error('该类型下此标签已存在');
    }

    return this.model.create({
      data: {
        name: data.name,
        slug: data.slug,
        type: data.type,
      },
    });
  }

  /**
   * 分页查询标签列表
   */
  async findAll(query: TagQueryDto): Promise<PaginatedResponse<any>> {
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

    // 查询标签
    const [tags, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
      }),
      this.model.count({ where }),
    ]);

    // 转换为列表格式
    const tagItems = tags.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      type: tag.type,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    }));

    return {
      items: tagItems,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 根据ID查询标签详情
   */
  async findById(id: number): Promise<any> {
    const tag = await this.model.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new Error(`${this.getEntityName()}不存在`);
    }

    return tag;
  }

  /**
   * 更新标签
   */
  async update(id: number, data: UpdateTagDto): Promise<any> {
    const tag = await this.findById(id);

    // 如果更新 slug，需要检查唯一性
    if (data.slug) {
      const existing = await this.model.findFirst({
        where: {
          type: tag.type,
          slug: data.slug,
          id: { not: id },
        },
      });

      if (existing) {
        throw new Error('该类型下此标签已存在');
      }
    }

    // 构建更新数据
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.type !== undefined) updateData.type = data.type;

    return this.model.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * 删除标签
   */
  async delete(id: number): Promise<void> {
    const tag = await this.findById(id);

    // TODO: 检查是否有关联的内容
    // 如果需要，可以添加关联检查

    await this.model.delete({
      where: { id },
    });
  }

  /**
   * 批量创建或获取标签（用于内容创建时）
   */
  async findOrCreate(tagNames: string[], type: string): Promise<any[]> {
    const results = await Promise.all(
      tagNames.map(async (tagName) => {
        const slug = this.toSlug(tagName);

        return await this.model.upsert({
          where: {
            type_slug: {
              type,
              slug,
            },
          },
          create: {
            name: tagName,
            slug,
            type,
          },
          update: {},
        });
      })
    );

    return results;
  }

  /**
   * 生成 slug
   */
  protected toSlug(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\u4e00-\u9fa5a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * 构建查询条件
   */
  protected buildWhereClause(filters: any): any {
    const where: any = {};

    // 类型过滤（必填）
    if (filters.type) {
      where.type = filters.type;
    }

    // 关键词搜索
    if (filters.keyword) {
      where.OR = [
        {
          name: {
            contains: filters.keyword,
          },
        },
        {
          slug: {
            contains: filters.keyword,
          },
        },
      ];
    }

    return where;
  }
}
