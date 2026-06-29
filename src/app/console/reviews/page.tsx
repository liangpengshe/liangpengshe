'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { arrFromDb } from '@/lib/json-array'
import {
  ArrowLeft,
  Inbox,
  Loader2,
  Check,
  X,
  Edit3,
  Wrench,
  Briefcase,
  FileText,
  Calendar,
  User as UserIcon,
  Tag,
  DollarSign,
  Globe,
  Link2,
  Phone,
  Building2,
  MessageSquare,
  Sparkles,
} from 'lucide-react'

interface ProjectSubmission {
  id: string
  title: string
  description: string
  content?: string
  category: string
  submitter?: string
  contact?: string
  status: string
  createdAt: string
}

interface ToolSubmission {
  id: string
  name: string
  description: string
  category: string
  officialUrl: string
  pricingModel: string
  affiliateLink?: string
  contactName?: string
  contactInfo?: string
  status: string
  submittedAt: string
}

interface ServiceProvider {
  id: string
  name: string
  company?: string
  contact?: string
  specialty: string[]
  experience: string
  priceRange?: string
  isVerified: boolean
  status: string
  createdAt: string
}

interface ReviewItem {
  id: string
  type: 'project' | 'tool' | 'service'
  title: string
  status: string
  data: ProjectSubmission | ToolSubmission | ServiceProvider
}

const PRICING_LABELS: Record<string, string> = {
  free: '免费',
  freemium: '免费增值',
  subscription: '订阅制',
  'one-time': '买断制',
  enterprise: '企业定制',
}

const SPECIALTY_LABELS: Record<string, string> = {
  training: '企业内训',
  geo: 'GEO',
  agent: '智能体定制',
  system: '系统定制',
  data: '数据中台',
  content: '内容生产',
}

const PRICE_LABELS: Record<string, string> = {
  'under-10k': '1 万以下',
  '10k-50k': '1-5 万',
  '50k-200k': '5-20 万',
  '200k-500k': '20-50 万',
  'over-500k': '50 万以上',
  custom: '按需定制',
}

