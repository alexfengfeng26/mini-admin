import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();
const roleController = new RoleController();

// 所有路由都需要认证
router.use(authenticate);

// 获取角色列表
router.get(
  '/',
  requirePermission('role:list'),
  roleController.findAll
);

// 获取角色详情
router.get(
  '/:id',
  requirePermission('role:read'),
  roleController.findById
);

// 创建角色
router.post(
  '/',
  requirePermission('role:create'),
  roleController.create
);

// 更新角色
router.put(
  '/:id',
  requirePermission('role:update'),
  roleController.update
);

// 删除角色
router.delete(
  '/:id',
  requirePermission('role:delete'),
  roleController.delete
);

// 获取角色的菜单权限
router.get(
  '/:id/menus',
  requirePermission('role:read'),
  roleController.getRoleMenus
);

// 更新角色的菜单权限
router.put(
  '/:id/menus',
  requirePermission('role:update'),
  roleController.updateRoleMenus
);

export default router;
