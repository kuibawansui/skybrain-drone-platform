# 🔧 GitHub连接问题解决方案

## 问题诊断
错误：`Failed to connect to github.com port 443`

## 解决方案

### 方案1：检查防火墙/代理
```bash
# 检查是否能访问GitHub
ping github.com

# 检查DNS解析
nslookup github.com
```

### 方案2：使用SSH代替HTTPS
```bash
# 生成SSH密钥（如果没有）
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 添加SSH密钥到GitHub
# 复制公钥内容：
cat ~/.ssh/id_rsa.pub

# 然后在GitHub Settings > SSH Keys 中添加
```

### 方案3：配置Git使用SSH
```bash
# 移除HTTPS远程仓库
git remote remove origin

# 添加SSH远程仓库
git remote add origin git@github.com:ty477/skybrain-drone-platform.git

# 推送代码
git push -u origin main
```

### 方案4：使用GitHub Desktop
1. 下载GitHub Desktop：https://desktop.github.com/
2. 登录GitHub账号
3. 创建新仓库：skybrain-drone-platform
4. 将项目文件夹添加到GitHub Desktop
5. 提交并推送

### 方案5：直接上传到GitHub网页
1. 在GitHub创建空仓库
2. 点击"uploading an existing file"
3. 将项目文件拖拽上传
4. 提交更改

## 推荐顺序
1. 先尝试方案3（SSH）
2. 如果不行，使用方案4（GitHub Desktop）
3. 最后使用方案5（网页上传）