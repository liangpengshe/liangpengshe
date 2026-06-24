import { NextResponse } from 'next/server'
import { callDifyWorkflow, pickFirstStringOutput } from '@/lib/dify-workflow'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `你是一个资深的 AI 商业落地导师和职业规划师。请根据用户的出生日期（{birthday}）、目标年收入（{targetIncome}）、职业背景（{background}），生成一份专属的《良朋社 AI 个人商业规划报告》。报告必须使用 Markdown 格式，包含：

一、人生阶段与特质分析（结合年龄和当前背景给出评估）
二、目标可行性拆解（说明实现目标需要跨越的几道关）
三、精准项目匹配（推荐 2-3 个你数据库中具体的项目内容，最好包含使用 AI 工具进行创作的路径）
四、分步行动计划（按"第1-2周"、"第1个月"、"第3个月"递进）
五、AI 工具与技能补充（建议学习使用哪些工具）
仅输出 Markdown，不要有任何额外的解释。`

// 降级：内置 AI 计划模板
function buildFallbackPlan(
  name: string,
  age: number,
  targetIncome: string,
  background: string
): string {
  const lifeStage =
    age < 25
      ? '探索期'
      : age < 35
      ? '黄金成长期'
      : age < 45
      ? '事业突破期'
      : '经验沉淀与再创业期'

  return `# 🎯 ${name} 的专属《AI 个人商业规划报告》

> **年龄**：${age} 岁（${lifeStage}）
> **目标年收入**：${targetIncome}
> **生成时间**：${new Date().toLocaleString('zh-CN')}

---

## 一、人生阶段与特质分析

你目前处于人生的**${lifeStage}**，这是**${age < 35 ? '敢想敢做、试错成本最低' : '经验资源最丰富、人脉最广'}**的黄金阶段。

**当下职业背景解读**：
${background ? `> ${background}` : '> 用户暂未填写详细背景'}

**核心特质评估**：
- ✅ ${age < 30 ? '学习能力强，对新事物敏感' : '行业认知深，懂人性'}
- ✅ 有明确目标收入（${targetIncome}），说明具备目标感
- ⚠️  从现状到目标，需要补足**技能 + 项目 + 流量**三大核心能力

## 二、目标可行性拆解

要实现 **${targetIncome}** 的年收入，你需要跨越以下 3 道关：

| 阶段 | 关键里程碑 | 收入跃迁 | 时间周期 |
|------|------------|----------|----------|
| **基础期** | 跑通 0→1 单点业务 | 月入 5K-1万 | 1-2 个月 |
| **增长期** | 形成可复制 SOP | 月入 2-5 万 | 2-4 个月 |
| **规模化** | 团队 + 多渠道 | 月入 5万+ | 4-8 个月 |

**核心障碍**：
1. **技能鸿沟**：是否掌握 AI 工具进行内容/产品/服务生产
2. **项目选择**：是否选择高客单 + 可复制的赛道
3. **流量获取**：是否能稳定获取精准客户

## 三、精准项目匹配

根据你的背景，推荐以下 3 个高适配项目：

### 🌟 项目 1：${age < 35 ? 'AI 数字人短视频带货' : '行业知识付费 + AI 工具陪跑'}

- **路径**：用**先锋派数字人**生成 7×24 数字人口播视频 + **灵犀 AI** 批量产出脚本
- **变现周期**：1-2 周起号 → 1 个月见收入
- **预期月入**：1-3 万（前期）→ 5万+（稳定期）

### 🌟 项目 2：本地生活 + AI 短视频矩阵

- **路径**：用 **豹纹工坊** 一键生成爆款素材图 + 数字人做探店视频
- **变现周期**：2 周起号 → 1 个月单店分成
- **预期月入**：2-5 万

### 🌟 项目 3：AI 跨境电商 / 私域代运营

- **路径**：AI 选品 + 灵犀 AI 写 Listing + 数字人做客服
- **变现周期**：1 个月跑通 → 3 个月放大
- **预期月入**：3-10 万

## 四、分步行动计划

### 📅 第 1-2 周（启动期）
- [ ] 注册 1 个抖音/小红书账号
- [ ] 用**灵犀 AI** 生成 30 条脚本 → 用**先锋派数字人**生成 30 条视频
- [ ] 每天发布 3 条，测试流量反馈
- [ ] 同步加入良朋社 OPC 城市分会，对接本地资源

### 📅 第 1 个月（验证期）
- [ ] 跑通 0→1：至少成交 5 单
- [ ] 锁定 1 个高转化内容模板
- [ ] 开始接 1-2 个本地商家订单
- [ ] 收入目标：月入 5K-1万

### 📅 第 3 个月（增长期）
- [ ] 复制 SOP 到 2-3 个账号 / 商家
- [ ] 组建 2-3 人小团队（找 OPC 合伙人）
- [ ] 启动付费投流 / 私域转化
- [ ] 收入目标：月入 2-5 万

## 五、AI 工具与技能补充

| 工具 | 用途 | 学习时间 | 优先级 |
|------|------|----------|--------|
| **灵犀 AI** | 批量内容生产 | 1 天 | ⭐⭐⭐⭐⭐ |
| **先锋派数字人** | 视频自动化 | 1-2 天 | ⭐⭐⭐⭐⭐ |
| **豹纹工坊** | 电商素材 | 1 天 | ⭐⭐⭐⭐ |
| **Coze（扣子）** | 智能体搭建 | 2-3 天 | ⭐⭐⭐ |
| **Cursor** | AI 编程 | 1 天 | ⭐⭐⭐ |

---

> 🚀 **"种一棵树最好的时间是十年前，其次是现在。"**
> **${name}，你的人生下半场，从今天开始。**

*本报告由良朋社 AI 引擎生成。*`
}

