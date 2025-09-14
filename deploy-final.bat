@echo off
echo 🚁 SkyBrain 最终部署脚本
echo.

echo 请输入你的GitHub用户名:
set /p USERNAME=

if "%USERNAME%"=="" (
    echo ❌ 用户名不能为空！
    pause
    exit /b 1
)

echo.
echo 📤 正在配置远程仓库...
git remote remove origin 2>nul
git remote add origin https://github.com/%USERNAME%/skybrain-drone-platform.git

echo.
echo 🚀 正在推送到GitHub...
git branch -M main
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 代码已成功推送到GitHub！
    echo 📋 仓库地址: https://github.com/%USERNAME%/skybrain-drone-platform
    echo.
    echo 🌐 接下来请访问 https://vercel.com 完成部署：
    echo 1. 用GitHub账号登录Vercel
    echo 2. 点击 "New Project"
    echo 3. 选择 "skybrain-drone-platform" 仓库
    echo 4. 点击 "Deploy"
    echo.
    echo 🎉 部署完成后，你将获得一个公开的网站链接！
) else (
    echo.
    echo ❌ 推送失败！可能的原因：
    echo 1. GitHub仓库不存在，请先在GitHub创建仓库
    echo 2. 用户名错误
    echo 3. 没有推送权限
    echo.
    echo 💡 解决方案：
    echo 1. 访问 https://github.com/%USERNAME%/skybrain-drone-platform
    echo 2. 如果仓库不存在，请先创建
    echo 3. 确保仓库名为: skybrain-drone-platform
)

echo.
pause