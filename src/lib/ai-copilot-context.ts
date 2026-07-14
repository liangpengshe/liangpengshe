/**
 * AI 主动型 Copilot · 路由上下文识别
 * ------------------------------------------------------------
 * 把"用户当前在看什么"转化为"AI 应该主动说什么"的策略表。
 *
 * 设计原则：
 *   - 每个 ctx.kind 包含 1-3 个时间档位的提示语（dwell15s / dwell30s / dwell60s）
 *   - 已点踩过的 kind 会被过滤（由 ai-copilot-feedback 提供）
 *   - systemHint 用于注入 Dify，让 AI 回答时主动结合当前场景
 * ------------------------------------------------------------
 */

import { readOPCRouteFromStorage } from './user-stage'

export type CopilotKind =
  | 'market-projects'
  | 'market-tools'
  | 'market-resources'
  | 'market-services'
  | 'project-detail'
  | 'guide-trader'
  | 'guide-flow'
  | 'guide-system'
  | 'guide-asset'
  | 'member'
  | 'workspace'
  | 'diagnosis'
  | 'home'
  | 'default'

export interface CopilotCTA {
  label: string
  href: string
}

export interface CopilotContext {
  kind: CopilotKind
  /** 15s 内的首次主动提示 */
  bubble: string | null
  /** 30s 时的二次深化提示 */
  dwell30Bubble: string | null
  /** 60s 时的升级提示（卡点检测/强引导） */
  dwell60Bubble: string | null
  /** 关键 CTA 按钮 */
  cta: CopilotCTA | null
  /** 注入 Dify 的系统提示 */
  systemHint: string
  /** 视觉风格 key（决定气泡配色） */
  style: 'blue' | 'purple' | 'amber' | 'rose' | 'emerald' | 'slate'
  /** 该 kind 的图标 lucide name（用于气泡） */
  icon: 'Wrench' | 'FolderKanban' | 'BookOpen' | 'Briefcase' | 'Compass' | 'Sparkles' | 'Target'
}

/**
 * 路由 → 上下文
 * 优先匹配长路径前缀（避免 /market/projects 误匹配 /market）
 */
