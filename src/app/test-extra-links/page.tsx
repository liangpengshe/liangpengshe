'use client'

/**
 * extraLinks 渲染效果测试页
 * ------------------------------------------------------------
 * 入口：访问 /test-extra-links
 * 作用：在本地浏览器中快速验证 subStep 卡片多行胶囊按钮的渲染效果
 *
 * 模拟数据：
 *   - 1-1 开通支付宝（基线：无 extraLinks，仅 actionUrl）
 *   - 2-2 安装店群运营插件包（4 个 extraLinks 工具胶囊）
 *   - 2-3 开通版权检测与AI辅助（4 个 extraLinks 工具胶囊）
 *   - 1-3 开店须知（纯文字，无 actionUrl / 无 extraLinks）
 * ------------------------------------------------------------
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ExternalLink, Sparkles, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubStep {
  id: string
  title: string
  desc: string
  actionUrl?: string
  actionLabel?: string
  extraLinks?: { label: string; href: string }[]
}

const MOCK_SUBSTEPS: SubStep[] = [
  {
    id: '1-1',
    title: '开通支付宝',
    desc: '注册并实名认证支付宝账号，用于店铺收款与资金流转。',
    actionUrl: 'https://www.alipay.com/',
    actionLabel: '🅰️ 打开支付宝',
    // 无 extraLinks（基线对照）
  },
  {
    id: '2-2',
    title: '安装店群运营插件包',
    desc: '下载并安装哈士奇、至尊宝电商插件；配置阿奇索自动发货与抖羚羊裂变工具。',
    actionUrl: 'https://hsq.dangxun.com/',
    actionLabel: '🦊 打开哈士奇插件',
    extraLinks: [
      { label: '哈士奇', href: 'https://hsq.dangxun.com/' },
      { label: '至尊宝', href: 'https://zzb.zzbtool.com' },
      { label: '阿奇索', href: 'https://www.agiso.com/' },
      { label: '抖羚羊', href: 'https://doulingyang.cn' },
    ],
  },
  {
    id: '2-3',
    title: '开通版权检测与AI辅助',
    desc: '开通天眼查版权检测，将百度网盘、夸克网盘接入 AI 辅助工作流。',
    actionUrl: 'https://banquan.tianyancha.com/zp',
    actionLabel: '🛡️ 打开天眼查版权检测',
    extraLinks: [
      { label: '天眼查', href: 'https://banquan.tianyancha.com/zp' },
      { label: '百度网盘', href: 'https://pan.baidu.com/' },
      { label: '夸克网盘', href: 'https://pan.quark.cn/' },
      { label: '任推邦', href: 'https://dtbd.cn/#/pages/login/register?invite_code=0389221&qd=self_fans_h5' },
    ],
  },
  {
    id: '1-3',
    title: '开店须知',
    desc: '保证金：2000元（可退）；运营资金：1000-3000元（用于首单、推广及基础销量）。1张身份证可开3个支付宝，对应开3家个人店。',
    // 纯文字，无 actionUrl / 无 extraLinks
  },
]

export default function TestExtraLinksPage() {
  // 模拟打卡状态（点击圆形框会切换）
  const [subDone, setSubDone] = useState<Set<string>>(new Set())
  // 模拟付费会员（false → 后两个 subStep 会显示锁定态）
  const [isPaidMember, setIsPaidMember] = useState(false)
  // 展开所有 subStep
  const [showLocked, setShowLocked] = useState(true)

  const handleToggle = (id: string) => {
    setSubDone((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const reset = () => {
    setSubDone(new Set())
  }

  const checkAll = () => {
    setSubDone(new Set(MOCK_SUBSTEPS.map((s) => s.id)))
  }

  // 模拟 FREE_MAIN_STEPS = 2 的行为：idx >= 2 的视为锁定
  const isLocked = (idx: number) => !isPaidMember && idx >= 2

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 顶部调试条 */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 font-bold text-violet-700">
            <Sparkles size={14} />
            extraLinks 渲染测试
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">路径：<code className="text-slate-700">/test-extra-links</code></span>
          <div className="ml-auto flex items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isPaidMember}
                onChange={(e) => setIsPaidMember(e.target.checked)}
                className="w-3.5 h-3.5 accent-violet-600"
              />
              <span className="text-slate-600">付费会员</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showLocked}
                onChange={(e) => setShowLocked(e.target.checked)}
                className="w-3.5 h-3.5 accent-violet-600"
              />
              <span className="text-slate-600">显示锁定态</span>
            </label>
            <button
              onClick={reset}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition"
            >
              <RotateCcw size={11} />
              重置打卡
            </button>
            <button
              onClick={checkAll}
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition"
            >
              <Check size={11} />
              全部打卡
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* 标题区 */}
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">🧪 extraLinks 渲染测试</h1>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            下面 4 个 subStep 卡片是 <code className="text-violet-700 bg-violet-50 px-1 rounded">projects/[slug]/page.tsx</code> 中 subStep 渲染逻辑的 1:1 复刻。
            重点观察：
          </p>
          <ul className="mt-2 text-xs text-slate-500 space-y-1 list-disc pl-5">
            <li>1-1 开通支付宝 → 基线（仅 actionUrl 按钮）</li>
            <li>2-2 安装店群运营插件包 → 4 个工具胶囊 + 1 个 actionUrl 按钮</li>
            <li>2-3 开通版权检测与AI辅助 → 4 个工具胶囊 + 1 个 actionUrl 按钮</li>
            <li>1-3 开店须知 → 纯文字（无按钮）</li>
          </ul>
        </div>

        {/* 模拟主步骤卡片头（仅展示视觉上下文） */}
        <div className="bg-white rounded-2xl border-2 border-blue-300 shadow-md p-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white font-extrabold flex items-center justify-center">
              1
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">第 1 步 · 开店申请（模拟卡片）</h2>
              <p className="text-xs text-slate-500">完成淘宝数字店铺入驻，提交资质并激活商品类目。</p>
            </div>
          </div>

          {/* 子步骤列表（复刻主流程） */}
          <div className="mt-5 flex flex-col gap-2">
            {MOCK_SUBSTEPS.slice(0, 1).map((sub) => {
              const idx = 0
              return renderSubStep(sub, idx, subDone, handleToggle, isLocked)
            })}
          </div>
        </div>

        {/* 模拟主步骤卡片头（第 2 步：开店工具） */}
        <div className="bg-white rounded-2xl border-2 border-blue-300 shadow-md p-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white font-extrabold flex items-center justify-center">
              2
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">第 2 步 · 开店工具（模拟卡片）</h2>
              <p className="text-xs text-slate-500">配置阿奇索自动发货、千牛工作台等首批运营工具。</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            {MOCK_SUBSTEPS.slice(1, 3).map((sub, i) => {
              const idx = 1
              const subLocked = isLocked(idx) && !showLocked ? true : isLocked(idx)
              return renderSubStep(sub, idx, subDone, handleToggle, (i: number) => subLocked)
            })}
          </div>
        </div>

        {/* 模拟主步骤卡片头（第 3 步：基础设置） */}
        <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md p-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 text-white font-extrabold flex items-center justify-center">
              3
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">第 3 步 · 基础设置（模拟卡片）</h2>
              <p className="text-xs text-slate-500">完善店铺基础信息：头像、简介、绑定支付通道。</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            {MOCK_SUBSTEPS.slice(3).map((sub) => {
              const idx = 2
              const subLocked = isLocked(idx) && !showLocked ? true : isLocked(idx)
              return renderSubStep(sub, idx, subDone, handleToggle, () => subLocked)
            })}
          </div>
        </div>

        {/* 调试信息面板 */}
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 text-xs font-mono space-y-1">
          <div className="text-slate-400">// 当前状态</div>
          <div>isPaidMember = <span className="text-amber-400">{String(isPaidMember)}</span></div>
          <div>showLocked = <span className="text-amber-400">{String(showLocked)}</span></div>
          <div>subDone = <span className="text-emerald-400">[{Array.from(subDone).join(', ')}]</span></div>
        </div>
      </div>
    </div>
  )
}

