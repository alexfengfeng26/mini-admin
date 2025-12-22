import { Response } from 'express';
import { ApiResponse } from '@types/shared.types';

/**
 * 成功响应
 * @param res Express Response
 * @param data 响应数据
 * @param message 响应消息
 * @returns Response
 */
export const successResponse = <T>(
  res: Response,
  data: T,
  message: string = 'Success'
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
  return res.json(response);
};

/**
 * 分页响应
 * @param res Express Response
 * @param items 数据列表
 * @param total 总数
 * @param page 当前页
 * @param pageSize 每页大小
 * @param message 响应消息
 * @returns Response
 */
export const paginatedResponse = <T>(
  res: Response,
  items: T[],
  total: number,
  page: number,
  pageSize: number,
  message: string = 'Success'
): Response => {
  const response: ApiResponse<{
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> = {
    success: true,
    data: {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
    message,
    timestamp: new Date().toISOString(),
  };
  return res.json(response);
};

/**
 * 错误响应
 * @param res Express Response
 * @param statusCode 状态码
 * @param message 错误消息
 * @returns Response
 */
export const errorResponse = (
  res: Response,
  statusCode: number,
  message: string
): Response => {
  const response: ApiResponse = {
    success: false,
    data: null,
    message,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
};
