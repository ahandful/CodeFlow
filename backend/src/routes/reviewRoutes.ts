import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';

const router = Router();

// 获取所有评审
router.get('/', ReviewController.getAllReviews);

// 创建代码评审
router.post('/', ReviewController.createReview);

// 获取评审详情
router.get('/:id', ReviewController.getReview);

// 生成评审报告
router.post('/:id/report', ReviewController.generateReport);

// 获取评审报告
router.get('/:id/report', ReviewController.getReport);

export default router;