/**
 * 复刻 projects/[slug]/page.tsx 中的 subStep 卡片渲染逻辑
 * （保持 1:1 视觉，便于对比实际页面效果）
 */
function renderSubStep(
  sub: SubStep,
  mainIdx: number,
  subDone: Set<string>,
  handleToggle: (id: string) => void,
  isLocked: (subIdx: number) => boolean
) {
  const subChecked = subDone.has(sub.id)
  const subIsLocked = isLocked(mainIdx)
  return (
    <div
      key={sub.id}
      className={cn(
        'group relative flex items-start gap-3 rounded-xl border p-3 md:p-3.5 transition-all min-h-[64px]',
        subChecked
          ? 'border-emerald-200 bg-emerald-50/50'
          : subIsLocked
            ? 'border-slate-200 bg-slate-50/40'
            : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
      )}
    >
      {/* 圆形选择框 */}
      <button
        type="button"
        onClick={() => !subIsLocked && handleToggle(sub.id)}
        disabled={subIsLocked}
        className={cn(
          'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all min-h-[28px]',
          subChecked
            ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-500 text-white shadow-sm'
            : subIsLocked
              ? 'border-slate-200 bg-slate-100 cursor-not-allowed'
              : 'border-slate-300 bg-white group-hover:border-blue-500 hover:scale-110 active:scale-95'
        )}
        aria-label={subChecked ? '取消完成' : '标记完成'}
      >
        <AnimatePresence>
          {subChecked && (
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            >
              <Check size={16} strokeWidth={3.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* 子步骤内容 */}
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'text-sm font-bold leading-snug',
            subChecked ? 'text-slate-400 line-through' : 'text-slate-900'
          )}
        >
          {sub.title}
        </div>
        <div
          className={cn(
            'mt-0.5 text-xs leading-relaxed',
            subChecked ? 'text-slate-400' : 'text-slate-500'
          )}
        >
          {sub.desc}
        </div>
        {/* 多行胶囊按钮（任务升级：仅作快捷通道，无打卡功能） */}
        {sub.extraLinks && sub.extraLinks.length > 0 && !subChecked && !subIsLocked && (
          <div className="flex flex-wrap gap-2 mt-2">
            {sub.extraLinks.map((lk, lkIdx) => (
              <a
                key={`${sub.id}-lk-${lkIdx}`}
                href={lk.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition min-h-[28px] inline-flex items-center gap-1"
              >
                <ExternalLink size={10} className="text-slate-400" />
                {lk.label}
              </a>
            ))}
          </div>
        )}
        {/* 操作链接 */}
        {sub.actionUrl && !subChecked && !subIsLocked && (
          <a
            href={sub.actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors min-h-[28px]"
          >
            <ExternalLink size={11} />
            {sub.actionLabel || '打开相关工具'}
          </a>
        )}
      </div>

      {/* AI 助手悬浮按钮 [Task 4] - 模拟 */}
      {!subChecked && !subIsLocked && (
        <button
          type="button"
          className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-sm hover:shadow-md transition min-h-[28px]"
          aria-label="AI 助手"
          title="AI 助手"
        >
          <Sparkles size={12} />
        </button>
      )}
    </div>
  )
}
