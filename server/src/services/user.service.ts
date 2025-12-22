import { BaseService } from './base.service';
import { hashPassword } from '../utils/password';
import { CreateUserDto, UpdateUserDto, UserQueryDto, UserListItem } from '@types/user.types';
import { PaginatedResponse } from '@types/shared.types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserService extends BaseService<any, CreateUserDto, UpdateUserDto, UserQueryDto> {
  protected model = prisma.user;
  protected entityName = '用户';

  async create(data: CreateUserDto): Promise<any> {
    // 检查用户名是否已存在
    await this.validateUniqueConstraints(data, null);

    // 加密密码
    const hashedPassword = await hashPassword(data.password);

    // 创建用户（不包含密码）
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        nickname: data.nickname,
        avatar: data.avatar,
        phone: data.phone,
        status: data.status ?? 1,
      },
    });

    // 分配角色
    if (data.roleIds && data.roleIds.length > 0) {
      await this.assignRoles(user.id, data.roleIds);
    }

    return this.findById(user.id);
  }

  async findAll(query: UserQueryDto): Promise<PaginatedResponse<UserListItem>> {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'id',
      sortOrder = 'desc',
      username,
      email,
      status,
      roleId,
    } = query;

    const skip = (page - 1) * pageSize;
    const orderBy = { [sortBy]: sortOrder };

    // 构建查询条件
    const where: any = {};

    if (username) {
      where.username = { contains: username };
    }

    if (email) {
      where.email = { contains: email };
    }

    if (status !== undefined) {
      where.status = status;
    }

    // 如果按角色过滤，需要关联查询
    const include: any = {
      userRoles: {
        include: {
          role: true,
        },
      },
    };

    // 查询用户
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include,
        skip,
        take: pageSize,
        orderBy,
      }),
      prisma.user.count({ where }),
    ]);

    // 转换为列表格式
    const userItems = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.userRoles.map((ur: any) => ur.role.name).join(', '),
    }));

    return {
      items: userItems,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: number): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error(`${this.getEntityName()}不存在`);
    }

    return user;
  }

  async update(id: number, data: UpdateUserDto): Promise<any> {
    const user = await this.findById(id);

    // 如果更新用户名或邮箱，需要检查唯一性
    if (data.username && data.username !== user.username) {
      await this.validateUniqueConstraints(data, id);
    }

    if (data.email && data.email !== user.email) {
      await this.validateUniqueConstraints(data, id);
    }

    // 构建更新数据
    const updateData: any = {
      nickname: data.nickname,
      avatar: data.avatar,
      phone: data.phone,
      status: data.status,
    };

    // 如果更新密码，需要加密
    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    // 更新角色分配
    if (data.roleIds !== undefined) {
      // 先删除现有角色关联
      await prisma.userRole.deleteMany({
        where: { userId: id },
      });

      // 重新分配角色
      if (data.roleIds.length > 0) {
        await this.assignRoles(id, data.roleIds);
      }
    }

    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const user = await this.findById(id);

    // 删除用户角色关联
    await prisma.userRole.deleteMany({
      where: { userId: id },
    });

    // 删除用户
    await prisma.user.delete({
      where: { id },
    });
  }

  async updateStatus(id: number, status: number): Promise<void> {
    await this.update(id, { status });
  }

  /**
   * 分配角色给用户
   */
  async assignRoles(userId: number, roleIds: number[]): Promise<void> {
    // 创建用户角色关联
    await Promise.all(
      roleIds.map((roleId) =>
        prisma.userRole.create({
          data: {
            userId,
            roleId,
          },
        })
      )
    );
  }

  /**
   * 验证唯一性约束
   */
  private async validateUniqueConstraints(data: CreateUserDto, excludeId?: number): Promise<void> {
    // 检查用户名
    if (data.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: data.username,
          ...(excludeId && { id: { not: excludeId } }),
        },
      });

      if (existingUser) {
        throw new Error('用户名已存在');
      }
    }

    // 检查邮箱
    if (data.email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email: data.email,
          ...(excludeId && { id: { not: excludeId } }),
        },
      });

      if (existingEmail) {
        throw new Error('邮箱已存在');
      }
    }
  }

  protected buildWhereClause(filters: any): any {
    const where: any = {};

    if (filters.username) {
      where.username = { contains: filters.username };
    }

    if (filters.email) {
      where.email = { contains: filters.email };
    }

    if (filters.status !== undefined) {
      where.status = filters.status;
    }

    return where;
  }
}