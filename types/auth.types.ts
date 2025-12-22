import { User } from './user.types';

// JWT Token载荷
export interface JwtPayload {
  userId: number;
  username: string;
  email: string;
  iat: number;
  exp: number;
}

// 登录请求
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

// 认证相关类型
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  status: number;
  roles: Role[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

// 角色信息（简化版）
export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
}
