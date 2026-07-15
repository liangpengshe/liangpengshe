'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ClientLayout from '@/components/ClientLayout'
import { AIDailyBrief } from '@/components/AIDailyBrief'
import { OPCProgressBar } from '@/components/learning/OPCProgressBar'
import { ProfileHeader } from '@/components/member/ProfileHeader'
import { MetricsBento } from '@/components/member/MetricsBento'
import { DiagnosisHistoryList } from '@/components/member/DiagnosisHistoryList'
import { NextActionCTA } from '@/components/member/NextActionCTA'
import { AdaptiveAlertBanner } from '@/components/member/AdaptiveAlertBanner'
import { SOPImageGenerator } from '@/components/member/SOPImageGenerator'
import { StreakCard } from '@/components/member/StreakCard'
import { AICommentBoard } from '@/components/community/AICommentBoard'
import { toast } from '@/components/Toast'
import type { AdaptiveAlert } from '@/lib/adaptive-path'
import {
  getUserStage,
  subscribeUserStage,
  type UserStage,
  type UserStageKey,
} from '@/lib/user-stage'
import {
  getDiagnosisHistory,
  getMetrics,
  getStageDetail,
  type MemberMetrics,
  type StageDetail,
  type DiagnosisRecord,
} from '@/lib/member-dashboard'
import { arrFromDb } from '@/lib/json-array'
import { buildExpiringBanner } from '@/lib/subscription-middleware'
import { useAudio } from '@/hooks/useAudio'
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Wrench,
  ChevronRight,
  LogOut,
  Compass,
  Stethoscope,
  Lightbulb,
  Package,
  Users,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Zap,
  Download,
  Printer,
  X,
  FileDown,
  Trophy,
  Coins,
  Gift,
  ChevronDown,
  ChevronUp,
  History,
  Headphones,
  Rocket,
  Flame,
  AlertCircle,
  Loader2,
} from 'lucide-react'

type Step = {
  type: 'diagnosis' | 'plan' | 'tool' | 'salon'
  id: string
  title: string
  desc: string
  meta: string
  at: string
}

const STEP_META: Record<string, { icon: any; gradient: string; href: string; ring: string; badge: string }> = {
  diagnosis: {
    icon: Stethoscope,
    gradient: 'from-rose-500 to-pink-600',
    ring: 'ring-rose-300/40',
    badge: '诊断',
    href: '/diagnosis',
  },
  plan: {
    icon: Lightbulb,
    gradient: 'from-amber-500 to-orange-600',
    ring: 'ring-amber-300/40',
    badge: '规划',
    href: '/project-plan',
  },
  tool: {
    icon: Wrench,
    gradient: 'from-blue-500 to-indigo-600',
    ring: 'ring-blue-300/40',
    badge: '工具',
    href: '/tools',
  },
  salon: {
    icon: Users,
    gradient: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-300/40',
    badge: '沙龙',
    href: '/salons',
  },
}

const FOUR_STAGES = [
  { key: 'diagnosis', label: '自我诊断', desc: 'AI 1v1 商业体检', icon: Stethoscope, color: 'from-rose-500 to-pink-600' },
  { key: 'plan', label: '匹配规划', desc: '生成商业路线', icon: Lightbulb, color: 'from-amber-500 to-orange-600' },
  { key: 'tool', label: '选择工具', desc: '挑选降本增效工具', icon: Wrench, color: 'from-blue-500 to-indigo-600' },
  { key: 'salon', label: '资源对接', desc: '参与线下沙龙', icon: Users, color: 'from-emerald-500 to-teal-600' },
]

