import { BaseEntity, PaginationParams } from './shared.types';

// 菜单实体
export interface Menu extends BaseEntity {
  name: string;
  path?: string;
  component?: string;
  icon?: string;
  sort: number;
  parentId?: number;
  status: number; // 0:禁用 1:启用
  type: number; // 1:菜单 2:按钮
  permission?: string;
  children?: Menu[];
}

// 创建菜单DTO
export interface CreateMenuDto {
  name: string;
  path?: string;
  component?: string;
  icon?: string;
  sort?: number;
  parentId?: number;
  status?: number;
  type?: number;
  permission?: string;
}

// 更新菜单DTO
export interface UpdateMenuDto {
  name?: string;
  path?: string;
  component?: string;
  icon?: string;
  sort?: number;
  parentId?: number;
  status?: number;
  type?: number;
  permission?: string;
}

// 菜单查询参数
export interface MenuQueryDto extends PaginationParams {
  name?: string;
  type?: number;
  status?: number;
  parentId?: number;
}

// 菜单树节点
export interface MenuTreeNode {
  id: number;
  label: string;
  parentId?: number;
  children?: MenuTreeNode[];
  [key: string]: any;
}

// 菜单权限
export interface MenuPermission {
  id: number;
  menuId: number;
  permission: string;
}
