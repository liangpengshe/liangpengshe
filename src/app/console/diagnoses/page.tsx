'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { arrFromDb } from '@/lib/json-array'
import {
  Loader2,
  RefreshCw,
  X,
  Check,
  Eye,
  Clock,
  CheckCircle2,
  Phone,
  Briefcase,
  Target,
  FileText,
  Calendar,
  TrendingUp,
} from 'lucide-react'

interface DiagnosisItem {
  id: string
  name: string
  phone: string
  role: string
  goals: string[]
  description: string
  aiReport: string
  status: string
  createdAt: string
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: {
    label: '待联系',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Clock,
  },
  CONTACTED: {
    label: '已联系',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Phone,
  },
  CLOSED: {
    label: '已结案',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: CheckCircle2,
  },
}

export default function ConsoleDiagnosesPage() {
  const [list, setList] = useState<DiagnosisItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'CONTACTED' | 'CLOSED'>('ALL')
  const [detail, setDetail] = useState<DiagnosisItem | null>(null)
  const [updating, setUpdating] = useState(false)

  const loadList = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/diagnose', { cache: 'no-store' })
      const data = await res.json()
      if (data.success) {
        setList(data.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadList()
  }, [])

  const filtered = filter === 'ALL' ? list : list.filter((i) => i.status === filter)

  const markContacted = async (id: string) => {
    setUpdating(true)
    try {
      await fetch(`/api/ai/diagnose?id=${id}&action=contacted`)
      // 更新本地
      setList((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: 'CONTACTED' } : i))
      )
      if (detail && detail.id === id) {
        setDetail({ ...detail, status: 'CONTACTED' })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUpdating(false)
    }
  }

  const stats = {
    total: list.length,
    pending: list.filter((i) => i.status === 'PENDING').length,
    contacted: list.filter((i) => i.status === 'CONTACTED').length,
    closed: list.filter((i) => i.status === 'CLOSED').length,
  }

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-8">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText size={22} className="text-blue-600" />
              AI 诊断请求管理
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              管理所有 AI 商业落地诊断申请，查看 AI 报告并跟进转化
            </p>
          </div>
          <button
            onClick={loadList}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            刷新
          </button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="总申请" value={stats.total} icon={FileText} color="from-blue-500 to-indigo-500" />
          <StatCard label="待联系" value={stats.pending} icon={Clock} color="from-amber-500 to-orange-500" />
          <StatCard label="已联系" value={stats.contacted} icon={Phone} color="from-cyan-500 to-blue-500" />
          <StatCard label="已结案" value={stats.closed} icon={CheckCircle2} color="from-gray-500 to-slate-500" />
        </div>

        {/* 筛选 */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          {(['ALL', 'PENDING', 'CONTACTED', 'CLOSED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm rounded-full border transition-all whitespace-nowrap ${
                filter === f
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {f === 'ALL' ? '全部' : STATUS_MAP[f].label} ({f === 'ALL' ? stats.total : stats[f.toLowerCase() as keyof typeof stats]})
            </button>
          ))}
        </div>

        {/* 列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-500 text-sm">暂无诊断申请</p>
            <p className="text-gray-400 text-xs mt-1">
              用户提交 AI 商业落地诊断后，会在这里显示
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              const statusInfo = STATUS_MAP[item.status] || STATUS_MAP.PENDING
              const StatusIcon = statusInfo.icon
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusInfo.color}`}>
                          <StatusIcon size={10} />
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Briefcase size={12} />
                          {item.role}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone size={12} />
                          {item.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(item.createdAt).toLocaleString('zh-CN')}
                        </div>
                      </div>
                      <div className="mt-2 flex items-start gap-1 text-xs text-gray-600">
                        <Target size={12} className="mt-0.5 flex-shrink-0" />
                        <span>目标：{item.goals.join('、')}</span>
                      </div>
                      <div className="mt-1.5 text-xs text-gray-500 line-clamp-1">
                        <span className="font-semibold">困境：</span>
                        {item.description}
                      </div>
                    </div>
                    <button
                      onClick={() => setDetail(item)}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-semibold rounded-xl flex items-center gap-1.5 flex-shrink-0 transition-colors"
                    >
                      <Eye size={14} />
                      查看报告
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      <AnimatePresence>
        {detail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetail(null)}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{detail.name} 的诊断报告</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {detail.role} · {detail.phone} ·{' '}
                    {new Date(detail.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                <button
                  onClick={() => setDetail(null)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* 用户信息卡片 */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">角色</div>
                    <div className="font-semibold text-gray-900 flex items-center gap-1">
                      <Briefcase size={12} /> {detail.role}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">目标</div>
                    <div className="font-semibold text-gray-900 flex items-center gap-1 flex-wrap">
                      <Target size={12} /> {arrFromDb(detail.goals).join('、')}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-xs text-gray-500 mb-1">业务困境描述</div>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {detail.description}
                    </div>
                  </div>
                </div>

                {/* AI 报告 */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-blue-600" />
                    AI 生成的诊断报告
                  </h4>
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 max-h-[50vh] overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
                      {detail.aiReport}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3">
                {detail.status === 'PENDING' ? (
                  <button
                    onClick={() => markContacted(detail.id)}
                    disabled={updating}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                  >
                    {updating ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    标记为已联系
                  </button>
                ) : (
                  <div className={`text-sm flex items-center gap-1.5 px-4 py-2 rounded-xl border ${
                    (STATUS_MAP[detail.status] || STATUS_MAP.PENDING).color
                  }`}>
                    {(() => {
                      const Icon = (STATUS_MAP[detail.status] || STATUS_MAP.PENDING).icon
                      return <Icon size={14} />
                    })()}
                    {STATUS_MAP[detail.status]?.label}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: any
  color: string
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}
