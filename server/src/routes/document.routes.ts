import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();
const documentController = new DocumentController();

// 所有路由都需要认证
router.use(authenticate);

// 获取文档列表
router.get(
  '/',
  requirePermission('document:list'),
  documentController.findAll
);

// 搜索文档
router.get(
  '/search',
  requirePermission('document:list'),
  documentController.search
);

// 获取文档统计
router.get(
  '/stats',
  requirePermission('document:read'),
  documentController.getStats
);

// 根据 slug 获取文档（公开访问，用于前端展示）
router.get(
  '/slug/:slug',
  documentController.findBySlug
);

// 增加浏览次数（公开访问）
router.patch(
  '/:id/view',
  documentController.incrementViewCount
);

// 增加下载次数（公开访问）
router.patch(
  '/:id/download',
  documentController.incrementDownloadCount
);

// 获取文档详情
router.get(
  '/:id',
  requirePermission('document:read'),
  documentController.findById
);

// 创建文档
router.post(
  '/',
  requirePermission('document:create'),
  documentController.create
);

// 更新文档
router.put(
  '/:id',
  requirePermission('document:update'),
  documentController.update
);

// 删除文档
router.delete(
  '/:id',
  requirePermission('document:delete'),
  documentController.delete
);

// 批量删除文档
router.delete(
  '/batch',
  requirePermission('document:delete'),
  documentController.deleteMany
);

// 更新文档状态
router.patch(
  '/:id/status',
  requirePermission('document:update'),
  documentController.updateStatus
);

// 批量更新文档状态
router.patch(
  '/batch/status',
  requirePermission('document:update'),
  documentController.updateStatusMany
);

export default router;
