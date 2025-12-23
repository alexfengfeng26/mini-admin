import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicates() {
  // 查找重复的path
  const duplicates = await prisma.$queryRaw`
    SELECT path, COUNT(*) as count
    FROM menus
    WHERE path IS NOT NULL
    GROUP BY path
    HAVING COUNT(*) > 1
  `;

  console.log('重复的菜单路径:');
  console.table(duplicates);

  // 查看所有菜单
  const allMenus = await prisma.menu.findMany({
    select: {
      id: true,
      name: true,
      path: true,
      parentId: true,
    },
    orderBy: [{ path: 'asc' }, { parentId: 'asc' }],
  });

  console.log('\n所有菜单:');
  console.table(allMenus);

  await prisma.$disconnect();
}

checkDuplicates().catch(console.error);
