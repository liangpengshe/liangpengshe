/**
 * ════════════════════════════════════════════════════════════════
 *  诊断页 4 问对话脚本 · 任务 W2 拆分
 * ════════════════════════════════════════════════════════════════
 *
 *  之前内联在 src/app/diagnosis/page.tsx（line 42-97），现抽离到独立文件：
 *  1. 纯数据，无 React 依赖
 *  2. 未来可通过 CMS / API 动态下发
 *  3. 单测可单独覆盖
 *
 *  维度：identity（身份）/ strength（优势）/ bottleneck（瓶颈）/ goal（目标）
 *  覆盖 OPC 四层（trading / traffic / system / asset）的定位推演
 * ════════════════════════════════════════════════════════════════
 */

export type QuestionKey = 'identity' | 'strength' | 'bottleneck' | 'goal'

export interface QuestionOption {
  value: string
  label: string
  emoji: string
  desc?: string
}

export interface Question {
  key: QuestionKey
  text: string
  options: QuestionOption[]
}

export const DIAGNOSIS_QUESTIONS: Question[] = [
  {
    key: 'identity',
    text: '您目前的身份是？',
    options: [
      { value: 'solo', label: '个人创业者', emoji: '🧑‍💻' },
      { value: 'micro', label: '小微团队', emoji: '👥' },
      { value: 'boss', label: '企业主', emoji: '👔' },
      { value: 'other', label: '其他', emoji: '🔍' },
    ],
  },
  {
    key: 'strength',
    text: '您最擅长/具备的核心优势是什么？',
    options: [
      { value: 'content', label: '写文案做内容', emoji: '✍️' },
      { value: 'supply', label: '懂供应链', emoji: '📦' },
      { value: 'tech', label: '有技术背景', emoji: '⚙️' },
      { value: 'sales', label: '擅长销售', emoji: '💬' },
      { value: 'local', label: '有本地资源', emoji: '🏘️' },
    ],
  },
  {
    key: 'bottleneck',
    text: '您当前面临的最大瓶颈是什么？',
    options: [
      { value: 'traffic', label: '不知道怎么获客', emoji: '🚦' },
      { value: 'monetize', label: '不知道怎么变现', emoji: '💸' },
      { value: 'pricing', label: '不知道怎么定高价', emoji: '💎' },
      { value: 'scale', label: '不知道怎么复制放大', emoji: '🚀' },
    ],
  },
  {
    key: 'goal',
    text: '您的核心目标是？',
    options: [
      { value: 'first', label: '先跑通一单', emoji: '🎯' },
      { value: '30k', label: '稳定月入 3 万', emoji: '📈' },
      { value: 'enterprise', label: '接企业高客单', emoji: '🏢' },
      { value: 'national', label: '成为全国主理人', emoji: '🌐' },
    ],
  },
]
