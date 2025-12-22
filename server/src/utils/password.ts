import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * 加密密码
 * @param password 原始密码
 * @returns 加密后的密码
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * 验证密码
 * @param password 原始密码
 * @param hashedPassword 加密后的密码
 * @returns 是否匹配
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * 验证密码强度
 * @param password 密码
 * @returns 验证结果
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('密码长度不能少于6位');
  }

  if (password.length > 20) {
    errors.push('密码长度不能超过20位');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
