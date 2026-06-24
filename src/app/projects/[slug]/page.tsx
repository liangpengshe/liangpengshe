import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Clock,
  Tag,
  Wrench,
  Target,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  DollarSign,
  ShoppingBag,
  Video,
  Sparkles,
  Image as ImageIcon,
  type LucideIcon,
} from 'lucide-react'
import { sops, getSOPBySlug } from '@/data/sop-projects'

export function generateStaticParams() {
  return sops.map((s) => ({ slug: s.slug }))
}

// 根据 category 选择封面图标与渐变色（不依赖任何外部图片）
const CATEGORY_STYLE: Record<string, { Icon: LucideIcon; gradient: string; ring: string }> = {
  'ai-ecommerce': {
    Icon: ShoppingBag,
    gradient: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700',
    ring: 'ring-blue-400/40',
  },
  'ai-media': {
    Icon: Video,
    gradient: 'bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600',
    ring: 'ring-pink-400/40',
  },
}

export default function SOPDetailPage({ params }: { params: { slug: string } }) {
  const sop = getSOPBySlug(params.slug)
  if (!sop) notFound()

  const isEcommerce = sop.category === 'ai-ecommerce'
  const categoryLabel = isEcommerce ? '🛒 AI 电商实战' : '🎬 AI 自媒体引流'
  const categoryColor = isEcommerce
    ? 'from-blue-500 to-indigo-600'
    : 'from-pink-500 to-rose-600'

  // 兜底默认风格（category 不在表中时使用）
  const style = CATEGORY_STYLE[sop.category] ?? {
    Icon: Sparkles,
    gradient: 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900',
    ring: 'ring-slate-400/40',
  }
  const CategoryIcon = style.Icon

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* 顶部封面：纯 CSS 渐变 + 装饰图标，彻底告别外部图片 */}
      <header className={`relative ${style.gradient} text-white overflow-hidden`}>
        {/* 装饰光晕（无图，纯背景） */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.08]">
            <CategoryIcon size={420} strokeWidth={0.6} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50" />
        </div>

        <div className="relative px-4 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm text-slate-200 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft size={16} />
              返回项目库
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${categoryColor}`}>
                {categoryLabel}
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1">
                <Tag size={12} />
                {sop.tags}
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1">
                <Clock size={12} />
                预估完成：{sop.time}
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1">
                难度：{sop.difficulty}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              {sop.title}
            </h1>
            <p className="text-base md:text-lg text-slate-100 leading-relaxed">
              {sop.summary}
            </p>

            <div className="mt-6 inline-flex items-center gap-2 text-xs text-white/70 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5">
              <ImageIcon size={12} />
              封面由 CSS 渐变生成 · 文章内含完整操作 SOP
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 -mt-12 pb-20">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* 痛点 */}
          <Section icon={<AlertTriangle size={20} />} title="🎯 你是不是也遇到这些问题？" color="red">
            <ul className="space-y-2">
              {sop.painPoints.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700">
                  <span className="text-red-500 font-bold mt-0.5">✗</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* 工具清单 */}
          <Section icon={<Wrench size={20} />} title="🧰 所需工具清单" color="blue">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sop.tools.map((t, i) => (
                <div key={i} className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <div className="font-bold text-blue-900 text-sm">{t.name}</div>
                  <div className="text-xs text-blue-700 mt-1">{t.use}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* 3 步操作流程 */}
          <Section icon={<Target size={20} />} title="📋 3 步详细操作流程" color="emerald">
            <div className="space-y-6">
              {sop.steps.map((step, i) => (
                <div key={i} className="relative pl-12">
                  <div className="absolute left-0 top-0 w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">{step.detail}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-emerald-50 border border-emerald-100 rounded p-2">
                      <div className="text-emerald-600 font-semibold mb-0.5">🛠 工具</div>
                      <div className="text-slate-700">{step.tools.join('、')}</div>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded p-2">
                      <div className="text-amber-600 font-semibold mb-0.5">⏱ 时长</div>
                      <div className="text-slate-700">{step.duration}</div>
                    </div>
                    <div className="bg-violet-50 border border-violet-100 rounded p-2">
                      <div className="text-violet-600 font-semibold mb-0.5">📤 产出</div>
                      <div className="text-slate-700">{step.output}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 预计效果 */}
          <Section icon={<TrendingUp size={20} />} title="📈 预计效果" color="amber">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sop.expectedResults.map((r, i) => (
                <div key={i} className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 text-center">
                  <div className="text-xs text-amber-700 mb-1">{r.metric}</div>
                  <div className="text-lg font-bold text-amber-900">{r.value}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* 变现模式 */}
          <Section icon={<DollarSign size={20} />} title="💰 变现模式" color="emerald">
            <p className="text-slate-700 leading-relaxed">{sop.revenueModel}</p>
          </Section>

          {/* 注意事项 */}
          <Section icon={<Lightbulb size={20} />} title="⚠️ 注意事项" color="rose">
            <ul className="space-y-2">
              {sop.warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700">
                  <span className="text-rose-500 font-bold mt-0.5">!</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* 底部 CTA */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white text-center shadow-xl">
            <h3 className="text-xl font-bold mb-2">想要 1v1 帮你定制这个 SOP？</h3>
            <p className="text-sm text-white/90 mb-4">让 AI 助手结合你的情况做个性化规划</p>
            <Link
              href="/"
              className="inline-block bg-white text-blue-600 font-bold px-6 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg"
            >
              立即咨询 AI 助手
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

function Section({
  icon, title, color, children,
}: { icon: React.ReactNode; title: string; color: string; children: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    red: 'bg-red-50 text-red-600 border-red-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  }
  const cls = colorMap[color] || colorMap.blue

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
      <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-5">
        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border ${cls}`}>
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}
