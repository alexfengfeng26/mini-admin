import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { JwtPayload } from '@types/auth.types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        user?: any;
        permissions?: string[];
      };
    }
  }
}

/**
 * JWT认证中间件
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data: null,
        message: '未提供认证令牌',
        timestamp: new Date().toISOString(),
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    // 查询用户信息
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
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
      return res.status(401).json({
        success: false,
        data: null,
        message: '用户不存在',
        timestamp: new Date().toISOString(),
      });
    }

    // 提取权限
    const permissions = user.userRoles
      .flatMap(ur => ur.role.roleMenus)
      .map(rm => rm.menu.permission)
      .filter(Boolean) as string[];

    req.user = {
      ...payload,
      user,
      permissions,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: null,
      message: '无效的令牌',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * 可选认证中间件（不强制要求登录）
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
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

      if (user) {
        const permissions = user.userRoles
          .flatMap(ur => ur.role.roleMenus)
          .map(rm => rm.menu.permission)
          .filter(Boolean) as string[];

        req.user = {
          ...payload,
          user,
          permissions,
        };
      }
    }

    next();
  } catch (error) {
    // 忽略错误，继续执行
    next();
  }
};
