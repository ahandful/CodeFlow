import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../utils/database';
import { Repository } from '../models/types';
import { GitService } from '../services/gitService';

export class RepositoryController {
  // 获取所有仓库
  static async getAllRepositories(req: Request, res: Response) {
    try {
      const repositories = await Database.all('SELECT * FROM repositories ORDER BY created_at DESC');
      res.json({ success: true, data: repositories });
    } catch (error) {
      console.error('获取仓库列表失败:', error);
      res.status(500).json({ success: false, error: '获取仓库列表失败' });
    }
  }

  // 添加新仓库
  static async addRepository(req: Request, res: Response) {
    try {
      const { name, url, description } = req.body;

      if (!name || !url) {
        return res.status(400).json({ 
          success: false, 
          error: '仓库名称和URL是必填项' 
        });
      }

      // 验证Git URL格式
      if (!this.isValidGitUrl(url)) {
        return res.status(400).json({ 
          success: false, 
          error: '无效的Git仓库URL' 
        });
      }

      const id = uuidv4();
      const now = new Date().toISOString();

      await Database.run(
        'INSERT INTO repositories (id, name, url, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, name, url, description || '', now, now]
      );

      const repository = await Database.get('SELECT * FROM repositories WHERE id = ?', [id]);
      res.status(201).json({ success: true, data: repository });
    } catch (error) {
      console.error('添加仓库失败:', error);
      if (error.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ success: false, error: '该仓库URL已存在' });
      } else {
        res.status(500).json({ success: false, error: '添加仓库失败' });
      }
    }
  }

  // 删除仓库
  static async deleteRepository(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // 检查仓库是否存在
      const repository = await Database.get('SELECT * FROM repositories WHERE id = ?', [id]);
      if (!repository) {
        return res.status(404).json({ success: false, error: '仓库不存在' });
      }

      // 删除相关的评审记录
      await Database.run('DELETE FROM review_reports WHERE review_id IN (SELECT id FROM reviews WHERE repository_id = ?)', [id]);
      await Database.run('DELETE FROM reviews WHERE repository_id = ?', [id]);
      
      // 删除仓库
      await Database.run('DELETE FROM repositories WHERE id = ?', [id]);

      res.json({ success: true, message: '仓库删除成功' });
    } catch (error) {
      console.error('删除仓库失败:', error);
      res.status(500).json({ success: false, error: '删除仓库失败' });
    }
  }

  // 获取仓库详情
  static async getRepository(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repository = await Database.get('SELECT * FROM repositories WHERE id = ?', [id]);
      
      if (!repository) {
        return res.status(404).json({ success: false, error: '仓库不存在' });
      }

      res.json({ success: true, data: repository });
    } catch (error) {
      console.error('获取仓库详情失败:', error);
      res.status(500).json({ success: false, error: '获取仓库详情失败' });
    }
  }

  // 验证Git URL格式
  private static isValidGitUrl(url: string): boolean {
    // 支持HTTPS和SSH格式的Git URL
    const httpsPattern = /^https:\/\/github\.com\/[\w\.-]+\/[\w\.-]+\.git$/;
    const sshPattern = /^git@github\.com:[\w\.-]+\/[\w\.-]+\.git$/;
    
    return httpsPattern.test(url) || sshPattern.test(url);
  }
}
