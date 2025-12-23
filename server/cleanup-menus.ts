/**
 * 清理重复的CMS菜单
 * 删除所有ID >= 17的菜单（这些是重复的CMS菜单）
 * 保留系统管理菜单（ID 1-16）
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicateMenus() {
  console.log('========================================');
  console.log('开始清理重复的CMS菜单...');
  console.log('========================================');

  try {
    // 删除角色-菜单关联（CMS菜单的关联）
    const deletedRoleMenus = await prisma.roleMenu.deleteMany({
      where: {
        menuId: {
          gte: 17, // 删除ID >= 17的菜单关联
        },
      },
    });
    console.log(`✅ 删除了 ${deletedRoleMenus.count} 条角色-菜单关联`);

    // 删除重复的CMS菜单
    const deletedMenus = await prisma.menu.deleteMany({
      where: {
        id: {
          gte: 17, // 删除ID >= 17的菜单
        },
      },
    });
    console.log(`✅ 删除了 ${deletedMenus.count} 条重复菜单`);

    // 统计剩余菜单
    const remainingMenus = await prisma.menu.count();
    console.log(`\n📊 剩余菜单数: ${remainingMenus} 条（系统管理菜单）`);

    console.log('========================================');
    console.log('✅ 清理完成！');
    console.log('========================================');
    console.log('💡 下一步：运行 npm run seed 重新创建菜单');

  } catch (error) {
    console.error('❌ 清理失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateMenus();
