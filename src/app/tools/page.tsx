'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Wrench,
  Sparkles,
  Video,
  PenTool,
  ArrowRight,
  Star,
  ShoppingBag,
  Bot,
  Image as ImageIcon,
  Briefcase,
  Copy,
  Check,
  ChevronRight,
  Target,
} from 'lucide-react'
import AIToolAdvisor from '@/components/AIToolAdvisor'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

// ─── 第一层：OPC 独家自研工具（彩色渐变卡）───
const selfTools = [
  {
    icon: ShoppingBag,
    title: '豹纹工坊（豹纹+）',
    desc: '一键生成爆款商品素材，提升电商转化',
    href: '/tools/leopard',
    gradient: 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500',
    light: 'from-amber-50 via-orange-50 to-rose-50',
    border: 'border-amber-200',
    tagBg: 'bg-white/25 backdrop-blur-sm',
    tagText: 'text-amber-50',
  },
  {
    icon: Sparkles,
    title: '灵犀 AI',
    desc: '智能内容创作助手，7×24 不间断产出',
    href: '/tools/lingxi',
    gradient: 'bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600',
    light: 'from-violet-50 via-purple-50 to-indigo-50',
    border: 'border-violet-200',
    tagBg: 'bg-white/25 backdrop-blur-sm',
    tagText: 'text-violet-50',
  },
  {
    icon: Video,
    title: '先锋派数字人',
    desc: 'AI 数字人视频生成，打造个人 IP',
    href: '/tools/pioneer',
    gradient: 'bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600',
    light: 'from-cyan-50 via-sky-50 to-blue-50',
    border: 'border-cyan-200',
    tagBg: 'bg-white/25 backdrop-blur-sm',
    tagText: 'text-cyan-50',
  },
]

// ─── 第二层：AI 生态市场分类 ───
const categories = [
  { key: 'all', label: '全部', icon: Wrench },
  { key: 'writing', label: '写作', icon: PenTool },
  { key: 'image', label: '绘画', icon: ImageIcon },
  { key: 'video', label: '视频', icon: Video },
  { key: 'digital-human', label: '数字人', icon: Bot },
  { key: 'material', label: '素材', icon: Briefcase },
]

const tools = [
  {
    id: 1,
    name: 'ChatGPT',
    desc: 'OpenAI 推出的大型语言模型，对话式 AI 助手',
    category: 'writing',
    tags: ['免费', '⭐ 推荐'],
    rating: 5,
    link: 'https://chat.openai.com',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chatgpt%20logo%20modern%20minimal&image_size=square',
  },
  {
    id: 2,
    name: 'Midjourney',
    desc: '顶级 AI 绘画工具，生成高质量艺术作品',
    category: 'image',
    tags: ['付费', '🚀 爆款'],
    rating: 5,
    link: 'https://midjourney.com',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=midjourney%20logo%20modern%20minimal&image_size=square',
  },
  {
    id: 3,
    name: '剪映 AI',
    desc: '字节跳动旗下 AI 视频剪辑工具',
    category: 'video',
    tags: ['免费', '⭐ 推荐'],
    rating: 4,
    link: 'https://capcut.com',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=capcut%20logo%20modern%20minimal&image_size=square',
  },
  {
    id: 4,
    name: 'Notion AI',
    desc: '智能笔记与文档协作平台',
    category: 'writing',
    tags: ['会员专享'],
    rating: 4,
    link: 'https://notion.so',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=notion%20logo%20modern%20minimal&image_size=square',
  },
  {
    id: 5,
    name: 'Stable Diffusion',
    desc: '开源 AI 绘画模型，本地部署首选',
    category: 'image',
    tags: ['免费', '⭐ 推荐'],
    rating: 4,
    link: 'https://stability.ai',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=stablediffusion%20logo%20modern%20minimal&image_size=square',
  },
  {
    id: 6,
    name: 'HeyGen',
    desc: 'AI 数字人视频生成，多语言支持',
    category: 'video',
    tags: ['付费', '🚀 爆款'],
    rating: 5,
    link: 'https://heygen.com',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=heygen%20logo%20modern%20minimal&image_size=square',
  },
  {
    id: 7,
    name: '豆包',
    desc: '字节跳动旗下免费 AI 对话助手',
    category: 'writing',
    tags: ['免费', '⭐ 推荐'],
    rating: 4,
    link: 'https://doubao.com',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=doubao%20logo%20modern%20minimal&image_size=square',
  },
  {
    id: 8,
    name: '即梦 AI',
    desc: '字节跳动 AI 视频与绘画平台',
    category: 'image',
    tags: ['免费'],
    rating: 4,
    link: 'https://jimeng.jianying.com',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=jimeng%20logo%20modern%20minimal&image_size=square',
  },
  {
    id: 9,
    name: 'Dify',
    desc: '开源 LLMOps 平台，可视化构建 AI 智能体 / 数字人工作流',
    category: 'digital-human',
    tags: ['免费', '⭐ 推荐', '数字人工作流'],
    rating: 5,
    link: 'https://dify.ai',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dify%20logo%20modern%20minimal&image_size=square',
  },
  {
    id: 10,
    name: 'Pexels',
    desc: '高质量免费商用图库 / 视频素材库，全球创作者首选',
    category: 'material',
    tags: ['免费', '商用授权'],
    rating: 5,
    link: 'https://pexels.com',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pexels%20logo%20modern%20minimal&image_size=square',
  },
]

