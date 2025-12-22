import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import roleRoutes from './role.routes';
import menuRoutes from './menu.routes';

const router = Router();

// API路由
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/menus', menuRoutes);

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: null,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
