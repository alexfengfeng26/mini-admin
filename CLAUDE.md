# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Mini Admin 是一个基于 Node.js + TypeScript (Express + Prisma) 后端和 Vue 3 + Vite 前端的 Monorepo 内容管理系统（CMS）。项目使用 npm workspaces 组织，包含 server 和 packages/client 两个 workspace。

## 常用命令

### 根目录命令
```bash
# 安装所有依赖
npm run install:all

# 同时启动前后端开发服务器
npm run dev

# 单独启动后端 (localhost:3000)
npm run dev:server

# 单独启动前端 (localhost:5173)
npm run dev:client

# 构建所有项目
npm run build
```

### 后端 (server/)
```bash
# 开发模式（带热重载）
npm run dev

# 构建 TypeScript
npm run build

# 启动生产服务器
npm run start

# Prisma 相关
npm run prisma:generate    # 生成 Prisma Client
npm run prisma:migrate     # 运行数据库迁移
npm run prisma:studio      # 打开 Prisma Studio GUI

# 数据库种子
npm run seed
```

### 前端 (packages/client/)
```bash
# 开发模式
npm run dev

# 构建（带类型检查）
npm run build

# 预览构建产物
npm run preview
```

## 架构设计

### 后端架构

**分层架构模式：**
- **Routes** (`src/routes/`) - 路由定义，将请求分发到控制器
- **Controllers** (`src/controllers/`) - 请求处理和响应
- **Services** (`src/services/`) - 业务逻辑层
  - `BaseService` - 通用 CRUD 基类
  - `BaseCmsService` - CMS 特定功能基类（slug 管理、标签关联等）
- **Middleware** (`src/middleware/`) - 认证、授权、日志、错误处理
- **Utils** (`src/utils/`) - JWT、密码哈希、响应格式化
- **Lib** (`src/lib/`) - Prisma 客户端单例

**服务继承关系：**
```
BaseService<T, CreateDto, UpdateDto, QueryDto>
  └── BaseCmsService<T, ...> extends BaseService
        ├── ArticleService
        ├── PageService
        ├── ProductService
        └── DocumentService

单独的 Service（直接继承 BaseService）：
  ├── AuthService
  ├── UserService
  ├── RoleService
  └── MenuService
```

**数据库设计：**
- 使用 Prisma ORM，MySQL 数据库
- Schema 定义在 `server/prisma/schema.prisma`
- RBAC 权限模型：User ↔ UserRole ↔ Role ↔ RoleMenu ↔ Menu
- CMS 内容模型：Category/Tag（多态）与 Article/Page/Product/Document 关联

### 前端架构

**技术栈：** Vue 3 (Composition API) + TypeScript + Pinia + Vue Router + Axios

**目录结构：**
- `views/` - 页面组件，按功能模块分组（users/, roles/, articles/ 等）
- `components/` - 可复用组件（BaseTable, BaseModal, ConfirmDialog 等）
- `layouts/` - 布局组件（MainLayout）
- `stores/` - Pinia 状态管理
- `router/` - 路由配置（含权限守卫）

**路由设计：**
- 嵌套路由结构，CMS 和 System 为两个主要模块
- 路由守卫在 `router.beforeEach` 中处理认证和权限检查
- 使用 meta 字段配置 `requiresAuth` 和 `permission`

**状态管理：**
- Pinia stores 使用 Composition API 风格
- 认证状态存储在 `stores/auth.ts`，同步到 localStorage

### 类型共享

项目根目录的 `types/` 目录包含共享 TypeScript 类型定义：
- `shared.types.ts` - 分页响应、通用类型
- `auth.types.ts` - 认证相关
- `cms.types.ts` - CMS 内容类型
- `user.types.ts`, `role.types.ts`, `menu.types.ts` - 系统管理类型

**TypeScript 路径配置：**

后端 (`server/tsconfig.json`)：
```json
{
  "baseUrl": ".",
  "paths": {
    "@/*": ["./src/*"],
    "@types/*": ["../types/*"]
  }
}
```

前端 (`packages/client/tsconfig.json`)：
```json
{
  "baseUrl": ".",
  "paths": {
    "@/*": ["./src/*"],
    "@types/*": ["../../types/*"]
  }
}
```

**使用示例：**
```typescript
// 后端引用
import { User } from '@types/user.types'
import { PaginatedResponse } from '@types/shared.types'

// 前端引用
import type { LoginRequest, LoginResponse } from '@types'
import { PaginatedResponse } from '@types/shared.types'
```

## 环境配置

后端需要 `.env` 文件（参考 `server/.env.example`）：
```bash
DATABASE_URL="mysql://user:pass@localhost:3306/mini_admin"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"
PORT=3000
```

