'use client'

import { useState, useEffect } from 'react'
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
  const [coinsBalance, setCoinsBalance] = useState<number>(0)
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

  // 良朋币余额（从 /api/coins 读取）
  useEffect(() => {
    if (!userData?.phone) return
    let mounted = true
    void fetch(`/api/coins?phone=${encodeURIComponent(userData.phone)}&type=balance`, {
      cache: 'no-store',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (mounted && j?.success && typeof j.data?.coins === 'number') {
          setCoinsBalance(j.data.coins)
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
        {/* 🌅 商业作战地图 · 顶部概览（替换原 Hero） */}
        <section className="px-4 pt-4 md:px-6 md:pt-6">
          <ProfileHeader
            userName={userData.name || userData.email || '老板'}
            userAvatar={userData.avatar || '🧭'}
            userStage={userStage}
            coinsBalance={coinsBalance}
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
   🪙 良朋币资产卡片
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
      const res = await fetch(`/api/coins?phone=${encodeURIComponent(phone)}&type=balance`)
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch (e) {
      console.error('获取良朋币失败:', e)
    }
  }

  const fetchRules = async () => {
    try {
      const res = await fetch(`/api/coins?type=rules`)
      const json = await res.json()
      if (json.success) setRules(json.data)
    } catch {}
  }

  const fetchLedger = async () => {
    if (!phone) return
    try {
      const res = await fetch(`/api/coins?phone=${encodeURIComponent(phone)}&type=ledger`)
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
      const res = await fetch('/api/coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, action: 'signin' }),
      })
      const json = await res.json()
      if (json.success) {
        setSigninTip(`✅ 签到成功 +${json.data.amount} 良朋币`)
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
              <h2 className="text-base font-bold text-white">良朋币资产</h2>
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
            良朋币流水
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
