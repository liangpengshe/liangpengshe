'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ClientLayout from '@/components/ClientLayout'
import { AIDailyBrief } from '@/components/AIDailyBrief'
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

  useEffect(() => {
    fetch('/api/member/roadmap')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setRoadmap(d.data)
      })
      .catch(() => {})
  }, [])

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
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 px-5 py-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold">{userData.name || '用户'}</h1>
              <div className="flex items-center gap-2 text-blue-100 text-sm mt-1">
                <Mail size={14} />
                <span>{userData.email}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100 text-sm mt-1">
                <MapPin size={14} />
                <span>{userData.city?.name || '深圳'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 🌅 AI 智富日报（每日 7:00 推送） */}
        <section className="px-5 -mt-6 relative z-10">
          <AIDailyBrief userId={userData.phone} />
        </section>

        {/* 🪙 良朋币资产卡片 */}
        <section className="px-5 -mt-6 relative z-10">
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

        {/* ⚡️ 四库全胜启动包模块 */}
        <section className="px-5 py-4">
          <ReportStarterCard
            userName={userData?.name || userData?.email || '老板'}
            roadmap={roadmap}
            onOpenReport={() => setShowReport(true)}
          />
        </section>

        {/* 🌟 商业路线图板块 */}
        <section className="px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Compass size={18} className="text-blue-600" />
              商业路线图
            </h2>
            <span className="text-xs text-gray-500">
              整体进度{' '}
              <span className="font-bold text-blue-600">{overallProgress}%</span>
            </span>
          </div>

          {/* 总进度条 */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>四库进度 · 已完成 {completedSteps}/4 步</span>
              <span className="font-bold text-blue-600">{overallProgress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-amber-500 via-blue-500 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* 四阶段卡片 */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {FOUR_STAGES.map((s) => {
              const done = progress[s.key as keyof typeof progress] === 100
              const Icon = s.icon
              return (
                <Link
                  key={s.key}
                  href={STEP_META[s.key].href}
                  className="block group"
                >
                  <div
                    className={`relative aspect-square rounded-2xl p-2 flex flex-col items-center justify-center text-center transition-all ${
                      done
                        ? `bg-gradient-to-br ${s.color} text-white shadow-lg`
                        : 'bg-white border-2 border-dashed border-gray-200 text-gray-400'
                    }`}
                  >
                    {done && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      </div>
                    )}
                    <Icon size={20} className="mb-1" />
                    <div className="text-[10px] font-bold leading-tight">{s.label}</div>
                    <div className={`text-[9px] leading-tight mt-0.5 ${done ? 'text-white/80' : 'text-gray-400'}`}>
                      {done ? '已完成' : '待解锁'}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* 时间轴 */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-blue-600" />
                我的成长时间轴
              </h3>
              <span className="text-[10px] text-gray-400">{timeline.length} 个节点</span>
            </div>

            {timeline.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                  <Sparkles size={20} className="text-blue-500" />
                </div>
                <div className="text-sm text-gray-600 mb-1">还没有成长记录</div>
                <div className="text-xs text-gray-400 mb-4">完成诊断、规划、工具、沙龙即可解锁路线</div>
                <Link
                  href="/diagnosis"
                  className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-full"
                >
                  开始自我诊断
                  <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="relative">
                {/* 时间轴竖线 */}
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-rose-300 via-amber-300 via-blue-300 to-emerald-300" />

                <ul className="space-y-3.5">
                  {timeline.map((step) => {
                    const meta = STEP_META[step.type]
                    const Icon = meta.icon
                    return (
                      <li key={`${step.type}-${step.id}`} className="relative pl-12">
                        {/* 节点圆 */}
                        <div
                          className={`absolute left-0 top-0 w-10 h-10 rounded-full bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-md ring-4 ${meta.ring} z-10`}
                        >
                          <Icon size={16} className="text-white" />
                        </div>

                        <Link
                          href={meta.href}
                          className="block bg-gray-50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl p-3 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r ${meta.gradient} text-white`}
                                >
                                  {meta.badge}
                                </span>
                                <span className="text-xs font-bold text-gray-900">{step.title}</span>
                              </div>
                              <div className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                                {step.desc}
                              </div>
                              <div className="text-[10px] text-gray-400 mt-0.5">{step.meta}</div>
                            </div>
                            <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                              <span className="text-[10px] text-gray-400">
                                {new Date(step.at).toLocaleDateString('zh-CN', {
                                  month: '2-digit',
                                  day: '2-digit',
                                })}
                              </span>
                              <ChevronRight
                                size={12}
                                className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all"
                              />
                            </div>
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* 引导下一步 */}
            {completedSteps < 4 && (
              <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div className="flex-1 text-xs text-gray-700">
                  下一步：完成{' '}
                  {FOUR_STAGES.find((s) => progress[s.key as keyof typeof progress] === 0)?.label || '所有节点'}
                </div>
                <Link
                  href={
                    STEP_META[
                      (FOUR_STAGES.find((s) => progress[s.key as keyof typeof progress] === 0)?.key ||
                        'diagnosis') as string
                    ].href
                  }
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                >
                  继续
                  <ArrowRight size={10} />
                </Link>
              </div>
            )}
          </div>
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
                  目标：<span className="font-semibold text-gray-700">{(diag.goals || []).join(' / ')}</span>
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
