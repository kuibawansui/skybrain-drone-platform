@echo off
chcp 65001 >nul
echo SkyBrain Deployment Script
echo.

echo Configuring remote repository for user: ty477
git remote remove origin 2>nul
git remote add origin https://github.com/ty477/skybrain-drone-platform.git

echo.
echo Pushing to GitHub...
git branch -M main
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS! Code pushed to GitHub!
    echo Repository: https://github.com/ty477/skybrain-drone-platform
    echo.
    echo Next steps:
    echo 1. Visit https://vercel.com
    echo 2. Login with GitHub
    echo 3. Click "New Project"
    echo 4. Select "skybrain-drone-platform"
    echo 5. Click "Deploy"
    echo.
    echo You will get a public website URL after deployment!
) else (
    echo.
    echo FAILED! Possible reasons:
    echo 1. Repository does not exist on GitHub
    echo 2. No push permission
    echo 3. Network issue
    echo.
    echo Solution:
    echo 1. Create repository at: https://github.com/ty477/skybrain-drone-platform
    echo 2. Make sure repository name is: skybrain-drone-platform
    echo 3. Set repository as Public
)

echo.
pause