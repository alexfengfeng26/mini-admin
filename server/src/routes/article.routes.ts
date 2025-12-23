import { Router } from 'express';
import { ArticleController } from '../controllers/article.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();
const articleController = new ArticleController();

// 所有路由都需要认证
router.use(authenticate);

// 获取文章列表
router.get(
  '/',
  requirePermission('article:list'),
  articleController.findAll
);

// 搜索文章
router.get(
  '/search',
  requirePermission('article:list'),
  articleController.search
);

// 获取推荐文章
router.get(
  '/featured',
  requirePermission('article:list'),
  articleController.getFeatured
);

// 获取热门文章
router.get(
  '/popular',
  requirePermission('article:list'),
  articleController.getPopular
);

// 获取文章统计
router.get(
  '/stats',
  requirePermission('article:read'),
  articleController.getStats
);

// 根据 slug 获取文章（公开访问，用于前端展示）
router.get(
  '/slug/:slug',
  articleController.findBySlug
);

// 增加浏览次数（公开访问）
router.patch(
  '/:id/view',
  articleController.incrementViewCount
);

// 获取文章详情
router.get(
  '/:id',
  requirePermission('article:read'),
  articleController.findById
);

// 创建文章
router.post(
  '/',
  requirePermission('article:create'),
  articleController.create
);

// 更新文章
router.put(
  '/:id',
  requirePermission('article:update'),
  articleController.update
);

// 更新文章标签
router.put(
  '/:id/tags',
  requirePermission('article:update'),
  articleController.updateTags
);

// 删除文章
router.delete(
  '/:id',
  requirePermission('article:delete'),
  articleController.delete
);

// 批量删除文章
router.delete(
  '/batch',
  requirePermission('article:delete'),
  articleController.deleteMany
);

// 更新文章状态
router.patch(
  '/:id/status',
  requirePermission('article:update'),
  articleController.updateStatus
);

// 批量更新文章状态
router.patch(
  '/batch/status',
  requirePermission('article:update'),
  articleController.updateStatusMany
);

// 切换推荐状态
router.patch(
  '/:id/featured',
  requirePermission('article:update'),
  articleController.toggleFeatured
);

export default router;
