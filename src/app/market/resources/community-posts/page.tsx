/**
 * OPC 生态成员投稿的实战资源
 *
 * 路由：/market/resources/community-posts
 *
 * 视觉层级：
 *   1. 顶部 Hero · 玻璃态卡片 + 3 个社交证明胶囊
 *   2. Bento 网格（3 列）· 6 个资源池 + 头像叠加
 *   3. 底部 CTA · 渐变投稿横幅
 */
import Link from 'next/link'
import { ChevronLeft, Star, Sparkles, Send, Users, Package } from 'lucide-react'

interface CommunityPost {
  id: string
  title: string
  emoji: string
  category: string
  categoryColor: string
  /** 左侧色条 */
  borderAccent: string
  desc: string
  /** 3 个贡献者首字母（用于头像叠加） */
  contributors: string[]
  /** 头像渐变（一一对应 contributors） */
  avatarGradients: string[]
  rating: number
  reviews: number
  preview: string[]
  href: string
}

const POSTS: CommunityPost[] = [
  {
    id: 'physical-prod-pool',
    title: '实物产品库',
    emoji: '🛍️',
    category: '货源共享',
    categoryColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    borderAccent: 'border-l-emerald-500',
    desc: '源头工厂直供的智能硬件、礼盒套装、私域选品清单。',
    contributors: ['张', '陈', '王'],
    avatarGradients: [
      'from-rose-500 to-pink-600',
      'from-amber-500 to-orange-600',
      'from-emerald-500 to-teal-600',
    ],
    rating: 4.8,
    reviews: 36,
    preview: ['直播麦克风（源头报价 ¥299）', '桌面 AI 摄像头（OEM 渠道）', '智能音箱套件（白牌代发）'],
    href: '/market?tab=resources&category=physical',
  },
  {
    id: 'ai-self-tools',
    title: 'AI自研工具库',
    emoji: '⚙️',
    category: '内部工具',
    categoryColor: 'bg-purple-50 text-purple-600 border-purple-200',
    borderAccent: 'border-l-purple-500',
    desc: '豹纹 PLUS / 灵犀 AI / 先锋派数字人 · 主理人亲测 SOP。',
    contributors: ['灵', '犀', 'W'],
    avatarGradients: [
      'from-purple-500 to-violet-600',
      'from-blue-500 to-indigo-600',
      'from-cyan-500 to-blue-600',
    ],
    rating: 4.9,
    reviews: 128,
    preview: ['豹纹 PLUS 自动出图 SOP', '灵犀 AI 文案调优脚本', '先锋派数字人形象库'],
    href: '/market/tools?type=tools',
  },
  {
    id: 'digital-templates',
    title: '数字模板库',
    emoji: '📦',
    category: '内容资产',
    categoryColor: 'bg-blue-50 text-blue-600 border-blue-200',
    borderAccent: 'border-l-blue-500',
    desc: '提示词包 / 设计模板 / 直播脚本 / 朋友圈海报整套拿走。',
    contributors: ['陈', 'L', 'S'],
    avatarGradients: [
      'from-blue-500 to-indigo-600',
      'from-sky-500 to-blue-600',
      'from-indigo-500 to-purple-600',
    ],
    rating: 4.7,
    reviews: 84,
    preview: ['AI 提示词包 v3.2（200+ 条）', '直播脚本模板（7 大行业）', '朋友圈海报设计稿源文件'],
    href: '/market/resources?tab=resources&category=digital',
  },
  {
    id: 'sop-handbook',
    title: '实操SOP手册',
    emoji: '📚',
    category: '方法论',
    categoryColor: 'bg-amber-50 text-amber-600 border-amber-200',
    borderAccent: 'border-l-amber-500',
    desc: '从 0 到 1 跑通 AI 数字店群的完整流程，含踩坑合集。',
    contributors: ['李', 'M', 'Z'],
    avatarGradients: [
      'from-amber-500 to-orange-600',
      'from-yellow-500 to-amber-600',
      'from-orange-500 to-red-600',
    ],
    rating: 5.0,
    reviews: 62,
    preview: ['开店前 7 天准备清单', '首月冷启动 14 步 SOP', '30 个真实踩坑合集'],
    href: '/market/resources?tab=resources&category=sop',
  },
  {
    id: 'traffic-routes',
    title: '流量渠道地图',
    emoji: '🗺️',
    category: '增长方案',
    categoryColor: 'bg-rose-50 text-rose-600 border-rose-200',
    borderAccent: 'border-l-rose-500',
    desc: '从公域到私域的完整引流链路，含 ROI 真实数据。',
    contributors: ['王', 'H', 'K'],
    avatarGradients: [
      'from-rose-500 to-pink-600',
      'from-fuchsia-500 to-purple-600',
      'from-pink-500 to-rose-600',
    ],
    rating: 4.6,
    reviews: 47,
    preview: ['抖音 → 私域 12 步路径', '小红书爆款拆解 50 例', '企业微信 SOP 全流程'],
    href: '/market/resources?tab=resources&category=traffic',
  },
  {
    id: 'collab-cases',
    title: '联营案例库',
    emoji: '🤝',
    category: '联运实操',
    categoryColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    borderAccent: 'border-l-indigo-500',
    desc: '主理人之间如何 1+1>2：分成机制、风险隔离、合规要点。',
    contributors: ['张', '陈', 'Y'],
    avatarGradients: [
      'from-indigo-500 to-blue-600',
      'from-violet-500 to-purple-600',
      'from-blue-500 to-cyan-600',
    ],
    rating: 4.8,
    reviews: 29,
    preview: ['3 套主流分成模型', '联营合同模板 v2.0', '2 个已跑通百万级案例'],
    href: '/market/resources?tab=resources&category=collab',
  },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={11}
          className={
            i <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'text-slate-300'
          }
        />
      ))}
    </div>
  )
}