// ─── 第三层：智富实战提示词库（从项目库迁移）───
interface PromptItem {
  id: string
  title: string
  tags: string[]
  content: string
  emoji: string
  tagBg: string
  tagText: string
}

const promptList: PromptItem[] = [
  {
    id: 'p1',
    title: '小红书爆款标题生成',
    tags: ['营销'],
    content: '我是做【你的领域】的博主，请帮我生成 10 个小红书爆款标题，要求包含数字、痛点、解决方案三个要素，风格要吸引人点击。',
    emoji: '📕',
    tagBg: 'bg-rose-100',
    tagText: 'text-rose-700',
  },
  {
    id: 'p2',
    title: '电商详情页文案',
    tags: ['电商'],
    content: '请帮我为以下产品写一段详情页文案：【产品名称】，卖点是【核心卖点】，目标人群是【目标用户】，请突出产品价值，激发购买欲望。',
    emoji: '🛒',
    tagBg: 'bg-orange-100',
    tagText: 'text-orange-700',
  },
  {
    id: 'p3',
    title: '短视频脚本生成',
    tags: ['视频'],
    content: '请帮我写一个 60 秒的短视频脚本，主题是【主题】，要求开头 3 秒抓住注意力，中间有干货，结尾引导互动。',
    emoji: '🎬',
    tagBg: 'bg-blue-100',
    tagText: 'text-blue-700',
  },
  {
    id: 'p4',
    title: '周报自动总结',
    tags: ['办公'],
    content: '请帮我总结本周工作：【粘贴你的工作内容】，要求结构化展示，突出关键成果和下周计划。',
    emoji: '📊',
    tagBg: 'bg-emerald-100',
    tagText: 'text-emerald-700',
  },
  {
    id: 'p5',
    title: '竞品分析报告',
    tags: ['分析'],
    content: '请帮我分析【竞品名称】的产品：从产品功能、用户体验、市场定位三个维度进行深度分析，并给出差异化建议。',
    emoji: '🎯',
    tagBg: 'bg-violet-100',
    tagText: 'text-violet-700',
  },
]

