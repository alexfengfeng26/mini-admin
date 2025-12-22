import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { validateInput, userValidationSchema } from '../middleware/validation';

const router = Router();
const userController = new UserController();

// 所有路由都需要认证
router.use(authenticate);

// 获取用户列表
router.get(
  '/',
  requirePermission('user:list'),
  userController.findAll
);

// 获取用户详情
router.get(
  '/:id',
  requirePermission('user:read'),
  userController.findById
);

// 创建用户
router.post(
  '/',
  requirePermission('user:create'),
  validateInput(userValidationSchema),
  userController.create
);

// 更新用户
router.put(
  '/:id',
  requirePermission('user:update'),
  validateInput(userValidationSchema),
  userController.update
);

// 删除用户
router.delete(
  '/:id',
  requirePermission('user:delete'),
  userController.delete
);

// 更新用户状态
router.patch(
  '/:id/status',
  requirePermission('user:update'),
  userController.updateStatus
);

export default router;
