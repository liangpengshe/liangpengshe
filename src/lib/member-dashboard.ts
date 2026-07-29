/**
 * 会员数据看板 · Mock 数据层
 *
 * 提供：
 *  - getDiagnosisHistory(phone)  历史诊断记录
 *  - getMetrics(phone)           四维核心指标
 *  - getStageDetail(phone, key)  单阶段历史详情
 *  - getNextAction(stage, level) 智能行动建议
 *
 * 数据策略：
 *  - 优先从 /api/member/roadmap 拉取真实数据
 *  - 落空则用本文件内置的演示数据
 *  - 后续可替换为 Supabase / Prisma
 */

import {
  type UserStage,
  type UserStageKey,
  type OPCLevel,
  getStageLabel,
  isStageCompleted,
  isStageActive,
} from './user-stage'

// ════════════════════════════════════════════════════════════════
// 类型定义
// ════════════════════════════════════════════════════════════════

export type DiagnosisType = 'TRADER' | 'FLOW' | 'SYSTEM' | 'ASSET'

export interface DiagnosisRecord {
  id: string
  date: string
  type: DiagnosisType
  typeLabel: string
  typeEmoji: string
  summary: string
  /** 完整 Markdown 报告（弹窗展示用） */
  fullReport: string
}

export interface MemberMetrics {
  diagnosis: { total: number; latestDate: string | null }
  learning: { unlockedCount: number; totalCount: number; checkins: number }
  operation: { orders: number; tasksDone: number; tasksTotal: number }
  scaling: { matrixTasks: number; stores: number }
}

export interface StageDetail {
  stage: UserStageKey
  label: string
  status: 'completed' | 'active' | 'locked'
  /** 简明描述 */
  summary: string
  /** 关键时间点（已完成阶段） */
  completedAt?: string
  /** 详细列表（每阶段 3-6 条） */
  items: Array<{
    title: string
    desc: string
    meta?: string
  }>
}

export interface NextAction {
  title: string
  description: string
  buttonLabel: string
  buttonHref: string
  tone: 'blue' | 'green' | 'rose' | 'amber' | 'violet'
}

const TYPE_META: Record<DiagnosisType, { label: string; emoji: string }> = {
  TRADER: { label: '交易型诊断', emoji: '💰' },
  FLOW: { label: '流量型诊断', emoji: '🔥' },
  SYSTEM: { label: '系统型诊断', emoji: '⚙️' },
  ASSET: { label: '资产型诊断', emoji: '💎' },
}

// ════════════════════════════════════════════════════════════════
// Mock 数据
// ════════════════════════════════════════════════════════════════

const MOCK_DIAGNOSIS_HISTORY: DiagnosisRecord[] = [
  {
    id: 'diag-2025-12-08',
    date: '2025-12-08',
    type: 'TRADER',
    typeLabel: '交易型诊断',
    typeEmoji: '💰',
    summary: '建议聚焦选品+爆款素材；起跑资金 1-3 万；最快 3-7 天出首单。',
    fullReport: `# 交易型 OPC · 商业蓝图

## 🎯 战略定位
你属于**交易型 OPC 创业者**，核心优势是"快速验证 + 选品嗅觉"。

## 📊 关键指标
- **起跑资金**：1-3 万（推荐）
- **出单周期**：3-7 天（首单）/ 15-30 天（稳定出单）
- **核心技能**：选品眼光 / 基础运营 / 执行力

## 🛠 推荐武器
1. 智富严选（选品库）
2. 灵犀 AI · 商品图（爆款素材）
3. 豹纹工坊（爆款视频脚本）

## 📅 3/7/15 路线图
- **D1-3**：选品 + 货源谈判
- **D4-7**：上架 + 500 元小额广告
- **D8-15**：跑通首单 + 迭代详情页

## 💎 风险提示
- 库存压货
- 广告费超支
- 退货率风险
`,
  },
  {
    id: 'diag-2025-11-20',
    date: '2025-11-20',
    type: 'TRADER',
    typeLabel: '交易型诊断（复诊）',
    typeEmoji: '💰',
    summary: '复盘上阶段：日均出单 2-3 单，复购率 18%。下一步放大 SKU。',
    fullReport: `# 交易型 OPC · 阶段复诊

## 📈 上阶段复盘
- 日均出单：2-3 单
- 复购率：18%
- GMV：¥4,200 / 周

## 🚀 下阶段建议
- 拓展 SKU 至 30+
- 启动第二波内容矩阵
- 接入私域承接
`,
  },
  {
    id: 'diag-2025-10-15',
    date: '2025-10-15',
    type: 'TRADER',
    typeLabel: '交易型诊断（首次）',
    typeEmoji: '💰',
    summary: '首次 AI 综合诊断，建议从单品突破；资金 2 万。',
    fullReport: `# 交易型 OPC · 首次诊断

## 你的画像
- 启动资金：2 万
- 可用时间：3 小时/天
- 风险偏好：稳健

## 推荐路径
先跑通 1 款单品 → 验证选品 → 矩阵放大
`,
  },
]