export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null)

  const filteredTools =
    activeCategory === 'all'
      ? tools
      : tools.filter((tool) => tool.category === activeCategory)

  const handleCopyPrompt = async (id: string, content: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content)
      } else {
        const ta = document.createElement('textarea')
        ta.value = content
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopiedPromptId(id)
      setTimeout(() => setCopiedPromptId(null), 2000)
    } catch (e) {
      console.error('复制失败:', e)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ═══ Hero ═══ */}
      <motion.header
        {...fadeUp}
        className="px-4 pt-20 pb-8 bg-gradient-to-b from-slate-900 to-slate-50"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="text-white/80 hover:text-white transition-colors flex items-center gap-1 text-sm">
              <ArrowLeft size={16} />
              返回主页
            </Link>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-3 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-400 to-blue-500">
              🧰 AI 智富工具全家桶
            </span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg mb-6">
            一手独家自研 AI 工具，一手严选外部生态神器，让 OPC 成员没有工具焦虑。
          </p>

          <Link
            href="/market"
            className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300"
          >
            探索全部工具
            <ArrowRight size={14} />
          </Link>
        </div>
      </motion.header>

      {/* ═══ 第一层：OPC 独家自研工具专区（独占比大）═══ */}
      <motion.section
        {...fadeUp}
        className="px-4 py-8"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              <span>✨ OPC 独家自研工具专区</span>
            </h2>
            <span className="text-xs text-slate-500">横向滑动查看</span>
          </div>

          <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible -mx-4 md:mx-0 px-4 md:px-0 pb-2 md:pb-0 snap-x snap-mandatory md:snap-none scrollbar-hide">
            {selfTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className={`group relative flex-shrink-0 w-72 md:w-auto snap-start overflow-hidden rounded-2xl ${tool.gradient} p-5 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300`}
              >
                {/* ✨ OPC 独家 醒目标签 */}
                <div className={`absolute top-3 right-3 ${tool.tagBg} ${tool.tagText} text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm`}>
                  <Sparkles size={11} className={tool.tagText} />
                  OPC 独家
                </div>

                {/* 装饰光晕 */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/15 rounded-full blur-3xl" />

                <div className="relative flex flex-col h-full min-h-[200px]">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                    <tool.icon size={24} className="text-white" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-1">{tool.title}</h3>
                  <p className="text-sm text-white/85 mb-4 leading-relaxed">{tool.desc}</p>
                  <div className="mt-auto inline-flex items-center gap-1 text-sm text-white font-medium group-hover:gap-2 transition-all">
                    <span>立即体验</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 层级分隔 */}
      <div className="my-8 max-w-lg md:max-w-6xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
      </div>

      {/* ═══ 第二层：AI 生态工具市场 ═══ */}
      <motion.section
        {...fadeUp}
        className="px-4 py-2"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Target size={18} className="text-cyan-500" />
              <span>🚀 严选 AI 生态工具导航</span>
            </h2>
            <span className="text-xs text-slate-500">{filteredTools.length} 个工具</span>
          </div>

          <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide -mx-4 px-4">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.key
              const Icon = cat.icon
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-slate-200 hover:border-cyan-300 hover:text-cyan-600'
                  }`}
                >
                  <Icon size={14} />
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
      </motion.section>

      <motion.section
        {...fadeUp}
        className="px-4 py-4 pb-8"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.length === 0 ? (
              <div className="col-span-full text-center text-slate-400 text-sm py-12">
                该分类下暂无工具
              </div>
            ) : (
              filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  <div className="aspect-[2/1] bg-slate-100 overflow-hidden">
                    <img
                      src={tool.image}
                      alt={tool.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{tool.name}</h3>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < tool.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{tool.desc}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {tool.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <a
                        href={tool.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                      >
                        立即前往
                        <ArrowRight size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.section>

      {/* AI 工具栈即时诊断与推荐 */}
      <AIToolAdvisor />

      {/* 层级分隔 */}
      <div className="my-8 max-w-lg md:max-w-6xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
      </div>

      {/* ═══ 第三层：AI 智富提示词库 ═══ */}
      <motion.section
        {...fadeUp}
        className="px-4 py-4 pb-16"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Target size={18} className="text-violet-500" />
              <span>🎯 智富实战提示词库</span>
            </h2>
            <span className="text-xs text-slate-500">点击复制即可使用</span>
          </div>

          <div className="space-y-3">
            {promptList.map((p) => {
              const copied = copiedPromptId === p.id
              return (
                <div
                  key={p.id}
                  className="group bg-white border border-slate-200 hover:border-violet-300 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl leading-none">{p.emoji}</span>
                      <h3 className="font-bold text-gray-900 text-sm md:text-base">
                        {p.title}
                      </h3>
                      {p.tags.map((t) => (
                        <span
                          key={t}
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${p.tagBg} ${p.tagText}`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleCopyPrompt(p.id, p.content)}
                      className={`flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        copied
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:scale-105 active:scale-95'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check size={12} />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          一键复制
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs md:text-sm text-slate-700 leading-relaxed font-mono whitespace-pre-wrap break-words">
                    {p.content}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-5 text-center text-xs text-slate-400">
            💡 提示：把【】中的内容替换为你的实际信息，效果更佳
          </div>
        </div>
      </motion.section>
    </div>
  )
}