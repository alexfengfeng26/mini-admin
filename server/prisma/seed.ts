/**
 * 数据库 Seed 脚本 - 实用平衡方案
 *
 * 特点：
 * - 使用配置数组定义菜单，减少重复代码
 * - 辅助函数处理upsert逻辑
 * - 固定ID确保幂等性
 * - 清晰的代码组织和注释
 *
 * 菜单ID分配：
 * - 1-99: 系统管理模块
 * - 100-199: CMS内容管理模块
 */

import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/utils/password';

// ==================== 类型定义 ====================

/**
 * 菜单配置接口
 */
interface MenuConfig {
  id: number;              // 固定ID，确保幂等性
  name: string;
  path?: string;
  component?: string;
  icon?: string;
  sort: number;
  parentId?: number;
  status: number;
  type: number;            // 1:菜单 2:按钮
  permission?: string;
}

/**
 * 角色配置接口
 */
interface RoleConfig {
  code: string;
  name: string;
  description?: string;
  status: number;
  menuCodes?: string[];    // 分配的菜单模块编码
}

// ==================== 常量定义 ====================

/**
 * 系统常量
 */
const STATUS_ACTIVE = 1;
const MENU_TYPE_MENU = 1;
const MENU_TYPE_BUTTON = 2;
const DEFAULT_SEED_PASSWORD = 'admin123';

/**
 * 菜单模块编码常量
 */
const MENU_MODULES = {
  SYSTEM: 'system',
  CMS: 'cms',
} as const;

// ==================== 配置数据 ====================

/**
 * 系统管理菜单配置
 */
const systemMenus: MenuConfig[] = [
  // 父菜单
  {
    id: 1,
    name: '系统管理',
    path: '/system',
    icon: 'SettingOutlined',
    sort: 1,
    parentId: undefined,
    status: STATUS_ACTIVE,
    type: MENU_TYPE_MENU,
  },
  // 用户管理
  {
    id: 2,
    name: '用户管理',
    path: '/system/users',
    component: 'system/users/index',
    icon: 'UserOutlined',
    sort: 1,
    parentId: 1,
    status: STATUS_ACTIVE,
    type: MENU_TYPE_MENU,
    permission: 'user:list',
  },
  { id: 5, name: '查看用户', parentId: 2, type: MENU_TYPE_BUTTON, permission: 'user:read', sort: 0, status: STATUS_ACTIVE },
  { id: 6, name: '新增用户', parentId: 2, type: MENU_TYPE_BUTTON, permission: 'user:create', sort: 1, status: STATUS_ACTIVE },
  { id: 7, name: '编辑用户', parentId: 2, type: MENU_TYPE_BUTTON, permission: 'user:update', sort: 2, status: STATUS_ACTIVE },
  { id: 8, name: '删除用户', parentId: 2, type: MENU_TYPE_BUTTON, permission: 'user:delete', sort: 3, status: STATUS_ACTIVE },

  // 角色管理
  {
    id: 3,
    name: '角色管理',
    path: '/system/roles',
    component: 'system/roles/index',
    icon: 'TeamOutlined',
    sort: 2,
    parentId: 1,
    status: STATUS_ACTIVE,
    type: MENU_TYPE_MENU,
    permission: 'role:list',
  },
  { id: 9, name: '查看角色', parentId: 3, type: MENU_TYPE_BUTTON, permission: 'role:read', sort: 0, status: STATUS_ACTIVE },
  { id: 10, name: '创建角色', parentId: 3, type: MENU_TYPE_BUTTON, permission: 'role:create', sort: 1, status: STATUS_ACTIVE },
  { id: 11, name: '编辑角色', parentId: 3, type: MENU_TYPE_BUTTON, permission: 'role:update', sort: 2, status: STATUS_ACTIVE },
  { id: 12, name: '删除角色', parentId: 3, type: MENU_TYPE_BUTTON, permission: 'role:delete', sort: 3, status: STATUS_ACTIVE },

  // 菜单管理
  {
    id: 4,
    name: '菜单管理',
    path: '/system/menus',
    component: 'system/menus/index',
    icon: 'MenuOutlined',
    sort: 3,
    parentId: 1,
    status: STATUS_ACTIVE,
    type: MENU_TYPE_MENU,
    permission: 'menu:list',
  },
  { id: 13, name: '查看菜单', parentId: 4, type: MENU_TYPE_BUTTON, permission: 'menu:read', sort: 0, status: STATUS_ACTIVE },
  { id: 14, name: '创建菜单', parentId: 4, type: MENU_TYPE_BUTTON, permission: 'menu:create', sort: 1, status: STATUS_ACTIVE },
  { id: 15, name: '编辑菜单', parentId: 4, type: MENU_TYPE_BUTTON, permission: 'menu:update', sort: 2, status: STATUS_ACTIVE },
  { id: 16, name: '删除菜单', parentId: 4, type: MENU_TYPE_BUTTON, permission: 'menu:delete', sort: 3, status: STATUS_ACTIVE },
];

