import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../utils/database';
import { Review, ReviewData } from '../models/types';
import { GitService } from '../services/gitService';

export class ReviewController {
  // 创建代码评审
  static async createReview(req: Request, res: Response) {
    try {
      const { repository_id, start_date, end_date } = req.body;

      if (!repository_id || !start_date || !end_date) {
        return res.status(400).json({ 
          success: false, 
          error: '仓库ID、开始时间和结束时间是必填项' 
        });
      }

      // 验证日期格式
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ 
          success: false, 
          error: '无效的日期格式' 
        });
      }

      if (startDate >= endDate) {
        return res.status(400).json({ 
          success: false, 
          error: '开始时间必须早于结束时间' 
        });
      }

      // 检查仓库是否存在
      const repository = await Database.get('SELECT * FROM repositories WHERE id = ?', [repository_id]);
      if (!repository) {
        return res.status(404).json({ success: false, error: '仓库不存在' });
      }

      const id = uuidv4();
      const now = new Date().toISOString();

      await Database.run(
        'INSERT INTO reviews (id, repository_id, start_date, end_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, repository_id, start_date, end_date, 'pending', now]
      );

      const review = await Database.get('SELECT * FROM reviews WHERE id = ?', [id]);
      res.status(201).json({ success: true, data: review });
    } catch (error) {
      console.error('创建评审失败:', error);
      res.status(500).json({ success: false, error: '创建评审失败' });
    }
  }

  // 获取评审详情
  static async getReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const review = await Database.get('SELECT * FROM reviews WHERE id = ?', [id]);
      
      if (!review) {
        return res.status(404).json({ success: false, error: '评审不存在' });
      }

      res.json({ success: true, data: review });
    } catch (error) {
      console.error('获取评审详情失败:', error);
      res.status(500).json({ success: false, error: '获取评审详情失败' });
    }
  }

  // 生成评审报告
  static async generateReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // 获取评审信息
      const review = await Database.get('SELECT * FROM reviews WHERE id = ?', [id]);
      if (!review) {
        return res.status(404).json({ success: false, error: '评审不存在' });
      }

      // 获取仓库信息
      const repository = await Database.get('SELECT * FROM repositories WHERE id = ?', [review.repository_id]);
      if (!repository) {
        return res.status(404).json({ success: false, error: '仓库不存在' });
      }

      // 更新状态为处理中
      await Database.run('UPDATE reviews SET status = ? WHERE id = ?', ['processing', id]);

      try {
        // 使用Git服务分析代码
        const gitService = new GitService();
        const reviewData = await gitService.analyzeRepository(
          repository.url,
          review.start_date,
          review.end_date
        );

        // 保存报告数据
        const reportId = uuidv4();
        await Database.run(
          'INSERT INTO review_reports (id, review_id, total_commits, total_files_changed, total_lines_added, total_lines_deleted, report_data) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            reportId,
            id,
            reviewData.summary.total_commits,
            reviewData.summary.total_files_changed,
            reviewData.summary.total_lines_added,
            reviewData.summary.total_lines_deleted,
            JSON.stringify(reviewData)
          ]
        );

        // 更新评审状态为完成
        await Database.run('UPDATE reviews SET status = ? WHERE id = ?', ['completed', id]);

        res.json({ 
          success: true, 
          data: {
            review_id: id,
            report_id: reportId,
            ...reviewData
          }
        });
      } catch (gitError) {
        // 更新状态为失败
        await Database.run('UPDATE reviews SET status = ? WHERE id = ?', ['failed', id]);
        throw gitError;
      }
    } catch (error) {
      console.error('生成评审报告失败:', error);
      res.status(500).json({ 
        success: false, 
        error: '生成评审报告失败',
        details: error.message 
      });
    }
  }

  // 获取评审报告
  static async getReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const report = await Database.get(
        'SELECT rr.*, r.repository_id, r.start_date, r.end_date, r.status FROM review_reports rr JOIN reviews r ON rr.review_id = r.id WHERE rr.review_id = ?',
        [id]
      );
      
      if (!report) {
        return res.status(404).json({ success: false, error: '报告不存在' });
      }

      const reportData = JSON.parse(report.report_data);
      res.json({ 
        success: true, 
        data: {
          ...report,
          report_data: reportData
        }
      });
    } catch (error) {
      console.error('获取评审报告失败:', error);
      res.status(500).json({ success: false, error: '获取评审报告失败' });
    }
  }

  // 获取所有评审
  static async getAllReviews(req: Request, res: Response) {
    try {
      const reviews = await Database.all(`
        SELECT r.*, repo.name as repository_name, repo.url as repository_url 
        FROM reviews r 
        JOIN repositories repo ON r.repository_id = repo.id 
        ORDER BY r.created_at DESC
      `);
      
      res.json({ success: true, data: reviews });
    } catch (error) {
      console.error('获取评审列表失败:', error);
      res.status(500).json({ success: false, error: '获取评审列表失败' });
    }
  }
}