export default function ReviewsPage() {
  const [tab, setTab] = useState<'project' | 'tool' | 'service'>('project')
  const [projects, setProjects] = useState<ProjectSubmission[]>([])
  const [tools, setTools] = useState<ToolSubmission[]>([])
  const [services, setServices] = useState<ServiceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ReviewItem | null>(null)
  const [comment, setComment] = useState('')
  const [acting, setActing] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [projRes, toolRes, svcRes] = await Promise.all([
        fetch('/api/console/projects?status=PENDING').then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/tools/submit').then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/services/join').then((r) => r.json()).catch(() => ({ data: [] })),
      ])
      setProjects((projRes.data || []).filter((p: any) => p.status === 'PENDING' || p.status === 'PENDING_REVIEW'))
      setTools((toolRes.data || []).filter((t: any) => t.status === 'PENDING'))
      setServices(
        (svcRes.data || []).filter((s: any) => s.status === 'PENDING' || s.isVerified === false)
      )
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const reviewItem = async (type: 'project' | 'tool' | 'service', id: string, action: 'approve' | 'reject' | 'revise') => {
    setActing(`${type}-${id}`)
    try {
      if (type === 'project') {
        // 项目审核调用 console/projects
        const res = await fetch(`/api/console/projects/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : 'REVISE' }),
        })
        const data = await res.json()
        if (data.success) {
          setProjects((prev) => prev.filter((p) => p.id !== id))
          showToast(action === 'approve' ? '✅ 项目已通过' : action === 'reject' ? '❌ 项目已驳回' : '📝 已要求修改')
          setSelected(null)
        } else {
          showToast('操作失败：' + (data.error || ''))
        }
      } else {
        const res = await fetch('/api/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, id, action, comment }),
        })
        const data = await res.json()
        if (data.success) {
          if (type === 'tool') {
            setTools((prev) => prev.filter((t) => t.id !== id))
          } else {
            setServices((prev) => prev.filter((s) => s.id !== id))
          }
          showToast(data.message || '审核完成')
          setSelected(null)
          setComment('')
        } else {
          showToast('操作失败：' + (data.error || ''))
        }
      }
    } catch (e: any) {
      showToast('网络错误：' + e.message)
    } finally {
      setActing(null)
    }
  }

  const counts = {
    project: projects.length,
    tool: tools.length,
    service: services.length,
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center gap-3">
          <Link href="/console" className="p-1.5 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Inbox size={18} className="text-blue-600" />
              专家评审后台
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">项目 / 工具 / 服务商统一审核</p>
          </div>
          <button
            onClick={loadAll}
            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            刷新
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex gap-1 -mb-px">
            {[
              { key: 'project', label: '项目审核', icon: FileText, count: counts.project, color: 'blue', activeCls: 'border-blue-600 text-blue-600', badgeCls: 'bg-blue-100 text-blue-700' },
              { key: 'tool', label: '工具审核', icon: Wrench, count: counts.tool, color: 'indigo', activeCls: 'border-indigo-600 text-indigo-600', badgeCls: 'bg-indigo-100 text-indigo-700' },
              { key: 'service', label: '服务商审核', icon: Briefcase, count: counts.service, color: 'purple', activeCls: 'border-purple-600 text-purple-600', badgeCls: 'bg-purple-100 text-purple-700' },
            ].map((t) => {
              const active = tab === t.key
              const Icon = t.icon
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                    active
                      ? t.activeCls
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                  {t.count > 0 && (
                    <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                      active ? t.badgeCls : 'bg-gray-100 text-gray-600'
                    }`}>
                      {t.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-5 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {tab === 'project' && (
              <List
                items={projects}
                emptyText="暂无待审核项目"
                onSelect={(p) => setSelected({ id: p.id, type: 'project', title: p.title, status: p.status, data: p })}
                renderItem={(p) => (
                  <Card
                    title={p.title}
                    subtitle={p.description}
                    tags={[p.category, `提交于 ${formatDate(p.createdAt)}`]}
                  />
                )}
              />
            )}
            {tab === 'tool' && (
              <List
                items={tools}
                emptyText="暂无待审核工具"
                onSelect={(t) => setSelected({ id: t.id, type: 'tool', title: t.name, status: t.status, data: t })}
                renderItem={(t) => (
                  <Card
                    title={t.name}
                    subtitle={t.description}
                    tags={[
                      categoryLabel(t.category),
                      PRICING_LABELS[t.pricingModel] || t.pricingModel,
                      `提交于 ${formatDate(t.submittedAt)}`,
                    ]}
                    accent="indigo"
                  />
                )}
              />
            )}
            {tab === 'service' && (
              <List
                items={services}
                emptyText="暂无待审核服务商"
                onSelect={(s) => setSelected({ id: s.id, type: 'service', title: s.name, status: s.status, data: s })}
                renderItem={(s) => (
                  <Card
                    title={s.name}
                    subtitle={s.experience.slice(0, 60) + (s.experience.length > 60 ? '...' : '')}
                    tags={[
                      ...arrFromDb(s.specialty).map((sp) => SPECIALTY_LABELS[sp] || sp),
                      s.company ? `所属: ${s.company}` : '个人服务商',
                      `入驻于 ${formatDate(s.createdAt)}`,
                    ]}
                    accent="purple"
                  />
                )}
              />
            )}
          </>
        )}
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 bg-gray-900 text-white text-sm rounded-2xl shadow-2xl z-50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <DetailModal
            item={selected}
            comment={comment}
            setComment={setComment}
            acting={acting}
            onClose={() => {
              setSelected(null)
              setComment('')
            }}
            onAction={(action) => reviewItem(selected.type, selected.id, action)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function List<T>({
  items,
  emptyText,
  onSelect,
  renderItem,
}: {
  items: T[]
  emptyText: string
  onSelect: (item: T) => void
  renderItem: (item: T) => React.ReactNode
}) {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-2xl flex items-center justify-center">
          <Inbox size={28} className="text-gray-300" />
        </div>
        <p className="text-sm text-gray-500">{emptyText}</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((item) => (
        <button
          key={(item as any).id}
          onClick={() => onSelect(item)}
          className="text-left bg-white border border-gray-100 rounded-2xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
        >
          {renderItem(item)}
        </button>
      ))}
    </div>
  )
}

function Card({
  title,
  subtitle,
  tags,
  accent = 'blue',
}: {
  title: string
  subtitle: string
  tags: string[]
  accent?: 'blue' | 'indigo' | 'purple'
}) {
  const dot = accent === 'indigo' ? 'bg-indigo-500' : accent === 'purple' ? 'bg-purple-500' : 'bg-blue-500'
  return (
    <div>
      <div className="flex items-start gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${dot} mt-1.5 flex-shrink-0`} />
        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{title}</h3>
      </div>
      <p className="text-xs text-gray-600 line-clamp-2 mb-3 ml-4">{subtitle}</p>
      <div className="flex flex-wrap gap-1.5 ml-4">
        {tags.map((t, i) => (
          <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

function DetailModal({
  item,
  comment,
  setComment,
  acting,
  onClose,
  onAction,
}: {
  item: ReviewItem
  comment: string
  setComment: (v: string) => void
  acting: string | null
  onClose: () => void
  onAction: (a: 'approve' | 'reject' | 'revise') => void
}) {
  const isProject = item.type === 'project'
  const isTool = item.type === 'tool'
  const isService = item.type === 'service'
  const acting_ = acting === `${item.type}-${item.id}`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-1">
              {isProject ? '项目审核' : isTool ? '工具审核' : '服务商审核'}
            </div>
            <h2 className="text-lg font-bold text-gray-900">{item.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* 项目详情 */}
          {isProject && <ProjectDetail p={item.data as ProjectSubmission} />}

          {/* 工具详情 */}
          {isTool && <ToolDetail t={item.data as ToolSubmission} />}

          {/* 服务商详情 */}
          {isService && <ServiceDetail s={item.data as ServiceProvider} />}

          {/* 专家意见 */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
              <MessageSquare size={12} /> 专家意见（可选）
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="留下您的审核意见，将通过站内信发送给申请人..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={() => onAction('reject')}
            disabled={acting_}
            className="flex-1 py-3 bg-red-50 text-red-600 text-sm font-semibold rounded-2xl hover:bg-red-100 disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {acting_ ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
            驳回
          </button>
          <button
            onClick={() => onAction('revise')}
            disabled={acting_}
            className="flex-1 py-3 bg-amber-50 text-amber-700 text-sm font-semibold rounded-2xl hover:bg-amber-100 disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {acting_ ? <Loader2 size={14} className="animate-spin" /> : <Edit3 size={14} />}
            要求修改
          </button>
          <button
            onClick={() => onAction('approve')}
            disabled={acting_}
            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-2xl hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {acting_ ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            通过
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ProjectDetail({ p }: { p: ProjectSubmission }) {
  return (
    <>
      <Section title="项目介绍" content={p.description} />
      {p.content && <Section title="详细内容" content={p.content} />}
      <div className="grid grid-cols-2 gap-3">
        <Field icon={Tag} label="分类" value={p.category} />
        <Field icon={Calendar} label="提交时间" value={formatDate(p.createdAt)} />
        {p.submitter && <Field icon={UserIcon} label="申请人" value={p.submitter} />}
        {p.contact && <Field icon={Phone} label="联系方式" value={p.contact} />}
      </div>
    </>
  )
}

function ToolDetail({ t }: { t: ToolSubmission }) {
  return (
    <>
      <Section title="工具亮点" content={t.description} />
      <div className="grid grid-cols-2 gap-3">
        <Field icon={Tag} label="分类" value={categoryLabel(t.category)} />
        <Field icon={DollarSign} label="收费模式" value={PRICING_LABELS[t.pricingModel] || t.pricingModel} />
        <Field icon={Globe} label="官网" value={t.officialUrl} link />
        {t.affiliateLink && <Field icon={Link2} label="推广链接" value={t.affiliateLink} link />}
        {t.contactName && <Field icon={UserIcon} label="联系人" value={t.contactName} />}
        {t.contactInfo && <Field icon={Phone} label="联系方式" value={t.contactInfo} />}
      </div>
    </>
  )
}

function ServiceDetail({ s }: { s: ServiceProvider }) {
  return (
    <>
      <Section title="过往案例" content={s.experience} />
      <div className="grid grid-cols-2 gap-3">
        {s.company && <Field icon={Building2} label="所属公司" value={s.company} />}
        {s.contact && <Field icon={Phone} label="联系方式" value={s.contact} />}
        <Field icon={Tag} label="擅长领域" value={arrFromDb(s.specialty).map((sp) => SPECIALTY_LABELS[sp] || sp).join('、')} />
        {s.priceRange && <Field icon={DollarSign} label="报价区间" value={PRICE_LABELS[s.priceRange] || s.priceRange} />}
        <Field icon={Calendar} label="入驻时间" value={formatDate(s.createdAt)} />
        <Field icon={Sparkles} label="当前状态" value={s.isVerified ? '已认证' : '待认证'} />
      </div>
    </>
  )
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-600 mb-2">{title}</h3>
      <div className="px-4 py-3 bg-gray-50 rounded-2xl text-sm text-gray-800 whitespace-pre-wrap">
        {content}
      </div>
    </div>
  )
}

function Field({
  icon: Icon,
  label,
  value,
  link,
}: {
  icon: any
  label: string
  value: string
  link?: boolean
}) {
  return (
    <div className="flex items-start gap-2 px-3 py-2 bg-gray-50 rounded-xl">
      <Icon size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-xs text-gray-500">{label}</div>
        {link ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-600 hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          <div className="text-sm text-gray-900 truncate">{value}</div>
        )}
      </div>
    </div>
  )
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleString('zh-CN', { hour12: false })
  } catch {
    return d
  }
}

function categoryLabel(v: string): string {
  const map: Record<string, string> = {
    writing: '写作',
    image: '绘画',
    video: '视频',
    'digital-human': '数字人',
    code: '开发',
    productivity: '效率',
    audio: '音频',
    data: '数据',
  }
  return map[v] || v
}
