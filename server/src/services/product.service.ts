import { BaseCmsService } from './base-cms.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  ProductListItem,
} from '@types/cms.types';
import { PaginatedResponse } from '@types/shared.types';
import { prisma } from '@/lib/prisma';

export class ProductService extends BaseCmsService<any, CreateProductDto, UpdateProductDto, ProductQueryDto> {
  protected model = prisma.product;
  protected entityName = '产品';
  protected contentType = 'product';

  /**
   * 创建产品
   */
  async create(data: CreateProductDto): Promise<any> {
    // 验证产品编码唯一性
    const existing = await this.model.findFirst({
      where: { code: data.code }
    });
    if (existing) {
      throw new Error('产品编码已存在');
    }

    // 如果没有提供 slug，从名称生成
    if (!data.slug) {
      data.slug = await this.generateUniqueSlug(data.name);
    } else {
      // 验证 slug 唯一性
      const exists = await this.slugExists(data.slug);
      if (exists) {
        throw new Error('Slug 已存在，请使用其他值');
      }
    }

    return await this.transaction(async (tx) => {
      // 创建产品
      const product = await tx.product.create({
        data: {
          name: data.name,
          code: data.code,
          slug: data.slug,
          description: data.description,
          price: data.price,
          stock: data.stock ?? 0,
          categoryId: data.categoryId,
          images: data.images ? JSON.stringify(data.images) : null,
          status: data.status ?? 1,
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
          product.id,
          data.tagNames
        );
      }

      return product;
    }).then(product => this.findById(product.id));
  }

  /**
   * 分页查询产品列表
   */
  async findAll(query: ProductQueryDto): Promise<PaginatedResponse<ProductListItem>> {
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

    // 查询产品
    const [products, total] = await Promise.all([
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
    const productItems = products.map((product: any) => ({
      id: product.id,
      name: product.name,
      code: product.code,
      slug: product.slug,
      price: product.price ? Number(product.price) : null,
      stock: product.stock,
      category: product.category?.name,
      status: product.status,
      viewCount: product.viewCount,
      salesCount: product.salesCount,
      createdAt: product.createdAt,
      tags: product.tags.map((pt: any) => pt.tag.name).join(', '),
    }));

    return {
      items: productItems,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 根据ID查询产品详情
   */
  async findById(id: number): Promise<any> {
    const product = await this.model.findUnique({
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

    if (!product) {
      throw new Error(`${this.getEntityName()}不存在`);
    }

    // 转换标签和图片格式
    return {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      tagNames: product.tags.map((pt: any) => pt.tag.name),
    };
  }

  /**
   * 更新产品
   */
  async update(id: number, data: UpdateProductDto): Promise<any> {
    const product = await this.findById(id);

    // 如果更新产品编码，需要检查唯一性
    if (data.code && data.code !== product.code) {
      const existing = await this.model.findFirst({
        where: {
          code: data.code,
          id: { not: id }
        }
      });
      if (existing) {
        throw new Error('产品编码已存在');
      }
    }

    // 如果更新 slug，需要检查唯一性
    if (data.slug && data.slug !== product.slug) {
      const exists = await this.slugExists(data.slug, id);
      if (exists) {
        throw new Error('Slug 已存在，请使用其他值');
      }
    }

    // 如果更新名称但没有提供新 slug，重新生成
    if (data.name && !data.slug) {
      data.slug = await this.generateUniqueSlug(data.name, id);
    }

    // 构建更新数据
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.images !== undefined) updateData.images = data.images ? JSON.stringify(data.images) : null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;
    if (data.seoKeywords !== undefined) updateData.seoKeywords = data.seoKeywords;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    // 更新产品
    await this.model.update({
      where: { id },
      data: updateData,
    });

    // 更新标签关联
    if (data.tagNames !== undefined) {
      await this.associateTags(id, data.tagNames, 'ProductTag', 'productId');
    }

    return this.findById(id);
  }

  /**
   * 删除产品
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
    productId: number,
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
        tx.productTag.create({
          data: {
            productId,
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

    // 产品特定过滤
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters.inStock !== undefined) {
      if (filters.inStock) {
        where.stock = { gt: 0 };
      } else {
        where.stock = { equals: 0 };
      }
    }

    return where;
  }
}