const MOCK_METRICS: MemberMetrics = {
  diagnosis: { total: 3, latestDate: '2025-12-08' },
  learning: { unlockedCount: 4, totalCount: 6, checkins: 12 },
  operation: { orders: 28, tasksDone: 3, tasksTotal: 5 },
  scaling: { matrixTasks: 2, stores: 1 },
}

// ════════════════════════════════════════════════════════════════
// 公共 API
// ════════════════════════════════════════════════════════════════

/**
 * 获取历史诊断记录（按时间倒序）
 *
 * 数据源：/api/member/roadmap 的 diagnosis + plans，
 * 若没有真实记录则用 Mock 演示数据。
 */
export async function getDiagnosisHistory(
  phone: string | null | undefined
): Promise<DiagnosisRecord[]> {
  if (phone) {
    try {
      const res = await fetch(`/api/member/roadmap`, { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        if (json?.success && json?.data) {
          const list: DiagnosisRecord[] = []
          if (json.data.diagnosis) {
            list.push(mapRoadmapDiagnosis(json.data.diagnosis))
          }
          if (Array.isArray(json.data.plans)) {
            // 商业规划也算诊断
            for (const p of json.data.plans) {
              list.push({
                id: p.id,
                date: p.createdAt?.slice(0, 10) || '',
                type: 'SYSTEM',
                typeLabel: '系统型商业规划',
                typeEmoji: '⚙️',
                summary: p.summary || `目标收入 ¥${p.targetIncome}`,
                fullReport: `# 商业规划\n\n## 目标收入\n¥${p.targetIncome}\n\n## 摘要\n${p.summary || '—'}`,
              })
            }
          }
          if (list.length > 0) {
            return list.sort((a, b) => (a.date < b.date ? 1 : -1))
          }
        }
      }
    } catch (e) {
      console.warn('[member-dashboard] roadmap fetch failed, fallback to mock', e)
    }
  }
  return [...MOCK_DIAGNOSIS_HISTORY]
}

function mapRoadmapDiagnosis(d: any): DiagnosisRecord {
  const type: DiagnosisType = 'TRADER'
  const meta = TYPE_META[type]
  return {
    id: d.id || `diag-${d.createdAt}`,
    date: (d.createdAt || '').slice(0, 10),
    type,
    typeLabel: meta.label,
    typeEmoji: meta.emoji,
    summary: d.summary || '已完成 AI 商业诊断',
    fullReport: d.aiReport || `# 诊断报告\n\n${d.summary || '—'}`,
  }
}

/**
 * 获取四维核心指标
 */
export async function getMetrics(
  _phone: string | null | undefined,
  _stage?: UserStage | null
): Promise<MemberMetrics> {
  // 后续可对接真实数据；当前用 Mock + stage 加权
  return { ...MOCK_METRICS }
}

/**
 * 获取某一阶段的历史详情
 * （点击进度条节点时调用）
 */
export function getStageDetail(
  stage: UserStageKey,
  userStage: UserStage | null,
  metrics: MemberMetrics
): StageDetail {
  const label = getStageLabel(stage)
  const status: 'completed' | 'active' | 'locked' = userStage
    ? isStageCompleted(userStage, stage)
      ? 'completed'
      : isStageActive(userStage, stage)
        ? 'active'
        : 'locked'
    : 'active'

  switch (stage) {
    case 'diagnosis':
      return {
        stage,
        label,
        status,
        summary: '你已经完成了 AI 商业诊断，定位在四层创业阶梯中的位置。',
        completedAt:
          status === 'completed' ? metrics.diagnosis.latestDate || undefined : undefined,
        items: [
          {
            title: '已完成 AI 综合诊断',
            desc: '通过 4 问对话，AI 定位你在四层阶梯中的最佳位置。',
            meta: `诊断次数：${metrics.diagnosis.total} 次`,
          },
          {
            title: '生成《OPC 智富蓝皮书》',
            desc: '包含战略定位 / 关键指标 / 推荐武器 / 3·7·15 路线图。',
            meta: status === 'completed' ? '已生成' : '可生成',
          },
          {
            title: '已选定 OPC 创业路径',
            desc: '基于你的偏好，自动匹配交易型/流量型/系统型/资产型。',
            meta: userStage?.opcLevel ? userStage.opcLevel : '未选择',
          },
        ],
      }

    case 'learning':
      return {
        stage,
        label,
        status,
        summary: '进入四库学习阶段，工具智选 + SOP 矩阵 + 案例拆解。',
        items: [
          {
            title: '已解锁工具 / 资源',
            desc: '在四库中完成首次配置的工具数。',
            meta: `${metrics.learning.unlockedCount} / ${metrics.learning.totalCount}`,
          },
          {
            title: '学习打卡',
            desc: '完成每日 SOP 任务的次数。',
            meta: `累计 ${metrics.learning.checkins} 次`,
          },
          {
            title: '良朋社 SOP 同步',
            desc: '从智富研报中同步过来的关键打法。',
            meta: status === 'completed' ? '已同步' : '待同步',
          },
        ],
      }

    case 'operation':
      return {
        stage,
        label,
        status,
        summary: '在四库完成实操，工具落地 + 工作台任务 + 出单数据回流。',
        items: [
          {
            title: '工作台出单量',
            desc: '从工作台导入的订单数。',
            meta: `${metrics.operation.orders} 单`,
          },
          {
            title: '今日任务完成率',
            desc: 'AI 自动派发的实操任务完成情况。',
            meta: `${metrics.operation.tasksDone} / ${metrics.operation.tasksTotal}`,
          },
          {
            title: '商品图 / 视频素材',
            desc: '通过豹纹工坊（豹纹+）产出的爆款素材。',
            meta: '12 张主图 + 3 支短视频',
          },
        ],
      }

    case 'scaling':
      return {
        stage,
        label,
        status,
        summary: '完成矩阵复制与城市分站扩张。',
        items: [
          {
            title: '矩阵复制任务',
            desc: '在多平台 / 多账号复制的任务数。',
            meta: `${metrics.scaling.matrixTasks} 个任务`,
          },
          {
            title: '已复制店铺 / 账号',
            desc: '已完成跨平台复制的店铺或账号。',
            meta: `${metrics.scaling.stores} 个`,
          },
          {
            title: '城市分站申请',
            desc: '升级为某城市主理人 / 合伙人。',
            meta: status === 'completed' ? '已成为主理人' : '可申请',
          },
        ],
      }
  }
}

/**
 * 基于 current_stage + opc_level 渲染下一步行动建议
 */
export function getNextAction(
  stage: UserStage | null,
  opcLevel: OPCLevel | null | undefined
): NextAction {
  if (!stage) {
    return {
      title: '加载中…',
      description: '正在读取你的商业地图。',
      buttonLabel: '前往首页',
      buttonHref: '/',
      tone: 'blue',
    }
  }

  if (!opcLevel) {
    return {
      title: '你还未选择 OPC 创业路径',
      description: '完成 4 问 AI 对话，系统会根据你的偏好自动匹配交易型/流量型/系统型/资产型。',
      buttonLabel: '立即开始诊断 →',
      buttonHref: '/diagnosis',
      tone: 'blue',
    }
  }

  switch (stage.current) {
    case 'diagnosis':
      return {
        title: `你已选定【${getStageLabel(stage.current)}】阶段`,
        description: `建议你现在前往【学习中心】配置你的首款 AI 工具，进入四库系统。`,
        buttonLabel: '前往工具库 →',
        buttonHref: '/tools',
        tone: 'blue',
      }
    case 'learning':
      return {
        title: `你正处于【学习入门】阶段`,
        description: `建议你现在前往【四库智富】，完成每日 SOP 打卡，开始实操。`,
        buttonLabel: '进入四库智富 →',
        buttonHref: '/market',
        tone: 'green',
      }
    case 'operation':
      return {
        title: `你已进入【实操执行】阶段`,
        description: `你已经跑通了工作流，是时候解锁【矩阵放大】。复制你的成功到多平台 / 多账号。`,
        buttonLabel: '解锁矩阵放大 →',
        buttonHref: '/partner',
        tone: 'rose',
      }
    case 'scaling':
      return {
        title: `恭喜！你已抵达【放大阶段】`,
        description: `现在可以申请成为某城市的【主理人 / 合伙人】，构建你自己的城市 OPC 生态。`,
        buttonLabel: '申请成为主理人 →',
        buttonHref: '/partner',
        tone: 'amber',
      }
  }
}
