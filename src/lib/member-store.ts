// 跨 route.ts 共享的会员路线图事件 store
// Next.js 14 route.ts 不允许 export 函数/常量，所以全局 store 和 recordMemberEvent 提取到这里

const globalStore: any = (global as any).__memberRoadmapStore ||= {
  byPhone: {} as Record<string, any>,
  byUserId: {} as Record<string, any>,
  demoInit: false,
}

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

export function recordMemberEvent(
  phone: string,
  type: 'diagnosis' | 'plan' | 'tool' | 'salon',
  payload: any
) {
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

export function getMemberStore() {
  ensureDemo()
  return globalStore
}
