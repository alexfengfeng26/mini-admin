import { Router } from 'express';
import { MenuController } from '../controllers/menu.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();
const menuController = new MenuController();

// 所有路由都需要认证
router.use(authenticate);

// 获取菜单树（需要菜单查看权限）
router.get(
  '/tree',
  requirePermission('menu:list'),
  menuController.findTree
);

// 获取用户菜单（自动获取当前用户的菜单）
router.get(
  '/user',
  menuController.getUserMenus
);

// 获取菜单列表
router.get(
  '/',
  requirePermission('menu:list'),
  menuController.findAll
);

// 获取菜单详情
router.get(
  '/:id',
  requirePermission('menu:read'),
  menuController.findById
);

// 创建菜单
router.post(
  '/',
  requirePermission('menu:create'),
  menuController.create
);

// 更新菜单
router.put(
  '/:id',
  requirePermission('menu:update'),
  menuController.update
);

// 删除菜单
router.delete(
  '/:id',
  requirePermission('menu:delete'),
  menuController.delete
);

export default router;
