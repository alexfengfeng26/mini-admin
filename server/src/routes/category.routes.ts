import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();
const categoryController = new CategoryController();

// 所有路由都需要认证
router.use(authenticate);

// 获取分类列表
router.get(
  '/',
  requirePermission('category:list'),
  categoryController.findAll
);

// 获取分类树
router.get(
  '/tree',
  requirePermission('category:read'),
  categoryController.findTree
);

// 获取分类详情
router.get(
  '/:id',
  requirePermission('category:read'),
  categoryController.findById
);

// 创建分类
router.post(
  '/',
  requirePermission('category:create'),
  categoryController.create
);

// 更新分类
router.put(
  '/:id',
  requirePermission('category:update'),
  categoryController.update
);

// 删除分类
router.delete(
  '/:id',
  requirePermission('category:delete'),
  categoryController.delete
);

// 更新分类状态
router.patch(
  '/:id/status',
  requirePermission('category:update'),
  categoryController.updateStatus
);

export default router;
