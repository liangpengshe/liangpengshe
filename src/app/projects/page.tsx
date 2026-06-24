'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import {
  ShoppingBag,
  Video,
  Wrench,
  BookOpen,
  Copy,
  Check,
  Clock,
  Tag,
  Wand2,
  Image as ImageIcon,
  Globe,
  Store,
  Users,
  Headphones,
  Hash,
  Tv,
  Mic,
  Sparkles,
  Inbox,
  type LucideIcon,
} from 'lucide-react'
import AIProjectPlanner from '@/components/AIProjectPlanner'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

// ─── 项目库数据映射 ───
// slug 必须与 src/data/sop-projects.ts 中的 SOP 数据一致
// 修改此数组的 slug / title / summary 即可同步更新项目库与详情页
type ProjectCategory = 'ai-ecommerce' | 'ai-media' | 'ai-toolbox' | 'case-study'

interface Project {
  slug: string
  title: string
  tags: string
  duration: string
  summary: string
  cover: string // Tailwind 渐变 className（占位封面）
  icon: LucideIcon
  category: ProjectCategory
}

const PROJECTS: Project[] = [
  // ===== AI 电商实战 =====
  {
    slug: 'ai-tiktok-shop',
    title: 'AI 选品 + TikTok Shop 跨境带货 7 日启动 SOP',
    tags: '高阶玩法',
    duration: '7 天',
    summary: '从 0 起步，用 AI 选品、数据监控、AI 翻译/详情页生成、AI 客服 4 步把 TikTok 美区小店做到首单。',
    cover: 'bg-gradient-to-br from-purple-100 via-fuchsia-100 to-pink-100',
    icon: Globe,
    category: 'ai-ecommerce',
  },
  {
    slug: 'ai-shopify-listing',
    title: 'AI 一键生成 Shopify 多语种详情页 SOP',
    tags: '新手友好',
    duration: '3 天',
    summary: '用 AI 翻译/重写 + AI 主图批量生成，3 天搭好一个可下单的 Shopify 多语种店铺详情页。',
    cover: 'bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100',
    icon: Store,
    category: 'ai-ecommerce',
  },
  {
    slug: 'ai-private-traffic',
    title: 'AI 私域流量自动触达 SOP',
    tags: '进阶玩法',
    duration: '7 天',
    summary: '通过 AI 分析用户行为，自动生成个性化私聊话术，实现 7×24 小时精准触达，提升 3 倍转化。',
    cover: 'bg-gradient-to-br from-blue-100 via-indigo-100 to-violet-100',
    icon: Users,
    category: 'ai-ecommerce',
  },
  {
    slug: 'ai-pinduoduo',
    title: '拼多多 AI 主图 + 详情页批量生成 SOP',
    tags: '新手友好',
    duration: '2 天',
    summary: '用 AI 批量生成拼多多白底图、场景图和详情页，零设计基础也能日更 50 个 SKU 主图。',
    cover: 'bg-gradient-to-br from-rose-100 via-pink-100 to-fuchsia-100',
    icon: ShoppingBag,
    category: 'ai-ecommerce',
  },
  {
    slug: 'ai-after-sales-automation',
    title: 'AI 客服自动回复 + 售后 SOP',
    tags: '进阶玩法',
    duration: '5 天',
    summary: '搭建基于大模型的智能客服系统，自动识别用户意图生成标准化回复，客服成本降低 60%。',
    cover: 'bg-gradient-to-br from-amber-100 via-orange-100 to-red-100',
    icon: Headphones,
    category: 'ai-ecommerce',
  },

  // ===== AI 自媒体引流 =====
  {
    slug: 'ai-xiaohongshu-matrix',
    title: '小红书爆款笔记矩阵 SOP',
    tags: '新手友好',
    duration: '2 天',
    summary: '输入关键词，AI 自动生成选题、文案、配图建议，一天产出 10 篇高质量笔记，矩阵起号 10 倍速。',
    cover: 'bg-gradient-to-br from-pink-100 via-rose-100 to-red-100',
    icon: Hash,
    category: 'ai-media',
  },
  {
    slug: 'ai-douyin-clone',
    title: '抖音 AI 数字人克隆 + 直播 SOP',
    tags: '进阶玩法',
    duration: '10 天',
    summary: '用 D-ID / Heygen 生成数字人，配合 AI 实时问答，实现 24 小时无人值守直播带货。',
    cover: 'bg-gradient-to-br from-cyan-100 via-sky-100 to-blue-100',
    icon: Video,
    category: 'ai-media',
  },
  {
    slug: 'ai-bilibili-creator',
    title: 'B 站 AI 知识区 UP 主起号 SOP',
    tags: '新手友好',
    duration: '14 天',
    summary: 'AI 写脚本、AI 配音、AI 字幕 3 件套，0 露脸也能在 B 站知识区快速起号。',
    cover: 'bg-gradient-to-br from-indigo-100 via-purple-100 to-fuchsia-100',
    icon: Tv,
    category: 'ai-media',
  },
  {
    slug: 'ai-youtube-faceless',
    title: 'YouTube 无人露脸频道 SOP',
    tags: '高阶玩法',
    duration: '21 天',
    summary: 'AI 脚本 + 数字人 + AI 剪辑，打造可持续变现的 YouTube Faceless 频道，吃英文长尾流量。',
    cover: 'bg-gradient-to-br from-red-100 via-rose-100 to-pink-100',
    icon: Sparkles,
    category: 'ai-media',
  },
  {
    slug: 'ai-podcast-newsletter',
    title: 'AI 播客 + Newsletter 双线 SOP',
    tags: '进阶玩法',
    duration: '7 天',
    summary: 'AI 选题、写稿、合成语音，一键生成播客 + 邮件订阅，构建私域高客单订阅收入。',
    cover: 'bg-gradient-to-br from-violet-100 via-purple-100 to-indigo-100',
    icon: Mic,
    category: 'ai-media',
  },
]

