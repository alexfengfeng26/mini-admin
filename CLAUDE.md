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

前后端通过 tsconfig paths 引用：`@types/*` 映射到 `../../types`

## 环境配置

后端需要 `.env` 文件（参考 `server/.env.example`）：
```bash
DATABASE_URL="mysql://user:pass@localhost:3306/mini_admin"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"
PORT=3000
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

## Node 版本要求

Node.js >= 18.0.0
