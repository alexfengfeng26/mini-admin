import { BaseService } from './base.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryQueryDto,
  CategoryTreeNode,
} from '@types/cms.types';
import { PaginatedResponse } from '@types/shared.types';
import { prisma } from '@/lib/prisma';

export class CategoryService extends BaseService<any, CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto> {
  protected model = prisma.category;
  protected entityName = '分类';

  /**
   * 创建分类
   */
  async create(data: CreateCategoryDto): Promise<any> {
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
      throw new Error('该类型下此 slug 已存在');
    }

    // 验证父分类是否存在且类型一致
    if (data.parentId) {
      const parent = await this.model.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new Error('父分类不存在');
      }

      if (parent.type !== data.type) {
        throw new Error('父分类类型不一致');
      }
    }

    return this.model.create({
      data: {
        name: data.name,
        slug: data.slug,
        type: data.type,
        description: data.description,
        parentId: data.parentId,
        sort: data.sort ?? 0,
        status: data.status ?? 1,
      },
    });
  }

  /**
   * 分页查询分类列表
   */
  async findAll(query: CategoryQueryDto): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'sort',
      sortOrder = 'asc',
      ...filters
    } = query;

    const skip = (page - 1) * pageSize;
    const orderBy = { [sortBy]: sortOrder };

    // 构建查询条件
    const where = this.buildWhereClause(filters);

    // 总是包含父分类信息
    const include = {
      parent: true,
    };

    // 查询分类
    const [categories, total] = await Promise.all([
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
    const categoryItems = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      type: category.type,
      description: category.description,
      parentId: category.parentId,
      parentName: category.parent?.name,
      sort: category.sort,
      status: category.status,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));

    return {
      items: categoryItems,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 根据ID查询分类详情
   */
  async findById(id: number): Promise<any> {
    const category = await this.model.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!category) {
      throw new Error(`${this.getEntityName()}不存在`);
    }

    return category;
  }

  /**
   * 获取分类树
   */
  async findTree(type: string): Promise<CategoryTreeNode[]> {
    const categories = await this.model.findMany({
      where: {
        type,
        status: 1,
      },
      include: {
        children: true,
      },
      orderBy: {
        sort: 'asc',
      },
    });

    // 构建树形结构
    const buildTree = (parentId: number | null = null): CategoryTreeNode[] => {
      return categories
        .filter((cat: any) => cat.parentId === parentId)
        .map((cat: any) => ({
          ...cat,
          children: buildTree(cat.id),
        }));
    };

    return buildTree();
  }

  /**
   * 更新分类
   */
  async update(id: number, data: UpdateCategoryDto): Promise<any> {
    const category = await this.findById(id);

    // 如果更新 slug，需要检查唯一性
    if (data.slug) {
      const existing = await this.model.findFirst({
        where: {
          type: category.type,
          slug: data.slug,
          id: { not: id },
        },
      });

      if (existing) {
        throw new Error('该类型下此 slug 已存在');
      }
    }

    // 如果更新父分类，需要验证
    if (data.parentId !== undefined) {
      // 不能将自己设为父分类
      if (data.parentId === id) {
        throw new Error('不能将自己设为父分类');
      }

      // 不能将子分类设为父分类（避免循环）
      if (data.parentId !== null) {
        const isDescendant = await this.isDescendant(id, data.parentId);
        if (isDescendant) {
          throw new Error('不能将子分类设为父分类');
        }
      }

      if (data.parentId !== null) {
        const parent = await this.model.findUnique({
          where: { id: data.parentId },
        });

        if (!parent) {
          throw new Error('父分类不存在');
        }

        if (parent.type !== category.type) {
          throw new Error('父分类类型不一致');
        }
      }
    }

    // 构建更新数据
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.parentId !== undefined) updateData.parentId = data.parentId;
    if (data.sort !== undefined) updateData.sort = data.sort;
    if (data.status !== undefined) updateData.status = data.status;

    return this.model.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * 删除分类
   */
  async delete(id: number): Promise<void> {
    const category = await this.findById(id);

    // 检查是否有子分类
    const childCount = await this.model.count({
      where: { parentId: id },
    });

    if (childCount > 0) {
      throw new Error('该分类下有子分类，无法删除');
    }

    // TODO: 检查是否有关联的内容（文章、页面等）
    // 如果需要，可以添加关联检查

    await this.model.delete({
      where: { id },
    });
  }

  /**
   * 检查是否为后代分类
   */
  private async isDescendant(ancestorId: number, descendantId: number): Promise<boolean> {
    if (ancestorId === descendantId) return true;

    const descendant = await this.model.findUnique({
      where: { id: descendantId },
      select: { parentId: true },
    });

    if (!descendant || !descendant.parentId) return false;

    return this.isDescendant(ancestorId, descendant.parentId!);
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

    // 状态过滤
    if (filters.status !== undefined) {
      where.status = filters.status;
    }

    // 父分类过滤
    if (filters.parentId !== undefined) {
      where.parentId = filters.parentId;
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
          description: {
            contains: filters.keyword,
          },
        },
      ];
    }

    return where;
  }
}
