'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle2,
  Loader2,
  Download,
  Copy,
  Check,
  ShoppingBag,
  Wrench,
  Briefcase,
  ArrowUpRight,
  Calendar,
  X,
  Smartphone,
  CreditCard,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'

interface CommissionRecord {
  id: string
  orderId: string
  sellerId: string
  referrerId: string
  amount: number
  commissionRate: number
  commission: number
  status: string
  createdAt: string
  source?: string
}

const SOURCE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  project: { label: '项目库', icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
  tool: { label: '工具库', icon: Wrench, color: 'text-indigo-600 bg-indigo-50' },
  service: { label: '服务库', icon: Briefcase, color: 'text-purple-600 bg-purple-50' },
  resource: { label: '资源库', icon: Briefcase, color: 'text-emerald-600 bg-emerald-50' },
}

export default function RevenueDashboardPage() {
  const [records, setRecords] = useState<CommissionRecord[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SETTLED'>('ALL')
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [acting, setActing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [referrerId] = useState('demo-city-shanghai')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/revenue/dashboard?referrerId=${referrerId}`)
      const data = await res.json()
      if (data.success) {
        setRecords(data.records || [])
        setStats(data.stats)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const filtered = records.filter((r) => filter === 'ALL' || r.status === filter)

  const toggleSelect = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  const toggleSelectAll = () => {
    if (selected.length === filtered.filter((r) => r.status === 'PENDING').length) {
      setSelected([])
    } else {
      setSelected(filtered.filter((r) => r.status === 'PENDING').map((r) => r.id))
    }
  }

  const settleSelected = async () => {
    if (selected.length === 0) {
      showToast('请先选择要结算的记录')
      return
    }
    setActing(true)
    try {
      const res = await fetch('/api/revenue/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selected, action: 'settle' }),
      })
      const data = await res.json()
      if (data.success) {
        showToast(data.message || '已结算')
        setSelected([])
        fetchData()
      } else {
        showToast('操作失败：' + (data.error || ''))
      }
    } catch (e: any) {
      showToast('网络错误：' + e.message)
    } finally {
      setActing(false)
    }
  }

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${referrerId}`
    navigator.clipboard.writeText(link).then(() => showToast('✅ 推荐链接已复制'))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center gap-3">
          <Link href="/console" className="p-1.5 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Wallet size={18} className="text-emerald-600" />
              收益分润仪表盘
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">主理人专属 · 推荐成交 5% 归您</p>
          </div>
          <button
            onClick={fetchData}
            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            刷新
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-emerald-600" />
          </div>
        ) : (
          <>
            {/* 顶部 3 大数据卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard
                icon={TrendingUp}
                label="本月预估佣金"
                value={stats?.monthCommission || 0}
                accent="from-emerald-500 to-green-600"
                trend="实时累计"
              />
              <StatCard
                icon={Wallet}
                label="累计总收益"
                value={stats?.totalCommission || 0}
                accent="from-blue-500 to-indigo-600"
                trend={`共 ${stats?.orderCount || 0} 笔订单`}
              />
              <StatCard
                icon={Clock}
                label="待结算笔数"
                value={stats?.pendingCommission || 0}
                count={stats?.pendingCount || 0}
                accent="from-amber-500 to-orange-600"
                trend="点击结算"
                onClick={() => {
                  setFilter('PENDING')
                  setSelected(filtered.filter((r) => r.status === 'PENDING').map((r) => r.id))
                }}
              />
            </div>

            {/* 操作栏 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">💎 我的专属推荐链接</div>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg flex-1 truncate">
                    {typeof window !== 'undefined' ? `${window.location.origin}?ref=${referrerId}` : `?ref=${referrerId}`}
                  </code>
                  <button
                    onClick={copyReferralLink}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    <Copy size={12} />
                    复制
                  </button>
                </div>
              </div>
              <button
                onClick={() => setWithdrawOpen(true)}
                disabled={!stats?.pendingCommission || stats.pendingCommission <= 0}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Download size={14} />
                一键提现 ¥{stats?.pendingCommission || '0.00'}
              </button>
            </div>

            {/* 过滤 + 批量操作 */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1">
                {[
                  { key: 'ALL', label: '全部' },
                  { key: 'PENDING', label: '待结算' },
                  { key: 'SETTLED', label: '已结算' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => {
                      setFilter(f.key as any)
                      setSelected([])
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      filter === f.key
                        ? 'bg-emerald-500 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {selected.length > 0 && (
                <button
                  onClick={settleSelected}
                  disabled={acting}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                >
                  {acting ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                  结算 {selected.length} 笔
                </button>
              )}
            </div>

            {/* 记录列表 */}
            {filtered.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-2xl flex items-center justify-center">
                  <Wallet size={28} className="text-gray-300" />
                </div>
                <p className="text-sm text-gray-500 mb-2">还没有佣金记录</p>
                <p className="text-xs text-gray-400">
                  分享您的推荐链接，成交后 5% 佣金将自动到账
                </p>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        filtered.filter((r) => r.status === 'PENDING').length > 0 &&
                        selected.length === filtered.filter((r) => r.status === 'PENDING').length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-emerald-500"
                    />
                    <span className="text-xs font-semibold text-gray-700">
                      收入明细（{filtered.length}）
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {filtered.map((r) => {
                    const src = SOURCE_LABELS[r.source || 'project'] || SOURCE_LABELS.project
                    const Icon = src.icon
                    return (
                      <div
                        key={r.id}
                        className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                      >
                        {r.status === 'PENDING' && (
                          <input
                            type="checkbox"
                            checked={selected.includes(r.id)}
                            onChange={() => toggleSelect(r.id)}
                            className="w-4 h-4 accent-emerald-500"
                          />
                        )}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${src.color}`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-gray-900">{src.label}</span>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs text-gray-500 truncate">订单 {r.orderId}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar size={10} />
                            <span>{formatDate(r.createdAt)}</span>
                            <span>·</span>
                            <span>订单额 ¥{r.amount.toFixed(2)}</span>
                            <span>·</span>
                            <span>抽成 {(r.commissionRate * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className={`text-sm font-bold ${r.status === 'SETTLED' ? 'text-gray-400' : 'text-emerald-600'}`}>
                            +¥{r.commission.toFixed(2)}
                          </div>
                          <div className="text-xs">
                            {r.status === 'SETTLED' ? (
                              <span className="text-gray-400">已结算</span>
                            ) : (
                              <span className="text-amber-600">待结算</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 提现说明 */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">分润规则</h3>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• 卖家（项目方/服务商）：获得 85% 订单收益</li>
                    <li>• 平台运营：留存 10%（含支付通道 + 客服 + 售后）</li>
                    <li>• 推荐主理人：获得 5% 推荐佣金（您）</li>
                    <li>• 提现门槛：满 ¥100 起提，T+1 工作日到账</li>
                  </ul>
                </div>
              </div>
            </div>
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

      {/* 提现弹窗 */}
      <AnimatePresence>
        {withdrawOpen && (
          <WithdrawModal
            amount={stats?.pendingCommission || 0}
            onClose={() => setWithdrawOpen(false)}
            onSuccess={() => {
              setWithdrawOpen(false)
              showToast('✅ 提现申请已提交，1 个工作日内到账')
              fetchData()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  count,
  accent,
  trend,
  onClick,
}: {
  icon: any
  label: string
  value: number
  count?: number
  accent: string
  trend: string
  onClick?: () => void
}) {
  const Component = onClick ? motion.button : motion.div
  return (
    <Component
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative bg-gradient-to-br ${accent} text-white rounded-2xl p-4 shadow-lg overflow-hidden text-left w-full`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 text-white/80 text-xs mb-2">
          <Icon size={14} />
          <span>{label}</span>
        </div>
        <div className="text-3xl font-bold mb-1">¥{value.toFixed(2)}</div>
        <div className="text-xs text-white/80 flex items-center gap-1">
          {count !== undefined && (
            <span className="bg-white/20 rounded-full px-2 py-0.5">{count} 笔</span>
          )}
          <span>{trend}</span>
          {onClick && <ChevronRight size={12} />}
        </div>
      </div>
    </Component>
  )
}

function WithdrawModal({
  amount,
  onClose,
  onSuccess,
}: {
  amount: number
  onClose: () => void
  onSuccess: () => void
}) {
  const [method, setMethod] = useState<'wechat' | 'alipay' | 'bank'>('wechat')
  const [account, setAccount] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!account || !name) {
      setError('请填写收款账号和姓名')
      return
    }
    if (amount < 100) {
      setError('提现金额需满 ¥100')
      return
    }
    setSubmitting(true)
    // 模拟提现请求（实际对接微信支付商户分账）
    await new Promise((r) => setTimeout(r, 1200))
    setSubmitting(false)
    onSuccess()
  }

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
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">提现申请</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl p-4 mb-5 text-center">
            <div className="text-xs text-white/80 mb-1">可提现金额</div>
            <div className="text-3xl font-bold">¥{amount.toFixed(2)}</div>
            <div className="text-xs text-white/80 mt-1">T+1 工作日到账</div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">收款方式</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'wechat', label: '微信', icon: Smartphone, color: 'bg-green-50 text-green-700 border-green-200' },
                  { key: 'alipay', label: '支付宝', icon: Wallet, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                  { key: 'bank', label: '银行卡', icon: CreditCard, color: 'bg-purple-50 text-purple-700 border-purple-200' },
                ].map((m) => {
                  const Icon = m.icon
                  const active = method === m.key
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setMethod(m.key as any)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        active ? `${m.color} border-current` : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      <Icon size={18} className="mx-auto mb-1" />
                      <div className="text-xs font-semibold">{m.label}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                {method === 'bank' ? '银行卡号' : '账号'}
              </label>
              <input
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder={method === 'wechat' ? '微信号' : method === 'alipay' ? '支付宝账号' : '银行卡号'}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">真实姓名</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="收款人真实姓名"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800">
                平台将扣除 1% 提现手续费（用于支付通道成本），实际到账 ¥
                <span className="font-bold">{(amount * 0.99).toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-2xl text-sm shadow-lg shadow-emerald-200 hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Download size={16} />
                  确认提现 ¥{amount.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleString('zh-CN', { hour12: false }).slice(0, 16)
  } catch {
    return d
  }
}
