# 🚀 手动部署步骤

## 第一步：创建GitHub仓库

1. 访问 https://github.com
2. 点击右上角的 "+" 号，选择 "New repository"
3. 填写仓库信息：
   - Repository name: `skybrain-drone-platform`
   - Description: `SkyBrain智能无人机管理平台 - 实时风险评估与3D可视化`
   - 选择 "Public"
   - **不要**勾选 "Add a README file"
   - **不要**勾选 "Add .gitignore"
   - **不要**勾选 "Choose a license"
4. 点击 "Create repository"

## 第二步：推送代码到GitHub

创建仓库后，GitHub会显示一个页面，复制 "…or push an existing repository from the command line" 部分的命令。

或者手动执行以下命令（替换 `YOUR_USERNAME` 为你的GitHub用户名）：

```bash
git remote add origin https://github.com/YOUR_USERNAME/skybrain-drone-platform.git
git branch -M main
git push -u origin main
```

## 第三步：部署到Vercel

1. 访问 https://vercel.com
2. 点击 "Continue with GitHub" 登录
3. 点击 "New Project"
4. 在仓库列表中找到 `skybrain-drone-platform`
5. 点击 "Import"
6. 保持默认设置，点击 "Deploy"

## 🎉 完成！

部署成功后，Vercel会提供一个类似这样的URL：
`https://skybrain-drone-platform-xxx.vercel.app`

## 后续更新

每次修改代码后，只需：
```bash
git add .
git commit -m "更新描述"
git push
```

Vercel会自动重新部署！