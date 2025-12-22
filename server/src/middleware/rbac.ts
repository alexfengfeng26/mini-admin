import { Request, Response, NextFunction } from 'express';

/**
 * 检查单个权限
 * @param permission 权限标识
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: '未认证用户',
        timestamp: new Date().toISOString(),
      });
    }

    if (!user.permissions || !user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        data: null,
        message: `没有权限访问此资源: ${permission}`,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

/**
 * 检查多个权限（需要全部拥有）
 * @param permissions 权限标识数组
 */
export const requirePermissions = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: '未认证用户',
        timestamp: new Date().toISOString(),
      });
    }

    const hasAllPermissions = permissions.every(permission =>
      user.permissions?.includes(permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        data: null,
        message: '权限不足',
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

/**
 * 检查角色
 * @param roleCode 角色编码
 */
export const requireRole = (roleCode: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: '未认证用户',
        timestamp: new Date().toISOString(),
      });
    }

    const hasRole = user.user?.userRoles?.some(
      ur => ur.role.code === roleCode
    );

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        data: null,
        message: `需要角色: ${roleCode}`,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};
