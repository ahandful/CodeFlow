# CodeFlow 开发指南

## 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- Git

## 快速开始

### 1. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装所有子项目依赖
npm run install:all
```

### 2. 启动开发服务器

```bash
# 同时启动前端和后端
npm run dev

# 或者分别启动
npm run dev:backend  # 后端服务 (端口 3001)
npm run dev:frontend # 前端服务 (端口 3000)
```

### 3. 访问应用

- 前端界面: http://localhost:3000
- 后端API: http://localhost:3001
- API健康检查: http://localhost:3001/api/health

## 项目结构

```
CodeFlow/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由
│   │   ├── services/       # 业务服务
│   │   └── utils/          # 工具类
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── pages/          # 页面
│   │   ├── services/       # API服务
│   │   ├── types/          # 类型定义
│   │   └── utils/          # 工具类
│   ├── package.json
│   └── vite.config.ts
├── package.json            # 根项目配置
└── README.md
```

## API 接口文档

### 仓库管理

#### 获取所有仓库
```
GET /api/repositories
```

#### 添加仓库
```
POST /api/repositories
Content-Type: application/json

{
  "name": "仓库名称",
  "url": "https://github.com/user/repo.git",
  "description": "仓库描述（可选）"
}
```

#### 删除仓库
```
DELETE /api/repositories/:id
```

#### 获取仓库详情
```
GET /api/repositories/:id
```

### 代码评审

#### 获取所有评审
```
GET /api/review
```

#### 创建评审
```
POST /api/review
Content-Type: application/json

{
  "repository_id": "仓库ID",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}
```

#### 生成评审报告
```
POST /api/review/:id/report
```

#### 获取评审报告
```
GET /api/review/:id/report
```

## 数据库

项目使用SQLite数据库，数据库文件会自动创建在 `backend/database.sqlite`。

### 表结构

#### repositories 表
- id: 主键
- name: 仓库名称
- url: 仓库URL
- description: 描述
- created_at: 创建时间
- updated_at: 更新时间

#### reviews 表
- id: 主键
- repository_id: 仓库ID（外键）
- start_date: 开始日期
- end_date: 结束日期
- status: 状态（pending/processing/completed/failed）
- created_at: 创建时间

#### review_reports 表
- id: 主键
- review_id: 评审ID（外键）
- total_commits: 总提交数
- total_files_changed: 总文件变更数
- total_lines_added: 总新增行数
- total_lines_deleted: 总删除行数
- report_data: 报告数据（JSON）
- created_at: 创建时间

## 开发说明

### 后端开发

后端使用 Node.js + Express + TypeScript 开发。

主要特性：
- RESTful API 设计
- SQLite 数据库
- Git 仓库克隆和分析
- 错误处理和日志记录

### 前端开发

前端使用 React + TypeScript + Vite + Ant Design 开发。

主要特性：
- 响应式设计
- 组件化开发
- 图表可视化
- 现代化UI

### Git 操作

系统使用 `nodegit` 库进行 Git 操作：
- 克隆远程仓库
- 分析提交记录
- 统计代码变更
- 生成评审报告

## 部署

### 开发环境
```bash
npm run dev
```

### 生产环境
```bash
# 构建项目
npm run build

# 启动生产服务
cd backend && npm start
```

## 故障排除

### 常见问题

1. **Git 克隆失败**
   - 检查网络连接
   - 确认仓库URL正确
   - 检查仓库访问权限

2. **端口占用**
   - 后端默认端口 3001
   - 前端默认端口 3000
   - 可在配置文件中修改

3. **依赖安装失败**
   - 使用 npm 而不是 yarn
   - 清除缓存: `npm cache clean --force`
   - 删除 node_modules 重新安装

### 日志查看

后端日志会输出到控制台，包括：
- API 请求日志
- 错误信息
- Git 操作状态

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
