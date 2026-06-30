'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Wand2, Loader2, Copy, Check, FileText, Sparkles, ChevronRight } from 'lucide-react'

// 4 步变现体系预置的行业模板
const industryTemplates: Record<string, { audience: string; pains: string[]; questions: string[] }> = {
  教培: {
    audience: 'K12 教培机构校长 / 教培创业者',
    pains: ['招生困难', '续费率低', '老师留不住', '课程同质化', '家长沟通成本高'],
    questions: [
      '您目前最希望解决的招生难题是什么？',
      '您机构的年营收规模大约在哪个区间？',
      '您是否已经尝试过 AI 工具辅助教学？效果如何？',
      '您希望在 3 个月内达到什么目标？',
      '您愿意为一套完整的 AI 招生方案投入多少预算？',
    ],
  },
  电商: {
    audience: '电商卖家 / 品牌主理人 / 直播带货主播',
    pains: ['流量贵', '转化低', '退货率高', '内容产能不足', '广告投放 ROI 低'],
    questions: [
      '您目前在哪个电商平台经营？月销规模如何？',
      '您最头疼的环节是流量、转化还是复购？',
      '您团队有多少人？是否使用过 AI 工具？',
      '您希望 AI 帮您解决哪个具体场景？',
      '您对 AI 落地的预期投入和回报周期是多久？',
    ],
  },
  本地服务: {
    audience: '本地生活服务商家（餐饮/美容/健身/医美等）',
    pains: ['新客引流难', '老客复购低', '员工效率低', '差评管理', '私域转化弱'],
    questions: [
      '您所在的城市和具体行业是？',
      '您门店的月流水大致在什么区间？',
      '您目前主要通过什么渠道获客？',
      '您最希望 AI 帮您自动化哪个环节？',
      '您是否考虑过做会员体系或私域社群？',
    ],
  },
  企业服务: {
    audience: 'B 端企业服务商 / SaaS 创业者 / 咨询公司',
    pains: ['获客难', '销售周期长', '交付成本高', '客户流失', '产品同质化'],
    questions: [
      '您公司的主营业务和目标客户画像是？',
      '您当前的获客渠道主要有哪些？',
      '您销售团队规模多大？成单周期多长？',
      '您最希望 AI 在哪个环节提效？',
      '您对 AI Agent / Workflow 是否有初步了解？',
    ],
  },
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5 },
}

export default function SurveyGenPage() {
  const [industry, setIndustry] = useState('')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<{ audience: string; pains: string[]; questions: string[] } | null>(null)
  const [copied, setCopied] = useState(false)

  const generate = () => {
    if (!industry.trim()) return
    setGenerating(true)
    setResult(null)
    // 模拟 AI 生成延迟
    setTimeout(() => {
      // 优先匹配预置模板，否则用通用模板
      const matched = Object.keys(industryTemplates).find((k) => industry.includes(k))
      const template = matched
        ? industryTemplates[matched]
        : {
            audience: `${industry} 行业从业者 / 创业者`,
            pains: ['获客成本高', '转化效率低', '运营成本上升', '人才稀缺', '增长遇到瓶颈'],
            questions: [
              `您目前在 ${industry} 领域遇到的最大挑战是什么？`,
              '您目前的营收规模在什么区间？',
              '您是否已经尝试过 AI 工具？效果如何？',
              '您希望在 3-6 个月内达成什么目标？',
              '您对 AI 落地的预算和预期回报是？',
            ],
          }
      setResult(template)
      setGenerating(false)
    }, 1200)
  }

  const copyAll = () => {
    if (!result) return
    const text = [
      `【AI 智能诊断表 — ${industry}】`,
      `目标人群：${result.audience}`,
      '',
      '核心痛点：',
      ...result.pains.map((p) => `• ${p}`),
      '',
      '诊断问题：',
      ...result.questions.map((q, i) => `${i + 1}. ${q}`),
    ].join('\n')
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/tools/market"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} />
            返回工具市场
          </Link>
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            4 步变现 · STEP 1
          </span>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Hero */}
        <motion.div {...fadeUp} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Wand2 size={14} />
            知识变现第一步
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            AI 生成智能诊断表
          </h1>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed">
            输入你的行业，AI 一键生成痛点调查表，帮你精准锁定目标人群。
          </p>
        </motion.div>

        {/* 输入区 */}
        <motion.div
          {...fadeUp}
          className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm mb-6"
        >
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            你的行业 / 服务方向
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
              placeholder="例如：教培、电商、本地服务、企业服务..."
              className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            />
            <button
              onClick={generate}
              disabled={generating || !industry.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {generating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  AI 生成中...
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  AI 一键生成
                </>
              )}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-xs text-slate-400">快速选择：</span>
            {Object.keys(industryTemplates).map((k) => (
              <button
                key={k}
                onClick={() => setIndustry(k)}
                className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full hover:bg-amber-100 hover:text-amber-700 transition-colors"
              >
                {k}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 生成结果 */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-2 border-amber-200 rounded-2xl p-5 md:p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                  <FileText size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base leading-tight">
                    AI 智能诊断表 · {industry}
                  </h2>
                  <p className="text-xs text-slate-500">由 AI 自动生成，可直接复制使用</p>
                </div>
              </div>
              <button
                onClick={copyAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-50 transition-colors shadow-sm"
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    一键复制
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-[11px] font-bold text-amber-600 tracking-wider mb-1.5">
                  🎯 目标人群
                </div>
                <div className="bg-white rounded-xl p-3 text-sm text-gray-800 font-medium">
                  {result.audience}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-amber-600 tracking-wider mb-1.5">
                  💡 核心痛点（5 条）
                </div>
                <ul className="bg-white rounded-xl p-3 space-y-1.5">
                  {result.pains.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-[11px] font-bold text-amber-600 tracking-wider mb-1.5">
                  📋 诊断问题（5 题）
                </div>
                <ul className="bg-white rounded-xl p-3 space-y-2">
                  {result.questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="flex-shrink-0 text-amber-500 font-bold">Q{i + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 下一步引导 */}
            <div className="mt-5 pt-5 border-t border-amber-200/60">
              <div className="text-[11px] font-bold text-amber-600 tracking-wider mb-2">
                🚀 下一步
              </div>
              <Link
                href="/services"
                className="group flex items-center justify-between bg-white rounded-xl p-3 hover:shadow-md transition-all"
              >
                <div>
                  <div className="text-sm font-bold text-gray-900">STEP 2 · AI 直播连麦诊断</div>
                  <div className="text-xs text-slate-500 mt-0.5">用 AI 模型快速生成解决方案，建立极强信任</div>
                </div>
                <ChevronRight size={18} className="text-amber-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* 底部说明 */}
        <motion.div
          {...fadeUp}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Sparkles size={14} className="text-amber-500" />
            <span>这是 4 步变现 SOP 的第 1 步：在线诊断表设计</span>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