**生成安全的 JWT_SECRET：**
```bash
# 使用 OpenSSL 生成 32 字符的随机密钥
openssl rand -base64 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## CMS 内容类型

系统支持四种内容类型，每种都有独立的 CRUD：
- **Articles** - 文章（支持作者、封面图、推荐、浏览/点赞/评论计数）
- **Pages** - 页面（支持模板）
- **Products** - 产品（支持价格、库存、图片、销量）
- **Documents** - 文档（支持版本、附件、下载计数）

所有内容类型都支持：
- SEO 字段（seoTitle, seoDescription, seoKeywords）
- 扩展元数据（metadata JSON 字段）
- 分类和标签多态关联

## 开发注意事项

1. **数据库变更：** 修改 Prisma schema 后需运行 `npm run prisma:migrate`
2. **类型安全：** 后端服务严格使用 TypeScript 泛型确保类型安全
3. **Slug 生成：** CMS 内容自动从标题生成 URL 友好的唯一 slug
4. **权限系统：** 基于角色和菜单的 RBAC，菜单可配置为按钮级权限
5. **API 响应格式：** 统一使用 `utils/response.ts` 中的 `successResponse` 格式

## 开发工作流最佳实践

### 添加新的 CMS 内容类型

1. **定义 Prisma 模型** (`server/prisma/schema.prisma`)
2. **创建类型定义** (`types/cms.types.ts` 或新建文件)
3. **创建 Service** (`server/src/services/`)，继承 `BaseCmsService`
4. **创建 Controller** (`server/src/controllers/`)
5. **创建 Routes** (`server/src/routes/`)
6. **创建前端页面** (`packages/client/src/views/`)

### 添加新的系统管理功能

1. **定义 Prisma 模型**
2. **创建类型定义** (`types/`)
3. **创建 Service** (`server/src/services/`)，继承 `BaseService`
4. **创建 Controller、Routes**
5. **更新前端路由** (`packages/client/src/router/index.ts`)
6. **创建前端页面组件**

## Node 版本要求

Node.js >= 18.0.0

## API 响应格式

所有 API 统一使用以下响应格式（`server/src/utils/response.ts`）：

**成功响应：**
```typescript
{
  success: true,
  data: T,
  message: string,
  timestamp: string
}
```

**分页响应：**
```typescript
{
  success: true,
  data: {
    items: T[],
    total: number,
    page: number,
    pageSize: number,
    totalPages: number
  },
  message: string,
  timestamp: string
}
```

**错误响应：**
```typescript
{
  success: false,
  data: null,
  message: string,
  timestamp: string
}
```

## 中间件使用

**认证中间件** (`server/src/middleware/auth.ts`)：
- `authenticate` - JWT 认证，验证 Bearer Token
- `optionalAuth` - 可选认证，不强制要求登录

**权限中间件** (`server/src/middleware/rbac.ts`)：
- `requirePermission(permission)` - 检查单个权限
- `requirePermissions(permissions[])` - 检查多个权限（需全部拥有）
- `requireRole(roleCode)` - 检查角色

**使用示例：**
```typescript
router.get('/users', authenticate, requirePermission('user:list'), controller.list)
router.post('/users', authenticate, requirePermission('user:create'), controller.create)
```

## 故障排除

### 数据库连接问题
```bash
# 检查 MySQL 服务状态
# Windows
net start MySQL

# Linux
sudo systemctl status mysql

# 测试连接
mysql -u root -p -h localhost -P 3306
```

### Prisma 迁移问题
```bash
# 重置数据库（危险操作，会删除所有数据）
cd server
npx prisma migrate reset

# 重新生成 Prisma Client
npm run prisma:generate

# 查看迁移历史
npx prisma migrate status
```

### 前端构建问题
```bash
# 清理 node_modules 和重新安装
cd packages/client
rm -rf node_modules dist
npm install
npm run build
```

### 类型错误
```bash
# 重新生成 Prisma Client（确保类型同步）
cd server
npm run prisma:generate

# 检查 TypeScript 配置
# 确保 tsconfig.json 中的 paths 配置正确
```

### 端口占用
```bash
# 查看端口占用
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -ti:3000

# 终止进程
# Windows
taskkill /PID <进程ID> /F

# Linux/Mac
kill -9 <进程ID>
```

## 日志和调试

### 后端日志
- **请求日志：** 通过 `logger.ts` 中间件记录所有 HTTP 请求
- **错误日志：** 统一在 `errorHandler.ts` 中间件处理
- **查看日志：** 开发模式下控制台直接输出

### 前端调试
- **Vue DevTools：** 安装浏览器扩展进行组件调试
- **API 调试：** 使用浏览器 Network 面板查看请求
- **Pinia 状态：** 通过 Vue DevTools 查看 store 状态

### 数据库调试
```bash
# 打开 Prisma Studio 可视化界面
cd server
npm run prisma:studio

# 在浏览器中访问 http://localhost:5555
```

## 安全注意事项

1. **JWT 密钥：** 生产环境必须使用强随机密钥，不要使用示例值
2. **数据库密码：** 使用强密码，不要硬编码在代码中
3. **环境变量：** `.env` 文件不要提交到版本控制
4. **CORS 配置：** 生产环境限制允许的源
5. **输入验证：** 所有用户输入都需验证（使用 `validation.ts` 中间件）
6. **SQL 注入：** 使用 Prisma ORM 自动防护
