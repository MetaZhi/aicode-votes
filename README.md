# 主播建议系统

这是一个让用户给主播提建议并投票的网站。

## 部署到Vercel的步骤

### 1. 准备MongoDB数据库

1. 注册并登录[MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. 创建一个新的集群（可以选择免费的共享集群）
3. 在「Security」→「Database Access」中创建一个数据库用户
4. 在「Security」→「Network Access」中添加IP地址（可以选择允许所有IP地址 0.0.0.0/0）
5. 在「Databases」→「Connect」中获取MongoDB连接字符串，格式如下：
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
   ```

### 2. 创建GitHub仓库

1. 在GitHub上创建一个新的仓库
2. 将本地代码推送到GitHub仓库：
   ```bash
   git init
   git add .
   git commit -m "初始提交"
   git branch -M main
   git remote add origin https://github.com/你的用户名/你的仓库名.git
   git push -u origin main
   ```

### 3. 在Vercel上部署

1. 注册并登录[Vercel](https://vercel.com/signup)
2. 点击「New Project」
3. 导入你的GitHub仓库
4. 在「Environment Variables」部分添加以下环境变量：
   - `MONGO_URI`：你的MongoDB Atlas连接字符串
   - `NODE_ENV`：production
5. 点击「Deploy」按钮

### 4. 验证部署

部署完成后，Vercel会提供一个域名（例如：your-app.vercel.app）。访问该域名，确认应用是否正常运行。

## 本地开发

1. 安装依赖：
   ```bash
   npm install
   npm run install-client
   ```

2. 运行开发服务器：
   ```bash
   npm run dev-full
   ```

## 项目结构

- `/client`：React前端应用
- `/models`：MongoDB数据模型
- `server.js`：Express后端服务器
- `vercel.json`：Vercel部署配置