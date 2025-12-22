// 通用API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

// 分页查询参数
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API错误类型
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// 通用实体
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

// 通用状态枚举
export enum Status {
  ACTIVE = 1,
  INACTIVE = 0,
}

// 通用操作结果
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}