export function buildCopilotContext(pathname: string | null): CopilotContext {
  const p = pathname || ''
  const opcLevel = readOPCRouteFromStorage() // TRADER / FLOW / SYSTEM / ASSET / null
  const levelLabel = opcLevel ? `（当前 OPC 类型：${opcLevel}）` : '（你尚未完成 OPC 诊断）'

  // 1. /projects/[slug] - 独立项目 SOP 详情（最高优先级，任务 5 路由升级）
  if (p.startsWith('/projects/') && p !== '/projects') {
    const slug = p.split('/projects/')[1]?.split('/')[0] || ''
    return {
      kind: 'project-detail',
      bubble: `你正在做「${slug || '该 SOP'}」5 步实操任务——卡在哪一步？要不要我给你打 1V1 辅导一下？`,
      dwell30Bubble: '这个项目底层依赖哪些工具？需要我帮你列出工具栈吗？',
      dwell60Bubble: '想把这个项目拆解成 7 天执行清单吗？我可以基于你的 opc_level 给你生成。',
      cta: { label: '生成 7 天执行清单', href: '/workspace' },
      systemHint: `用户正在浏览 /projects/${slug || '?'} 独立项目 SOP 详情${levelLabel}。请主动询问：1) 当前步骤卡点；2) 底层工具栈；3) 7 天可执行拆解。`,
      style: 'emerald',
      icon: 'Target',
    }
  }

  // 2. /projects - 独立项目库总览（任务 5 新增）
  if (p === '/projects' || p.startsWith('/projects?')) {
    return {
      kind: 'market-projects',
      bubble: opcLevel
        ? `你正在看项目库——要我基于你的 OPC 类型（${opcLevel}）筛出最匹配的 3 个项目吗？`
        : '你正在看项目库。要不要先花 60 秒做个 OPC 类型诊断？这样我能帮你精准推荐。',
      dwell30Bubble: '项目太多挑花眼？告诉我你的预算和擅长领域，我帮你缩小到 3 个候选。',
      dwell60Bubble: '找不到合适的？点击任意项目卡片的"我想做这个项目"按钮，可以直接进入 Duolingo 风格 SOP 任务流。',
      cta: opcLevel
        ? { label: `推荐 ${opcLevel} 型项目`, href: `/projects?recommend=${opcLevel.toLowerCase()}` }
        : { label: '去做 OPC 诊断', href: '/diagnosis' },
      systemHint: `用户当前停留在 /projects 独立项目库${levelLabel}。请基于用户的 OPC 类型推荐最匹配的 3 个 SOP 项目。`,
      style: 'emerald',
      icon: 'FolderKanban',
    }
  }

  // 3. /market/resources
  if (p === '/market/resources' || p.startsWith('/market/resources?')) {
    return {
      kind: 'market-resources',
      bubble: '你正在看资源库——需要我帮你找出"👍 实用指数"最高的 3 个资源吗？',
      dwell30Bubble: '看到喜欢的资源可以顺手投稿一个，让更多 OPC 受益。',
      dwell60Bubble: '没找到合适的？告诉我你的需求（比如"AI 选品工具"），我帮你定向推荐。',
      cta: { label: '查看 TOP 3 资源', href: '/market/resources?tab=top' },
      systemHint: '用户当前停留在 /market/resources 页面（资源库 UGC 平台）。请主动询问用户需要哪类资源（实物 / AI 软件 / 智能硬件 / 精品教程），并推荐评分最高的 3 个。',
      style: 'amber',
      icon: 'BookOpen',
    }
  }

  // 4. /market/services
  if (p === '/market/services' || p.startsWith('/market/services?')) {
    return {
      kind: 'market-services',
      bubble: '你正在看服务库——选好服务提交后，我会帮你精准匹配 AI 顾问或行业专家。',
      dwell30Bubble: '服务商价格跨度大？告诉我你的预算区间，我帮你筛出性价比最高的。',
      dwell60Bubble: '需要陪跑式服务吗？1980 元的 OPC 陪跑服务有 50 元新人券。',
      cta: { label: '查看陪跑服务', href: '/pricing' },
      systemHint: '用户当前停留在 /market/services 页面（服务商库）。请基于用户当前 opc_level 推荐最匹配的服务类型（智能体定制 / GEO / 企业内训 / 数据中台 等）。',
      style: 'purple',
      icon: 'Briefcase',
    }
  }

  // 5. /market/tools
  if (p === '/market/tools' || p.startsWith('/market/tools?')) {
    return {
      kind: 'market-tools',
      bubble: '你正在看工具库——告诉我你现在的痛点（降本/引流/客户运营），我帮你匹配最合适的 3 个工具。',
      dwell30Bubble: '工具太多挑花眼？告诉我你的预算和团队规模，我帮你精准推荐。',
      dwell60Bubble: '需要工具教程吗？AI 精品教程库里有 200+ 实战视频。',
      cta: { label: 'AI 智能推荐工具', href: '/market/tools?advisor=1' },
      systemHint: '用户当前停留在 /market/tools 页面（工具库）。请主动询问用户的痛点（降本 / 引流 / 客户运营 / 内容生产），并推荐 3 个最匹配的工具。',
      style: 'blue',
      icon: 'Wrench',
    }
  }

  // 6. /guide/[level] - 4 种 OPC 类型学习页
  if (p.startsWith('/guide/')) {
    const lvl = p.split('/guide/')[1]?.split('/')[0] || ''
    const meta: Record<string, { label: string; emoji: string; firstTask: string }> = {
      trader: { label: '交易型 OPC', emoji: '💰', firstTask: '【注册网店】' },
      flow: { label: '流量型 OPC', emoji: '🔥', firstTask: '【注册抖音创作者】' },
      system: { label: '系统型 OPC', emoji: '⚙️', firstTask: '【选择 SOP 工具链】' },
      asset: { label: '资产型 OPC', emoji: '💎', firstTask: '【选择选品赛道】' },
    }
    const m = meta[lvl] || meta.trader
    return {
      kind: `guide-${lvl}` as CopilotKind,
      bubble: `你正在学习 ${m.emoji} ${m.label} 路径。新手任务卡的${m.firstTask}你还没动，需要我帮你列出平台注册链接吗？`,
      dwell30Bubble: `任务卡 30 秒还没点击？需要我帮你直接跳转 ${m.firstTask.replace(/[【】]/g, '')} 平台吗？`,
      dwell60Bubble: `进度卡了？告诉我你卡在哪一步，我直接给你看同类 OPC 是怎么突破的。`,
      cta: { label: '查看新手任务', href: `${p}#starter-tasks` },
      systemHint: `用户正在 /guide/${lvl} 学习 ${m.label} 路径。任务卡前三项是新手必做。请主动询问用户是否需要：1) 任务卡跳转链接；2) 同类 OPC 突破案例；3) 学习路线图。`,
      style: 'blue',
      icon: 'Compass',
    }
  }

  // 7. /member - 个人中心
  if (p === '/member' || p.startsWith('/member?')) {
    return {
      kind: 'member',
      bubble: '你今天还没打卡——首页 STEP 区域有今日待办，连续打卡 7 天可解锁勋章哦。',
      dwell30Bubble: '想了解今日待办详情？点击"AI 智能推荐"按钮，我会基于你最近的进度推送最合适的下一步。',
      dwell60Bubble: '不知道下一步学什么？告诉我你现在最纠结的点（工具选品 / 流量起号 / SOP 落地）。',
      cta: { label: '今日待办', href: '/workspace' },
      systemHint: '用户当前在 /member 个人中心。请主动询问：1) 用户今日是否打卡；2) 是否需要 AI 推荐下一步任务；3) 是否有特定卡点。',
      style: 'rose',
      icon: 'Sparkles',
    }
  }

  // 8. /workspace - 工作台
  if (p === '/workspace' || p.startsWith('/workspace?')) {
    return {
      kind: 'workspace',
      bubble: '你正在看工作台——核心 SOP 任务已就位，建议从优先级最高的任务开始。',
      dwell30Bubble: '连续 2 天没推进？点击"简化任务清单"按钮，我会把高难度任务隐藏，只留 3 项基础打卡。',
      dwell60Bubble: '实操卡点排查不出来？联系主理人一对一带你跑通。',
      cta: { label: '简化任务清单', href: '/workspace?bypass=simplify' },
      systemHint: '用户当前在 /workspace 工作台。任务清单中已包含"今日待办"和"数据看板"。请主动询问：1) 是否需要简化任务；2) 是否需要联系主理人；3) 实时打卡激励。',
      style: 'amber',
      icon: 'Target',
    }
  }

  // 9. /diagnosis - 诊断页
  if (p === '/diagnosis' || p.startsWith('/diagnosis?')) {
    return {
      kind: 'diagnosis',
      bubble: '诊断只需要 60 秒——回答 4 个问题，我会告诉你属于哪种 OPC 类型。',
      dwell30Bubble: '卡在某道题了？告诉我题目关键词，我帮你解读。',
      dwell60Bubble: 'OPC 4 种类型你都了解吗？我可以先给你 1 分钟视频科普。',
      cta: { label: '看 OPC 类型科普', href: '/diagnosis?tour=1' },
      systemHint: '用户在 /diagnosis 诊断页。诊断由 4 个问题组成：业务类型、核心资源、运营痛点、目标规模。请主动引导用户完成诊断，必要时给出 1 分钟科普。',
      style: 'rose',
      icon: 'Compass',
    }
  }

  // 10. 首页 /
  if (p === '/' || p === '') {
    return {
      kind: 'home',
      bubble: '你正在首页 4 步 OPC 路线图。要不要告诉我你现在卡在哪一步，我帮你加速？',
      dwell30Bubble: '想直接进入学习？点这里 → 四库全胜系统',
      dwell60Bubble: '看主页的 4 步路演太长？点这里看 60 秒视频版',
      cta: { label: '四库全胜系统', href: '/market' },
      systemHint: '用户当前在 / 首页。首页包含 STEP 01-04 四步路径。请主动询问用户卡在哪一步。',
      style: 'blue',
      icon: 'Sparkles',
    }
  }

  // default
  return {
    kind: 'default',
    bubble: '✨ 我正在学习本地 AI 案例，需要我帮你找找吗？',
    dwell30Bubble: '想了解 OPC 智富系统？60 秒带你跑通全流程',
    dwell60Bubble: '有问题随时点我，7x24 在线',
    cta: null,
    systemHint: `用户当前路径：${p}。无特殊上下文。`,
    style: 'slate',
    icon: 'Sparkles',
  }
}

/**
 * 根据停留时长挑出该显示的提示语
 * - 0-15s  → bubble
 * - 15-30s → dwell30Bubble
 * - 30s+   → dwell60Bubble
 */
export function pickBubbleByDwell(ctx: CopilotContext, dwellSec: number): string | null {
  if (dwellSec < 15) return ctx.bubble
  if (dwellSec < 30) return ctx.dwell30Bubble || ctx.bubble
  return ctx.dwell60Bubble || ctx.dwell30Bubble || ctx.bubble
}
