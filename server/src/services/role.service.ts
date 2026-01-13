import { BaseService } from './base.service';
import { CreateRoleDto, UpdateRoleDto, RoleQueryDto } from '@types/role.types';
import { PaginatedResponse } from '@types/shared.types';
import { prisma } from '@/lib/prisma';

export class RoleService extends BaseService<any, CreateRoleDto, UpdateRoleDto, RoleQueryDto> {
  protected model = prisma.role;
  protected entityName = '角色';

  async create(data: CreateRoleDto): Promise<any> {
    // 检查角色编码是否已存在
    await this.validateUniqueCode(data.code, null);

    const role = await this.model.create({
      data,
    });

    // 分配菜单权限
    if (data.menuIds && data.menuIds.length > 0) {
      await this.assignMenus(role.id, data.menuIds);
    }

    return this.findById(role.id);
  }

  async findAll(query: RoleQueryDto): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'id',
      sortOrder = 'desc',
      name,
      code,
      status,
    } = query;

    const skip = (page - 1) * pageSize;
    const orderBy = { [sortBy]: sortOrder };

    // 构建查询条件
    const where: any = {};

    if (name) {
      where.name = { contains: name };
    }

    if (code) {
      where.code = { contains: code };
    }

    if (status !== undefined) {
      where.status = status;
    }

    const [roles, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
      }),
      this.model.count({ where }),
    ]);

    return {
      items: roles,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: number): Promise<any> {
    const role = await this.model.findUnique({
      where: { id },
      include: {
        roleMenus: {
          include: {
            menu: true,
          },
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                nickname: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new Error(`${this.getEntityName()}不存在`);
    }

    return role;
  }

  async update(id: number, data: UpdateRoleDto): Promise<any> {
    const role = await this.findById(id);

    // 如果更新角色编码，需要检查唯一性
    if (data.code && data.code !== role.code) {
      await this.validateUniqueCode(data.code, id);
    }

    // 构建更新数据 - 只包含 Role 模型的字段
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;

    // 更新角色信息
    await this.model.update({
      where: { id },
      data: updateData,
    });

    // 更新菜单权限分配
    if (data.menuIds !== undefined) {
      // 先删除现有菜单关联
      await prisma.roleMenu.deleteMany({
        where: { roleId: id },
      });

      // 重新分配菜单权限
      if (data.menuIds.length > 0) {
        await this.assignMenus(id, data.menuIds);
      }
    }

    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const role = await this.findById(id);

    // 检查是否有用户使用此角色
    const userCount = await prisma.userRole.count({
      where: { roleId: id },
    });

    if (userCount > 0) {
      throw new Error('该角色下还有用户，无法删除');
    }

    // 删除角色菜单关联
    await prisma.roleMenu.deleteMany({
      where: { roleId: id },
    });

    // 删除用户角色关联
    await prisma.userRole.deleteMany({
      where: { roleId: id },
    });

    // 删除角色
    await this.model.delete({
      where: { id },
    });
  }

  /**
   * 获取角色的菜单权限
   */
  async getRoleMenus(roleId: number): Promise<any[]> {
    const role = await this.findById(roleId);
    return role.roleMenus.map((rm: any) => rm.menu);
  }

  /**
   * 更新角色的菜单权限
   */
  async updateRoleMenus(roleId: number, menuIds: number[]): Promise<void> {
    const role = await this.findById(roleId);

    await prisma.roleMenu.deleteMany({
      where: { roleId },
    });

    if (menuIds.length > 0) {
      await this.assignMenus(roleId, menuIds);
    }
  }

  /**
   * 分配菜单权限给角色
   */
  private async assignMenus(roleId: number, menuIds: number[]): Promise<void> {
    await Promise.all(
      menuIds.map((menuId) =>
        prisma.roleMenu.create({
          data: {
            roleId,
            menuId,
          },
        })
      )
    );
  }

  /**
   * 验证角色编码唯一性
   */
  private async validateUniqueCode(code: string, excludeId?: number): Promise<void> {
    const where: any = { code };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existingRole = await this.model.findFirst({ where });

    if (existingRole) {
      throw new Error('角色编码已存在');
    }
  }

  protected buildWhereClause(filters: any): any {
    const where: any = {};

    if (filters.name) {
      where.name = { contains: filters.name };
    }

    if (filters.code) {
      where.code = { contains: filters.code };
    }

    if (filters.status !== undefined) {
      where.status = filters.status;
    }

    return where;
  }
}