'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Copy, Check, MessageCircle, Gift, X, Download } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface ShareReportCTAProps {
  /** 用户姓名（来自报告输入） */
  userName?: string
  /** 报告类型，用于分享链接区分 */
  reportType: 'diagnose' | 'plan' | 'tools'
  /** 报告标题 */
  title: string
  /** 报告核心摘要（用于海报） */
  summary: string
  /** 报告 id（可选，如果有数据库记录就传） */
  reportId?: string
  /** 主题色（不同 AI 组件用不同色） */
  themeColor?: 'blue' | 'purple' | 'emerald'
  /** 报告内容（可选，海报页可用） */
  content?: string
}

const WECHAT_HELPER_QR =
  // 良朋社小助手朋朋的企微活码 URL（无对接时 fallback 到落地页）
  (typeof window !== 'undefined' && (window as any).__WECHAT_HELPER_URL) ||
  'https://work.weixin.qq.com/kfid/kfc1d62a31c2c9d1b2e'

const COLOR_MAP = {
  blue: {
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    bg: 'from-blue-50 to-indigo-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  purple: {
    gradient: 'from-purple-600 via-fuchsia-600 to-pink-600',
    bg: 'from-purple-50 to-pink-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
  },
  emerald: {
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    bg: 'from-emerald-50 to-teal-50',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
  },
} as const

export default function ShareReportCTA({
  userName = '朋友',
  reportType,
  title,
  summary,
  reportId,
  themeColor = 'blue',
}: ShareReportCTAProps) {
  const [showShareModal, setShowShareModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const c = COLOR_MAP[themeColor]

  // 构造分享链接（带参数）
  const shareUrl = buildShareUrl({
    type: reportType,
    id: reportId,
    user: userName,
    title,
    summary,
  })

  const shareText = `📢 我刚用「良朋社」AI 诊断生成的报告，${title}，推荐你也试试！`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 降级：选中文字
      const t = document.createElement('textarea')
      t.value = `${shareText}\n${shareUrl}`
      document.body.appendChild(t)
      t.select()
      document.execCommand('copy')
      document.body.removeChild(t)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: '良朋社 AI 诊断报告',
          text: shareText,
          url: shareUrl,
        })
      } catch {
        /* 用户取消 */
      }
    } else {
      handleCopy()
    }
  }

  return (
    <>
      <div
        className={`mt-5 rounded-2xl border-2 ${c.border} bg-gradient-to-br ${c.bg} p-4 md:p-5`}
      >
        {/* 分享按钮（顶部显眼位置） */}
        <button
          onClick={() => setShowShareModal(true)}
          className={`w-full py-3.5 bg-gradient-to-r ${c.gradient} text-white font-bold rounded-2xl text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2`}
        >
          <Share2 size={18} />
          📢 把这个超准的 AI 诊断报告分享给老板朋友，帮他省 3000 块咨询费！
        </button>

        {/* 微信引流区 */}
        <div className="mt-4 flex items-center gap-3">
          {/* 动态二维码（朋朋） */}
          <div className="flex-shrink-0 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
            <QRCodeSVG
              value={WECHAT_HELPER_QR}
              size={92}
              level="M"
              imageSettings={{
                src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20logo%20pengpeng%20cartoon%20penguin%20white%20background%20centered&image_size=square',
                width: 22,
                height: 22,
                excavate: true,
              }}
            />
          </div>

          {/* 文案 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
              <MessageCircle size={14} className={c.text} />
              扫码添加「良朋社小助手（朋朋）」
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mt-1">
              发送你的报告截图
              <br />
              <span className="font-semibold text-amber-600">
                立即赠送《AI 工具包》一份
              </span>
            </p>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400">
              <Gift size={10} />
              限前 500 名 · 价值 999 元
            </div>
          </div>
        </div>
      </div>

      {/* 分享弹窗 */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full md:max-w-md bg-white rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className={`bg-gradient-to-r ${c.gradient} px-6 py-5 text-white`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Share2 size={18} />
                    分享专属海报
                  </h3>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="text-xs text-white/90 mt-1">
                  转发给好友 / 朋友圈，帮他也省 3000 块咨询费
                </p>
              </div>

              {/* 海报预览 */}
              <div className="p-5 max-h-[60vh] overflow-y-auto">
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-4 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1.5 text-center">👇 海报预览</div>
                  <div
                    className={`bg-gradient-to-br ${c.bg} rounded-2xl p-5 text-center border-2 ${c.border}`}
                  >
                    <div className="text-3xl mb-2">🧠</div>
                    <div className={`text-xs font-bold ${c.text} mb-1`}>良朋社 AI 报告</div>
                    <div className="text-base font-bold text-gray-900 leading-snug mb-2 line-clamp-2">
                      {userName}的 {title}
                    </div>
                    <div className="text-xs text-gray-700 leading-relaxed line-clamp-3 mb-3">
                      {summary}
                    </div>
                    <div className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1 text-[10px] text-gray-500">
                      <span>📱 长按识别二维码立即查看</span>
                    </div>
                  </div>
                </div>

                {/* 分享链接 */}
                <div className="mt-4">
                  <label className="text-xs text-gray-500 mb-1.5 block">分享链接</label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={shareUrl}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 truncate"
                    />
                    <button
                      onClick={handleCopy}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                        copied
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? '已复制' : '复制'}
                    </button>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={handleNativeShare}
                    className={`py-3 bg-gradient-to-r ${c.gradient} text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md`}
                  >
                    <MessageCircle size={16} />
                    微信分享
                  </button>
                  <button
                    onClick={handleCopy}
                    className="py-3 bg-white border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50"
                  >
                    <Download size={16} />
                    复制文案
                  </button>
                </div>

                <p className="text-[10px] text-gray-400 text-center mt-3">
                  分享即同意《良朋社用户协议》· 转发可享专属福利
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function buildShareUrl(params: {
  type: string
  id?: string
  user: string
  title: string
  summary: string
}): string {
  if (typeof window === 'undefined') {
    return `https://liangpengshe.com/share/${params.type}/${params.id || 'preview'}`
  }
  const origin = window.location.origin
  const q = new URLSearchParams({
    user: params.user,
    title: params.title,
    summary: params.summary,
  })
  if (params.id) q.set('id', params.id)
  return `${origin}/share/${params.type}?${q.toString()}`
}
