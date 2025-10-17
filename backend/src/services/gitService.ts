import * as Git from 'nodegit';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { ReviewData, CommitInfo, FileChange } from '../models/types';

export class GitService {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp_repos');
    this.ensureTempDir();
  }

  private ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async analyzeRepository(repoUrl: string, startDate: string, endDate: string): Promise<ReviewData> {
    const repoPath = await this.cloneRepository(repoUrl);
    
    try {
      const repo = await Git.Repository.open(repoPath);
      const commits = await this.getCommitsInRange(repo, startDate, endDate);
      
      const fileChanges: FileChange[] = [];
      const commitInfos: CommitInfo[] = [];
      
      for (const commit of commits) {
        const commitInfo = await this.analyzeCommit(commit);
        commitInfos.push(commitInfo);
        
        // 获取文件变更
        const changes = await this.getFileChanges(commit);
        fileChanges.push(...changes);
      }

      // 生成汇总数据
      const summary = this.generateSummary(commitInfos, fileChanges);

      return {
        commits: commitInfos,
        file_changes: fileChanges,
        summary
      };
    } finally {
      // 清理临时目录
      await this.cleanupTempRepo(repoPath);
    }
  }

  private async cloneRepository(repoUrl: string): Promise<string> {
    const repoName = this.extractRepoName(repoUrl);
    const localPath = path.join(this.tempDir, repoName);
    
    // 如果目录已存在，先删除
    if (fs.existsSync(localPath)) {
      await this.removeDirectory(localPath);
    }

    try {
      await Git.Clone.clone(repoUrl, localPath, {
        checkoutBranch: 'main',
        fetchOpts: {
          callbacks: {
            credentials: () => Git.Cred.userpassPlaintextNew('', ''),
            certificateCheck: () => 1
          }
        }
      });
    } catch (error) {
      // 如果main分支不存在，尝试master分支
      try {
        await Git.Clone.clone(repoUrl, localPath, {
          checkoutBranch: 'master',
          fetchOpts: {
            callbacks: {
              credentials: () => Git.Cred.userpassPlaintextNew('', ''),
              certificateCheck: () => 1
            }
          }
        });
      } catch (masterError) {
        throw new Error(`克隆仓库失败: ${error.message}`);
      }
    }

    return localPath;
  }

  private async getCommitsInRange(repo: Git.Repository, startDate: string, endDate: string): Promise<Git.Commit[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const walker = repo.createRevWalk();
    walker.pushHead();
    
    const commits: Git.Commit[] = [];
    const commitOids = await walker.getCommits(1000); // 限制数量避免内存问题
    
    for (const oid of commitOids) {
      const commit = await repo.getCommit(oid);
      const commitDate = commit.date();
      
      if (commitDate >= start && commitDate <= end) {
        commits.push(commit);
      }
    }
    
    return commits;
  }

  private async analyzeCommit(commit: Git.Commit): Promise<CommitInfo> {
    const author = commit.author();
    const diff = await commit.getDiff();
    
    let filesChanged = 0;
    let linesAdded = 0;
    let linesDeleted = 0;
    
    for (let i = 0; i < diff.length; i++) {
      const patch = await diff.patch(i);
      filesChanged++;
      
      const stats = patch.stats();
      linesAdded += stats.insertions();
      linesDeleted += stats.deletions();
    }

    return {
      hash: commit.sha().substr(0, 8),
      author: author.name(),
      email: author.email(),
      date: commit.date().toISOString(),
      message: commit.message().trim(),
      files_changed: filesChanged,
      lines_added: linesAdded,
      lines_deleted: linesDeleted
    };
  }

  private async getFileChanges(commit: Git.Commit): Promise<FileChange[]> {
    const diff = await commit.getDiff();
    const fileChanges: FileChange[] = [];
    
    for (let i = 0; i < diff.length; i++) {
      const patch = await diff.patch(i);
      const deltas = await diff.deltas();
      const delta = deltas[i];
      
      const stats = patch.stats();
      const status = this.mapFileStatus(delta.status());
      
      fileChanges.push({
        file_path: delta.newFile().path(),
        status,
        lines_added: stats.insertions(),
        lines_deleted: stats.deletions()
      });
    }
    
    return fileChanges;
  }

  private mapFileStatus(status: Git.Delta.Type): 'added' | 'modified' | 'deleted' | 'renamed' {
    switch (status) {
      case Git.Delta.Type.ADDED:
        return 'added';
      case Git.Delta.Type.DELETED:
        return 'deleted';
      case Git.Delta.Type.RENAMED:
        return 'renamed';
      default:
        return 'modified';
    }
  }

  private generateSummary(commits: CommitInfo[], fileChanges: FileChange[]) {
    const totalCommits = commits.length;
    const totalFilesChanged = new Set(fileChanges.map(f => f.file_path)).size;
    const totalLinesAdded = commits.reduce((sum, c) => sum + c.lines_added, 0);
    const totalLinesDeleted = commits.reduce((sum, c) => sum + c.lines_deleted, 0);
    const contributors = [...new Set(commits.map(c => c.author))];

    return {
      total_commits: totalCommits,
      total_files_changed: totalFilesChanged,
      total_lines_added: totalLinesAdded,
      total_lines_deleted: totalLinesDeleted,
      contributors
    };
  }

  private extractRepoName(repoUrl: string): string {
    const match = repoUrl.match(/\/([^\/]+)\.git$/);
    return match ? match[1] : `repo_${Date.now()}`;
  }

  private async removeDirectory(dirPath: string): Promise<void> {
    const removeDir = promisify(fs.rm);
    try {
      await removeDir(dirPath, { recursive: true, force: true });
    } catch (error) {
      console.warn(`清理目录失败: ${dirPath}`, error);
    }
  }

  private async cleanupTempRepo(repoPath: string): Promise<void> {
    await this.removeDirectory(repoPath);
  }
}
