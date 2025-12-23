import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verify() {
  const count = await prisma.menu.count();
  const cmsMenus = await prisma.menu.findMany({
    where: { path: { startsWith: '/cms' } },
    orderBy: { id: 'asc' }
  });

  console.log('✅ 验证结果');
  console.log('总菜单数:', count);
  console.log('\n📋 CMS菜单结构:');
  console.table(cmsMenus.map(m => ({
    ID: m.id,
    名称: m.name,
    路径: m.path,
    类型: m.type === 1 ? '菜单' : '按钮',
    权限: m.permission || '-'
  })));

  await prisma.$disconnect();
}
verify();
