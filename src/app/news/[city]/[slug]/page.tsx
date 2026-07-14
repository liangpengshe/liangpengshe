/**
 * 城市日报 SEO 落地页
 * ------------------------------------------------------------
 * URL: /news/[city]/[slug]
 * 例: /news/wuhai/ai-e-commerce-wuhai-guide-abc
 *
 * 这是 SEO 黄金页面：
 *   - 服务端渲染（不依赖客户端 JS）
 *   - 自动生成 <meta name="description"> 和 OG tags
 *   - 包含本地关键词 / 选品建议 / 社群链接
 *   - JSON-LD 结构化数据（Article schema）
 */
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Calendar, User, Sparkles, Users, Hash, ExternalLink } from 'lucide-react'
import { renderMarkdown } from '@/lib/markdown'

interface CityArticle {
  id: string
  city: string
  title: string
  slug: string
  content: string
  excerpt: string
  authorName: string
  generatedAt: string
  source: 'dify' | 'fallback'
  localTips: string[]
  communityLinks: string[]
  relatedKeywords: string[]
}

const g = globalThis as unknown as { __lpCityDailyStore?: CityArticle[] }
const store: CityArticle[] = g.__lpCityDailyStore || []

const CITY_NAME: Record<string, string> = {
  liuzhou: '柳州',
  dongguan: '东莞',
  wuhai: '乌海',
  shenzhen: '深圳',
  guangzhou: '广州',
  shanghai: '上海',
  beijing: '北京',
  hangzhou: '杭州',
  chengdu: '成都',
  wuhan: '武汉',
}

interface PageProps {
  params: { city: string; slug: string }
}

async function findArticle(city: string, slug: string): Promise<CityArticle | null> {
  // 注：globalThis 在 next dev 中是模块级单例；这种读取对 SSR 友好
  const articles = store.filter(
    (a) => cityToSlugLocal(a.city) === city && a.slug === slug
  )
  return articles[0] || null
}

function cityToSlugLocal(city: string): string {
  const map: Record<string, string> = {
    柳州: 'liuzhou',
    东莞: 'dongguan',
    乌海: 'wuhai',
    深圳: 'shenzhen',
    广州: 'guangzhou',
    上海: 'shanghai',
    北京: 'beijing',
    杭州: 'hangzhou',
    成都: 'chengdu',
    武汉: 'wuhan',
  }
  return map[city] || city.toLowerCase()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await findArticle(params.city, params.slug)
  if (!article) {
    return { title: '文章未找到 · 良朋社 OPC' }
  }
  const cityLabel = CITY_NAME[params.city] || article.city
  return {
    title: `${article.title} · ${cityLabel} OPC 联运站`,
    description: article.excerpt,
    keywords: article.relatedKeywords.join(','),
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.generatedAt,
      authors: [article.authorName],
      locale: 'zh_CN',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
    alternates: {
      canonical: `/news/${params.city}/${params.slug}`,
    },
  }
}

export default async function CityArticlePage({ params }: PageProps) {
  const article = await findArticle(params.city, params.slug)
  if (!article) {
    notFound()
  }

  // 简单 markdown 渲染（不引入重型库，使用项目内轻量 renderMarkdown）
  const htmlContent = renderMarkdown(article.content)

  const cityLabel = CITY_NAME[params.city] || article.city

  // JSON-LD 结构化数据
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    author: {
      '@type': 'Person',
      name: article.authorName,
    },
    datePublished: article.generatedAt,
    publisher: {
      '@type': 'Organization',
      name: '良朋社 OPC',
    },
    keywords: article.relatedKeywords.join(','),
    articleSection: 'AI 商业',
    inLanguage: 'zh-CN',
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* 隐藏的 meta description（供不通过 Next metadata 注入的场景） */}
      <meta name="description" content={article.excerpt} />
      <meta name="keywords" content={article.relatedKeywords.join(',')} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-3xl mx-auto px-5 py-5 md:py-7">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-3 transition-colors"
          >
            <ArrowLeft size={14} />
            返回良朋社 OPC
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 backdrop-blur px-2 py-0.5 rounded-full">
              <MapPin size={10} />
              {cityLabel} 联运站
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-400/90 text-amber-900 px-2 py-0.5 rounded-full">
              <Sparkles size={10} />
              AI 自动生成
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
            {article.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/85">
            <span className="inline-flex items-center gap-1">
              <User size={12} />
              {article.authorName}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} />
              {new Date(article.generatedAt).toLocaleDateString('zh-CN')}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-6">
        {/* SEO 摘要区 */}
        <div className="mb-5 p-4 md:p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={14} className="text-amber-500" />
            <h2 className="text-xs font-bold text-amber-700 tracking-wider uppercase">
              本期摘要
            </h2>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{article.excerpt}</p>
          {article.relatedKeywords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {article.relatedKeywords.map((k) => (
                <span
                  key={k}
                  className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5"
                >
                  <Hash size={9} />
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 本地选品建议 */}
        {article.localTips.length > 0 && (
          <div className="mb-5 p-4 md:p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
            <div className="flex items-center gap-1.5 mb-2.5">
              <MapPin size={14} className="text-amber-600" />
              <h2 className="text-xs font-bold text-amber-700 tracking-wider uppercase">
                {cityLabel} 本地选品建议
              </h2>
            </div>
            <ul className="space-y-1.5">
              {article.localTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-800">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 文章主体 */}
        <article
          className="prose prose-slate max-w-none bg-white border border-slate-200 rounded-2xl p-5 md:p-7 shadow-sm
            prose-headings:font-extrabold prose-headings:text-slate-900
            prose-h1:text-2xl prose-h2:text-xl prose-h3:text-base
            prose-p:text-slate-700 prose-p:leading-relaxed
            prose-strong:text-slate-900 prose-strong:font-bold
            prose-blockquote:border-l-4 prose-blockquote:border-indigo-400
            prose-blockquote:bg-indigo-50/60 prose-blockquote:px-4 prose-blockquote:py-2
            prose-blockquote:not-italic prose-blockquote:text-slate-700
            prose-hr:border-slate-200"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* 加入本地社群 */}
        {article.communityLinks.length > 0 && (
          <div className="mt-5 p-5 md:p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} />
              <h2 className="text-base font-extrabold">加入 {cityLabel} OPC 联运群</h2>
            </div>
            <p className="text-sm text-white/90 leading-relaxed mb-3">
              本地 OPC 主理人 1V1 答疑 + 每周 1 场线下对接 + 选品/SOP 资源共享
            </p>
            {article.communityLinks.map((link) => (
              <a
                key={link}
                href={link}
                className="inline-flex items-center gap-1.5 bg-white text-indigo-700 font-bold text-sm px-4 py-2.5 rounded-xl hover:scale-105 transition-transform"
              >
                访问{cityLabel}社群
                <ExternalLink size={14} />
              </a>
            ))}
          </div>
        )}

        {/* 底部信息 */}
        <div className="mt-6 p-4 bg-slate-100 border border-slate-200 rounded-xl text-center">
          <p className="text-[10px] text-slate-500 leading-relaxed">
            本页内容由良朋社 OPC AI 引擎根据{cityLabel}本周 OPC 行为自动生成 ·
            {' '}
            <Link href="/console" className="text-indigo-600 hover:underline">
              城市主理人入口
            </Link>
            {' '}
            ·{' '}
            <Link href="/market/resources" className="text-indigo-600 hover:underline">
              AI四库全胜系统
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
