import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Database } from './utils/database';
import repositoryRoutes from './routes/repositoryRoutes';
import reviewRoutes from './routes/reviewRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 初始化数据库
Database.initialize();

// 路由
app.use('/api/repositories', repositoryRoutes);
app.use('/api/review', reviewRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CodeFlow API 服务运行正常' });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('错误:', err);
  res.status(500).json({ 
    error: '服务器内部错误',
    message: err.message 
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

app.listen(PORT, () => {
  console.log(`🚀 CodeFlow 后端服务启动成功，端口: ${PORT}`);
  console.log(`📊 API文档: http://localhost:${PORT}/api/health`);
});
