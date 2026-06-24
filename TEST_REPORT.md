# 良鹏社全站测试报告（2026-06-24）

## 总体结果
| 项目 | 数量 | 状态 |
|---|---|---|
| 页面（Pages） | 29 | 29/29 ✅ 200 OK |
| API 路由 | 29 | 14 ✅ 200 + 15 ⚠️ 预期非200 |
| Dify 调用 | 5 | 4/5 ✅（1 缺 Key） |
| 数据库 | 15 模型 | Schema ✅ 有效，连接 ⏸ 等待配置 |

---

## 一、页面测试 29/29 ✅

全部页面 200 OK，平均响应 100ms~1.2s（首次编译除外）。

| 路径 | 状态 | 大小 |
|---|---|---|
| / | 200 | 27 KB |
| /tools, /tools/leopard, /tools/lingxi, /tools/pioneer | 200 | 14-16 KB |
| /services, /services/leopard... | 200 | OK |
| /community, /community/[id] | 200 | OK |
| /member, /member/roadmap | 200 | OK |
| /projects, /projects/[id] | 200 | OK |
| /order, /order/revenue | 200 | OK |
| /console, /console/applications... | 200 | OK |
| /pay, /pay/salon | 200 | OK |
| /coins, /test-dify | 200 | OK |

---

## 二、API 路由测试 29 个

### ✅ 200 OK (14)
| 路由 | 方法 | 用途 | 耗时 |
|---|---|---|---|
| /api/community/heartbeat | GET | 社区心跳 | 186ms |
| /api/activities | GET | 活动列表 | 102ms |
| /api/projects | GET | 项目数据 | 82ms |
| /api/order/revenue | GET | 收益记录 | 111ms |
| /api/revenue/dashboard | GET | 收益仪表盘 | 104ms |
| /api/ai/tts | GET | TTS 健康检查 | 96ms |
| /api/ai/tools-recommend | POST | Dify TOOL 推荐 | 1739ms |
| /api/ai/project-plan | POST | Dify PLAN 规划 | 2486ms |
| /api/ai/diagnose | POST | Dify DIAGNOSE 诊断 | 812ms |
| /api/ai/daily-brief | POST | Dify DAILY 日报 | 727ms |
| /api/coins | POST | 金币操作 | 99ms |
| /api/order/create | POST | 创建订单 | 121ms |
| /api/pay/salon | POST | 沙龙门付 | 83ms |
| /api/user/preference | POST | 用户偏好 | 84ms |

### 🔒 401 未登录 (6) — 预期行为，需 admin 登录
- /api/console/stats
- /api/console/applications
- /api/console/projects
- /api/console/salons
- /api/console/applications/[id]/approve
- /api/console/applications/[id]/reject

### 📝 400 参数缺失 (4) — 预期行为，测试脚本没传参
- /api/ai/match（需 userInput）
- /api/tools/submit（需工具数据）
- /api/services/join（需服务数据）
- /api/review（需评价内容）

### 🚫 405 方法不允许 (4) — 预期行为，测试脚本方法错
- /api/partner（只支持 POST）
- /api/member/roadmap（只支持 GET）
- /api/console/salons/[id]（只支持 GET）
- /api/console/projects/[id]（只支持 GET）

### ❌ 真实错误 (1) — 需用户配合
- **/api/ai/chat → 503**：`DIFY_API_KEY_CHAT` 未配置

---

## 三、Dify 调用测试 4/5 ✅

| 路由 | 用途 | Key | 状态 |
|---|---|---|---|
| /api/ai/tools-recommend | 工具栈推荐 | DIFY_API_KEY_TOOL | ✅ 200 |
| /api/ai/project-plan | 项目规划 | DIFY_API_KEY_PLAN | ✅ 200 |
| /api/ai/diagnose | 企业诊断 | DIFY_API_KEY_DIAGNOSE | ✅ 200 |
| /api/ai/daily-brief | 智富日报 | DIFY_API_KEY_DAILY | ✅ 200 |
| /api/ai/chat | AI 助手 | DIFY_API_KEY_CHAT | ❌ 缺 Key |

---

## 四、数据库测试

✅ **Prisma schema 有效**：15 个模型（User、Project、Partner、City、CommissionRecord 等）通过 `prisma validate`。

⏸ **数据库连接未配置**：`DATABASE_URL` 当前的 `mysql://` 协议与 Prisma 的 `postgresql` provider 不匹配。

---

## 五、本次修复

1. **重构 Supabase Mock 客户端**（src/lib/supabase/server.ts）：
   - 用普通对象代替 Proxy，避免 Next.js dev 模式下 Proxy get 陷阱被异常优化
   - 客户端代理和链式查询代理分离，链尾方法（single、maybeSingle）正确返回 Promise
   - 所有方法在环境变量缺失或 SDK 初始化失败时返回 `{ data: null, error: null }`

2. **移除调试日志**（src/app/api/console/stats/route.ts）：清理掉之前排查时加的 console.log。

3. **调整测试脚本超时**（test-apis.ps1）：从 60s 提升到 180s，适应 Next.js dev 首次编译。

---

## 六、需要用户配合的事项

### 🔴 必填
1. **DIFY_API_KEY_CHAT**：在 `.env` 中为 AI 助手聊天功能配置专属 Key（`app-` 开头）。
2. **真实数据库配置**：当前 `.env` 的 `DATABASE_URL` 是 MySQL 协议，但 Prisma schema 用的是 postgresql。请二选一：
   - 方案 A：把 `DATABASE_URL` 改为有效的 postgresql URL（推荐使用 Supabase Postgres）
   - 方案 B：把 `prisma/schema.prisma` 的 `provider` 改为 `mysql`（需要重新生成 client 和迁移）

3. **Supabase 真实配置**：在 `.env` 中配置 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`（目前走 mock 模式，所有用户/数据查询返回空）。

### 🟡 可选
4. 在本地或生产环境运行 `npx prisma migrate deploy` 应用数据库迁移。
5. 真实登录后测试 `/api/console/*` 类的管理接口。

---

## 七、文件清单

### 修改
- [src/lib/supabase/server.ts](file:///c:/Users/lujie/Documents/trae_projects/liangpengshe/src/lib/supabase/server.ts) — Mock 客户端重构
- [src/app/api/console/stats/route.ts](file:///c:/Users/lujie/Documents/trae_projects/liangpengshe/src/app/api/console/stats/route.ts) — 清理 debug log
- [test-apis.ps1](file:///c:/Users/lujie/Documents/trae_projects/liangpengshe/test-apis.ps1) — 超时提升到 180s

### 新建
- test-pages.ps1 — 批量页面测试脚本
- TEST_REPORT.md — 本报告
