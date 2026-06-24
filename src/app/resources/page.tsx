'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Rocket,
  Shield,
  Gift,
  Radio,
  Users,
  Handshake,
  Calendar,
  Building2,
  Cloud,
  Sparkles,
  X,
  CheckCircle2,
  Send,
  User,
  Phone,
  FileText,
  Tag as TagIcon,
} from 'lucide-react'
import AIMatchmakerWidget from '@/components/AIMatchmakerWidget'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const partners = [
  { name: '硅基流动', icon: Cloud, premium: true },
  { name: '智谱AI', icon: Sparkles, premium: true },
  { name: '阿里云', icon: Building2, premium: false },
  { name: '腾讯云', icon: Building2, premium: true },
  { name: 'Dify', icon: Sparkles, premium: false },
  { name: 'Midjourney', icon: Sparkles, premium: false },
]

// 重新按商业逻辑分组：流量层（先获取）→ 资源层（再承接），形成完整商业闭环
const channelRows = [
  {
    label: '流量层',
    desc: '先把流量引进来',
    items: [
      {
        icon: Rocket,
        title: '流量获取',
        subtitle: '多平台矩阵运营',
        links: ['抖音', '小红书', '视频号', '亚马逊'],
        color: 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100',
        iconColor: 'text-orange-500',
      },
      {
        icon: Radio,
        title: '媒体矩阵',
        subtitle: '科技与商业媒体',
        links: ['36氪', '科技媒体', '本地创业号'],
        color: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100',
        iconColor: 'text-green-500',
      },
    ],
  },
  {
    label: '资源层',
    desc: '用资源把流量接住',
    items: [
      {
        icon: Shield,
        title: '圈层合作',
        subtitle: '优质商会资源',
        links: ['南山企服中心', '跨境电商协会', '地方商会'],
        color: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100',
        iconColor: 'text-blue-500',
      },
      {
        icon: Gift,
        title: '优质产品',
        subtitle: 'AI 工具与 SaaS',
        links: ['AI工具', 'SaaS插件', '免版税素材库'],
        color: 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100',
        iconColor: 'text-purple-500',
      },
    ],
  },
]

const supplyDemand: { id: string; tag: string; tagColor: string; title: string; time: string; desc: string }[] = [
  {
    id: '1',
    tag: '找人',
    tagColor: 'bg-blue-100 text-blue-700',
    title: '深圳本地AI个体户，寻带货供应链合作',
    time: '2小时前',
    desc: '本人擅长AI内容创作，希望找到稳定的供应链货源，共同打造AI电商品牌。',
  },
  {
    id: '2',
    tag: '找项目',
    tagColor: 'bg-emerald-100 text-emerald-700',
    title: '寻求GEO全域增长陪跑服务',
    time: '5小时前',
    desc: '跨境电商卖家，希望学习AI驱动的全域增长策略，提升海外市场竞争力。',
  },
  {
    id: '3',
    tag: '找合作',
    tagColor: 'bg-violet-100 text-violet-700',
    title: 'AI法律咨询工具寻求渠道合作',
    time: '1天前',
    desc: '自研AI法律助手工具，寻求律所、企业服务平台等渠道合作伙伴。',
  },
  {
    id: '4',
    tag: '找资源',
    tagColor: 'bg-amber-100 text-amber-700',
    title: '寻找本地优质数字人直播硬件供应商',
    time: '2天前',
    desc: 'OPC 主理人寻找深圳本地具备高性价比的数字人直播硬件设备渠道。',
  },
  {
    id: '5',
    tag: '找人',
    tagColor: 'bg-blue-100 text-blue-700',
    title: '杭州电商团队寻找AI图文代运营合伙人',
    time: '3天前',
    desc: '杭州本地电商团队，急需懂AI图文内容生产的合伙人共同开拓市场。',
  },
  {
    id: '6',
    tag: '找项目',
    tagColor: 'bg-emerald-100 text-emerald-700',
    title: '寻求小红书矩阵AI自动化工具开发合作',
    time: '5天前',
    desc: '拥有百万粉丝矩阵账号，需要一套自动化内容发布与评论区管理的AI工具。',
  },
  {
    id: '7',
    tag: '找资源',
    tagColor: 'bg-amber-100 text-amber-700',
    title: '寻找稳定靠谱的AI视频素材版权库',
    time: '1周前',
    desc: '自媒体创业者，需要大量版权明确的AI视频素材，用于批量生产短视频。',
  },
  {
    id: '8',
    tag: '找合作',
    tagColor: 'bg-violet-100 text-violet-700',
    title: 'AI智能体初创团队寻找FA或投资机构对接',
    time: '1周前',
    desc: '专注垂直行业智能体研发的团队，寻求融资与孵化资源对接。',
  },
  {
    id: '9',
    tag: '找人',
    tagColor: 'bg-blue-100 text-blue-700',
    title: '成都本地AI教练寻求与当地商会合作办沙龙',
    time: '2周前',
    desc: '在成都做AI商业培训，希望对接当地商会资源，合作开展线下AI沙龙活动。',
  },
  {
    id: '10',
    tag: '找项目',
    tagColor: 'bg-emerald-100 text-emerald-700',
    title: '跨境电商卖家寻求AI数字人直播陪跑服务',
    time: '2周前',
    desc: '主营TikTok跨境直播，急需OPC体系内的AI数字人搭建与直播陪跑服务。',
  },
]

