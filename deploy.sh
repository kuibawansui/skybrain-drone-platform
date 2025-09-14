#!/bin/bash

echo "🚁 SkyBrain 自动部署脚本"
echo

echo "📋 检查项目状态..."
if [ ! -d ".git" ]; then
    echo "❌ Git仓库未初始化，正在初始化..."
    git init
    git add .
    git commit -m "🚁 Initial commit: SkyBrain智能无人机管理平台"
fi

echo
echo "🔗 请输入你的GitHub仓库地址 (例如: https://github.com/username/skybrain-drone-platform.git):"
read REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ 仓库地址不能为空！"
    exit 1
fi

echo
echo "📤 添加远程仓库..."
git remote remove origin 2>/dev/null
git remote add origin "$REPO_URL"

echo
echo "🚀 推送到GitHub..."
git branch -M main
git push -u origin main

echo
echo "✅ 代码已成功推送到GitHub！"
echo
echo "📋 接下来的步骤："
echo "1. 访问 https://vercel.com"
echo "2. 用GitHub账号登录"
echo "3. 点击 'New Project'"
echo "4. 选择你的仓库"
echo "5. 点击 'Deploy'"
echo
echo "🎉 部署完成后，Vercel会提供访问链接！"