interface PromptItem {
  id: string
  title: string
  tags: string[]
  content: string
}

const promptList: PromptItem[] = [
  {
    id: 'p1',
    title: '小红书爆款标题生成',
    tags: ['营销'],
    content: '我是做【你的领域】的博主，请帮我生成 10 个小红书爆款标题，要求包含数字、痛点、解决方案三个要素，风格要吸引人点击。',
  },
  {
    id: 'p2',
    title: '电商详情页文案',
    tags: ['电商'],
    content: '请帮我为以下产品写一段详情页文案：【产品名称】，卖点是【核心卖点】，目标人群是【目标用户】，请突出产品价值，激发购买欲望。',
  },
  {
    id: 'p3',
    title: '短视频脚本生成',
    tags: ['视频'],
    content: '请帮我写一个 60 秒的短视频脚本，主题是【主题】，要求开头 3 秒抓住注意力，中间有干货，结尾引导互动。',
  },
  {
    id: 'p4',
    title: '周报自动总结',
    tags: ['办公'],
    content: '请帮我总结本周工作：【粘贴你的工作内容】，要求结构化展示，突出关键成果和下周计划。',
  },
  {
    id: 'p5',
    title: '竞品分析报告',
    tags: ['分析'],
    content: '请帮我分析【竞品名称】的产品：从产品功能、用户体验、市场定位三个维度进行深度分析，并给出差异化建议。',
  },
]

