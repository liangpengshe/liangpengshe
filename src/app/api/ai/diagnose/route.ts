import { NextResponse } from 'next/server'
import { callDifyWorkflow, pickFirstStringOutput } from '@/lib/dify-workflow'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `你是一名拥有 10 年经验的 AI 商业落地咨询专家。请根据用户的背景（{role}）、诉求（{goals}）、现状（{description}）生成一份极简但深刻的《AI 商业落地诊断报告》。
报告需要以 Markdown 格式输出，包含：

一、核心痛点诊断（3点）
二、推荐切入点（2条具体的起步建议）
三、OPC 服务匹配（推荐 1-2 个 OPC 的服务库产品）
四、预期见效周期与 ROI 预估
五、AI 赋能金句（给用户的鼓励）
仅输出 Markdown，不要有任何额外的开头或结尾。`

// 内存存储（数据库不可用时降级）
const memoryStore: Array<{
  id: string
  name: string
  phone: string
  role: string
  goals: string[]
  description: string
  aiReport: string
  status: string
  createdAt: Date
}> = []

// 降级：内置 AI 报告模板（Dify 不可用时）
function buildFallbackReport(role: string, goals: string[], description: string): string {
  const goalsText = goals.length ? goals.join('、') : '综合发展'
  return `# 🎯 AI 商业落地诊断报告

> **角色**：${role || '未填写'}
> **核心目标**：${goalsText}
> **生成时间**：${new Date().toLocaleString('zh-CN')}

---

## 一、核心痛点诊断

1. **效率瓶颈**：传统业务模式中，大量重复性工作（如内容产出、客服咨询、数据整理）仍依赖人工，单位时间产出有限。
2. **获客成本高**：依赖传统营销渠道，缺乏数据驱动的精准获客体系，转化路径长。
3. **团队能力受限**：单人或小团队难以覆盖全部业务环节，规模化增长受阻。

## 二、推荐切入点

1. **先工具后团队**：先用 AI 工具（智能客服、内容生成、数据分析）替代 30%-50% 的基础工作，1-2 周内即可见效。
2. **再流程后产品**：将高频重复流程标准化，再用 AI Agent 自动化，3 个月内可形成可复制的业务模型。

## 三、OPC 服务匹配

1. **灵犀 AI** —— 智能内容创作助手，1 人可产出 5 人内容产能
2. **先锋派数字人** —— 7×24 数字人口播，把视频内容产能提升 500%

## 四、预期见效周期与 ROI 预估

| 阶段 | 周期 | 预期收益 |
|------|------|----------|
| 工具替换期 | 1-2 周 | 节省 30% 时间成本 |
| 流程优化期 | 1-3 个月 | 整体效率提升 200% |
| 规模化复制期 | 3-6 个月 | 业务规模翻 2-3 倍 |

**预估 ROI**：投入 1 元 AI 工具成本，3 个月内可回收 5-8 元。

## 五、AI 赋能金句

> 🚀 **"AI 不会取代你，但用 AI 的人会取代不用 AI 的人。**
> **良朋社 OPC —— 让 1 个人，活成 1 家公司。"**

---

*本报告由良朋社 AI 引擎生成，顾问将于 24 小时内联系您提供一对一解读。*`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, role, goals, description } = body

    // 入参校验
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: '请填写姓名' }, { status: 400 })
    }
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json({ success: false, error: '请填写手机号或微信号' }, { status: 400 })
    }
    if (!role || typeof role !== 'string') {
      return NextResponse.json({ success: false, error: '请选择您的角色' }, { status: 400 })
    }
    if (!Array.isArray(goals) || goals.length === 0) {
      return NextResponse.json({ success: false, error: '请至少选择一项目标' }, { status: 400 })
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json({ success: false, error: '请描述业务困境' }, { status: 400 })
    }

    const cleanName = name.trim()
    const cleanPhone = phone.trim()
    const cleanRole = role.trim()
    const cleanGoals = goals.map((g: any) => String(g).trim()).filter(Boolean)
    const cleanDescription = description.trim()

    // ──────────── 1. 调用 Dify 生成报告 ────────────
    let report = ''
    let source: 'dify' | 'fallback' = 'fallback'

    // 企业转型诊断师 → DIFY_API_KEY_DIAGNOSE
    const apiKey = process.env.DIFY_API_KEY_DIAGNOSE
    if (apiKey) {
      try {
        const result = await callDifyWorkflow(apiKey, {
          system_prompt: SYSTEM_PROMPT.replace('{role}', cleanRole)
            .replace('{goals}', cleanGoals.join('、'))
            .replace('{description}', cleanDescription),
          user_input: `用户姓名：${cleanName}
联系方式：${cleanPhone}
角色：${cleanRole}
目标：${cleanGoals.join('、')}
现状描述：${cleanDescription}`,
          name: cleanName,
          phone: cleanPhone,
          role: cleanRole,
          goals: cleanGoals,
          description: cleanDescription,
        })
        const text =
          pickFirstStringOutput(result.outputs) ||
          (result.outputs as any).report ||
          (result.outputs as any).result ||
          ''
        if (text) {
          report = text
          source = 'dify'
        }
      } catch (difyErr) {
        console.warn('[diagnose] Dify 调用失败，使用降级报告:', (difyErr as Error).message)
      }
    }

    if (!report) {
      report = buildFallbackReport(cleanRole, cleanGoals, cleanDescription)
    }

    // ──────────── 2. 持久化到数据库 ────────────
    let savedId: string | null = null
    let storageSource = 'memory'

    // 尝试 Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasSupabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase')

    if (hasSupabase) {
      try {
        const supabase = await createClient()
        const { data, error } = await supabase
          .from('DiagnosisRequest')
          .insert({
            name: cleanName,
            phone: cleanPhone,
            role: cleanRole,
            goals: cleanGoals,
            description: cleanDescription,
            aiReport: report,
            status: 'PENDING',
          })
          .select('id')
          .single()

        if (!error && data) {
          savedId = data.id
          storageSource = 'supabase'
        }
      } catch (sbErr) {
        console.warn('[diagnose] Supabase 存储失败，尝试 Prisma:', sbErr)
      }
    }

    // 尝试 Prisma
    if (!savedId) {
      try {
        const record = await prisma.diagnosisRequest.create({
          data: {
            name: cleanName,
            phone: cleanPhone,
            role: cleanRole,
            goals: cleanGoals,
            description: cleanDescription,
            aiReport: report,
            status: 'PENDING',
          },
        })
        savedId = record.id
        storageSource = 'prisma'
      } catch (prismaErr) {
        console.warn('[diagnose] Prisma 存储失败，使用内存存储:', prismaErr)
      }
    }

    // 内存存储（最终降级）
    if (!savedId) {
      const id = `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      memoryStore.unshift({
        id,
        name: cleanName,
        phone: cleanPhone,
        role: cleanRole,
        goals: cleanGoals,
        description: cleanDescription,
        aiReport: report,
        status: 'PENDING',
        createdAt: new Date(),
      })
      savedId = id
      storageSource = 'memory'
    }

    // 同步写入会员路线图 store
    try {
      const { recordMemberEvent } = await import('../../member/roadmap/route')
      recordMemberEvent(cleanPhone, 'diagnosis', {
        id: savedId,
        name: cleanName,
        createdAt: new Date().toISOString(),
        goals: cleanGoals,
        summary: (report || '').slice(0, 80) || 'AI 诊断报告',
      })
    } catch {}

    return NextResponse.json({
      success: true,
      report,
      id: savedId,
      source: storageSource,
      aiSource: source,
      model: 'Dify Workflows (DIFY_API_KEY_DIAGNOSE)',
    })
  } catch (error: any) {
    console.error('[diagnose] 错误:', error)
    return NextResponse.json(
      { success: false, error: error.message || '诊断服务暂时不可用' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const status = url.searchParams.get('status')
    const updateAction = url.searchParams.get('action')

    // 标记为已联系
    if (id && updateAction === 'contacted') {
      // Supabase
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const hasSupabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase')

      if (hasSupabase) {
        try {
          const supabase = await createClient()
          await supabase
            .from('DiagnosisRequest')
            .update({ status: 'CONTACTED', updatedAt: new Date().toISOString() })
            .eq('id', id)
        } catch {}
      }

      try {
        await prisma.diagnosisRequest.update({
          where: { id },
          data: { status: 'CONTACTED' },
        })
      } catch {}

      const memIdx = memoryStore.findIndex((m) => m.id === id)
      if (memIdx >= 0) memoryStore[memIdx].status = 'CONTACTED'

      return NextResponse.json({ success: true })
    }

    // 列表查询
    const list: any[] = []

    // Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasSupabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase')

    if (hasSupabase) {
      try {
        const supabase = await createClient()
        let query = supabase
          .from('DiagnosisRequest')
          .select('*')
          .order('createdAt', { ascending: false })
        if (status) query = query.eq('status', status)
        const { data, error } = await query
        if (!error && data) {
          data.forEach((d: any) => list.push(d))
        }
      } catch {}
    }

    // Prisma
    try {
      const where: any = status ? { status } : undefined
      const prismaList = await prisma.diagnosisRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
      prismaList.forEach((p) => {
        if (!list.find((l) => l.id === p.id)) {
          list.push({
            id: p.id,
            name: p.name,
            phone: p.phone,
            role: p.role,
            goals: p.goals,
            description: p.description,
            aiReport: p.aiReport,
            status: p.status,
            createdAt: p.createdAt.toISOString(),
          })
        }
      })
    } catch {}

    // 内存
    const memFiltered = status
      ? memoryStore.filter((m) => m.status === status)
      : memoryStore
    memFiltered.forEach((m) => {
      if (!list.find((l) => l.id === m.id)) {
        list.push({
          ...m,
          createdAt: m.createdAt.toISOString(),
        })
      }
    })

    return NextResponse.json({
      success: true,
      data: list,
      total: list.length,
    })
  } catch (error: any) {
    console.error('[diagnose] GET 错误:', error)
    return NextResponse.json(
      { success: false, error: error.message || '查询失败', data: [] },
      { status: 500 }
    )
  }
}
