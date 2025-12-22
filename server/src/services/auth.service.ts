import { PrismaClient } from '@prisma/client';
import { comparePassword, hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { LoginRequest, LoginResponse, JwtPayload } from '@types/auth.types';

const prisma = new PrismaClient();

export class AuthService {
  /**
   * 用户登录
   * @param credentials 登录凭据
   * @returns 登录响应
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { username, password } = credentials;

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username },
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
      throw new Error('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('用户名或密码错误');
    }

    // 检查用户状态
    if (user.status === 0) {
      throw new Error('用户已被禁用');
    }

    // 生成Token
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };

    const token = generateToken(payload);

    // 构建用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword as any,
      expiresIn: 24 * 60 * 60, // 24小时
    };
  }

  /**
   * 获取当前用户信息
   * @param userId 用户ID
   * @returns 用户信息
   */
  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * 修改密码
   * @param userId 用户ID
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    // 获取用户
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证旧密码
    const isOldPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new Error('原密码错误');
    }

    // 加密新密码
    const hashedPassword = await hashPassword(newPassword);

    // 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}
