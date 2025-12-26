# Mini Link 🔗

[English](#english) | [中文说明](#中文说明)

---

<a name="english"></a>
## English

A minimalist, serverless URL shortener built on **Cloudflare Workers** & **KV**.  
Designed for speed, simplicity, and zero maintenance.

### Features
- 🚀 **Serverless**: Zero maintenance, runs on Cloudflare Edge global network.
- ⚡ **Blazing Fast**: Uses KV Metadata strategy for O(1) redirects and fast listing.
- 🛡️ **Smart Throttling**: Built-in daily quota (default 200/day) to protect your account's free tier limits.
- 🔐 **Admin Panel**: Secure management interface to custom create, list, and delete links.
- 📦 **One-File Deploy**: No build steps, no complex framework.

### One-Click Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/YOUR_USERNAME/mini-link)

> **Note**: Please **Fork** this repository to your GitHub account first, then click the button above!

### Configuration

After deployment, you need to configure a few things in the Cloudflare Dashboard:

1.  **KV Namespace**:
    *   Go to **Workers & Pages** -> Your Worker -> **Settings** -> **Variables**.
    *   Find **KV Namespace Bindings**.
    *   Bind a namespace to the variable name `LINKS`. (Create a new one if needed).

2.  **Environment Variables**:
    *   `SECRET_TOKEN`: **Required**. A secure string for accessing the admin panel (e.g., `my_secret_password`).
    *   `DAILY_QUOTA`: *Optional*. Usage limit per day. Default is `50` (conservatively set to share the 1000/day free limit with your other projects). You can increase this to `200` or more if dedicated.

### Usage

- **Public**: Visit `https://your-worker.workers.dev` to generate random short links.
- **Admin**: Visit `https://your-worker.workers.dev/#admin`.
    - It will prompt for your `SECRET_TOKEN`.
    - Once logged in, you can view all links, delete them, or create custom slugs (e.g., `mysite`).

---

<a name="中文说明"></a>
## 中文说明

一个基于 **Cloudflare Workers** 和 **KV** 构建的极简 Serverless 短链接生成器。
专为速度、简洁和零运维而设计。

### 功能特性
- 🚀 **无服务器架构**: 零运维成本，运行在 Cloudflare 全球边缘节点。
- ⚡ **极速响应**: 使用 KV Metadata 技术，重定向延迟极低 (<10ms)。
- 🛡️ **智能限流**: 内置每日配额控制（默认 200次/天），保护您账户的免费额度不被耗尽。
- 🔐 **管理后台**: 内置安全的管理界面，支持查看列表、删除、自定义短码。
- 📦 **单文件架构**: 无构建步骤，无复杂框架，代码即文档。

### 一键部署

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/YOUR_USERNAME/mini-link)

> **注意**: 请先 **Fork** 本仓库到您的 GitHub 账号，然后再点击上面的部署按钮！

### 配置指南

部署完成后，您需要在 Cloudflare 后台进行简单配置：

1.  **绑定 KV 数据库**:
    *   进入 **Workers & Pages** -> 选择你的 Worker -> **设置 (Settings)** -> **变量 (Variables)**。
    *   找到 **KV 命名空间绑定 (KV Namespace Bindings)**。
    *   添加一个绑定：变量名为 `LINKS`，并选择一个 KV 空间（如果没有请新建一个）。

2.  **环境变量 (Environment Variables)**:
    *   `SECRET_TOKEN`: **必填**。用于进入管理后台的密钥（例如 `my_secret_password`）。
    *   `DAILY_QUOTA`: *选填*。每日允许生成的数量。默认为 `50`（这是为了防止挤占您账户下其他项目的 1000次/天 免费配额）。如果您是专用账号，可以将其改大（如 `200`）。

### 使用方法

- **公开访问**: 访问 `https://你的域名.workers.dev` 即可生成随机短链。
- **管理后台**: 访问 `https://你的域名.workers.dev/#admin`。
    - 系统会弹窗提示输入 `SECRET_TOKEN`。
    - 登录后，您可以查看所有短链数据、删除链接，或创建自定义短码（如 `mysite`）。

### 本地开发

```bash
# 安装依赖
npm install

# 本地运行
npx wrangler dev
```
