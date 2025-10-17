# CodeFlow 部署指南

## 系统要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- Git
- 至少 2GB 可用磁盘空间

## 安装步骤

### 1. 克隆项目

```bash
git clone <repository-url>
cd CodeFlow
```

### 2. 安装依赖

```bash
# 安装所有依赖
npm run install:all
```

### 3. 配置环境

复制配置文件：
```bash
cp backend/config.env backend/.env
```

编辑 `backend/.env` 文件：
```env
PORT=3001
NODE_ENV=production
```

### 4. 构建项目

```bash
# 构建前端和后端
npm run build
```

### 5. 启动服务

```bash
# 启动后端服务
cd backend
npm start
```

服务将在 http://localhost:3001 启动

## Docker 部署

### 1. 创建 Dockerfile

```dockerfile
# 后端 Dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制 package.json 和安装依赖
COPY backend/package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY backend/dist ./dist
COPY backend/config.env ./.env

# 安装 Git（用于 nodegit）
RUN apk add --no-cache git

EXPOSE 3001

CMD ["npm", "start"]
```

### 2. 构建和运行

```bash
# 构建镜像
docker build -t codeflow-backend .

# 运行容器
docker run -p 3001:3001 codeflow-backend
```

## 生产环境配置

### 1. 反向代理（Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. 进程管理（PM2）

```bash
# 安装 PM2
npm install -g pm2

# 创建 PM2 配置文件
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'codeflow-backend',
    script: './backend/dist/index.js',
    cwd: './',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
EOF

# 启动应用
pm2 start ecosystem.config.js

# 保存配置
pm2 save
pm2 startup
```

## 监控和日志

### 1. 日志配置

后端使用控制台输出日志，生产环境建议配置日志文件：

```javascript
// 在 backend/src/index.ts 中添加
import fs from 'fs';
import path from 'path';

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 配置日志输出到文件
const logStream = fs.createWriteStream(path.join(logDir, 'app.log'), { flags: 'a' });
console.log = (...args) => {
  logStream.write(new Date().toISOString() + ' ' + args.join(' ') + '\n');
};
```

### 2. 健康检查

系统提供健康检查接口：
```
GET /api/health
```

响应：
```json
{
  "status": "OK",
  "message": "CodeFlow API 服务运行正常"
}
```

## 安全配置

### 1. 环境变量

敏感信息应使用环境变量：
```env
PORT=3001
NODE_ENV=production
DATABASE_PATH=./database.sqlite
TEMP_REPO_PATH=./temp_repos
```

### 2. 防火墙

```bash
# 只允许必要端口
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### 3. HTTPS 配置

使用 Let's Encrypt 免费 SSL 证书：

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 备份和恢复

### 1. 数据库备份

```bash
# 备份 SQLite 数据库
cp backend/database.sqlite backup/database-$(date +%Y%m%d).sqlite

# 定期备份脚本
cat > backup.sh << EOF
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
cp backend/database.sqlite "$BACKUP_DIR/database-$DATE.sqlite"
# 保留最近 30 天的备份
find $BACKUP_DIR -name "database-*.sqlite" -mtime +30 -delete
EOF

chmod +x backup.sh
```

### 2. 恢复数据库

```bash
# 停止服务
pm2 stop codeflow-backend

# 恢复数据库
cp backup/database-20240101.sqlite backend/database.sqlite

# 重启服务
pm2 start codeflow-backend
```

## 性能优化

### 1. 数据库优化

```sql
-- 创建索引
CREATE INDEX idx_reviews_repository_id ON reviews(repository_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_review_reports_review_id ON review_reports(review_id);
```

### 2. 缓存配置

```javascript
// 添加 Redis 缓存（可选）
const redis = require('redis');
const client = redis.createClient();

// 缓存评审报告
const cacheKey = `report:${reviewId}`;
const cachedReport = await client.get(cacheKey);
if (cachedReport) {
  return JSON.parse(cachedReport);
}
```

### 3. 资源限制

```bash
# 限制临时仓库大小
du -sh backend/temp_repos
# 定期清理
find backend/temp_repos -type d -mtime +1 -exec rm -rf {} +
```

## 故障排除

### 1. 服务无法启动

```bash
# 检查端口占用
netstat -tulpn | grep :3001

# 检查日志
pm2 logs codeflow-backend

# 检查进程
pm2 status
```

### 2. Git 操作失败

```bash
# 检查 Git 配置
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 检查网络连接
ping github.com
```

### 3. 内存不足

```bash
# 检查内存使用
free -h
ps aux --sort=-%mem | head

# 增加交换空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 更新和维护

### 1. 更新应用

```bash
# 拉取最新代码
git pull origin main

# 重新安装依赖
npm run install:all

# 重新构建
npm run build

# 重启服务
pm2 restart codeflow-backend
```

### 2. 定期维护

```bash
# 清理临时文件
find backend/temp_repos -type d -mtime +7 -exec rm -rf {} +

# 清理日志文件
find logs -name "*.log" -mtime +30 -delete

# 更新系统包
sudo apt update && sudo apt upgrade
```

## 支持

如遇到问题，请查看：
1. 日志文件
2. 系统资源使用情况
3. 网络连接状态
4. 数据库完整性

更多帮助请参考项目文档或提交 Issue。
