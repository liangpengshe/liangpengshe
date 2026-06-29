import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { arrFromDb } from '@/lib/json-array'
import { getMemberStore } from '@/lib/member-store'

// 全局内存 store（按 userId / phone 索引四类记录）
const globalStore = getMemberStore()

// 本地 ensureDemo 包装（已搬进 member-store.ts，本文件继续调用）

function ensureDemo() {
  if (globalStore.demoInit) return
  globalStore.demoInit = true
  const demoPhone = '13800000000'
  globalStore.byPhone[demoPhone] = {
    diagnosis: {
      id: 'demo-diag',
      name: '示例用户',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
      goals: ['降本', '获客'],
      summary: 'AI 诊断建议：先打通 AI 数字人内容生产链路',
    },
    plans: [
      {
        id: 'demo-plan-1',
        targetIncome: '30万',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
        summary: '人生商业规划：3 阶段路径',
      },
    ],
    tools: [
      {
        id: 'demo-tool-1',
        name: 'AI 数字人口播',
        category: '数字人',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        status: 'APPROVED',
      },
    ],
    salons: [
      {
        id: 'demo-salon-1',
        title: 'AI商业变现实战沙龙（深圳站）',
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        status: 'PENDING',
      },
    ],
  }
}

// 记录提交到全局 store（可被其他 API 调用）— 本地版本，与 @/lib/member-store 保持同步
// Next.js 14 route.ts 不允许 export 函数，但代码可保留作为 fallback
function recordMemberEvent(phone: string, type: 'diagnosis' | 'plan' | 'tool' | 'salon', payload: any) {
  if (!phone) return
  ensureDemo()
  if (!globalStore.byPhone[phone]) {
    globalStore.byPhone[phone] = { diagnosis: null, plans: [], tools: [], salons: [] }
  }
  const rec = globalStore.byPhone[phone]
  if (type === 'diagnosis') {
    rec.diagnosis = payload
  } else {
    rec[type === 'plan' ? 'plans' : type === 'tool' ? 'tools' : 'salons'].unshift(payload)
  }
}

