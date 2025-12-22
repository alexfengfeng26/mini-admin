import { BaseEntity, PaginationParams } from './shared.types';
import { Role } from './auth.types';

// 用户实体
export interface User extends BaseEntity {
  username: string;
  email: string;
  password?: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  status: number; // 0:禁用 1:启用
  roles?: Role[];
}

// 创建用户DTO
export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  status?: number;
  roleIds?: number[];
}

// 更新用户DTO
export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  status?: number;
  roleIds?: number[];
}

// 用户查询参数
export interface UserQueryDto extends PaginationParams {
  username?: string;
  email?: string;
  status?: number;
  roleId?: number;
}

// 用户列表项（用于前端展示）
export interface UserListItem {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  status: number;
  roles: string;
  createdAt: string;
}
