'use client'

/**
 * 进化三：多模态资产生成器 · 智富资产工坊
 * ------------------------------------------------------------
 * 在 /member 页面集成"AI 生成SOP简图"功能：
 *   1. 调用 Dify 生成 HTML 简图代码（含品牌、阶段、核心任务）
 *   2. 前端使用 html2canvas 截图
 *   3. 用户下载后自动发放 10 良朋币
 * ------------------------------------------------------------
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Loader2,
  Download,
  X,
  CheckCircle2,
  Image as ImageIcon,
  Wand2,
  Coins,
} from 'lucide-react'
import { readOPCRouteFromStorage, type OPCLevel } from '@/lib/user-stage'

interface Props {
  phone?: string
  stage?: string
  onClose?: () => void
  onSuccess?: (result: { blob: Blob; filename: string; pointsAwarded: number }) => void
}

const LEVEL_META: Record<OPCLevel, { emoji: string; label: string; gradient: string }> = {
  TRADER: { emoji: '💰', label: '交易型 OPC', gradient: 'from-amber-500 to-orange-600' },
  FLOW:   { emoji: '🔥', label: '流量型 OPC', gradient: 'from-rose-500 to-pink-600' },
  SYSTEM: { emoji: '⚙️', label: '系统型 OPC', gradient: 'from-blue-500 to-cyan-600' },
  ASSET:  { emoji: '💎', label: '资产型 OPC', gradient: 'from-violet-500 to-purple-600' },
}

const STAGE_TASKS: Record<string, { title: string; tasks: string[] }> = {
  diagnosis: {
    title: 'STEP 01 · AI 商业 IP 诊断',
    tasks: [
      '回答 4 个核心问题，定位 OPC 类型',
      '获取专属 OPC 路径推荐',
      '解锁四库全胜系统访问权限',
    ],
  },
  learning: {
    title: 'STEP 02 · 智富严选学习',
    tasks: [
      '通读《智富严选选品 SOP》',
      '完成 3 项新手启航任务（+100分）',
      '解锁运营实操权限（≥80分）',
    ],
  },
  operation: {
    title: 'STEP 03 · 运营实操',
    tasks: [
      '在四库中挑选 2-3 个工具/项目',
      '搭建首单 SOP 模板',
      '跑通首单，赚第一笔钱',
    ],
  },
  scaling: {
    title: 'STEP 04 · 矩阵放大',
    tasks: [
      '城市主理人申请',
      '搭建本地沙龙网络',
      '对接 OPC 全球生态',
    ],
  },
}

export function SOPImageGenerator({ phone, stage = 'learning', onClose, onSuccess }: Props) {
  const [generating, setGenerating] = useState(false)
  const [html, setHtml] = useState<string>('')
  const [previewRef, setPreviewRef] = useState<HTMLDivElement | null>(null)
  const [coinsAwarded, setCoinsAwarded] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [opcLevel, setOpcLevel] = useState<OPCLevel | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setOpcLevel(readOPCRouteFromStorage())
  }, [])

  // 构建本地兜底 HTML（不依赖 Dify）
  const buildLocalHTML = (): string => {
    const lvl = opcLevel ? LEVEL_META[opcLevel] : { emoji: '🌱', label: 'OPC 新手', gradient: 'from-slate-500 to-slate-600' }
    const stageData = STAGE_TASKS[stage] || STAGE_TASKS.learning
    const today = new Date().toLocaleDateString('zh-CN')
    return `
      <div style="
        width: 600px;
        padding: 32px;
        font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
        background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
        color: #0f172a;
        box-sizing: border-box;
      ">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="
              width: 48px; height: 48px; border-radius: 14px;
              background: linear-gradient(135deg, #3b82f6, #6366f1);
              display: flex; align-items: center; justify-content: center;
              color: white; font-weight: 800; font-size: 22px;
            ">智</div>
            <div>
              <div style="font-size: 11px; color: #3b82f6; font-weight: 700; letter-spacing: 1px;">良朋社 OPC</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a;">智富严选周计划</div>
            </div>
          </div>
          <div style="
            background: linear-gradient(135deg, ${opcLevel ? LEVEL_META[opcLevel].gradient.replace('from-', '').replace('to-', '') : '#64748b,#475569'});
            color: white; padding: 6px 12px; border-radius: 20px;
            font-size: 12px; font-weight: 800;
          ">${lvl.emoji} ${lvl.label}</div>
        </div>

        <div style="
          background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
          border-radius: 18px; padding: 20px 24px; margin-bottom: 20px;
          border: 1px solid #e0e7ff;
        ">
          <div style="font-size: 11px; color: #6366f1; font-weight: 700; letter-spacing: 1px; margin-bottom: 6px;">📍 当前阶段</div>
          <div style="font-size: 20px; font-weight: 800; color: #1e293b; line-height: 1.3;">${stageData.title}</div>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 12px; letter-spacing: 0.5px;">🎯 本周核心任务</div>
          ${stageData.tasks.map((t, i) => `
            <div style="
              display: flex; align-items: flex-start; gap: 12px; padding: 12px 0;
              border-bottom: ${i < stageData.tasks.length - 1 ? '1px dashed #e2e8f0' : 'none'};
            ">
              <div style="
                flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%;
                background: linear-gradient(135deg, #3b82f6, #6366f1);
                color: white; display: flex; align-items: center; justify-content: center;
                font-size: 12px; font-weight: 800;
              ">${i + 1}</div>
              <div style="font-size: 14px; color: #1e293b; line-height: 1.5; padding-top: 2px;">${t}</div>
            </div>
          `).join('')}
        </div>

        <div style="
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 16px; border-top: 1px solid #e2e8f0;
        ">
          <div style="font-size: 10px; color: #94a3b8;">📅 ${today} · 良朋社出品</div>
          <div style="
            background: linear-gradient(135deg, #f59e0b, #ef4444);
            color: white; padding: 4px 10px; border-radius: 12px;
            font-size: 10px; font-weight: 800;
          ">🔥 智富严选</div>
        </div>
      </div>
    `
  }

  // 生成预览
  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    setCoinsAwarded(null)
    try {
      // 1. 尝试调用 Dify
      const res = await fetch('/api/ai/sop-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opcLevel: opcLevel || 'NONE',
          stage,
        }),
      })
      const data = await res.json()
      const generatedHtml = data?.data?.html || buildLocalHTML()
      setHtml(generatedHtml)
    } catch (e) {
      // 降级：本地构建
      setHtml(buildLocalHTML())
    } finally {
      setGenerating(false)
    }
  }

  // 下载并发放智富积分
  const handleDownload = async () => {
    if (!previewRef) return
    setDownloading(true)
    setError(null)
    try {
      // 动态导入 html2canvas
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(previewRef, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      })
      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
      })
      const filename = `智富严选周计划-${stage}-${Date.now()}.png`
      // 触发下载
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)

      // 发放智富积分
      if (phone) {
        const pointsRes = await fetch('/api/points', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'task-reward',
            userId: phone,
            taskType: 'SOP_IMAGE_DOWNLOAD',
            amount: 10,
            remark: 'AI SOP 简图下载奖励',
          }),
        })
        const pointsData = await pointsRes.json()
        if (pointsData?.success) {
          setCoinsAwarded(pointsData?.data?.balance ?? 10)
          onSuccess?.({ blob, filename, pointsAwarded: pointsData?.data?.balance ?? 10 })
        } else {
          onSuccess?.({ blob, filename, pointsAwarded: 0 })
        }
      } else {
        onSuccess?.({ blob, filename, pointsAwarded: 0 })
      }
    } catch (e) {
      setError((e as Error).message || '下载失败，请重试')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center">
            <Wand2 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              🎨 智富资产工坊
              <span className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-full">
                进化三
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              AI 一键生成可分享的 SOP 简图
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
        📍 基于你当前的 <strong>{opcLevel ? LEVEL_META[opcLevel].label : 'OPC 路径'}</strong> 和阶段
        <strong className="text-violet-600">「{STAGE_TASKS[stage]?.title || STAGE_TASKS.learning.title}」</strong>，
        生成朋友圈长图。下载后自动奖励 <strong className="text-amber-600">10 智富积分</strong>。
      </p>

      {!html && !generating && (
        <button
          onClick={handleGenerate}
          className="w-full py-3 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-white text-sm font-extrabold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Sparkles size={16} />
          AI 生成 SOP 简图
        </button>
      )}

      {generating && (
        <div className="w-full py-3 bg-slate-100 text-slate-500 text-sm font-bold rounded-xl flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          AI 正在为你设计专属周计划…
        </div>
      )}

      {error && (
        <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-700">
          {error}
        </div>
      )}

      <AnimatePresence>
        {html && !generating && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* 预览 */}
            <div className="bg-slate-100 rounded-xl p-3 overflow-auto max-h-96">
              <div ref={setPreviewRef} dangerouslySetInnerHTML={{ __html: html }} />
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <Sparkles size={12} />
                重新生成
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-extrabold rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {downloading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    正在生成图片…
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    下载图片 · +10 智富积分
                  </>
                )}
              </button>
            </div>

            {/* 智富积分到账提示 */}
            {coinsAwarded !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg"
              >
                <Coins size={16} className="text-amber-500" />
                <span className="text-xs text-amber-800 font-bold flex-1">
                  <CheckCircle2 size={12} className="inline-block mr-1 text-emerald-500" />
                  奖励已到账！+{coinsAwarded} 智富积分
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[9px] text-slate-400 mt-2 text-center">
        💡 适合发朋友圈/小红书，让你的 OPC 朋友圈都看到你的智富进度
      </p>
    </div>
  )
}