function ContributorStack({
  initials,
  gradients,
}: {
  initials: string[]
  gradients: string[]
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {initials.slice(0, 3).map((c, i) => (
          <div
            key={i}
            className={`w-7 h-7 rounded-full bg-gradient-to-br ${
              gradients[i] || 'from-slate-400 to-slate-600'
            } ring-2 ring-white flex items-center justify-center text-[10px] font-extrabold text-white shadow-sm`}
          >
            {c}
          </div>
        ))}
      </div>
      <span className="text-[10px] text-slate-500 leading-tight">
        来自 {initials.length} 位主理人实测
      </span>
    </div>
  )
}

export default function CommunityPostsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* 顶部：返回 + Hero 玻璃态卡片 */}
      <header className="px-4 pt-4 pb-2 md:px-6 md:pt-6">
        <div className="max-w-lg md:max-w-6xl mx-auto">
          <Link
            href="/market/resources"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft size={14} />
            返回资源库
          </Link>

          {/* Hero · 玻璃态卡片 */}
          <div className="mt-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-violet-500 flex items-center justify-center shadow-md">
                <Users size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-rose-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    OPC 生态成员投稿
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight">
                  OPC 生态成员投稿的实战资源
                </h1>
                <p className="text-xs md:text-sm text-slate-600 mt-2 leading-relaxed">
                  来自全国 <strong className="text-rose-600">71</strong> 位主理人亲测、贡献的实操资源。
                  免费浏览，深度解锁需加入 <strong className="text-amber-600">69 元实操会员</strong>。
                </p>
              </div>
            </div>

            {/* 3 个并排数据胶囊 */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200/60">
              <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 rounded-full px-3 py-1 text-xs font-medium">
                <Package size={11} />
                {POSTS.length} 个资源池
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 rounded-full px-3 py-1 text-xs font-medium">
                <Users size={11} />
                72 位主理人贡献
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 rounded-full px-3 py-1 text-xs font-medium">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                平均 4.8 / 5.0
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Bento 网格 · 3 列 */}
      <main className="px-4 py-4 md:px-6 md:py-6">
        <div className="max-w-lg md:max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {POSTS.map((post) => (
              <article
                key={post.id}
                className={`group relative bg-white rounded-2xl border border-slate-200 border-l-4 ${post.borderAccent} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5`}
              >
                {/* 顶部：emoji + 标题 + 分类胶囊 */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-2xl">
                      {post.emoji}
                    </span>
                    <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                      {post.title}
                    </h2>
                  </div>
                  <span
                    className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${post.categoryColor}`}
                  >
                    {post.category}
                  </span>
                </div>

                {/* 描述 */}
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {post.desc}
                </p>

                {/* 预览列表 */}
                <ul className="space-y-1.5 mb-4 min-h-[60px]">
                  {post.preview.map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-1.5 text-[11px] text-slate-700 leading-relaxed"
                    >
                      <span className="text-blue-500 mt-0.5">·</span>
                      <span className="line-clamp-1">{line}</span>
                    </li>
                  ))}
                </ul>

                {/* 贡献者头像叠加 */}
                <div className="mb-3 pt-3 border-t border-slate-100">
                  <ContributorStack
                    initials={post.contributors}
                    gradients={post.avatarGradients}
                  />
                </div>

                {/* 底部：评分 + 跳转 */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Stars rating={post.rating} />
                    <span className="text-[10px] font-bold text-slate-700 ml-1">
                      {post.rating.toFixed(1)}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      ({post.reviews})
                    </span>
                  </div>
                  <Link
                    href={post.href}
                    className="inline-flex items-center gap-0.5 text-[11px] font-bold text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    查看
                    <span>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      {/* 底部 CTA · 渐变投稿横幅 */}
      <section className="px-4 py-6 md:px-6">
        <div className="max-w-lg md:max-w-6xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
            {/* 装饰光斑 */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 min-w-0 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <Sparkles size={16} className="text-amber-300" />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-amber-200">
                    邀请投稿
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-extrabold leading-tight mb-1.5">
                  你是 OPC 生态成员？
                </h3>
                <p className="text-sm md:text-base text-indigo-100 leading-relaxed">
                  分享你的实战经验，帮助更多同频创业者。
                </p>
              </div>
              <Link
                href="/resources/submit"
                className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm md:text-base font-extrabold text-indigo-600 bg-white hover:bg-amber-50 px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Send size={14} />
                立即投稿你的资源
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* 底部风向标入口 */}
          <div className="mt-6 flex justify-center">
            <Link
              href="/trends"
              className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors group"
            >
              <span>📊</span>
              <span>查看本周 OPC 风向标</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