export default function MemberPage() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [roadmap, setRoadmap] = useState<any>(null)
  const [showReport, setShowReport] = useState(false)
  const [userStage, setUserStage] = useState<UserStage | null>(null)
  // ===== 商业作战地图 · 新增 state =====
  const [expandedStage, setExpandedStage] = useState<UserStageKey | null>(null)
  const [stageDetail, setStageDetail] = useState<StageDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [historyRecords, setHistoryRecords] = useState<DiagnosisRecord[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [metrics, setMetrics] = useState<MemberMetrics>({
    diagnosis: { total: 0, latestDate: null },
    learning: { unlockedCount: 0, totalCount: 0, checkins: 0 },
    operation: { orders: 0, tasksDone: 0, tasksTotal: 0 },
    scaling: { matrixTasks: 0, stores: 0 },
  })
  const [pointsBalance, setPointsBalance] = useState<number>(0)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data } = await supabase
        .from('users')
        .select('*, city:cityId(*)')
        .eq('id', user.id)
        .single()

      setUserData(data)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  // 🚀 进化项 3.3：合并并行 API 请求
  // 原 3 个独立 useEffect（roadmap / diagnosis-history / metrics）合并为单次网络往返
  // 减少 setState 抖动 + 提升首屏速度
  useEffect(() => {
    let mounted = true
    // Promise.allSettled 确保单个失败不影响其他
    Promise.allSettled([
      fetch('/api/member/roadmap').then((r) => r.json()),
      userData?.phone ? getDiagnosisHistory(userData.phone) : Promise.resolve([]),
      userData?.phone ? getMetrics(userData.phone, userStage) : Promise.resolve(null),
    ]).then(([roadmapRes, historyRes, metricsRes]) => {
      if (!mounted) return
      if (roadmapRes.status === 'fulfilled' && roadmapRes.value?.success) {
        setRoadmap(roadmapRes.value.data)
      }
      if (historyRes.status === 'fulfilled' && historyRes.value) {
        setHistoryRecords(historyRes.value)
        setLoadingHistory(false)
      }
      if (metricsRes.status === 'fulfilled' && metricsRes.value) {
        setMetrics(metricsRes.value)
      }
    })
    return () => {
      mounted = false
    }
  }, [userData?.phone, userStage])

  // 智富积分余额（从 /api/points 读取）
  useEffect(() => {
    if (!userData?.phone) return
    let mounted = true
    void fetch(`/api/points?userId=${encodeURIComponent(userData.phone)}&type=balance`, {
      cache: 'no-store',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (mounted && j?.success && typeof j.data?.points === 'number') {
          setPointsBalance(j.data.points)
        }
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [userData?.phone])

  // 点击进度条节点 → 切换展开
  const handleStageClick = (key: UserStageKey) => {
    if (expandedStage === key) {
      setExpandedStage(null)
      setStageDetail(null)
      return
    }
    setExpandedStage(key)
    setLoadingDetail(true)
    setStageDetail(null)
    // 模拟 250ms 加载（实际可直接同步）
    setTimeout(() => {
      setStageDetail(getStageDetail(key, userStage, metrics))
      setLoadingDetail(false)
    }, 250)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const registeredSalons = [
    { id: 1, title: 'AI商业变现实战沙龙（深圳站）', date: '2026-07-15', status: 'pending' },
    { id: 2, title: '企业AI落地闭门会', date: '2026-07-28', status: 'pending' },
  ]

  const toolExperiences = [
    { id: 1, name: 'AI文案助手', status: 'active', lastUsed: '2026-06-22' },
    { id: 2, name: '智能数据分析平台', status: 'active', lastUsed: '2026-06-20' },
    { id: 3, name: 'AI图像生成工具', status: 'trial', lastUsed: '2026-06-18' },
  ]

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-blue-600 animate-pulse">加载中...</div>
        </div>
      </ClientLayout>
    )
  }

  if (!userData) {
    return null
  }

  const progress = roadmap?.progress || { diagnosis: 0, plan: 0, tool: 0, salon: 0 }
  const timeline: Step[] = roadmap?.timeline || []
  const overallProgress = roadmap?.overallProgress ?? 0
  const completedSteps = roadmap?.completedSteps ?? 0

  return (
    <ClientLayout>
      <div className="min-h-screen bg-slate-50">
        {/* ⏰ 任务 4：订阅到期 3 天预警气泡（顶流 SaaS 模式） */}
        {userData && (
          <section className="px-4 pt-3 md:px-6">
            <ExpiringBanner userData={userData} userPoints={pointsBalance} />
          </section>
        )}

        {/* 🌟 任务 4：会员权益徽章（顶部 · 紧跟 ProfileHeader 之上） */}
        <section className="px-4 pt-4 md:px-6 md:pt-6">
          <SubscriptionBadge
            userData={userData}
            onCancelled={() => {
              // 取消成功后刷新页面
              window.location.reload()
            }}
          />
        </section>

        {/* 🎯 进化四：会员中心上下文感知 · 阶段引导（升级路径提示） */}
        <section className="px-4 pt-2.5 md:px-6">
          <MembershipStageGuidance userData={userData} />
        </section>

        {/* ⭐ 任务 3：签到领积分区块 */}
        <section className="px-4 pt-3 md:px-6">
          <DailySignInCard
            userId={userData?.id || userData?.email || userData?.phone || 'demo'}
            onSignInSuccess={(newBalance) => setPointsBalance(newBalance)}
          />
        </section>

        {/* 🌅 商业作战地图 · 顶部概览（替换原 Hero） */}
        <section className="px-4 pt-4 md:px-6 md:pt-6">
          <ProfileHeader
            userName={userData.name || userData.email || '老板'}
            userAvatar={userData.avatar || '🧭'}
            userStage={userStage}
            pointsBalance={pointsBalance}
          />
        </section>

        {/* 🌅 AI 智富日报（每日 7:00 推送） */}
        <section className="px-5 mt-4">
          <AIDailyBrief userId={userData.phone} />
        </section>

        {/* 🪙 良朋币资产卡片（保留） */}
        <section className="px-5 mt-4">
          <CoinBalanceCard phone={userData.phone} />
        </section>

        <section className="px-5 py-6 -mt-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex justify-around text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{registeredSalons.length}</div>
                <div className="text-xs text-gray-500 mt-1">报名沙龙</div>
              </div>
              <div className="w-px bg-gray-200"></div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{toolExperiences.length}</div>
                <div className="text-xs text-gray-500 mt-1">工具体验</div>
              </div>
              <div className="w-px bg-gray-200"></div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{completedSteps}/4</div>
                <div className="text-xs text-gray-500 mt-1">路线图</div>
              </div>
            </div>
          </div>
        </section>
        {/* ⚡️ 四库全胜启动包模块（保留） */}
        <section className="px-5 py-4">
          <ReportStarterCard
            userName={userData?.name || userData?.email || '老板'}
            roadmap={roadmap}
            onOpenReport={() => setShowReport(true)}
          />
        </section>

        {/* 🚨 进化二：自适应路径 · 卡点检测横幅 */}
        <section className="px-5 py-2">
          <AdaptiveAlertSection />
        </section>

        {/* 🎯 OPC 全流程进度条（升级：可点击展开历史详情） */}
        <section className="px-5 py-4">
          <OPCProgressBar
            stage={userStage}
            onStageClick={handleStageClick}
            expandedStage={expandedStage}
            stageDetail={stageDetail}
            loadingDetail={loadingDetail}
          />
        </section>

        {/* 🎨 进化三：智富资产工坊 · AI SOP 简图生成 */}
        <section className="px-5 py-2">
          <SOPImageSection />
        </section>

        {/* 📊 商业数据看板 · 2x2 Bento */}
        <section className="px-5 py-4">
          <MetricsBento metrics={metrics} />
        </section>

        {/* 📂 我的商业档案 · 历史诊断 */}
        <section className="px-5 py-4">
          <DiagnosisHistoryList
            records={historyRecords}
            loading={loadingHistory}
          />
        </section>

        {/* ✨ 下一步行动 · 智能推荐 */}
        <section className="px-5 py-4">
          <NextActionCTA
            userStage={userStage}
            opcLevel={userStage?.opcLevel}
          />
        </section>

        {/* 💬 AI 轻互动留言板 · 任务 4：会员中心卡点交流 */}
        <section className="px-5 py-4">
          <AICommentBoard
            slug="member-center"
            title="会员中心 · 卡点交流"
            variant="full"
          />
        </section>

        <section className="px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            我的报名沙龙
          </h2>
          <div className="space-y-3">
            {registeredSalons.map((salon) => (
              <div key={salon.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{salon.title}</h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                      <Calendar size={12} />
                      <span>{salon.date}</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">待参加</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench size={18} className="text-blue-600" />
            我的工具体验
          </h2>
          <div className="space-y-3">
            {toolExperiences.map((tool) => (
              <div
                key={tool.id}
                className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{tool.name}</h3>
                  <div className="text-gray-500 text-xs mt-1">上次使用：{tool.lastUsed}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      tool.status === 'active'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-yellow-50 text-yellow-600'
                    }`}
                  >
                    {tool.status === 'active' ? '使用中' : '试用中'}
                  </span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 py-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 text-red-600 hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut size={18} />
                <span className="font-medium">退出登录</span>
              </div>
              <ChevronRight size={16} />
            </button>
          </div>
        </section>

        <div className="h-20"></div>
      </div>

      {/* 📄 报告预览弹窗 */}
      {showReport && (
        <ReportPreviewModal
          userName={userData?.name || userData?.email || '老板'}
          roadmap={roadmap}
          onClose={() => setShowReport(false)}
        />
      )}
    </ClientLayout>
  )
}

/* ============================================
   🚨 进化二：自适应路径 · 卡点检测 section
   - 拉取 /api/user/adaptive-alert
   - 传入 AdaptiveAlertBanner 渲染
============================================ */
function AdaptiveAlertSection() {
  const [alert, setAlert] = useState<AdaptiveAlert | null>(null)
  const [phone, setPhone] = useState<string>('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('opc_device_id') || ''
    if (stored) {
      setPhone(stored)
    }
  }, [])

  useEffect(() => {
    if (!phone) return
    let cancelled = false
    const fetchAlert = () => {
      fetch(`/api/user/adaptive-alert?phone=${encodeURIComponent(phone)}`)
        .then((r) => r.json())
        .then((resp) => {
          if (cancelled) return
          if (resp?.success) setAlert(resp.alert || null)
        })
        .catch(() => {
          // 静默降级：不显示横幅
        })
    }
    fetchAlert()
    // 5 分钟刷新一次
    const t = setInterval(fetchAlert, 5 * 60 * 1000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [phone])

  return <AdaptiveAlertBanner alert={alert} />
}

/* ============================================
   🎨 进化三：智富资产工坊 · AI SOP 简图 section
============================================ */
function SOPImageSection() {
  const [phone, setPhone] = useState<string>('')
  const [stage, setStage] = useState<string>('learning')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedPhone = window.localStorage.getItem('opc_device_id') || ''
    const storedStage = window.localStorage.getItem('opc_current_stage') || 'learning'
    setPhone(storedPhone)
    setStage(storedStage)
  }, [])

  return <SOPImageGenerator phone={phone} stage={stage} />
}

/* ============================================
   ⚡️ 四库全胜启动包 卡片
============================================ */
function ReportStarterCard({
  userName,
  roadmap,
  onOpenReport,
}: {
  userName: string
  roadmap: any
  onOpenReport: () => void
}) {
  const hasDiagnosis = !!roadmap?.diagnosis
  const hasPlan = (roadmap?.plans?.length || 0) > 0
  const generated = hasDiagnosis || hasPlan
  const reportCount = (hasDiagnosis ? 1 : 0) + (roadmap?.plans?.length || 0)

  if (generated) {
    return (
      <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 rounded-2xl p-5 shadow-xl overflow-hidden">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-4 w-28 h-28 bg-yellow-300/20 rounded-full blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Trophy size={20} className="text-yellow-100" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                  <Zap size={14} className="text-yellow-200" />
                  我的四库全胜启动包
                </h2>
                <p className="text-[11px] text-white/80 mt-0.5">良朋社 OPC · 专属定制</p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-white/25 backdrop-blur rounded-full text-[10px] font-bold text-white border border-white/30">
              ✅ 已解锁
            </span>
          </div>

          <div className="bg-white/15 backdrop-blur rounded-xl p-3 mb-3 border border-white/20">
            <div className="flex items-center gap-2 text-white text-sm font-semibold mb-1.5">
              <FileDown size={14} className="text-yellow-200" />
              已生成报告：
              <span className="text-2xl font-bold text-yellow-200">{reportCount}</span>
              <span className="text-xs">份</span>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] text-white/90">
              {hasDiagnosis && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full">📊 商业诊断</span>
              )}
              {hasPlan && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full">🗺️ 商业规划 ×{roadmap.plans.length}</span>
              )}
              {roadmap?.tools?.length > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full">🛠️ 工具 ×{roadmap.tools.length}</span>
              )}
              {roadmap?.salons?.length > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full">👥 沙龙 ×{roadmap.salons.length}</span>
              )}
            </div>
          </div>

          <button
            onClick={onOpenReport}
            className="w-full py-3 bg-white text-orange-600 font-bold rounded-xl text-sm shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <FileDown size={16} />
            查看《良朋社 OPC 四库全胜报告》
          </button>
        </div>
      </div>
    )
  }

  // 未生成
  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-5 shadow-xl overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">⚡️ 我的四库全胜启动包</h2>
            <p className="text-[11px] text-blue-200 mt-0.5">先诊断 → 再规划 → 启动四库协同</p>
          </div>
        </div>

        <p className="text-xs text-white/80 leading-relaxed mb-3">
          完成 1 次 AI 商业诊断或商业规划，即可解锁《良朋社 OPC 四库全胜报告》PDF 交付物，内含工具/项目/服务/资源四大引擎的启动建议。
        </p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <Link
            href="/projects"
            className="block bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-xl p-2.5 transition-all"
          >
            <div className="flex items-center gap-1.5 text-white text-xs font-bold mb-0.5">
              <Lightbulb size={12} className="text-amber-300" />
              商业规划诊断
            </div>
            <div className="text-[10px] text-white/60">→ /projects 提交规划</div>
          </Link>
          <Link
            href="/services/join"
            className="block bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-xl p-2.5 transition-all"
          >
            <div className="flex items-center gap-1.5 text-white text-xs font-bold mb-0.5">
              <Stethoscope size={12} className="text-pink-300" />
              AI 商业诊断
            </div>
            <div className="text-[10px] text-white/60">→ /services 提需求</div>
          </Link>
        </div>

        <Link
          href="/projects"
          className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-orange-500/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles size={14} />
          点击生成你的专属四库全胜报告
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}

/* ============================================
   📄 四库全胜报告预览弹窗
============================================ */

// 把报告结构化数据拼成适合 TTS 朗读的中文文本
function buildReportText(userName: string, roadmap: any): string {
  const diag = roadmap?.diagnosis
  const plans = roadmap?.plans || []
  const tools = roadmap?.tools || []
  const salons = roadmap?.salons || []

  const lines: string[] = []
  lines.push(`${userName}老板，您好。以下是您的良朋社OPC四库全胜报告。`)
  if (diag) {
    lines.push(
      `第一部分，商业诊断。您的目标包括：${(diag.goals || []).join('，') || '暂未填写'}。${
        diag.summary || '已完成 AI 商业诊断。'
      }`
    )
  }
  if (plans.length) {
    lines.push(`第二部分，人生商业规划。您共有 ${plans.length} 份规划。`)
    plans.slice(0, 3).forEach((p: any, i: number) => {
      lines.push(`规划 ${i + 1}，目标年收入：${p.targetIncome}。${p.summary || ''}`)
    })
  }
  if (tools.length) {
    lines.push(`第三部分，工具清单。您已选用 ${tools.length} 款提效工具。`)
    tools.slice(0, 5).forEach((t: any, i: number) => {
      lines.push(`${i + 1}：${t.name}。`)
    })
  }
  if (salons.length) {
    lines.push(`第四部分，资源链接。您已参加 ${salons.length} 场沙龙。`)
  }
  lines.push(
    '最后，四库全胜系统启动建议：第一，工具提效，选择 1 到 2 个高频工具深度使用 30 天。第二，项目创收，复制 1 个城市 SOP，跑通最小成交闭环。第三，服务护航，购买 1 次 AI 落地陪跑。第四，资源链接，每月参加 1 到 2 次线下沙龙。'
  )
  lines.push('祝您早日实现智富人生。')
  return lines.filter(Boolean).join(' ')
}

function ReportPreviewModal({
  userName,
  roadmap,
  onClose,
}: {
  userName: string
  roadmap: any
  onClose: () => void
}) {
  const { playTTS, playSound } = useAudio()
  const [isPlaying, setIsPlaying] = useState(false)

  const handleListen = () => {
    if (isPlaying) return
    const text = buildReportText(userName, roadmap)
    setIsPlaying(true)
    playTTS(text).finally(() => {
      // 延迟解锁，避免 race
      setTimeout(() => setIsPlaying(false), 500)
    })
  }
  const diag = roadmap?.diagnosis
  const plans = roadmap?.plans || []
  const tools = roadmap?.tools || []
  const salons = roadmap?.salons || []

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print()
  }

  const handleDownload = () => {
    // 用 HTML → 文本文件简易下载，后续可换 jspdf
    const lines: string[] = []
    lines.push('═══════════════════════════════════════')
    lines.push('  良朋社 OPC 四库全胜报告')
    lines.push('  LiángPéngShè OPC Four-Library Victory Report')
    lines.push('═══════════════════════════════════════')
    lines.push(`用户：${userName}`)
    lines.push(`报告日期：${today}`)
    lines.push(`报告编号：OPC-FLVR-${Date.now()}`)
    lines.push('')
    lines.push('【序言】')
    lines.push('  本报告基于良朋社 OPC 四库全胜系统，为您量身定制')
    lines.push('  工具提效、项目创收、服务护航、资源链接 四大引擎协同方案。')
    lines.push('')
    if (diag) {
      lines.push('【一、商业诊断】')
      lines.push(`  目标：${(diag.goals || []).join(' / ')}`)
      lines.push(`  诊断摘要：${diag.summary || '已完成 AI 商业诊断'}`)
      lines.push('')
    }
    if (plans.length) {
      lines.push('【二、人生商业规划】')
      plans.forEach((p: any, i: number) => {
        lines.push(`  规划 #${i + 1} · 目标年收入：${p.targetIncome}`)
        lines.push(`  ${p.summary || ''}`)
      })
      lines.push('')
    }
    if (tools.length) {
      lines.push('【三、提效引擎 · 工具清单】')
      tools.forEach((t: any, i: number) => {
        lines.push(`  ${i + 1}. ${t.name}（${t.category}）· ${t.status}`)
      })
      lines.push('')
    }
    if (salons.length) {
      lines.push('【四、链接引擎 · 沙龙记录】')
      salons.forEach((s: any, i: number) => {
        lines.push(`  ${i + 1}. ${s.title}`)
      })
      lines.push('')
    }
    lines.push('【五、四库全胜系统启动建议】')
    lines.push('  1. 工具提效：选择 1-2 个高频工具深度使用 30 天')
    lines.push('  2. 项目创收：复制 1 个城市 SOP，跑通最小成交闭环')
    lines.push('  3. 服务护航：购买 1 次 AI 落地陪跑，避免踩坑')
    lines.push('  4. 资源链接：每月参加 1-2 次线下沙龙')
    lines.push('')
    lines.push('═══════════════════════════════════════')
    lines.push('  良朋社 OPC · 四库全胜系统')
    lines.push('  让 AI 时代的创业者，赢在协同。')
    lines.push('═══════════════════════════════════════')

    if (typeof window !== 'undefined') {
      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `四库全胜报告_${userName}_${Date.now()}.txt`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50 print:hidden">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-orange-500" />
            <span className="text-sm font-bold text-gray-900">报告预览</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleListen}
              disabled={isPlaying}
              className={`px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-lg hover:opacity-90 flex items-center gap-1 disabled:opacity-60 ${
                isPlaying ? 'animate-pulse' : ''
              }`}
              title="用硅基流动 AI 朗读报告"
            >
              <Headphones size={12} />
              {isPlaying ? '朗读中…' : '听报告'}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 flex items-center gap-1"
            >
              <Download size={12} />
              下载
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-1"
            >
              <Printer size={12} />
              打印
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-500"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* 报告内容（可打印区域） */}
        <div className="overflow-y-auto p-6 md:p-8 print:p-0">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
              <Trophy size={12} />
              良朋社 OPC · 四库全胜系统
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              四库全胜报告
            </h1>
            <p className="text-xs text-gray-500">专属定制 · {userName} · {today}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4 mb-5">
            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              报告说明
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed">
              本报告基于良朋社 OPC <span className="font-bold text-orange-600">四库全胜系统</span>，围绕
              <span className="font-bold text-blue-600">工具提效、项目创收、服务护航、资源链接</span>
              四大引擎，为您定制 AI 时代创业协同方案。
            </p>
          </div>

          {diag && (
            <div className="mb-5">
              <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                <span className="w-1 h-4 bg-rose-500 rounded" />
                一、商业诊断
              </h2>
              <div className="bg-white border border-gray-100 rounded-xl p-3 text-xs text-gray-700">
                <div className="text-[11px] text-gray-500 mb-1">
                  目标：<span className="font-semibold text-gray-700">{arrFromDb(diag.goals).join(' / ')}</span>
                </div>
                <div className="leading-relaxed">{diag.summary || 'AI 已为您生成商业诊断报告'}</div>
              </div>
            </div>
          )}

          {plans.length > 0 && (
            <div className="mb-5">
              <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                <span className="w-1 h-4 bg-amber-500 rounded" />
                二、人生商业规划
              </h2>
              {plans.map((p: any, i: number) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-3 text-xs text-gray-700 mb-2">
                  <div className="text-[11px] text-gray-500 mb-1">
                    目标年收入：<span className="font-semibold text-amber-600">{p.targetIncome}</span>
                  </div>
                  <div className="leading-relaxed">{p.summary || 'AI 商业规划已生成'}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mb-5">
            <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-blue-500 rounded" />
              三、提效引擎 · 工具清单
            </h2>
            {tools.length > 0 ? (
              <ul className="space-y-1.5">
                {tools.map((t: any, i: number) => (
                  <li
                    key={i}
                    className="bg-blue-50/50 border border-blue-100 rounded-xl p-2.5 text-xs text-gray-700 flex items-center gap-2"
                  >
                    <span className="text-base">🛠️</span>
                    <span className="font-semibold">{t.name}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500">{t.category}</span>
                    <span className="ml-auto text-[10px] text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                      {t.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-gray-400 italic bg-gray-50 rounded-xl p-3">
                暂未提交工具，去工具库挑选你的「提效引擎」→
              </div>
            )}
          </div>

          <div className="mb-5">
            <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-emerald-500 rounded" />
              四、链接引擎 · 沙龙记录
            </h2>
            {salons.length > 0 ? (
              <ul className="space-y-1.5">
                {salons.map((s: any, i: number) => (
                  <li
                    key={i}
                    className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2.5 text-xs text-gray-700"
                  >
                    👥 {s.title}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-gray-400 italic bg-gray-50 rounded-xl p-3">
                暂未报名沙龙，去参加线下「链接引擎」活动 →
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-2xl p-4 text-white">
            <h2 className="text-base font-bold mb-2 flex items-center gap-1.5">
              <Zap size={14} className="text-yellow-300" />
              五、四大引擎启动建议
            </h2>
            <ol className="space-y-1.5 text-xs text-white/90 list-decimal list-inside">
              <li>
                <span className="font-bold text-amber-200">工具提效</span>：选择 1-2 个高频工具深度使用 30 天，跑通 SOP
              </li>
              <li>
                <span className="font-bold text-blue-200">项目创收</span>：复制 1 个城市 SOP，最小成交闭环测试
              </li>
              <li>
                <span className="font-bold text-purple-200">服务护航</span>：购买 1 次 AI 落地陪跑，规避踩坑
              </li>
              <li>
                <span className="font-bold text-emerald-200">资源链接</span>：每月参加 1-2 次线下沙龙拓展人脉
              </li>
            </ol>
          </div>

          <div className="text-center mt-6 text-[10px] text-gray-400">
            — 良朋社 OPC · 让 AI 时代的创业者，赢在协同 —
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================
   ⭐ 智富积分资产卡片
============================================ */
function CoinBalanceCard({ phone }: { phone?: string }) {
  const [data, setData] = useState<any>(null)
  const [rules, setRules] = useState<any>(null)
  const [ledger, setLedger] = useState<any[]>([])
  const [showRules, setShowRules] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [signinLoading, setSigninLoading] = useState(false)
  const [signinTip, setSigninTip] = useState<string | null>(null)

  const fetchBalance = async () => {
    if (!phone) return
    try {
      const res = await fetch(`/api/points?userId=${encodeURIComponent(phone)}&type=balance`)
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch (e) {
      console.error('获取良朋币失败:', e)
    }
  }

  const fetchRules = async () => {
    try {
      const res = await fetch(`/api/points?type=rules`)
      const json = await res.json()
      if (json.success) setRules(json.data)
    } catch {}
  }

  const fetchLedger = async () => {
    if (!phone) return
    try {
      const res = await fetch(`/api/points?userId=${encodeURIComponent(phone)}&type=logs`)
      const json = await res.json()
      if (json.success) setLedger(json.data || [])
    } catch {}
  }

  useEffect(() => {
    fetchBalance()
    fetchRules()
  }, [phone])

  useEffect(() => {
    if (showHistory) fetchLedger()
  }, [showHistory])

  const handleSignin = async () => {
    if (!phone || signinLoading) return
    setSigninLoading(true)
    setSigninTip(null)
    try {
      const res = await fetch('/api/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sign-in', userId: phone }),
      })
      const json = await res.json()
      if (json.success) {
        setSigninTip(`✅ 签到成功 +${json.data.amount} 智富积分`)
        fetchBalance()
      } else {
        setSigninTip(`⚠️ ${json.error || '签到失败'}`)
      }
    } catch {
      setSigninTip('⚠️ 网络错误')
    } finally {
      setSigninLoading(false)
      setTimeout(() => setSigninTip(null), 3000)
    }
  }

  const coins = data?.coins ?? 0
  const totalEarned = data?.totalEarned ?? 0

  return (
    <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl p-5 shadow-2xl overflow-hidden">
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-yellow-300/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-rose-300/30 rounded-full blur-3xl" />

      <div className="relative">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/25 backdrop-blur rounded-xl flex items-center justify-center shadow-lg">
              <Coins size={22} className="text-yellow-100" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">智富积分资产</h2>
              <p className="text-[11px] text-white/80">LiángPéng Coin · 平台积分</p>
            </div>
          </div>
          <button
            onClick={handleSignin}
            disabled={signinLoading}
            className="px-3 py-1.5 bg-white/25 hover:bg-white/35 backdrop-blur border border-white/30 rounded-full text-xs font-bold text-white disabled:opacity-50"
          >
            {signinLoading ? '签到中...' : '📅 每日签到 +10'}
          </button>
        </div>

        {signinTip && (
          <div className="absolute top-12 right-0 bg-white text-orange-600 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg animate-bounce">
            {signinTip}
          </div>
        )}

        {/* 余额数据 */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-white/15 backdrop-blur rounded-2xl p-3 border border-white/20">
            <div className="text-[10px] text-white/80 mb-0.5">良朋币余额</div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-yellow-100 drop-shadow">
                {coins.toLocaleString()}
              </span>
              <span className="text-xs text-white/80">🪙</span>
            </div>
          </div>
          <div className="bg-white/15 backdrop-blur rounded-2xl p-3 border border-white/20">
            <div className="text-[10px] text-white/80 mb-0.5">累计赚取</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-white">
                {totalEarned.toLocaleString()}
              </span>
              <span className="text-xs text-white/80">🪙</span>
            </div>
          </div>
        </div>

        {/* 入口 1：如何赚取 */}
        <button
          onClick={() => setShowRules(!showRules)}
          className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-xl px-3 py-2.5 text-white text-xs font-semibold transition-all"
        >
          <span className="flex items-center gap-1.5">
            <Gift size={14} className="text-yellow-200" />
            如何赚取良朋币？
          </span>
          {showRules ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showRules && rules && (
          <div className="mt-2 bg-white/95 rounded-2xl p-3 shadow-xl grid grid-cols-2 gap-1.5 animate-fade-in">
            {Object.entries(rules)
              .filter(([k]) => k !== 'purchase' && k !== 'redeem')
              .map(([key, rule]: [string, any]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-2 text-xs"
                >
                  <span className="text-base">{rule.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 truncate">{rule.label}</div>
                    <div className="text-[10px] text-orange-600 font-bold">
                      +{rule.amount} 良朋币
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* 入口 2：历史记录 */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full mt-2 flex items-center justify-between bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-xl px-3 py-2.5 text-white text-xs font-semibold transition-all"
        >
          <span className="flex items-center gap-1.5">
            <History size={14} className="text-yellow-200" />
            智富积分流水
            {ledger.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/25 rounded-full text-[10px]">
                {ledger.length}
              </span>
            )}
          </span>
          {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showHistory && (
          <div className="mt-2 bg-white/95 rounded-2xl p-3 shadow-xl max-h-64 overflow-y-auto">
            {ledger.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-4">
                暂无流水记录，去做任务赚取良朋币吧
              </div>
            ) : (
              <ul className="space-y-1.5">
                {ledger.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center gap-2 text-xs py-1.5 border-b border-gray-100 last:border-0"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        l.amount > 0
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-rose-100 text-rose-600'
                      }`}
                    >
                      {l.amount > 0 ? '+' : ''}
                      {l.amount}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 truncate">
                        {l.note || l.action}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(l.createdAt).toLocaleString('zh-CN')}
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500">余额 {l.balance}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================
   🌟 任务 4：会员权益徽章（SubscriptionBadge）
   - 根据 subscription_type 渲染不同文案
   - MONTHLY_69 → 🟢 显示续费日期 + 取消按钮
   - LIGHT_598 → 🥇 显示激活状态
   - CITY_5980 → 👑 显示主理人认证
   - 未订阅 → 🚀 引导购买链接
============================================ */
function SubscriptionBadge({
  userData,
  onCancelled,
}: {
  userData: any
  onCancelled?: () => void
}) {
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [localStatus, setLocalStatus] = useState<string | null>(null)

  // 优先读服务端字段 → 兜底读 localStorage
  const subType: string | null =
    userData?.subscription_type || null
  const subStatus: string =
    userData?.subscription_status || localStatus || 'INACTIVE'
  const subEnd: string | null = userData?.subscription_end
    ? new Date(userData.subscription_end).toISOString().slice(0, 10)
    : null
  const autoRenew: boolean = userData?.auto_renew || false
  const role: string = userData?.role || 'MEMBER'

  // ─── 格式化续费日期 ───
  const formatDate = (d: string | null) => {
    if (!d) return '—'
    try {
      const dt = new Date(d)
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
    } catch {
      return d
    }
  }

  // ─── 取消订阅 ───
  const handleCancel = async () => {
    if (cancelling) return
    setCancelling(true)
    try {
      const res = await fetch('/api/payment/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData?.email,
          deviceId:
            typeof window !== 'undefined'
              ? window.localStorage.getItem('opc_device_id')
              : null,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setLocalStatus('CANCELED')
        // 同步 localStorage
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(
              'opc_active_subscription',
              JSON.stringify({
                plan: subType,
                renewDate: subEnd,
                status: 'CANCELED',
                autoRenew: false,
              })
            )
          }
        } catch {
          // 静默
        }
        setShowCancelModal(false)
        onCancelled?.()
      } else {
        toast.error(`取消失败：${json.error || '未知错误'}`)
      }
    } catch (err) {
      toast.error(`取消失败：${String(err)}`)
    } finally {
      setCancelling(false)
    }
  }

  // ─── 渲染逻辑 ───

  // 场景 1：城市主理人（最高优先级 · 全站显示）
  if (subType === 'CITY_5980' || role === 'CITY_MAINTAINER') {
    return (
      <div className="relative max-w-lg md:max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 p-4 shadow-lg">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl" />
          <div className="relative flex items-center gap-3 text-white">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg ring-2 ring-white/30">
              👑
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-amber-200 tracking-widest mb-0.5 flex items-center gap-1">
                <Sparkles size={10} />
                CITY MAINTAINER · 城市主理人
              </div>
              <div className="text-base md:text-lg font-extrabold leading-tight">
                👑 城市主理人已认证
              </div>
              <div className="text-[11px] text-white/80 mt-0.5">
                已锁定分站经营 + 总部导师 + 团队搭建通道
              </div>
            </div>
            <Link
              href="/console"
              className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-2 bg-white text-purple-700 text-xs font-bold rounded-lg shadow-md active:scale-95 transition-transform"
            >
              <Trophy size={12} />
              主理人后台
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 场景 2：月度会员（MONTHLY_69）→ 显示续费日期 + 取消按钮
  if (subType === 'MONTHLY_69' && subStatus === 'ACTIVE') {
    return (
      <>
        <div className="relative max-w-lg md:max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-4 shadow-lg">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl" />
            <div className="relative flex items-center gap-3 text-white">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg ring-2 ring-white/30">
                🟢
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-emerald-100 tracking-widest mb-0.5 flex items-center gap-1">
                  <Sparkles size={10} />
                  MONTHLY MEMBER · 月度会员
                </div>
                <div className="text-sm md:text-base font-extrabold leading-tight">
                  🟢 当前权益：月度会员（69元/月）
                </div>
                <div className="text-[11px] text-white/90 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span>下次续费日期：<strong>{formatDate(subEnd)}</strong></span>
                  {autoRenew && (
                    <span className="px-1.5 py-0.5 bg-white/25 rounded-full text-[9px] font-bold">
                      🔁 自动续费
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white text-xs font-bold rounded-lg border border-white/30 active:scale-95 transition-all"
              >
                <X size={12} />
                取消订阅
              </button>
            </div>
          </div>
        </div>

        {/* 取消确认弹窗 */}
        {showCancelModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowCancelModal(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 border-b border-rose-100">
                <div className="relative flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <AlertCircle size={22} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-extrabold tracking-widest text-rose-700 uppercase mb-0.5">
                      ⚠️ CANCEL SUBSCRIPTION
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                      确认取消月度会员？
                    </h3>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm text-slate-700 leading-relaxed">
                  取消后，<strong className="text-rose-700">自动续费将关闭</strong>，
                  您仍可使用至 <strong className="text-blue-700">{formatDate(subEnd)}</strong>。
                  之后不再扣款。
                </p>
                <ul className="mt-4 space-y-2 text-[12px] text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>不收任何手续费</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>到期前所有权益正常使用</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>可随时重新订阅</span>
                  </li>
                </ul>

                <div className="mt-5 space-y-2">
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
                  >
                    {cancelling ? '⏳ 取消中...' : '确认取消订阅'}
                  </button>
                  <button
                    onClick={() => setShowCancelModal(false)}
                    disabled={cancelling}
                    className="w-full inline-flex items-center justify-center text-[11px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors"
                  >
                    再想想
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowCancelModal(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-900 flex items-center justify-center text-lg transition-colors"
                aria-label="关闭"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  // 场景 3：598 元轻陪跑
  if (subType === 'LIGHT_598' && subStatus === 'ACTIVE') {
    return (
      <div className="relative max-w-lg md:max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-4 shadow-lg">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl" />
          <div className="relative flex items-center gap-3 text-white">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg ring-2 ring-white/30">
              🥇
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-blue-100 tracking-widest mb-0.5 flex items-center gap-1">
                <Sparkles size={10} />
                LIGHT COACHING · 轻陪跑
              </div>
              <div className="text-sm md:text-base font-extrabold leading-tight">
                🥇 当前权益：598元轻陪跑已激活
              </div>
              <div className="text-[11px] text-white/90 mt-0.5">
                有效期至 <strong>{formatDate(subEnd)}</strong> · 导师 1V1 陪跑通道已开启
              </div>
            </div>
            <Link
              href="/market/services"
              className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-2 bg-white text-blue-700 text-xs font-bold rounded-lg shadow-md active:scale-95 transition-transform"
            >
              <Sparkles size={12} />
              查看陪跑
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 场景 4：19.9 元智富先锋卡
  if (subType === 'PIONEER_19' && subStatus === 'ACTIVE') {
    return (
      <div className="relative max-w-lg md:max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-4 shadow-lg">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl" />
          <div className="relative flex items-center gap-3 text-white">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg ring-2 ring-white/30">
              🎁
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-amber-100 tracking-widest mb-0.5 flex items-center gap-1">
                <Sparkles size={10} />
                PIONEER · 智富先锋卡
              </div>
              <div className="text-sm md:text-base font-extrabold leading-tight">
                🎁 智富先锋卡已激活
              </div>
              <div className="text-[11px] text-white/90 mt-0.5">
                AI 商业诊断 1 次 + 1 次沙龙名额 + 50 智富积分已到账
              </div>
            </div>
            <Link
              href="/pricing"
              className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-2 bg-white text-orange-600 text-xs font-bold rounded-lg shadow-md active:scale-95 transition-transform"
            >
              <Rocket size={12} />
              升级会员
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 场景 5：已取消（CANCELED）状态
  if (subStatus === 'CANCELED') {
    return (
      <div className="relative max-w-lg md:max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-slate-100 border-2 border-slate-200 p-4 shadow-sm">
          <div className="relative flex items-center gap-3 text-slate-700">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-2xl">
              ⏸️
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-slate-500 tracking-widest mb-0.5">
                CANCELED · 已取消
              </div>
              <div className="text-sm md:text-base font-extrabold leading-tight">
                订阅已取消
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                到期前可继续使用 · 重新订阅享 9.9 元首月优惠
              </div>
            </div>
            <Link
              href="/pricing"
              className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-lg shadow-md active:scale-95 transition-transform"
            >
              🔥 9.9 元重新订阅
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 场景 6：未订阅 → 引导购买
  return (
    <div className="relative max-w-lg md:max-w-6xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 p-4 shadow-lg">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl" />
        <div className="relative flex items-center gap-3 text-white">
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg ring-2 ring-white/20">
            🚀
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-amber-200 tracking-widest mb-0.5 flex items-center gap-1">
              <Sparkles size={10} />
              UPGRADE · 解锁更多权益
            </div>
            <div className="text-sm md:text-base font-extrabold leading-tight">
              9.9 元开启月度会员
            </div>
            <div className="text-[11px] text-white/80 mt-0.5">
              首月 9.9 元 · 工具库+项目库+诊断无限次 · 随时取消
            </div>
          </div>
          <Link
            href="/pricing"
            className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-lg shadow-md active:scale-95 transition-transform"
          >
            <Flame size={12} />
            查看方案
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ============================================
   🎯 进化四：会员中心上下文感知 · 阶段引导
   - 根据 subscription_type 自动生成"当前阶段"+"升级引导"文案
   - 6 档订阅 + 未订阅 + 已取消 共 8 种状态
   - 点击升级按钮 → router.push('/pricing') 直接跳转定价页
   - 移动端：单列紧凑布局；PC：横向卡片
   - CITY_5980（主理人）已是最高级，不显示引导
============================================ */

type StageKey =
  | 'NONE'
  | 'PIONEER_19'
  | 'COMMUNITY_199'
  | 'MONTHLY_69'
  | 'LIGHT_599'
  | 'LIGHT_598'
  | 'DEEP_1980'
  | 'CANCELED'

interface StageGuide {
  emoji: string
  /** 阶段名（高亮用） */
  stageName: string
  /** 当前状态描述 */
  statusText: string
  /** 升级引导 */
  upgradeHint: string
  /** 升级 CTA 文字 */
  upgradeCta: string
  /** 升级目标档（点击后锚点定位） */
  upgradeAnchor?: 'ice' | 'battle' | 'expansion'
  /** 主题色 token */
  theme: {
    /** 卡片外层背景 */
    cardBg: string
    /** 卡片边框 */
    cardBorder: string
    /** 阶段徽标底色 */
    badgeBg: string
    /** 阶段徽标文字色 */
    badgeText: string
    /** 升级按钮色 */
    buttonBg: string
    /** 文案主色 */
    textMain: string
    /** 文案副色 */
    textSub: string
    /** 提示图标色 */
    hintIcon: string
  }
}

/** 阶段引导配置表（7 档 + 取消） */
const STAGE_GUIDE_MAP: Record<StageKey, StageGuide> = {
  NONE: {
    emoji: '🌱',
    stageName: '未开启',
    statusText: '您当前处于【未订阅】阶段，可先 19.9 元体验 AI 商业诊断。',
    upgradeHint: '建议从 19.9 元智富先锋卡开启，找到方向后再深入。',
    upgradeCta: '19.9 元开启',
    upgradeAnchor: 'ice',
    theme: {
      cardBg: 'bg-gradient-to-r from-slate-50 via-white to-slate-50',
      cardBorder: 'border border-slate-200',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-700',
      buttonBg: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
      textMain: 'text-slate-900',
      textSub: 'text-slate-600',
      hintIcon: 'text-amber-500',
    },
  },
  PIONEER_19: {
    emoji: '🎁',
    stageName: '破冰体验',
    statusText: '您当前处于【破冰体验】阶段，已完成 1 次 AI 商业诊断。',
    upgradeHint: '如需长期诊断 + 工具库 + 资源库，建议升级 69 元月卡。',
    upgradeCta: '升级 69 元月卡',
    upgradeAnchor: 'battle',
    theme: {
      cardBg: 'bg-gradient-to-r from-amber-50/80 via-white to-orange-50/40',
      cardBorder: 'border border-amber-200',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      buttonBg: 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600',
      textMain: 'text-amber-900',
      textSub: 'text-amber-800/80',
      hintIcon: 'text-rose-500',
    },
  },
  COMMUNITY_199: {
    emoji: '🤝',
    stageName: '社群连接',
    statusText: '您当前处于【社群连接】阶段，已加入主理人私域圈子。',
    upgradeHint: '想从"连接"到"跑通 SOP"，建议升级 69 元月卡开启工具库。',
    upgradeCta: '升级 69 元月卡',
    upgradeAnchor: 'battle',
    theme: {
      cardBg: 'bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/40',
      cardBorder: 'border border-emerald-200',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      buttonBg: 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600',
      textMain: 'text-emerald-900',
      textSub: 'text-emerald-800/80',
      hintIcon: 'text-rose-500',
    },
  },
  MONTHLY_69: {
    emoji: '🟢',
    stageName: '单店实操',
    statusText: '您当前处于【单店实操】阶段，正在跑通单店/单号 SOP。',
    upgradeHint: '如需开启矩阵放大与深度陪跑，升级至 1980 元深度矩阵陪跑。',
    upgradeCta: '升级 1980 陪跑',
    upgradeAnchor: 'battle',
    theme: {
      cardBg: 'bg-gradient-to-r from-emerald-50/80 via-white to-cyan-50/40',
      cardBorder: 'border border-emerald-200',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      buttonBg: 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700',
      textMain: 'text-emerald-900',
      textSub: 'text-emerald-800/80',
      hintIcon: 'text-indigo-500',
    },
  },
  LIGHT_599: {
    emoji: '🎓',
    stageName: '3 个月轻陪跑',
    statusText: '您当前处于【导师轻陪跑】阶段，1V1 陪跑已开启。',
    upgradeHint: '想从"单店"到"矩阵放大"，建议升级 1980 元深度矩阵陪跑。',
    upgradeCta: '升级 1980 深度',
    upgradeAnchor: 'battle',
    theme: {
      cardBg: 'bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/40',
      cardBorder: 'border border-blue-200',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
      buttonBg: 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700',
      textMain: 'text-blue-900',
      textSub: 'text-blue-800/80',
      hintIcon: 'text-indigo-500',
    },
  },
  LIGHT_598: {
    emoji: '🥇',
    stageName: '轻陪跑',
    statusText: '您当前处于【导师轻陪跑】阶段，1V1 陪跑进行中。',
    upgradeHint: '想从"单店"到"矩阵放大"，建议升级 1980 元深度矩阵陪跑。',
    upgradeCta: '升级 1980 深度',
    upgradeAnchor: 'battle',
    theme: {
      cardBg: 'bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/40',
      cardBorder: 'border border-blue-200',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
      buttonBg: 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700',
      textMain: 'text-blue-900',
      textSub: 'text-blue-800/80',
      hintIcon: 'text-indigo-500',
    },
  },
  DEEP_1980: {
    emoji: '🚀',
    stageName: '矩阵放大',
    statusText: '您当前处于【矩阵放大】阶段，1V1 陪跑 + 团队搭建进行中。',
    upgradeHint: '如需锁定城市分站经营 + 总部导师轮值，升级 5980 元城市主理人。',
    upgradeCta: '升级 5980 主理人',
    upgradeAnchor: 'expansion',
    theme: {
      cardBg: 'bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/40',
      cardBorder: 'border border-indigo-200',
      badgeBg: 'bg-indigo-100',
      badgeText: 'text-indigo-800',
      buttonBg: 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600',
      textMain: 'text-indigo-900',
      textSub: 'text-indigo-800/80',
      hintIcon: 'text-amber-500',
    },
  },
  CANCELED: {
    emoji: '⏸️',
    stageName: '已取消',
    statusText: '您之前的订阅已取消，到期前可继续使用。',
    upgradeHint: '重新订阅享 9.9 元首月优惠 · 老用户专属。',
    upgradeCta: '9.9 元重新订阅',
    upgradeAnchor: 'battle',
    theme: {
      cardBg: 'bg-gradient-to-r from-slate-50 via-white to-slate-100',
      cardBorder: 'border border-slate-200',
      badgeBg: 'bg-slate-200',
      badgeText: 'text-slate-700',
      buttonBg: 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600',
      textMain: 'text-slate-900',
      textSub: 'text-slate-600',
      hintIcon: 'text-rose-500',
    },
  },
}

function MembershipStageGuidance({ userData }: { userData: any }) {
  const router = useRouter()
  const [stage, setStage] = useState<StageKey>('NONE')

  useEffect(() => {
    if (typeof window === 'undefined') return
    // 优先从服务端字段读取，兜底读 localStorage
    const fromServer = (userData?.subscription_type as string) || ''
    const fromStorage = window.localStorage.getItem('opc_active_subscription') || ''
    let detected: string = fromServer
    if (!detected && fromStorage) {
      try {
        detected = JSON.parse(fromStorage)?.plan || ''
      } catch {
        detected = ''
      }
    }
    // 已取消优先
    const status =
      (userData?.subscription_status as string) ||
      (() => {
        try {
          return JSON.parse(fromStorage || '{}')?.status || ''
        } catch {
          return ''
        }
      })()
    if (status === 'CANCELED' && detected) {
      setStage('CANCELED')
      return
    }
    // 匹配已知 key
    if (
      detected === 'PIONEER_19' ||
      detected === 'COMMUNITY_199' ||
      detected === 'MONTHLY_69' ||
      detected === 'LIGHT_599' ||
      detected === 'LIGHT_598' ||
      detected === 'DEEP_1980'
    ) {
      setStage(detected as StageKey)
    } else {
      setStage('NONE')
    }
  }, [userData?.subscription_type, userData?.subscription_status])

  // 城市主理人已是最高级，不显示引导
  if (userData?.role === 'CITY_MAINTAINER' || userData?.subscription_type === 'CITY_5980') {
    return null
  }

  const guide = STAGE_GUIDE_MAP[stage]
  const { theme } = guide

  const handleUpgrade = () => {
    if (guide.upgradeAnchor) {
      // 跳到定价页对应分区（hash 锚点）
      router.push(`/pricing#section-${guide.upgradeAnchor}`)
    } else {
      router.push('/pricing')
    }
  }

  return (
    <div
      className={`relative max-w-lg md:max-w-6xl mx-auto rounded-2xl p-3.5 md:p-4 shadow-sm ${theme.cardBg} ${theme.cardBorder}`}
    >
      <div className="flex items-start gap-3">
        {/* 左侧 emoji 徽标 */}
        <div
          className={`flex-shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-xl ${theme.badgeBg} flex items-center justify-center text-xl md:text-2xl shadow-sm`}
        >
          {guide.emoji}
        </div>

        {/* 中间文案 */}
        <div className="flex-1 min-w-0">
          {/* 阶段徽章 */}
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 ${theme.badgeBg} ${theme.badgeText} text-[10px] md:text-[11px] font-bold rounded-full`}
            >
              <Sparkles size={10} />
              当前阶段 · {guide.stageName}
            </span>
          </div>

          {/* 当前状态文案（高亮【阶段名】） */}
          <div className={`text-[12.5px] md:text-sm font-semibold ${theme.textMain} leading-snug`}>
            {highlightStage(guide.statusText, guide.stageName, theme.textMain)}
          </div>

          {/* 升级引导文案 */}
          <div className={`mt-1.5 text-[11.5px] md:text-xs ${theme.textSub} leading-relaxed flex items-start gap-1`}>
            <Lightbulb size={12} className={`flex-shrink-0 mt-0.5 ${theme.hintIcon}`} />
            <span>{guide.upgradeHint}</span>
          </div>
        </div>

        {/* 右侧升级按钮 */}
        <button
          onClick={handleUpgrade}
          className={`flex-shrink-0 inline-flex items-center gap-1 px-3 py-2 ${theme.buttonBg} text-white text-[11.5px] md:text-xs font-bold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all whitespace-nowrap`}
        >
          {guide.upgradeCta}
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  )
}

/** 把文案中的【xxx】高亮为带下划线的主色文本（用 React 节点替换） */
function highlightStage(
  text: string,
  _stageName: string,
  _colorClass: string
): JSX.Element {
  // 匹配【...】
  const match = text.match(/^(.*?)【(.+?)】(.*)$/)
  if (!match) return <>{text}</>
  const [, before, inner, after] = match
  // 内层高亮用 stageName 加粗
  return (
    <>
      {before}
      <span className="font-extrabold text-slate-900 border-b-2 border-dashed border-slate-400 mx-0.5">
        【{inner}】
      </span>
      {after}
    </>
  )
}

/* ============================================
   ⏰ 任务 4：订阅到期预警气泡（ExpiringBanner）
   - 订阅到期前 3 天 → 琥珀色温和提醒 + 积分抵扣续费提示
   - 已过期 → 红色警告
   - 长期订阅 → 不展示
============================================ */
function ExpiringBanner({
  userData,
  userPoints,
}: {
  userData: any
  userPoints: number
}) {
  const banner = buildExpiringBanner(userData, userPoints)
  if (!banner.show) return null

  const toneClass =
    banner.tone === 'red'
      ? 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 text-white border-rose-300'
      : 'bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 text-amber-900 border-amber-300'

  return (
    <div className="relative max-w-lg md:max-w-6xl mx-auto">
      <div
        className={`relative overflow-hidden rounded-2xl border-2 p-3 md:p-3.5 shadow-md ${toneClass}`}
      >
        {banner.tone !== 'red' && (
          <>
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-amber-300/40 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-yellow-300/30 rounded-full blur-2xl" />
          </>
        )}
        {banner.tone === 'red' && (
          <>
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-yellow-300/30 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-pink-300/30 rounded-full blur-2xl" />
          </>
        )}
        <div className="relative flex items-start gap-3">
          <div
            className={`flex-shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-md ${
              banner.tone === 'red'
                ? 'bg-white/20 ring-2 ring-white/30'
                : 'bg-white shadow-sm'
            }`}
          >
            {banner.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className={`text-[10px] font-bold tracking-widest mb-0.5 ${
                banner.tone === 'red' ? 'text-yellow-100' : 'text-amber-700'
              }`}
            >
              {banner.tone === 'red' ? '⚠️ SUBSCRIPTION EXPIRED' : '⏰ EXPIRING SOON · 到期预警'}
            </div>
            <div className="text-sm md:text-base font-extrabold leading-tight">
              {banner.title}
            </div>
            <div
              className={`text-[11px] md:text-xs mt-1 leading-relaxed ${
                banner.tone === 'red' ? 'text-white/90' : 'text-amber-800'
              }`}
            >
              {banner.body}
            </div>
            {banner.pointsTip && (
              <div
                className={`text-[10px] mt-1 font-bold ${
                  banner.tone === 'red' ? 'text-yellow-200' : 'text-amber-700'
                }`}
              >
                {banner.pointsTip}
              </div>
            )}
          </div>
          <Link
            href={banner.ctaHref}
            className={`flex-shrink-0 inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-lg shadow-md active:scale-95 transition-transform ${
              banner.tone === 'red'
                ? 'bg-white text-rose-600 hover:bg-rose-50'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
            }`}
          >
            {banner.ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ============================================
   ⭐ 任务 3：每日签到领积分（DailySignInCard）
============================================ */
function DailySignInCard({
  userId,
  onSignInSuccess,
}: {
  userId: string
  onSignInSuccess?: (newBalance: number) => void
}) {
  const [data, setData] = useState<{
    points: number
    signedToday: boolean
    isMonthlyMember: boolean
    todayReward: number
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [signing, setSigning] = useState(false)
  const [tip, setTip] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const res = await fetch(
        `/api/points?userId=${encodeURIComponent(userId)}&type=balance`,
        { cache: 'no-store' }
      )
      const json = await res.json()
      if (json.success) {
        setData({
          points: json.data?.points ?? 0,
          signedToday: !!json.data?.signedToday,
          isMonthlyMember: !!json.data?.isMonthlyMember,
          todayReward: json.data?.todayReward ?? 5,
        })
      }
    } catch {
      // 静默
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const handleSignIn = async () => {
    if (signing || data?.signedToday) return
    setSigning(true)
    setTip(null)
    try {
      const res = await fetch('/api/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sign-in', userId }),
      })
      const json = await res.json()
      if (json.success) {
        setTip(`✅ 签到成功！+${json.data.amount} 智富积分`)
        onSignInSuccess?.(json.data?.balance ?? 0)
        await fetchStatus()
        setTimeout(() => setTip(null), 3000)
      } else {
        setTip(`⚠️ ${json.error || '签到失败'}`)
      }
    } catch (err) {
      setTip(`⚠️ 网络错误：${String(err)}`)
    } finally {
      setSigning(false)
    }
  }

  // 已签到状态
  if (data?.signedToday) {
    return (
      <div className="relative max-w-lg md:max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-200 p-3 md:p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xl md:text-2xl shadow-md">
              ✅
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-emerald-700 tracking-widest mb-0.5">
                DAILY CHECK-IN · 今日已签到
              </div>
              <div className="text-sm md:text-base font-extrabold text-emerald-900 leading-tight">
                ✅ 今日已签到（明日再来）
              </div>
              <div className="text-[11px] text-emerald-700 mt-0.5">
                连续签到可累积更多奖励 · 明天 +{data?.todayReward ?? 5} 智富积分
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-[10px] text-emerald-700 font-bold">当前积分</div>
              <div className="text-lg md:text-xl font-extrabold text-emerald-900">
                ⭐ {data?.points ?? 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 未签到状态（主态）
  return (
    <div className="relative max-w-lg md:max-w-6xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-3 md:p-4 shadow-lg">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-yellow-300/30 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="flex-shrink-0 flex items-center gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center text-xl md:text-2xl shadow-lg ring-2 ring-white/30">
              ⭐
            </div>
            <div className="flex-1 min-w-0 text-white">
              <div className="text-[10px] font-bold text-amber-100 tracking-widest mb-0.5 flex items-center gap-1">
                <Sparkles size={10} />
                DAILY CHECK-IN · 每日签到
                {data?.isMonthlyMember && (
                  <span className="ml-1 px-1.5 py-0.5 bg-yellow-300 text-orange-900 rounded-full text-[9px] font-extrabold">
                    月度会员 2 倍
                  </span>
                )}
              </div>
              <div className="text-sm md:text-base font-extrabold leading-tight">
                签到领积分 ⭐ +{data?.todayReward ?? 5}
              </div>
              <div className="text-[11px] text-white/90 mt-0.5">
                当前积分 <strong>{data?.points ?? 0}</strong> · 累计签到让积分飞起来
              </div>
            </div>
          </div>
          <button
            onClick={handleSignIn}
            disabled={signing || loading}
            className="w-full md:w-auto flex-shrink-0 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-yellow-50 text-orange-600 px-4 py-2.5 md:py-2 text-sm font-extrabold rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {signing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                签到中...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                签到领积分
              </>
            )}
          </button>
        </div>
        {tip && (
          <div className="relative mt-2 text-center text-xs font-bold text-white bg-white/20 rounded-lg py-1.5 backdrop-blur">
            {tip}
          </div>
        )}
      </div>
    </div>
  )
}
