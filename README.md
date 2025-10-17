# CodeFlow - 代码仓库管理和评审系统

## 项目简介

CodeFlow 是一个支持Git仓库管理和代码评审的Web应用系统。用户可以添加Git仓库，选择时间区间进行代码评审，生成详细的评审报告。

## 功能特性

- 🗂️ **仓库管理**：添加、删除、查看Git仓库
- 📊 **代码评审**：选择时间区间，生成代码变更评审报告
- 🔍 **提交分析**：分析提交记录、文件变更、代码统计
- 📈 **可视化报告**：生成直观的评审报告和图表
- 🎨 **现代UI**：响应式设计，用户体验友好

## 技术栈

### 后端
- Node.js + Express
- TypeScript
- SQLite 数据库
- nodegit (Git操作)
- CORS 支持

### 前端
- React 18
- TypeScript
- Vite
- Ant Design
- Chart.js (图表)
- Axios (HTTP客户端)

## 项目结构

```
CodeFlow/
├── backend/          # 后端服务
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
├── frontend/         # 前端应用
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
├── package.json      # 根项目配置
└── README.md
```

## 快速开始

### 1. 安装依赖
```bash
npm run install:all
```

### 2. 启动开发服务器
```bash
npm run dev
```

这将同时启动后端服务（端口3001）和前端开发服务器（端口3000）。

### 3. 访问应用
打开浏览器访问：http://localhost:3000

## API 接口

### 仓库管理
- `GET /api/repositories` - 获取所有仓库
- `POST /api/repositories` - 添加新仓库
- `DELETE /api/repositories/:id` - 删除仓库

### 代码评审
- `POST /api/review` - 创建代码评审
- `GET /api/review/:id` - 获取评审详情
- `GET /api/review/:id/report` - 生成评审报告

## 开发说明

### 后端开发
```bash
cd backend
npm run dev
```

### 前端开发
```bash
cd frontend
npm run dev
```

## 许可证

MIT License
