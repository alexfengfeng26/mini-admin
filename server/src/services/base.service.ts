import { prisma } from '@/lib/prisma';
import { PaginatedResponse } from '@types/shared.types';

export abstract class BaseService<
  T,
  CreateDto,
  UpdateDto,
  QueryDto,
  Entity = any
> {
  protected abstract model: any;
  protected abstract entityName: string;

  /**
   * 创建记录
   */
  async create(data: CreateDto): Promise<T> {
    return this.model.create({ data });
  }

  /**
   * 分页查询记录
   */
  async findAll(query: QueryDto): Promise<PaginatedResponse<T>> {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'id',
      sortOrder = 'desc',
      ...filters
    } = query;

    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where = this.buildWhereClause(filters);

    // 构建排序条件
    const orderBy = this.buildOrderByClause(sortBy, sortOrder);

    const [items, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
      }),
      this.model.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 根据ID查询记录
   */
  async findById(id: number): Promise<T> {
    const item = await this.model.findUnique({ where: { id } });
    if (!item) {
      throw new Error(`${this.getEntityName()}不存在`);
    }
    return item;
  }

  /**
   * 更新记录
   */
  async update(id: number, data: UpdateDto): Promise<T> {
    // 先验证记录是否存在
    await this.findById(id);

    return this.model.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除记录
   */
  async delete(id: number): Promise<void> {
    // 先验证记录是否存在
    await this.findById(id);

    await this.model.delete({
      where: { id },
    });
  }

  /**
   * 批量删除记录
   */
  async deleteMany(ids: number[]): Promise<void> {
    // 验证所有记录是否存在
    await Promise.all(ids.map(id => this.findById(id)));

    await this.model.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }

  /**
   * 更新状态
   */
  async updateStatus(id: number, status: number): Promise<void> {
    await this.update(id, { status } as any);
  }

  /**
   * 批量更新状态
   */
  async updateStatusMany(ids: number[], status: number): Promise<void> {
    await this.model.updateMany({
      where: {
        id: { in: ids },
      },
      data: { status } as any,
    });
  }

  /**
   * 检查记录是否存在
   */
  async exists(id: number): Promise<boolean> {
    const count = await this.model.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * 根据条件查询第一条记录
   */
  async findOne(where: any): Promise<T | null> {
    return this.model.findFirst({ where });
  }

  /**
   * 根据条件查询记录数量
   */
  async count(where?: any): Promise<number> {
    return this.model.count({ where });
  }

  /**
   * 构建查询条件子类实现
   */
  protected abstract buildWhereClause(filters: any): any;

  /**
   * 构建排序条件
   */
  protected buildOrderByClause(sortBy: string, sortOrder: 'asc' | 'desc'): any {
    return { [sortBy]: sortOrder };
  }

  /**
   * 获取实体名称
   */
  protected getEntityName(): string {
    return this.entityName;
  }

  /**
   * 事务执行
   */
  async transaction<R>(fn: (tx: any) => Promise<R>): Promise<R> {
    return await prisma.$transaction(fn);
  }
}