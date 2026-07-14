# Bảng Giá Mainboard - 手机主板回收报价网站

网站用于越南手机主板回收业务，客户可每日查看最新报价。管理员后台可随时修改价格和型号。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **数据库**: Supabase (PostgreSQL，免费层)
- **UI**: Tailwind CSS
- **部署**: Vercel（免费）

## 快速部署（约15分钟）

### 第1步：Supabase 设置

1. 访问 [supabase.com](https://supabase.com) 注册账号
2. 创建新项目，选择 **Southeast Asia** 区域（新加坡）
3. 进入 **SQL Editor**，粘贴 `supabase/migrations/001_initial_schema.sql` 的全部内容并执行
4. 进入 **Authentication > Users**，点击 **Add User** 创建管理员账号
5. 进入 **Settings > API**，复制以下值：
   - `Project URL` → 即 `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → 即 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → 即 `SUPABASE_SERVICE_ROLE_KEY`

### 第2步：配置环境变量

编辑 `.env.local` 文件，填入上一步获取的3个值：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx...
```

### 第3步：部署到 Vercel

1. 将代码推送到 GitHub 仓库
2. 访问 [vercel.com](https://vercel.com) 注册并导入项目
3. 在 Vercel 项目设置中添加相同的3个环境变量
4. 自动部署完成！

### 第4步：管理员登录

访问 `https://你的域名/admin/login`，用在 Supabase 中创建的管理员邮箱和密码登录。

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

## 项目结构

```
phone-board-pricing/
├── src/
│   ├── app/                    # 页面路由
│   │   ├── page.tsx            # 首页
│   │   ├── layout.tsx          # 根布局
│   │   ├── apple/page.tsx      # Apple 价格列表
│   │   ├── android/page.tsx    # Android 价格列表
│   │   ├── search/page.tsx     # 搜索页
│   │   ├── admin/
│   │   │   ├── login/page.tsx  # 管理员登录
│   │   │   ├── page.tsx        # 仪表盘
│   │   │   ├── prices/page.tsx # 价格管理（核心）
│   │   │   ├── models/page.tsx # 型号管理
│   │   │   ├── brands/page.tsx # 品牌管理
│   │   │   └── settings/page.tsx # 网站设置
│   │   └── api/                # API 路由
│   ├── components/             # 组件
│   │   ├── ui/                 # 基础UI组件
│   │   ├── layout/             # 布局组件
│   │   ├── prices/             # 价格展示组件
│   │   ├── admin/              # 后台专用组件
│   │   └── shared/             # 共享组件
│   ├── lib/                    # 工具库
│   │   ├── supabase/           # Supabase 客户端
│   │   ├── db/                 # 数据访问层
│   │   └── format.ts           # 格式化工具
│   └── types/                  # TypeScript 类型
└── supabase/migrations/        # 数据库迁移
```

## 使用说明

### 管理员操作
1. 登录后进入 **Quản lý giá** (价格管理)
2. 选择分类 (Apple/Android) 和型号
3. 点击价格数字直接编辑，按 Enter 确认
4. 点击 Phiên bản 文字修改规格描述
5. 按 **Lưu tất cả** 批量保存所有修改

### 客户浏览
- 首页显示今日报价概览和两个分类入口
- 点击 Apple/Android 进入详细价格列表
- 右下角蓝色按钮：展开可见 Zalo 和 Facebook 链接
- 搜索页可按型号名称快速查找

## 月费

**0 VND** — Supabase 免费层（500MB数据库）+ Vercel Hobby（100GB带宽/月）完全够用。

## 价格格式

越南盾使用点号分隔：`12.500.000 đ`（与越南本地习惯一致）