function calculateAge(birthday: string): number {
  const b = new Date(birthday)
  if (isNaN(b.getTime())) return 28 // 默认值
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return age
}

// 内存存储
const memoryStore: Array<{
  id: string
  name: string
  birthday: string
  targetIncome: string
  background: string
  phone: string
  aiPlan: string
  status: string
  createdAt: Date
}> = []

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, birthday, targetIncome, background, phone } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: '请填写姓名' }, { status: 400 })
    }
    if (!birthday) {
      return NextResponse.json({ success: false, error: '请选择出生日期' }, { status: 400 })
    }
    if (!targetIncome || typeof targetIncome !== 'string') {
      return NextResponse.json({ success: false, error: '请选择目标年收入' }, { status: 400 })
    }
    if (!background || typeof background !== 'string' || !background.trim()) {
      return NextResponse.json({ success: false, error: '请描述职业背景' }, { status: 400 })
    }
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json({ success: false, error: '请填写手机号或微信号' }, { status: 400 })
    }

    const cleanName = name.trim()
    const cleanPhone = phone.trim()
    const cleanTarget = targetIncome.trim()
    const cleanBg = background.trim()
    const birthdayDate = new Date(birthday)
    if (isNaN(birthdayDate.getTime())) {
      return NextResponse.json({ success: false, error: '出生日期格式不正确' }, { status: 400 })
    }
    const age = calculateAge(birthday)

    // ──────────── 1. 调用 Dify 生成计划 ────────────
    let plan = ''
    let source: 'dify' | 'fallback' = 'fallback'

    // 个人商业规划师 → DIFY_API_KEY_PLAN
    const apiKey = process.env.DIFY_API_KEY_PLAN
    if (apiKey) {
      try {
        const result = await callDifyWorkflow(apiKey, {
          system_prompt: SYSTEM_PROMPT
            .replace('{birthday}', birthdayDate.toLocaleDateString('zh-CN'))
            .replace('{targetIncome}', cleanTarget)
            .replace('{background}', cleanBg),
          user_input: `用户姓名：${cleanName}
联系方式：${cleanPhone}
出生日期：${birthdayDate.toLocaleDateString('zh-CN')}（${age} 岁）
目标年收入：${cleanTarget}
职业背景：${cleanBg}`,
          name: cleanName,
          phone: cleanPhone,
          age,
          birthday: birthdayDate.toISOString(),
          target_income: cleanTarget,
          background: cleanBg,
        })
        const text =
          pickFirstStringOutput(result.outputs) ||
          (result.outputs as any).plan ||
          (result.outputs as any).result ||
          ''
        if (text) {
          plan = text
          source = 'dify'
        }
      } catch (difyErr) {
        console.warn('[project-plan] Dify 调用失败，使用降级模板:', (difyErr as Error).message)
      }
    }

    if (!plan) {
      plan = buildFallbackPlan(cleanName, age, cleanTarget, cleanBg)
    }

    // ──────────── 2. 持久化 ────────────
    let savedId: string | null = null
    let storageSource = 'memory'

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasSupabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase')

    if (hasSupabase) {
      try {
        const supabase = await createClient()
        const { data, error } = await supabase
          .from('ProjectPlanRequest')
          .insert({
            name: cleanName,
            birthday: birthdayDate.toISOString(),
            targetIncome: cleanTarget,
            background: cleanBg,
            phone: cleanPhone,
            aiPlan: plan,
            status: 'PENDING',
          })
          .select('id')
          .single()

        if (!error && data) {
          savedId = data.id
          storageSource = 'supabase'
        }
      } catch (sbErr) {
        console.warn('[project-plan] Supabase 存储失败:', sbErr)
      }
    }

    if (!savedId) {
      try {
        const record = await prisma.projectPlanRequest.create({
          data: {
            name: cleanName,
            birthday: birthdayDate,
            targetIncome: cleanTarget,
            background: cleanBg,
            phone: cleanPhone,
            aiPlan: plan,
            status: 'PENDING',
          },
        })
        savedId = record.id
        storageSource = 'prisma'
      } catch (prismaErr) {
        console.warn('[project-plan] Prisma 存储失败:', prismaErr)
      }
    }

    if (!savedId) {
      const id = `mem-plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      memoryStore.unshift({
        id,
        name: cleanName,
        birthday: birthdayDate.toISOString(),
        targetIncome: cleanTarget,
        background: cleanBg,
        phone: cleanPhone,
        aiPlan: plan,
        status: 'PENDING',
        createdAt: new Date(),
      })
      savedId = id
      storageSource = 'memory'
    }

    // 同步写入会员路线图 store
    try {
      const { recordMemberEvent } = await import('../../member/roadmap/route')
      recordMemberEvent(cleanPhone, 'plan', {
        id: savedId,
        targetIncome: cleanTarget,
        createdAt: new Date().toISOString(),
        summary: (plan || '').slice(0, 80) || '人生商业规划',
      })
    } catch {}

    return NextResponse.json({
      success: true,
      plan,
      id: savedId,
      source: storageSource,
      aiSource: source,
      model: 'Dify Workflows (DIFY_API_KEY_PLAN)',
    })
  } catch (error: any) {
    console.error('[project-plan] 错误:', error)
    return NextResponse.json(
      { success: false, error: error.message || '计划生成服务暂时不可用' },
      { status: 500 }
    )
  }
}