// ─── 分类定义（用于 Tabs 渲染）───
const CATEGORIES: { value: ProjectCategory; label: string; emoji: string; Icon: LucideIcon; activeGradient: string }[] = [
  { value: 'ai-ecommerce', label: 'AI 电商实战', emoji: '🛒', Icon: ShoppingBag, activeGradient: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600' },
  { value: 'ai-media', label: 'AI 自媒体引流', emoji: '🎬', Icon: Video, activeGradient: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-600' },
  { value: 'ai-toolbox', label: 'AI 高效工具箱', emoji: '🔧', Icon: Wrench, activeGradient: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600' },
  { value: 'case-study', label: '案例深度拆解', emoji: '📖', Icon: BookOpen, activeGradient: 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600' },
]

export default function ProjectsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getCategoryProjects = (category: ProjectCategory) =>
    PROJECTS.filter((p) => p.category === category)

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <motion.header
        {...fadeUp}
        className="px-4 pt-20 pb-12 bg-gradient-to-b from-slate-900 to-slate-50"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1 mb-4">
            <Tag size={14} className="text-blue-400" />
            <span className="text-xs text-slate-300">AI 变现场景实战地图</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">
            【AI 实战项目库】
          </h1>
          <p className="text-slate-600">
            不教理论，只给操作方法
          </p>
        </div>
      </motion.header>

      <motion.section
        {...fadeUp}
        className="px-4 py-6"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <Tabs defaultValue="ai-ecommerce" className="w-full">
            <TabsList className="w-full bg-white border border-gray-100 rounded-xl p-1.5 overflow-x-auto whitespace-nowrap">
              {CATEGORIES.map(({ value, label, emoji, Icon, activeGradient }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:text-white data-[state=active]:shadow-md ${activeGradient}`}
                >
                  <Icon size={16} />
                  <span>{emoji} {label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map(({ value, label, emoji }) => {
              const list = getCategoryProjects(value)
              return (
                <TabsContent key={value} value={value} className="mt-6">
                  {list.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {list.map((project) => (
                        <ProjectCard key={project.slug} project={project} />
                      ))}
                    </div>
                  ) : (
                    <CategoryEmpty
                      label={label}
                      emoji={emoji}
                    />
                  )}
                </TabsContent>
              )
            })}
          </Tabs>
        </div>
      </motion.section>

      <motion.section
        {...fadeUp}
        className="px-4 pb-12"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              🔥 当前最受欢迎的 AI 提示词库
            </h2>

            <div className="space-y-3">
              {promptList.map((prompt) => (
                <div
                  key={prompt.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      {prompt.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {prompt.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleCopy(prompt.id, prompt.content)}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all ${
                      copiedId === prompt.id
                        ? 'bg-green-100 text-green-600'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {copiedId === prompt.id ? (
                      <>
                        <Check size={14} />
                        <span>已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>复制</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* AI 个人商业项目规划师横幅 */}
      <section className="px-5 py-16 bg-slate-50">
        <div className="max-w-lg mx-auto md:max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden"
          >
            {/* 装饰光晕 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300/20 rounded-full blur-2xl" />

            <div className="relative text-center text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-1.5 mb-4">
                <Wand2 size={14} />
                <span className="text-xs font-semibold">AI 个人商业项目规划师</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold mb-4">
                不知道哪个项目适合你？
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-200">
                  让 AI 给你一份人生商业规划
                </span>
              </h2>
              <p className="text-sm md:text-base text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
                基于年龄、目标收入与技能背景
                <br className="md:hidden" />
                生成 1V1 专属 AI 项目匹配方案
              </p>
              <AIProjectPlanner compact />
              <p className="text-xs text-white/60 mt-5">
                ✨ 已有 980+ 位创业者完成规划 · 平均 3 个月内启动首条收入线
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

// ─── 空状态组件（用于 ai-toolbox / case-study 等暂无数据的分类）───
function CategoryEmpty({ label, emoji }: { label: string; emoji: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-2xl border border-dashed border-gray-200">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-4 shadow-inner">
        <Inbox size={28} className="text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-800 mb-1">
        {emoji} {label} 正在搭建中
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-md leading-relaxed">
        更多高价值项目正在由 OPC 教研团队整理中，敬请期待。
        <br />
        你可以先查看上方 <span className="text-blue-600 font-medium">🛒 AI 电商实战</span> 或 <span className="text-pink-600 font-medium">🎬 AI 自媒体引流</span> 板块。
      </p>
    </div>
  )
}

// ─── 卡片组件（图片区域用渐变 + 大图标占位）───
function ProjectCard({ project }: { project: Project }) {
  const isBeginner = project.tags === '新手友好'
  const Icon = project.icon

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
      {/* 封面：渐变背景 + 大图标占位（修复外部图片无法加载的问题） */}
      <div className={`relative overflow-hidden rounded-t-2xl ${project.cover}`} style={{ aspectRatio: '2/1' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon
            size={64}
            strokeWidth={1.4}
            className="text-slate-700/40"
          />
        </div>
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-white/80 backdrop-blur-sm text-xs text-slate-600 px-2 py-1 rounded-full">
          <ImageIcon size={12} />
          封面占位
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <span
          className={`inline-block self-start text-xs font-medium px-2 py-1 rounded-full ${
            isBeginner
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {project.tags}
        </span>

        <h3 className="text-lg font-bold mt-2 text-gray-900">
          {project.title}
        </h3>

        <div className="flex items-center gap-1.5 mt-1">
          <Clock size={14} className="text-slate-500" />
          <span className="text-sm text-slate-500">预估完成：{project.duration}</span>
        </div>

        <p className="mt-2 text-slate-600 text-sm line-clamp-2 flex-1">
          {project.summary}
        </p>

        <Link
          href={`/projects/${project.slug}`}
          className="block w-full mt-4 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-[1.02] transition-transform shadow-md text-center"
        >
          查看完整 SOP
        </Link>
      </div>
    </div>
  )
}
