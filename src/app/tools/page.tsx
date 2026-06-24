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
  Briefcase,
} from 'lucide-react'
import AIToolAdvisor from '@/components/AIToolAdvisor'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const selfTools = [
  {
    icon: ShoppingBag,
    title: '豹纹工坊',
    desc: '一键生成爆款商品素材，提升电商转化',
    href: '/tools/leopard',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Sparkles,
    title: '灵犀 AI',
    desc: '智能内容创作助手，7×24 不间断产出',
    href: '/tools/lingxi',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Video,
    title: '先锋派数字人',
    desc: 'AI 数字人视频生成，打造个人 IP',
    href: '/tools/pioneer',
    gradient: 'from-purple-500 to-pink-500',
  },
]

const categories = [
  { key: 'all', label: '全部分类', icon: Wrench },
  { key: 'writing', label: 'AI写作', icon: PenTool },
  { key: 'image', label: 'AI绘画', icon: Sparkles },
  { key: 'video', label: 'AI视频', icon: Video },
  { key: 'business', label: 'AI商业', icon: Briefcase },
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
    desc: '开源 LLMOps 平台，可视化构建 AI 应用',
    category: 'business',
    tags: ['免费', '⭐ 推荐'],
    rating: 5,
    link: 'https://dify.ai',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dify%20logo%20modern%20minimal&image_size=square',
  },
]

export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredTools =
    activeCategory === 'all'
      ? tools
      : tools.filter((tool) => tool.category === activeCategory)

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
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

          <h1 className="text-3xl font-bold text-white mb-3">AI 工具导航</h1>
          <p className="text-slate-400 text-lg mb-6">
            精选全网顶级 AI 工具，助力一人公司高效办公
          </p>

          <Link
            href="/tools/market"
            className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
          >
            探索全部工具
            <ArrowRight size={14} />
          </Link>
        </div>
      </motion.header>

      <motion.section
        {...fadeUp}
        className="px-4 py-8"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            🔥 OPC 独家自研工具
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selfTools.map((tool, index) => (
              <Link
                key={index}
                href={tool.href}
                className="group relative overflow-hidden rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br ${tool.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-3`}>
                  <tool.icon size={24} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{tool.title}</h3>
                <p className="text-sm text-slate-600 mb-3">{tool.desc}</p>
                <div className="flex items-center gap-1 text-sm text-blue-600 group-hover:gap-2 transition-all">
                  <span>立即体验</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        {...fadeUp}
        className="px-4 py-4"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
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
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
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
        className="px-4 py-4 pb-12"
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
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
    </div>
  )
}