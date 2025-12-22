import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { requestLogger, corsHandler } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// 加载环境变量
dotenv.config();

const app = express();

// 中间件
app.use(corsHandler);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// 路由
app.use('/api', routes);

// 404处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

export default app;
