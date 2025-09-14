# 🚁 SkyBrain 智能无人机管理平台

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/你的用户名/skybrain-drone-platform)

## 🌟 项目简介

SkyBrain是一个基于Next.js和Three.js构建的智能无人机管理平台，提供：

- 🎯 **实时3D可视化** - 基于Three.js的沉浸式3D场景
- 🛣️ **智能路径规划** - A*算法优化的飞行路径
- ⚠️ **风险评估系统** - 实时环境风险分析
- 📊 **数据可视化** - 丰富的图表和统计信息
- 🌦️ **气象数据集成** - 实时天气信息

## 🚀 快速开始

### 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 一键部署到Vercel
1. Fork 这个仓库
2. 在 [Vercel](https://vercel.com) 导入项目
3. 点击部署 - 就这么简单！

## 🛠️ 技术栈

- **前端框架**: Next.js 14
- **3D渲染**: Three.js + React Three Fiber
- **UI组件**: Ant Design
- **类型检查**: TypeScript
- **样式**: CSS Modules
- **部署**: Vercel

## 📁 项目结构

```
src/
├── app/                 # Next.js App Router
├── components/          # React组件
│   └── 3D/             # 3D可视化组件
├── algorithms/          # 算法实现
├── hooks/              # 自定义Hooks
├── services/           # API服务
├── store/              # 状态管理
└── types/              # TypeScript类型定义
```

## 🎮 功能特性

### 3D可视化
- 实时无人机位置追踪
- 动态飞行路径显示
- 交互式3D场景控制

### 智能调度
- 多机协同路径规划
- 避障算法优化
- 实时任务分配

### 风险管控
- 环境风险评估
- 飞行安全监控
- 异常情况预警

## 📈 演示数据

项目包含完整的演示数据，展示：
- 5架无人机的协同作业
- 城市环境下的物流配送
- 实时风险评估和路径调整

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

---

🚁 **让无人机管理更智能** - SkyBrain Team