export default function ResourcesPage() {
  // 三种发布表单的开关：null 表示全部关闭
  const [openDialog, setOpenDialog] = useState<null | 'demand' | 'supply' | 'partner'>(null)

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <motion.header
        {...fadeUp}
        className="px-4 pt-20 pb-8 bg-gradient-to-b from-slate-900 to-slate-50"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="text-white/80 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <span className="text-white/60 text-sm">返回主页</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">
            OPC 伙伴与赋能生态地图
          </h1>
          <p className="text-slate-400">
            连接顶尖算力、分发渠道与行业圈层，助力一人公司破圈增长
          </p>
        </div>
      </motion.header>

      <motion.section
        {...fadeUp}
        className="px-4 py-8"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="flex items-center gap-2 mb-6">
            <Building2 size={20} className="text-blue-500" />
            <h2 className="text-lg font-bold text-gray-900">基础设施底座</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="relative bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-100 flex flex-col items-center gap-2 hover:shadow-md hover:scale-105 transition-all duration-300"
              >
                {partner.premium && (
                  <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-0.5 text-[10px] font-medium text-white bg-gradient-to-r from-violet-500 to-purple-600 px-1.5 py-0.5 rounded-full shadow-sm">
                    <span aria-hidden>⚡</span>
                    战略合作
                  </span>
                )}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <partner.icon size={24} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        {...fadeUp}
        className="px-4 py-8"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="flex items-center gap-2 mb-6">
            <Rocket size={20} className="text-amber-500" />
            <h2 className="text-lg font-bold text-gray-900">增长与分发通道</h2>
          </div>

          <div className="space-y-6">
            {channelRows.map((row, rowIndex) => (
              <div key={rowIndex}>
                {/* 分组小标题 */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-700">{row.label}</span>
                  <span className="text-[11px] text-slate-400">· {row.desc}</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
                </div>

                {/* 2x2 网格（移动端单列、桌面双列） */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {row.items.map((channel, channelIndex) => (
                    <div
                      key={channelIndex}
                      className={`${channel.color} border rounded-2xl p-5 hover:shadow-md hover:scale-[1.01] transition-all duration-300`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm`}>
                          <channel.icon size={20} className={channel.iconColor} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{channel.title}</h3>
                          <p className="text-xs text-gray-500">{channel.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {channel.links.map((link, linkIndex) => (
                          <a
                            key={linkIndex}
                            href="#"
                            className="text-xs text-gray-700 bg-white/50 hover:bg-white rounded-full px-2 py-1 transition-colors"
                          >
                            {link}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        {...fadeUp}
        className="px-4 py-8"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Handshake size={20} className="text-purple-500" />
              <h2 className="text-lg font-bold text-gray-900">OPC 内部供需广场</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpenDialog('demand')}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors active:scale-95"
              >
                发布需求
              </button>
              <button
                onClick={() => setOpenDialog('supply')}
                className="px-3 py-1.5 text-sm font-medium text-purple-600 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors active:scale-95"
              >
                发布资源
              </button>
            </div>
          </div>

          {/* AI 智能供需匹配 */}
          <div className="mb-6">
            <AIMatchmakerWidget compact />
          </div>

          <div className="space-y-4">
            {supplyDemand.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.tagColor}`}>
                      {item.tag}
                    </span>
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar size={12} />
                    <span>{item.time}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        {...fadeUp}
        className="px-4 py-8 pb-20"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Users size={24} />
              <h2 className="text-xl font-bold">成为我们的生态伙伴</h2>
            </div>
            <p className="text-white/80 mb-6">
              如果你是优质AI/算力/渠道服务商，欢迎与我们建立合作，共同构建一人公司的AI商业操作系统。
            </p>
            <button
              onClick={() => setOpenDialog('partner')}
              className="w-full py-3 rounded-xl font-medium text-blue-600 bg-white hover:bg-gray-50 active:scale-[0.98] transition-all shadow-lg"
            >
              提交合作意向
            </button>
          </div>
        </div>
      </motion.section>

      {/* 三类发布表单共用一个 Dialog 组件，按 openDialog 切换内容 */}
      <PublishDialog
        type={openDialog}
        onClose={() => setOpenDialog(null)}
      />
    </div>
  )
}

// ─── 通用发布表单 Dialog ───
type DialogType = 'demand' | 'supply' | 'partner' | null

const DIALOG_META: Record<Exclude<DialogType, null>, { title: string; emoji: string; gradient: string; submitText: string }> = {
  demand: {
    title: '发布需求',
    emoji: '🛒',
    gradient: 'from-blue-500 to-indigo-600',
    submitText: '立即发布',
  },
  supply: {
    title: '发布资源',
    emoji: '🎁',
    gradient: 'from-purple-500 to-fuchsia-600',
    submitText: '立即发布',
  },
  partner: {
    title: '提交合作意向',
    emoji: '🤝',
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    submitText: '提交合作意向',
  },
}

function PublishDialog({ type, onClose }: { type: DialogType; onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ name: '', contact: '', title: '', content: '' })

  // 切换 type 或关闭时重置状态
  const close = () => {
    onClose()
    setTimeout(() => {
      setSuccess(false)
      setForm({ name: '', contact: '', title: '', content: '' })
    }, 200)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    // 模拟异步提交
    setTimeout(() => {
      setSubmitting(false)
      setSuccess(true)
    }, 700)
  }

  return (
    <AnimatePresence>
      {type && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4"
          onClick={close}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部彩色横幅 */}
            <div className={`relative bg-gradient-to-r ${DIALOG_META[type].gradient} text-white px-6 pt-6 pb-8`}>
              <button
                onClick={close}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="关闭"
              >
                <X size={16} />
              </button>
              <div className="text-3xl mb-2">{DIALOG_META[type].emoji}</div>
              <h3 className="text-xl font-bold">{DIALOG_META[type].title}</h3>
              <p className="text-xs text-white/80 mt-1">填写后我们会在 24 小时内联系你</p>
            </div>

            {/* 表单 / 成功状态 */}
            {success ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">提交成功！</h4>
                <p className="text-sm text-slate-600 mb-6">
                  我们的运营团队会尽快审核并联系你。
                </p>
                <button
                  onClick={close}
                  className="w-full py-3 rounded-xl font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  好的
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <Field
                  icon={<User size={14} />}
                  label="你的称呼"
                  placeholder="请输入姓名 / 网名"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  required
                />
                <Field
                  icon={<Phone size={14} />}
                  label="联系方式"
                  placeholder="微信号 / 手机号 / 邮箱"
                  value={form.contact}
                  onChange={(v) => setForm({ ...form, contact: v })}
                  required
                />
                {type === 'demand' || type === 'supply' ? (
                  <Field
                    icon={<TagIcon size={14} />}
                    label="标题"
                    placeholder="一句话描述你的需求 / 资源"
                    value={form.title}
                    onChange={(v) => setForm({ ...form, title: v })}
                    required
                  />
                ) : null}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
                    <FileText size={14} />
                    详细描述
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder={
                      type === 'partner'
                        ? '介绍下你公司的业务、可提供的资源、期望合作的方向…'
                        : '越具体越容易匹配到合适的对象（预算、时间、当前进度等）'
                    }
                    required
                    rows={4}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r ${DIALOG_META[type].gradient} hover:scale-[1.01] active:scale-[0.99] transition-transform shadow-lg flex items-center justify-center gap-2 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      提交中…
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      {DIALOG_META[type].submitText}
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 text-center">
                  提交即表示同意《OPC 用户协议》和《隐私政策》
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({
  icon, label, placeholder, value, onChange, required,
}: {
  icon: React.ReactNode
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
        {icon}
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
      />
    </div>
  )
}