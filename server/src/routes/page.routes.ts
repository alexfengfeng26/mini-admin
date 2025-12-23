import { Router } from 'express';
import { PageController } from '../controllers/page.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();
const pageController = new PageController();

// 所有路由都需要认证
router.use(authenticate);

// 获取页面列表
router.get(
  '/',
  requirePermission('page:list'),
  pageController.findAll
);

// 搜索页面
router.get(
  '/search',
  requirePermission('page:list'),
  pageController.search
);

// 获取页面统计
router.get(
  '/stats',
  requirePermission('page:read'),
  pageController.getStats
);

// 根据 slug 获取页面（公开访问，用于前端展示）
router.get(
  '/slug/:slug',
  pageController.findBySlug
);

// 获取页面详情
router.get(
  '/:id',
  requirePermission('page:read'),
  pageController.findById
);

// 创建页面
router.post(
  '/',
  requirePermission('page:create'),
  pageController.create
);

// 更新页面
router.put(
  '/:id',
  requirePermission('page:update'),
  pageController.update
);

// 删除页面
router.delete(
  '/:id',
  requirePermission('page:delete'),
  pageController.delete
);

// 批量删除页面
router.delete(
  '/batch',
  requirePermission('page:delete'),
  pageController.deleteMany
);

// 更新页面状态
router.patch(
  '/:id/status',
  requirePermission('page:update'),
  pageController.updateStatus
);

// 批量更新页面状态
router.patch(
  '/batch/status',
  requirePermission('page:update'),
  pageController.updateStatusMany
);

export default router;
