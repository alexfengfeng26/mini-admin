import { BaseCmsService } from './base-cms.service';
import {
  CreateArticleDto,
  UpdateArticleDto,
  ArticleQueryDto,
  ArticleListItem,
} from '@types/cms.types';
import { PaginatedResponse } from '@types/shared.types';
import { prisma } from '@/lib/prisma';

export class ArticleService extends BaseCmsService<
  any,
  CreateArticleDto,
  UpdateArticleDto,
  ArticleQueryDto
> {
  protected model = prisma.article;
  protected entityName = '文章';
  protected contentType = 'article';

  /**
   * 创建文章
   */
  async create(data: CreateArticleDto): Promise<any> {
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
      // 创建文章
      const article = await tx.article.create({
        data: {
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          coverImage: data.coverImage,
          categoryId: data.categoryId,
          status: data.status ?? 0,
          featured: data.featured ?? false,
          authorId: 1, // TODO: 从认证上下文获取当前用户ID
          publishedAt: data.status === 1 ? (data.publishedAt || new Date()) : null,
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
          article.id,
          data.tagNames
        );
      }

      return article;
    }).then(article => this.findById(article.id));
  }

  /**
   * 分页查询文章列表
   */
  async findAll(query: ArticleQueryDto): Promise<PaginatedResponse<ArticleListItem>> {
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
      author: {
        select: {
          id: true,
          username: true,
          nickname: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    };

    // 查询文章
    const [articles, total] = await Promise.all([
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
    const articleItems = articles.map((article: any) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      coverImage: article.coverImage,
      category: article.category?.name,
      status: article.status,
      featured: article.featured,
      viewCount: article.viewCount,
      likeCount: article.likeCount,
      commentCount: article.commentCount,
      author: article.author?.nickname || article.author?.username,
      publishedAt: article.publishedAt,
      createdAt: article.createdAt,
      tags: article.tags.map((at: any) => at.tag.name).join(', '),
    }));

    return {
      items: articleItems,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 根据ID查询文章详情
   */
  async findById(id: number): Promise<any> {
    const article = await this.model.findUnique({
      where: { id },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatar: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!article) {
      throw new Error(`${this.getEntityName()}不存在`);
    }

    // 转换标签格式
    return {
      ...article,
      tagNames: article.tags.map((at: any) => at.tag.name),
    };
  }

  /**
   * 更新文章
   */
  async update(id: number, data: UpdateArticleDto): Promise<any> {
    const article = await this.findById(id);

    // 如果更新 slug，需要检查唯一性
    if (data.slug && data.slug !== article.slug) {
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
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.status !== undefined) {
      updateData.status = data.status;
      // 如果状态改为已发布，设置发布时间
      if (data.status === 1 && !article.publishedAt) {
        updateData.publishedAt = data.publishedAt || new Date();
      }
    }
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;
    if (data.seoKeywords !== undefined) updateData.seoKeywords = data.seoKeywords;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    // 更新文章
    await this.model.update({
      where: { id },
      data: updateData,
    });

    // 更新标签关联
    if (data.tagNames !== undefined) {
      await this.associateTags(id, data.tagNames, 'ArticleTag', 'articleId');
    }

    return this.findById(id);
  }

  /**
   * 更新文章标签关联
   */
  async updateTags(id: number, tagIds: number[]): Promise<any> {
    await this.findById(id);

    // 删除旧的标签关联
    await prisma.articleTag.deleteMany({
      where: { articleId: id }
    });

    // 添加新的标签关联
    if (tagIds.length > 0) {
      await prisma.articleTag.createMany({
        data: tagIds.map(tagId => ({
          articleId: id,
          tagId: tagId
        })),
        skipDuplicates: true
      });
    }

    return this.findById(id);
  }

  /**
   * 删除文章
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
    articleId: number,
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
        tx.articleTag.create({
          data: {
            articleId,
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

    // 文章特定过滤
    if (filters.featured !== undefined) {
      where.featured = filters.featured;
    }

    if (filters.authorId) {
      where.authorId = filters.authorId;
    }

    if (filters.startDate || filters.endDate) {
      where.publishedAt = {};
      if (filters.startDate) {
        where.publishedAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.publishedAt.lte = new Date(filters.endDate);
      }
    }

    return where;
  }
}