/**
 * CMS内容管理菜单配置
 */
const cmsMenus: MenuConfig[] = [
  // CMS父菜单
  {
    id: 100,
    name: '内容管理',
    path: '/cms',
    icon: 'FileTextOutlined',
    sort: 2,
    parentId: undefined,
    status: STATUS_ACTIVE,
    type: MENU_TYPE_MENU,
    permission: 'cms:access',
  },

  // 文章管理
  {
    id: 101,
    name: '文章管理',
    path: '/cms/articles',
    component: 'cms/articles/index',
    icon: 'FileTextOutlined',
    sort: 1,
    parentId: 100,
    status: STATUS_ACTIVE,
    type: MENU_TYPE_MENU,
    permission: 'article:list',
  },
  { id: 102, name: '查看文章', parentId: 101, type: MENU_TYPE_BUTTON, permission: 'article:read', sort: 0, status: STATUS_ACTIVE },
  { id: 103, name: '新增文章', parentId: 101, type: MENU_TYPE_BUTTON, permission: 'article:create', sort: 1, status: STATUS_ACTIVE },
  { id: 104, name: '编辑文章', parentId: 101, type: MENU_TYPE_BUTTON, permission: 'article:update', sort: 2, status: STATUS_ACTIVE },
  { id: 105, name: '删除文章', parentId: 101, type: MENU_TYPE_BUTTON, permission: 'article:delete', sort: 3, status: STATUS_ACTIVE },

  // 页面管理
  {
    id: 106,
    name: '页面管理',
    path: '/cms/pages',
    component: 'cms/pages/index',
    icon: 'FileOutlined',
    sort: 2,
    parentId: 100,
    status: STATUS_ACTIVE,
    type: MENU_TYPE_MENU,
    permission: 'page:list',
  },
  { id: 107, name: '查看页面', parentId: 106, type: MENU_TYPE_BUTTON, permission: 'page:read', sort: 0, status: STATUS_ACTIVE },
  { id: 108, name: '新增页面', parentId: 106, type: MENU_TYPE_BUTTON, permission: 'page:create', sort: 1, status: STATUS_ACTIVE },
  { id: 109, name: '编辑页面', parentId: 106, type: MENU_TYPE_BUTTON, permission: 'page:update', sort: 2, status: STATUS_ACTIVE },
  { id: 110, name: '删除页面', parentId: 106, type: MENU_TYPE_BUTTON, permission: 'page:delete', sort: 3, status: STATUS_ACTIVE },

  // 产品管理
  {
    id: 111,
    name: '产品管理',
    path: '/cms/products',
    component: 'cms/products/index',
    icon: 'ShoppingOutlined',
    sort: 3,
    parentId: 100,
    status: STATUS_ACTIVE,
    type: MENU_TYPE_MENU,
    permission: 'product:list',
  },
  { id: 112, name: '查看产品', parentId: 111, type: MENU_TYPE_BUTTON, permission: 'product:read', sort: 0, status: STATUS_ACTIVE },
  { id: 113, name: '新增产品', parentId: 111, type: MENU_TYPE_BUTTON, permission: 'product:create', sort: 1, status: STATUS_ACTIVE },
  { id: 114, name: '编辑产品', parentId: 111, type: MENU_TYPE_BUTTON, permission: 'product:update', sort: 2, status: STATUS_ACTIVE },
  { id: 115, name: '删除产品', parentId: 111, type: MENU_TYPE_BUTTON, permission: 'product:delete', sort: 3, status: STATUS_ACTIVE },

  // 文档管理
  {
    id: 116,
    name: '文档管理',
    path: '/cms/documents',
    component: 'cms/documents/index',
    icon: 'FolderOutlined',
    sort: 4,
    parentId: 100,
    status: STATUS_ACTIVE,
    type: MENU_TYPE_MENU,
    permission: 'document:list',
  },
  { id: 117, name: '查看文档', parentId: 116, type: MENU_TYPE_BUTTON, permission: 'document:read', sort: 0, status: STATUS_ACTIVE },
  { id: 118, name: '新增文档', parentId: 116, type: MENU_TYPE_BUTTON, permission: 'document:create', sort: 1, status: STATUS_ACTIVE },
  { id: 119, name: '编辑文档', parentId: 116, type: MENU_TYPE_BUTTON, permission: 'document:update', sort: 2, status: STATUS_ACTIVE },
  { id: 120, name: '删除文档', parentId: 116, type: MENU_TYPE_BUTTON, permission: 'document:delete', sort: 3, status: STATUS_ACTIVE },

  // 分类管理
  {
    id: 121,
    name: '分类管理',
    path: '/cms/categories',
    component: 'cms/categories/index',
    icon: 'AppstoreOutlined',
    sort: 5,
    parentId: 100,
    status: STATUS_ACTIVE,
    type: MENU_TYPE_MENU,
    permission: 'category:list',
  },
  { id: 122, name: '查看分类', parentId: 121, type: MENU_TYPE_BUTTON, permission: 'category:read', sort: 0, status: STATUS_ACTIVE },
  { id: 123, name: '新增分类', parentId: 121, type: MENU_TYPE_BUTTON, permission: 'category:create', sort: 1, status: STATUS_ACTIVE },
  { id: 124, name: '编辑分类', parentId: 121, type: MENU_TYPE_BUTTON, permission: 'category:update', sort: 2, status: STATUS_ACTIVE },
  { id: 125, name: '删除分类', parentId: 121, type: MENU_TYPE_BUTTON, permission: 'category:delete', sort: 3, status: STATUS_ACTIVE },

  // 标签管理
  {
    id: 126,
    name: '标签管理',
    path: '/cms/tags',
    component: 'cms/tags/index',
    icon: 'TagsOutlined',
    sort: 6,
    parentId: 100,
    status: STATUS_ACTIVE,
    type: MENU_TYPE_MENU,
    permission: 'tag:list',
  },
  { id: 127, name: '查看标签', parentId: 126, type: MENU_TYPE_BUTTON, permission: 'tag:read', sort: 0, status: STATUS_ACTIVE },
  { id: 128, name: '新增标签', parentId: 126, type: MENU_TYPE_BUTTON, permission: 'tag:create', sort: 1, status: STATUS_ACTIVE },
  { id: 129, name: '编辑标签', parentId: 126, type: MENU_TYPE_BUTTON, permission: 'tag:update', sort: 2, status: STATUS_ACTIVE },
  { id: 130, name: '删除标签', parentId: 126, type: MENU_TYPE_BUTTON, permission: 'tag:delete', sort: 3, status: STATUS_ACTIVE },
];

