import { Router } from 'express';
import { TagController } from '../controllers/tag.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();
const tagController = new TagController();

// 所有路由都需要认证
router.use(authenticate);

// 获取标签列表
router.get(
  '/',
  requirePermission('tag:list'),
  tagController.findAll
);

// 批量创建或获取标签
router.post(
  '/find-or-create',
  requirePermission('tag:create'),
  tagController.findOrCreate
);

// 获取标签详情
router.get(
  '/:id',
  requirePermission('tag:read'),
  tagController.findById
);

// 创建标签
router.post(
  '/',
  requirePermission('tag:create'),
  tagController.create
);

// 更新标签
router.put(
  '/:id',
  requirePermission('tag:update'),
  tagController.update
);

// 删除标签
router.delete(
  '/:id',
  requirePermission('tag:delete'),
  tagController.delete
);

export default router;
