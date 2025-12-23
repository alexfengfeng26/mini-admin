import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import roleRoutes from './role.routes';
import menuRoutes from './menu.routes';
import articleRoutes from './article.routes';
import pageRoutes from './page.routes';
import productRoutes from './product.routes';
import documentRoutes from './document.routes';
import categoryRoutes from './category.routes';
import tagRoutes from './tag.routes';

const router = Router();

// API路由
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/menus', menuRoutes);
router.use('/categories', categoryRoutes);
router.use('/tags', tagRoutes);
router.use('/articles', articleRoutes);
router.use('/pages', pageRoutes);
router.use('/products', productRoutes);
router.use('/documents', documentRoutes);

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