/**
 * 所有菜单配置
 */
const allMenuConfigs: Record<string, MenuConfig[]> = {
  [MENU_MODULES.SYSTEM]: systemMenus,
  [MENU_MODULES.CMS]: cmsMenus,
};

/**
 * 角色配置
 */
const roleConfigs: RoleConfig[] = [
  {
    code: 'admin',
    name: '超级管理员',
    description: '系统超级管理员，拥有所有权限',
    status: STATUS_ACTIVE,
    menuCodes: [MENU_MODULES.SYSTEM, MENU_MODULES.CMS],
  },
  {
    code: 'user',
    name: '普通用户',
    description: '普通用户，仅有基本权限',
    status: STATUS_ACTIVE,
    menuCodes: [],
  },
];

// ==================== 辅助函数 ====================

/**
 * 日志工具
 */
const logger = {
  info: (message: string) => console.log(`\x1b[36m[INFO]\x1b[0m ${message}`),
  success: (message: string) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${message}`),
  error: (message: string) => console.error(`\x1b[31m[ERROR]\x1b[0m ${message}`),
};

/**
 * 菜单数据Upsert（创建或更新）
 * 使用固定ID实现幂等性
 */
async function upsertMenu(menu: MenuConfig): Promise<void> {
  await prisma.menu.upsert({
    where: { id: menu.id },
    update: {
      name: menu.name,
      path: menu.path,
      component: menu.component,
      icon: menu.icon,
      sort: menu.sort,
      parentId: menu.parentId,
      status: menu.status,
      type: menu.type,
      permission: menu.permission,
    },
    create: {
      id: menu.id, // 固定ID
      name: menu.name,
      path: menu.path,
      component: menu.component,
      icon: menu.icon,
      sort: menu.sort,
      parentId: menu.parentId,
      status: menu.status,
      type: menu.type,
      permission: menu.permission,
    },
  });
}

/**
 * 批量创建菜单
 */
async function seedMenus(): Promise<number> {
  logger.info('开始创建菜单数据...');

  let count = 0;

  // 创建系统管理菜单
  for (const menu of systemMenus) {
    await upsertMenu(menu);
    count++;
  }

  // 创建CMS菜单
  for (const menu of cmsMenus) {
    await upsertMenu(menu);
    count++;
  }

  logger.success(`菜单创建完成：${count} 条`);
  return count;
}

/**
 * 为角色分配菜单权限
 */
async function assignMenusToRole(roleCode: string, menuCodes: string[]): Promise<void> {
  if (!menuCodes || menuCodes.length === 0) {
    return;
  }

  // 获取角色
  const role = await prisma.role.findUnique({
    where: { code: roleCode },
  });

  if (!role) {
    throw new Error(`角色不存在: ${roleCode}`);
  }

  // 收集菜单ID
  const menuIds: number[] = [];
  for (const code of menuCodes) {
    const menus = allMenuConfigs[code];
    if (menus) {
      menuIds.push(...menus.map((m: MenuConfig) => m.id));
    }
  }

  // 删除旧的菜单关联
  await prisma.roleMenu.deleteMany({
    where: { roleId: role.id },
  });

  // 创建新的菜单关联（使用createMany批量操作）
  if (menuIds.length > 0) {
    await prisma.roleMenu.createMany({
      data: menuIds.map(menuId => ({
        roleId: role.id,
        menuId,
      })),
      skipDuplicates: true,
    });
  }

  logger.info(`  角色 ${role.name} 分配了 ${menuIds.length} 个菜单权限`);
}

/**
 * 创建角色数据
 */
async function seedRoles(): Promise<number> {
  logger.info('开始创建角色数据...');

  let count = 0;

  for (const roleConfig of roleConfigs) {
    // Upsert角色
    await prisma.role.upsert({
      where: { code: roleConfig.code },
      update: {
        name: roleConfig.name,
        description: roleConfig.description,
        status: roleConfig.status,
      },
      create: {
        code: roleConfig.code,
        name: roleConfig.name,
        description: roleConfig.description,
        status: roleConfig.status,
      },
    });

    // 分配菜单权限
    await assignMenusToRole(roleConfig.code, roleConfig.menuCodes || []);

    count++;
  }

  logger.success(`角色创建完成：${count} 个`);
  return count;
}

/**
 * 创建用户数据
 */
async function seedUsers(): Promise<number> {
  logger.info('开始创建用户数据...');

  // 获取admin角色
  const adminRole = await prisma.role.findUnique({
    where: { code: 'admin' },
  });

  if (!adminRole) {
    throw new Error('Admin角色不存在，请先创建角色');
  }

  // 加密密码
  const hashedPassword = await hashPassword(DEFAULT_SEED_PASSWORD);

  // Upsert管理员用户
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      email: 'admin@example.com',
      password: hashedPassword,
      nickname: '系统管理员',
      status: 1,
    },
    create: {
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      nickname: '系统管理员',
      status: 1,
    },
  });

  // 为管理员分配角色
  const adminUser = await prisma.user.findUnique({
    where: { username: 'admin' },
  });

  if (adminUser) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });
  }

  logger.success('用户创建完成：1 个');
  return 1;
}

// ==================== 主执行流程 ====================

async function main() {
  console.log('========================================');
  console.log('开始填充数据库...');
  console.log('========================================');

  const startTime = Date.now();

  try {
    // 验证数据库连接
    await prisma.$connect();
    logger.success('数据库连接成功');

    // 1. 创建菜单
    const menuCount = await seedMenus();

    // 2. 创建角色并分配权限
    const roleCount = await seedRoles();

    // 3. 创建用户
    const userCount = await seedUsers();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('========================================');
    console.log('✅ 数据库填充完成！');
    console.log('========================================');
    console.log(`📊 统计信息：`);
    console.log(`   - 菜单: ${menuCount} 条`);
    console.log(`   - 角色: ${roleCount} 个`);
    console.log(`   - 用户: ${userCount} 个`);
    console.log(`   - 耗时: ${duration}s`);
    console.log('========================================');
    console.log('🔑 默认管理员账户：');
    console.log('   用户名: admin');
    console.log('   密码: admin123');
    console.log('========================================');

  } catch (error) {
    console.error('========================================');
    console.error('❌ 数据库填充失败！');
    console.error('========================================');
    console.error(error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
