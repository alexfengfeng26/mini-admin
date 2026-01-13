import { Request, Response, NextFunction } from 'express';

/**
 * 验证中间件
 */
export const validateInput = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    // 验证必填字段
    if (schema.required) {
      for (const field of schema.required) {
        if (!req.body[field] || req.body[field] === '') {
          errors.push(`${field} 是必填字段`);
        }
      }
    }

    // 验证字段格式
    if (schema.fields) {
      for (const [field, rules] of Object.entries(schema.fields)) {
        const value = req.body[field];
        if (value === undefined || value === null || value === '') {
          continue; // 跳过未提供的字段
        }

        // 类型验证
        if (rules.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push(`${field} 格式不正确`);
          }
        }

        if (rules.type === 'string') {
          if (typeof value !== 'string') {
            errors.push(`${field} 必须是字符串`);
          } else {
            // 长度验证
            if (rules.minLength && value.length < rules.minLength) {
              errors.push(`${field} 长度不能少于 ${rules.minLength} 个字符`);
            }
            if (rules.maxLength && value.length > rules.maxLength) {
              errors.push(`${field} 长度不能超过 ${rules.maxLength} 个字符`);
            }
            // 正则验证
            if (rules.pattern && !rules.pattern.test(value)) {
              errors.push(`${field} 格式不正确`);
            }
          }
        }

        if (rules.type === 'number') {
          const numValue = Number(value);
          if (isNaN(numValue)) {
            errors.push(`${field} 必须是数字`);
          } else {
            if (rules.min !== undefined && numValue < rules.min) {
              errors.push(`${field} 不能小于 ${rules.min}`);
            }
            if (rules.max !== undefined && numValue > rules.max) {
              errors.push(`${field} 不能大于 ${rules.max}`);
            }
          }
        }

        if (rules.type === 'array') {
          if (!Array.isArray(value)) {
            errors.push(`${field} 必须是数组`);
          } else if (rules.minItems && value.length < rules.minItems) {
            errors.push(`${field} 至少需要 ${rules.minItems} 个元素`);
          }
        }
      }
    }

    // 清理输入数据，移除HTML标签和特殊字符
    const sanitizeString = (str: string): string => {
      return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<[^>]*>/g, '')
                .trim();
    };

    const sanitizeObj = (obj: any): any => {
      if (typeof obj === 'string') {
        return sanitizeString(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObj);
      }
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitizeObj(value);
        }
        return sanitized;
      }
      return obj;
    };

    // 清理请求数据
    req.body = sanitizeObj(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors,
      });
    }

    next();
  };
};

/**
 * 验证规则接口
 */
export interface ValidationRules {
  type: 'string' | 'number' | 'email' | 'array';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  minItems?: number;
  pattern?: RegExp;
}

/**
 * 验证模式接口
 */
export interface ValidationSchema {
  required?: string[];
  fields?: {
    [key: string]: ValidationRules;
  };
}

// 预定义的验证模式
export const userValidationSchema: ValidationSchema = {
  required: ['username', 'email', 'password'],
  fields: {
    username: {
      type: 'string',
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_]+$/,
    },
    email: {
      type: 'email',
      maxLength: 100,
    },
    password: {
      type: 'string',
      minLength: 6,
      maxLength: 100,
    },
    nickname: {
      type: 'string',
      maxLength: 50,
    },
    phone: {
      type: 'string',
      maxLength: 20,
      pattern: /^[0-9+\-\s()]+$/,
    },
    status: {
      type: 'number',
      min: 0,
      max: 1,
    },
    roleIds: {
      type: 'array',
    },
  },
};

// 用户更新验证模式（密码不是必填）
export const userUpdateValidationSchema: ValidationSchema = {
  required: ['username', 'email'],
  fields: {
    username: {
      type: 'string',
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_]+$/,
    },
    email: {
      type: 'email',
      maxLength: 100,
    },
    password: {
      type: 'string',
      minLength: 6,
      maxLength: 100,
    },
    nickname: {
      type: 'string',
      maxLength: 50,
    },
    phone: {
      type: 'string',
      maxLength: 20,
      pattern: /^[0-9+\-\s()]+$/,
    },
    status: {
      type: 'number',
      min: 0,
      max: 1,
    },
    roleIds: {
      type: 'array',
    },
  },
};

export const roleValidationSchema: ValidationSchema = {
  required: ['name', 'code'],
  fields: {
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 50,
    },
    code: {
      type: 'string',
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_:]+$/,
    },
    description: {
      type: 'string',
      maxLength: 200,
    },
    status: {
      type: 'number',
      min: 0,
      max: 1,
    },
  },
};

export const menuValidationSchema: ValidationSchema = {
  required: ['name', 'type'],
  fields: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    path: {
      type: 'string',
      maxLength: 200,
    },
    icon: {
      type: 'string',
      maxLength: 50,
    },
    component: {
      type: 'string',
      maxLength: 200,
    },
    type: {
      type: 'number',
      min: 1,
      max: 2,
    },
    parentId: {
      type: 'number',
      min: 0,
    },
    sort: {
      type: 'number',
      min: 0,
    },
    status: {
      type: 'number',
      min: 0,
      max: 1,
    },
    permission: {
      type: 'string',
      maxLength: 100,
    },
  },
};