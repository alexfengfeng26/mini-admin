import { BaseService } from './base.service';
import { CreateMenuDto, UpdateMenuDto, MenuQueryDto, MenuTreeNode } from '@types/menu.types';
import { PaginatedResponse } from '@types/shared.types';
import { prisma } from '@/lib/prisma';

export class MenuService extends BaseService<any, CreateMenuDto, UpdateMenuDto, MenuQueryDto> {
  protected model = prisma.menu;
  protected entityName = '菜单';
  async create(data: CreateMenuDto): Promise<any> {
    // 如果有父菜单，检查父菜单是否存在
    if (data.parentId) {
      const parent = await this.model.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new Error('父菜单不存在');
      }
    }

    const menu = await this.model.create({
      data: {
        name: data.name,
        path: data.path,
        component: data.component,
        icon: data.icon,
        sort: data.sort ?? 0,
        parentId: data.parentId,
        status: data.status ?? 1,
        type: data.type ?? 1,
        permission: data.permission,
      },
    });

    return menu;
  }

  
  /**
   * 获取菜单树形结构
   * @returns 树形菜单列表
   */
  async findTree() {
    const menus = await prisma.menu.findMany({
      orderBy: [
        { sort: 'asc' },
        { id: 'asc' },
      ],
    });

    return this.buildTree(menus);
  }

  
  async update(id: number, data: UpdateMenuDto): Promise<any> {
    const existingMenu = await this.findById(id);

    // 如果更新父菜单，检查父菜单是否存在且不能是自己或自己的子菜单
    if (data.parentId !== undefined) {
      if (data.parentId === id) {
        throw new Error('不能将菜单设置为自己的子菜单');
      }

      // 检查是否会形成循环依赖
      if (data.parentId) {
        const children = await this.getAllChildren(id);
        if (children.some(child => child.id === data.parentId)) {
          throw new Error('不能将菜单设置为自己的子菜单');
        }
      }
    }

    // 构建更新数据 - 只包含 Menu 模型的字段
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.path !== undefined) updateData.path = data.path;
    if (data.component !== undefined) updateData.component = data.component;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.sort !== undefined) updateData.sort = data.sort;
    if (data.parentId !== undefined) updateData.parentId = data.parentId;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.permission !== undefined) updateData.permission = data.permission;

    return this.model.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: number): Promise<void> {
    const menu = await this.model.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });

    if (!menu) {
      throw new Error(`${this.getEntityName()}不存在`);
    }

    // 检查是否有子菜单
    if (menu.children.length > 0) {
      throw new Error('该菜单下还有子菜单，无法删除');
    }

    await this.model.delete({
      where: { id },
    });
  }

  /**
   * 获取用户菜单权限
   */
  async getUserMenus(userId: number): Promise<any[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                roleMenus: {
                  include: {
                    menu: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 获取所有菜单
    const allMenus = user.userRoles
      .flatMap(ur => ur.role.roleMenus)
      .map(rm => rm.menu)
      .filter((menu, index, self) =>
        menu.type === 1 && // 只显示菜单类型
        self.findIndex(m => m.id === menu.id) === index // 去重
      );

    // 构建树形结构
    return this.buildTree(allMenus);
  }

  /**
   * 构建树形结构
   * @param menus 菜单列表
   * @param parentId 父菜单ID
   * @returns 树形菜单
   */
  private buildTree(menus: any[], parentId?: number): any[] {
    return menus
      .filter(menu => menu.parentId === parentId || (parentId === undefined && menu.parentId == null))
      .map(menu => ({
        ...menu,
        children: this.buildTree(menus, menu.id),
      }));
  }

  /**
   * 获取所有子菜单（包括孙子菜单）
   */
  private async getAllChildren(parentId: number): Promise<any[]> {
    const children = await this.model.findMany({
      where: { parentId },
    });

    const allChildren = [...children];

    for (const child of children) {
      const grandChildren = await this.getAllChildren(child.id);
      allChildren.push(...grandChildren);
    }

    return allChildren;
  }

  protected buildWhereClause(filters: any): any {
    const where: any = {};

    if (filters.name) {
      where.name = { contains: filters.name };
    }

    if (filters.type !== undefined) {
      where.type = filters.type;
    }

    if (filters.status !== undefined) {
      where.status = filters.status;
    }

    if (filters.parentId !== undefined) {
      where.parentId = filters.parentId;
    }

    return where;
  }
}
