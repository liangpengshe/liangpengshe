# 良朋社 OPC · 启动指南

> 明天一早启动只需要 **1 步**

## 🚀 快速启动

双击根目录下的 **`start.bat`**，等待 5-10 秒，浏览器打开 http://localhost:3001

## 📦 当前备份版本：v2026.06.24

**已完成的升级（按时间顺序）**：

1. ✅ **收益分润仪表盘** - 主理人分润系统（CommissionRecord 模型 + 85/10/5 分润）
2. ✅ **AI 助手上下文感知** - 路由感知 + Dify 动态系统提示
3. ✅ **商业路线图板块** - 四库进度时间轴
4. ✅ **四库全胜系统文案升级** - 首页 Bento 2x2 网格 + OPC 独立大横幅
5. ✅ **四库全胜启动包** - 报告生成 + PDF 导出
6. ✅ **首页样式对比度优化** - 深色字 + 白色卡 + hover 微动效
7. ✅ **良朋币资产系统** - 12 条积分规则 + 内存 store 三级降级

## 🔧 关键文件位置

| 功能 | 文件 |
|---|---|
| 首页 Bento + OPC 大横幅 | `src/app/page.tsx` |
| 个人中心（路线图/启动包/良朋币） | `src/app/member/page.tsx` |
| 良朋币 API | `src/app/api/coins/route.ts` |
| 分润计算 API | `src/app/api/order/create/route.ts` |
| 商业路线图 API | `src/app/api/member/roadmap/route.ts` |
| 上下文感知 AI 助手 | `src/components/AIAssistant.tsx` |
| 数据库模型 | `prisma/schema.prisma` |

## 🪙 良朋币测试

```powershell
# 测试积分（端口 3001）
curl -X POST -H "Content-Type: application/json" `
  -d '{"phone":"13800000001","action":"signin"}' `
  http://localhost:3001/api/coins

# 查看余额
curl "http://localhost:3001/api/coins?phone=13800000001"

# 查看规则
curl "http://localhost:3001/api/coins?type=rules"
```

支持的 action：`signin / salon / tool / diagnosis / plan / project / service / referral / review / share / purchase / redeem`

## ⚙️ 环境配置

如需启用 Supabase 真实数据持久化，编辑根目录 `.env`：

```env
NEXT_PUBLIC_SUPABASE_URL=你的_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_anon_key
DATABASE_URL=你的_postgres_url
DIFY_API_KEY=你的_dify_key
```

无配置时所有功能走 **内存 store**（dev 重启会清空，prod 持久）。

## 🆘 启动失败排查

1. **端口 3001 被占用** - 脚本已自动 kill
2. **依赖未安装** - 脚本会跑 `npm install`
3. **TypeScript 报错** - 看终端日志，搜索 `error` 行
4. **白屏** - 打开浏览器 F12 控制台，看 `Network` 是否 200
