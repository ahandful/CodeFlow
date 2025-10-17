import { Router } from 'express';
import { RepositoryController } from '../controllers/repositoryController';

const router = Router();

// 获取所有仓库
router.get('/', RepositoryController.getAllRepositories);

// 添加新仓库
router.post('/', RepositoryController.addRepository);

// 获取仓库详情
router.get('/:id', RepositoryController.getRepository);

// 删除仓库
router.delete('/:id', RepositoryController.deleteRepository);

export default router;
