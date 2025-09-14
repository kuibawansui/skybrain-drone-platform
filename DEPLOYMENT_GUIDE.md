# 🚀 SkyBrain 自动部署指南

## 📋 一键部署到 Vercel

### 1. 准备工作
确保你有：
- GitHub 账号
- Vercel 账号（用 GitHub 登录）

### 2. 创建 GitHub 仓库
```bash
# 在项目根目录执行
git init
git add .
git commit -m "🚁 Initial commit: SkyBrain智能无人机管理平台"
git branch -M main
git remote add origin https://github.com/你的用户名/skybrain-drone-platform.git
git push -u origin main
```

### 3. Vercel 自动部署设置

#### 方法一：通过 Vercel 网站（推荐）
1. 访问 [vercel.com](https://vercel.com)
2. 用 GitHub 账号登录
3. 点击 "New Project"
4. 选择你的 `skybrain-drone-platform` 仓库
5. 点击 "Deploy" - Vercel 会自动检测 Next.js 项目

#### 方法二：通过 GitHub Actions（高级）
1. 在 Vercel 获取以下信息：
   - Vercel Token: Settings > Tokens
   - Organization ID: Settings > General
   - Project ID: Project Settings > General

2. 在 GitHub 仓库设置 Secrets：
   - `VERCEL_TOKEN`
   - `ORG_ID` 
   - `PROJECT_ID`

### 4. 验证部署
部署成功后，Vercel 会提供一个 URL，检查：
- ✅ 首页正常加载
- ✅ 3D 可视化正常显示
- ✅ 所有功能正常工作

### 5. 后续更新
每次推送代码到 main 分支，Vercel 会自动重新部署：
```bash
git add .
git commit -m "更新功能"
git push
```

## 🔧 故障排除

### 常见问题
1. **构建失败**：检查 `package.json` 中的依赖
2. **3D 组件不显示**：确保 Three.js 依赖正确安装
3. **路由问题**：检查 Next.js 路由配置

### 构建日志查看
在 Vercel 控制台的 "Functions" 或 "Deployments" 页面查看详细日志。

---
🚁 **SkyBrain智能无人机管理平台** - 现在可以自动部署了！