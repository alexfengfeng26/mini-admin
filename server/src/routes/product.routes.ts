import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();
const productController = new ProductController();

// 所有路由都需要认证
router.use(authenticate);

// 获取产品列表
router.get(
  '/',
  requirePermission('product:list'),
  productController.findAll
);

// 搜索产品
router.get(
  '/search',
  requirePermission('product:list'),
  productController.search
);

// 获取热门产品
router.get(
  '/popular',
  requirePermission('product:list'),
  productController.getPopular
);

// 获取产品统计
router.get(
  '/stats',
  requirePermission('product:read'),
  productController.getStats
);

// 根据 slug 获取产品（公开访问，用于前端展示）
router.get(
  '/slug/:slug',
  productController.findBySlug
);

// 增加浏览次数（公开访问）
router.patch(
  '/:id/view',
  productController.incrementViewCount
);

// 获取产品详情
router.get(
  '/:id',
  requirePermission('product:read'),
  productController.findById
);

// 创建产品
router.post(
  '/',
  requirePermission('product:create'),
  productController.create
);

// 更新产品
router.put(
  '/:id',
  requirePermission('product:update'),
  productController.update
);

// 删除产品
router.delete(
  '/:id',
  requirePermission('product:delete'),
  productController.delete
);

// 批量删除产品
router.delete(
  '/batch',
  requirePermission('product:delete'),
  productController.deleteMany
);

// 更新产品状态
router.patch(
  '/:id/status',
  requirePermission('product:update'),
  productController.updateStatus
);

// 批量更新产品状态
router.patch(
  '/batch/status',
  requirePermission('product:update'),
  productController.updateStatusMany
);

export default router;
