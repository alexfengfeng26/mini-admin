import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始填充数据库...');

  // 创建菜单
  const systemMenu = await prisma.menu.create({
    data: {
      name: '系统管理',
      path: '/system',
      icon: 'SettingOutlined',
      sort: 1,
      type: 1,
      status: 1,
    },
  });

  const userMenu = await prisma.menu.create({
    data: {
      name: '用户管理',
      path: '/system/users',
      component: 'system/users/index',
      icon: 'UserOutlined',
      sort: 1,
      parentId: systemMenu.id,
      type: 1,
      status: 1,
      permission: 'user:list',
    },
  });

  const roleMenu = await prisma.menu.create({
    data: {
      name: '角色管理',
      path: '/system/roles',
      component: 'system/roles/index',
      icon: 'TeamOutlined',
      sort: 2,
      parentId: systemMenu.id,
      type: 1,
      status: 1,
      permission: 'role:list',
    },
  });

  const menuMenu = await prisma.menu.create({
    data: {
      name: '菜单管理',
      path: '/system/menus',
      component: 'system/menus/index',
      icon: 'MenuOutlined',
      sort: 3,
      parentId: systemMenu.id,
      type: 1,
      status: 1,
      permission: 'menu:list',
    },
  });

  // 创建按钮权限（查看权限）
  await prisma.menu.create({
    data: {
      name: '查看用户',
      parentId: userMenu.id,
      type: 2,
      permission: 'user:read',
      sort: 0,
      status: 1,
    },
  });

  await prisma.menu.create({
    data: {
      name: '新增用户',
      parentId: userMenu.id,
      type: 2,
      permission: 'user:create',
      sort: 1,
      status: 1,
    },
  });

  await prisma.menu.create({
    data: {
      name: '编辑用户',
      parentId: userMenu.id,
      type: 2,
      permission: 'user:update',
      sort: 2,
      status: 1,
    },
  });

  await prisma.menu.create({
    data: {
      name: '删除用户',
      parentId: userMenu.id,
      type: 2,
      permission: 'user:delete',
      sort: 3,
      status: 1,
    },
  });

  // 角色管理权限
  await prisma.menu.create({
    data: {
      name: '查看角色',
      parentId: roleMenu.id,
      type: 2,
      permission: 'role:read',
      sort: 0,
      status: 1,
    },
  });

  await prisma.menu.create({
    data: {
      name: '创建角色',
      parentId: roleMenu.id,
      type: 2,
      permission: 'role:create',
      sort: 1,
      status: 1,
    },
  });

  await prisma.menu.create({
    data: {
      name: '编辑角色',
      parentId: roleMenu.id,
      type: 2,
      permission: 'role:update',
      sort: 2,
      status: 1,
    },
  });

  await prisma.menu.create({
    data: {
      name: '删除角色',
      parentId: roleMenu.id,
      type: 2,
      permission: 'role:delete',
      sort: 3,
      status: 1,
    },
  });

  // 菜单管理权限
  await prisma.menu.create({
    data: {
      name: '查看菜单',
      parentId: menuMenu.id,
      type: 2,
      permission: 'menu:read',
      sort: 0,
      status: 1,
    },
  });

  await prisma.menu.create({
    data: {
      name: '创建菜单',
      parentId: menuMenu.id,
      type: 2,
      permission: 'menu:create',
      sort: 1,
      status: 1,
    },
  });

  await prisma.menu.create({
    data: {
      name: '编辑菜单',
      parentId: menuMenu.id,
      type: 2,
      permission: 'menu:update',
      sort: 2,
      status: 1,
    },
  });

  await prisma.menu.create({
    data: {
      name: '删除菜单',
      parentId: menuMenu.id,
      type: 2,
      permission: 'menu:delete',
      sort: 3,
      status: 1,
    },
  });

  // 创建角色
  const adminRole = await prisma.role.create({
    data: {
      name: '超级管理员',
      code: 'admin',
      description: '系统超级管理员，拥有所有权限',
      status: 1,
    },
  });

  await prisma.role.create({
    data: {
      name: '普通用户',
      code: 'user',
      description: '普通用户，仅有基本权限',
      status: 1,
    },
  });

  // 为管理员角色分配所有菜单权限（包括按钮权限）
  const allMenus = await prisma.menu.findMany();

  for (const menu of allMenus) {
    await prisma.roleMenu.create({
      data: {
        roleId: adminRole.id,
        menuId: menu.id,
      },
    });
  }

  // 创建管理员用户
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      nickname: '系统管理员',
      status: 1,
    },
  });

  // 为管理员分配角色
  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log('数据库填充完成！');
  console.log('默认管理员账户:');
  console.log('  用户名: admin');
  console.log('  密码: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
