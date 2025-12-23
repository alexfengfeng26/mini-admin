import { BaseCmsService } from './base-cms.service';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  DocumentQueryDto,
  DocumentListItem,
} from '@types/cms.types';
import { PaginatedResponse } from '@types/shared.types';
import { prisma } from '@/lib/prisma';

export class DocumentService extends BaseCmsService<any, CreateDocumentDto, UpdateDocumentDto, DocumentQueryDto> {
  protected model = prisma.document;
  protected entityName = '文档';
  protected contentType = 'document';

  /**
   * 创建文档
   */
  async create(data: CreateDocumentDto): Promise<any> {
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
      // 创建文档
      const document = await tx.document.create({
        data: {
          title: data.title,
          slug: data.slug,
          content: data.content,
          version: data.version,
          categoryId: data.categoryId,
          fileUrl: data.fileUrl,
          fileSize: data.fileSize,
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
          document.id,
          data.tagNames
        );
      }

      return document;
    }).then(document => this.findById(document.id));
  }

  /**
   * 分页查询文档列表
   */
  async findAll(query: DocumentQueryDto): Promise<PaginatedResponse<DocumentListItem>> {
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

    // 查询文档
    const [documents, total] = await Promise.all([
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
    const documentItems = documents.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      version: doc.version,
      category: doc.category?.name,
      fileUrl: doc.fileUrl,
      fileSize: doc.fileSize,
      downloadCount: doc.downloadCount,
      viewCount: doc.viewCount,
      status: doc.status,
      createdAt: doc.createdAt,
      tags: doc.tags.map((dt: any) => dt.tag.name).join(', '),
    }));

    return {
      items: documentItems,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 根据ID查询文档详情
   */
  async findById(id: number): Promise<any> {
    const document = await this.model.findUnique({
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

    if (!document) {
      throw new Error(`${this.getEntityName()}不存在`);
    }

    // 转换标签格式
    return {
      ...document,
      tagNames: document.tags.map((dt: any) => dt.tag.name),
    };
  }

  /**
   * 更新文档
   */
  async update(id: number, data: UpdateDocumentDto): Promise<any> {
    const document = await this.findById(id);

    // 如果更新 slug，需要检查唯一性
    if (data.slug && data.slug !== document.slug) {
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
    if (data.version !== undefined) updateData.version = data.version;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.fileUrl !== undefined) updateData.fileUrl = data.fileUrl;
    if (data.fileSize !== undefined) updateData.fileSize = data.fileSize;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;
    if (data.seoKeywords !== undefined) updateData.seoKeywords = data.seoKeywords;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    // 更新文档
    await this.model.update({
      where: { id },
      data: updateData,
    });

    // 更新标签关联
    if (data.tagNames !== undefined) {
      await this.associateTags(id, data.tagNames, 'DocumentTag', 'documentId');
    }

    return this.findById(id);
  }

  /**
   * 删除文档
   */
  async delete(id: number): Promise<void> {
    await this.findById(id);

    // 删除会级联删除标签关联（已在 schema 中配置）
    await this.model.delete({
      where: { id },
    });
  }

  /**
   * 增加下载次数
   */
  async incrementDownloadCount(id: number): Promise<void> {
    await this.model.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * 在事务中关联标签
   */
  private async associateTagsInTransaction(
    tx: any,
    documentId: number,
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
        tx.documentTag.create({
          data: {
            documentId,
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

    // 文档特定过滤
    if (filters.version) {
      where.version = filters.version;
    }

    return where;
  }
}
