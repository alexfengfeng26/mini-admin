import { Request, Response, NextFunction } from 'express';

/**
 * 全局错误处理中间件
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // 默认错误响应
  const statusCode = 500;
  const message = process.env.NODE_ENV === 'development'
    ? error.message
    : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    data: null,
    message,
    timestamp: new Date().toISOString(),
  });
};

/**
 * 404处理中间件
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    data: null,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
};