export async function GET(request: Request) {
  try {
    ensureDemo()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: true, data: getDemoData() })
    }

    // 获取当前用户手机号（用于关联四类记录）
    const { data: userData } = await supabase
      .from('users')
      .select('id, phone, email')
      .eq('id', user.id)
      .single()

    const phone = userData?.phone || userData?.email || user.id
    const userKey = user.id

    // 合并：内存 store + Supabase 表（按 phone 查询）
    const fromStore = globalStore.byPhone[phone] || globalStore.byUserId[userKey] || {
      diagnosis: null,
      plans: [],
      tools: [],
      salons: [],
    }

    // 尝试从 Supabase 拉真实数据
    let diagnosis = fromStore.diagnosis
    let plans = [...(fromStore.plans || [])]
    let tools = [...(fromStore.tools || [])]
    let salons = [...(fromStore.salons || [])]

    if (supabase && userData?.phone) {
      try {
        const [diagRes, planRes, toolRes] = await Promise.all([
          supabase
            .from('DiagnosisRequest')
            .select('id,name,phone,goals,description,aiReport,status,createdAt')
            .eq('phone', userData.phone)
            .order('createdAt', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('ProjectPlanRequest')
            .select('id,name,phone,targetIncome,aiPlan,status,createdAt')
            .eq('phone', userData.phone)
            .order('createdAt', { ascending: false })
            .limit(5),
          supabase
            .from('ToolSubmission')
            .select('id,name,category,status,submittedAt')
            .order('submittedAt', { ascending: false })
            .limit(5),
        ])
        if (diagRes.data && !diagnosis) {
          diagnosis = {
            id: diagRes.data.id,
            name: diagRes.data.name,
            createdAt: diagRes.data.createdAt,
            goals: diagRes.data.goals,
            summary: (diagRes.data.aiReport || '').slice(0, 80) || 'AI 诊断报告',
          }
        }
        if (planRes.data) {
          planRes.data.forEach((p: any) => {
            if (!plans.find((x) => x.id === p.id)) {
              plans.push({
                id: p.id,
                targetIncome: p.targetIncome,
                createdAt: p.createdAt,
                summary: (p.aiPlan || '').slice(0, 80) || '人生商业规划',
              })
            }
          })
        }
        if (toolRes.data) {
          toolRes.data.forEach((t: any) => {
            if (!tools.find((x) => x.id === t.id)) {
              tools.push({
                id: t.id,
                name: t.name,
                category: t.category,
                createdAt: t.submittedAt,
                status: t.status,
              })
            }
          })
        }
      } catch (e) {
        console.warn('[member/roadmap] Supabase 查询失败:', e)
      }
    }

    // 按时间排序生成 timeline
    const timeline = [
      diagnosis && {
        type: 'diagnosis' as const,
        id: diagnosis.id,
        title: '自我诊断',
        desc: diagnosis.summary,
        meta: `目标：${(diagnosis.goals || []).join(' / ')}`,
        at: diagnosis.createdAt,
      },
      ...plans.map((p) => ({
        type: 'plan' as const,
        id: p.id,
        title: '商业规划',
        desc: p.summary,
        meta: `目标年收入：${p.targetIncome}`,
        at: p.createdAt,
      })),
      ...tools.map((t) => ({
        type: 'tool' as const,
        id: t.id,
        title: '工具提交',
        desc: t.name,
        meta: `分类：${t.category} · ${t.status}`,
        at: t.createdAt,
      })),
      ...salons.map((s) => ({
        type: 'salon' as const,
        id: s.id,
        title: '沙龙报名',
        desc: s.title,
        meta: `时间：${new Date(s.date).toLocaleDateString('zh-CN')}`,
        at: s.createdAt,
      })),
    ]
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b.at).getTime() - new Date(a.at).getTime())

    // 四库进度
    const progress = {
      diagnosis: diagnosis ? 100 : 0,
      plan: plans.length > 0 ? 100 : 0,
      tool: tools.length > 0 ? 100 : 0,
      salon: salons.length > 0 ? 100 : 0,
    }
    const completedSteps = [progress.diagnosis, progress.plan, progress.tool, progress.salon].filter(
      (v) => v === 100
    ).length
    const overallProgress = Math.round((completedSteps / 4) * 100)

    return NextResponse.json({
      success: true,
      data: {
        diagnosis,
        plans,
        tools,
        salons,
        timeline,
        progress,
        overallProgress,
        completedSteps,
        user: { name: userData?.name || userData?.email || '老板', phone },
      },
    })
  } catch (error: any) {
    console.error('[member/roadmap] 错误:', error)
    return NextResponse.json({
      success: true,
      data: getDemoData(),
      warning: error.message,
    })
  }
}

function getDemoData() {
  ensureDemo()
  const demo = globalStore.byPhone['13800000000']
  const timeline = [
    {
      type: 'diagnosis' as const,
      id: 'demo-diag',
      title: '自我诊断',
      desc: demo.diagnosis.summary,
      meta: `目标：${(demo.diagnosis.goals || []).join(' / ')}`,
      at: demo.diagnosis.createdAt,
    },
    ...demo.plans.map((p: any) => ({
      type: 'plan' as const,
      id: p.id,
      title: '商业规划',
      desc: p.summary,
      meta: `目标年收入：${p.targetIncome}`,
      at: p.createdAt,
    })),
    ...demo.tools.map((t: any) => ({
      type: 'tool' as const,
      id: t.id,
      title: '工具提交',
      desc: t.name,
      meta: `分类：${t.category} · ${t.status}`,
      at: t.createdAt,
    })),
    ...demo.salons.map((s: any) => ({
      type: 'salon' as const,
      id: s.id,
      title: '沙龙报名',
      desc: s.title,
      meta: `时间：${new Date(s.date).toLocaleDateString('zh-CN')}`,
      at: s.createdAt,
    })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  return {
    diagnosis: demo.diagnosis,
    plans: demo.plans,
    tools: demo.tools,
    salons: demo.salons,
    timeline,
    progress: { diagnosis: 100, plan: 100, tool: 100, salon: 100 },
    overallProgress: 100,
    completedSteps: 4,
    user: { name: '示例用户', phone: '13800000000' },
  }
}
