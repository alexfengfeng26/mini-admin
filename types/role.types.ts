import { BaseEntity, PaginationParams } from './shared.types';
import { Menu } from './menu.types';

// 角色实体
export interface Role extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  status: number; // 0:禁用 1:启用
  menus?: Menu[];
}

// 创建角色DTO
export interface CreateRoleDto {
  name: string;
  code: string;
  description?: string;
  status?: number;
  menuIds?: number[];
}

// 更新角色DTO
export interface UpdateRoleDto {
  name?: string;
  code?: string;
  description?: string;
  status?: number;
  menuIds?: number[];
}

// 角色查询参数
export interface RoleQueryDto extends PaginationParams {
  name?: string;
  code?: string;
  status?: number;
}

// 角色列表项
export interface RoleListItem {
  id: number;
  name: string;
  code: string;
  description?: string;
  status: number;
  menuCount: number;
  userCount: number;
  createdAt: string;
}
