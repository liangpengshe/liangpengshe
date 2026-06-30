'use client'

import { useState } from 'react'
import { Search, Zap, ArrowRight, Flame, Bot, Code, FileText, Wand2 } from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'

interface Tool {
  id: number
  name: string
  description: string
  category: string
  tags: string[]
  rating?: number
  isHot?: boolean
  isFree?: boolean
  isMemberOnly?: boolean
  imageUrl?: string
  externalUrl?: string
  domain?: string
}

const opcTools = [
  { id: 1, name: '豹纹工坊', description: '一键生成爆款商品素材，提升电商转化', category: 'writing', color: 'from-orange-400 to-amber-500', icon: 'Zap', href: '/tools/leopard' },
  { id: 2, name: '灵犀 AI', description: '智能内容创作助手，7×24 不间断产出', category: 'writing', color: 'from-purple-400 to-indigo-500', icon: 'Brain', href: '/tools/lingxi' },
  { id: 3, name: '先锋派数字人', description: 'AI数字人视频生成平台，打造个人 IP', category: 'video', color: 'from-cyan-400 to-blue-500', icon: 'Users', href: '/tools/pioneer' },
]

const aiTools: Tool[] = [
  { id: 101, name: 'ChatGPT', description: 'OpenAI 推出的强大对话模型', category: 'writing', tags: ['免费', '推荐'], rating: 5, isHot: true, domain: 'openai.com', externalUrl: 'https://chat.openai.com' },
  { id: 102, name: 'Claude', description: 'Anthropic 开发的 AI 助手', category: 'writing', tags: ['免费'], rating: 4, domain: 'anthropic.com', externalUrl: 'https://claude.ai' },
  { id: 103, name: '豆包', description: '字节跳动推出的智能助手', category: 'writing', tags: ['免费'], rating: 4, domain: 'doubao.com', externalUrl: 'https://www.doubao.com' },
  { id: 201, name: 'Midjourney', description: '领先的 AI 图像生成工具', category: 'painting', tags: ['付费', '爆款'], rating: 5, isHot: true, domain: 'midjourney.com', externalUrl: 'https://www.midjourney.com' },
  { id: 202, name: 'DALL-E', description: 'OpenAI 的图像生成模型', category: 'painting', tags: ['免费'], rating: 4, domain: 'openai.com', externalUrl: 'https://labs.openai.com' },
  { id: 203, name: 'Stable Diffusion', description: '开源的文本到图像模型', category: 'painting', tags: ['免费', '开源'], rating: 4, domain: 'stability.ai', externalUrl: 'https://stablediffusionweb.com' },
  { id: 301, name: 'Runway', description: 'AI 视频创作平台', category: 'video', tags: ['付费', '爆款'], rating: 5, isHot: true, domain: 'runwayml.com', externalUrl: 'https://runwayml.com' },
  { id: 302, name: 'Pika', description: '文本转视频 AI 工具', category: 'video', tags: ['免费'], rating: 4, domain: 'pika.art', externalUrl: 'https://pika.art' },
  { id: 303, name: 'Synthesia', description: 'AI 视频生成与数字人', category: 'video', tags: ['付费'], rating: 4, domain: 'synthesia.io', externalUrl: 'https://www.synthesia.io' },
  { id: 401, name: 'Character AI', description: '角色化对话 AI 平台', category: 'digitalhuman', tags: ['免费'], rating: 4, domain: 'character.ai', externalUrl: 'https://character.ai' },
  { id: 402, name: 'D-ID', description: 'AI 驱动的数字人视频', category: 'digitalhuman', tags: ['付费'], rating: 4, domain: 'd-id.com', externalUrl: 'https://www.d-id.com' },
  { id: 403, name: 'HeyGen', description: 'AI 数字人视频生成', category: 'digitalhuman', tags: ['付费', '会员专享'], isMemberOnly: true, rating: 4, domain: 'heygen.com', externalUrl: 'https://www.heygen.com' },
  { id: 501, name: 'IconScout', description: 'AI 图标与素材生成', category: 'design', tags: ['免费'], rating: 4, domain: 'iconscout.com', externalUrl: 'https://iconscout.com' },
  { id: 502, name: 'Remove.bg', description: 'AI 背景去除工具', category: 'design', tags: ['免费'], rating: 4, domain: 'remove.bg', externalUrl: 'https://www.remove.bg' },
  { id: 503, name: 'Uizard', description: 'AI 界面设计工具', category: 'design', tags: ['付费'], rating: 4, domain: 'uizard.io', externalUrl: 'https://uizard.io' },
  // ── 智能体 ──
  { id: 601, name: 'Coze 扣子', description: '字节跳动出品的 AI 智能体开发平台，零代码搭建专属助手', category: 'agent', tags: ['免费', '推荐'], rating: 5, isHot: true, domain: 'coze.com', externalUrl: 'https://www.coze.com' },
  { id: 602, name: 'Dify', description: '开源的 LLM 应用开发平台，支持工作流编排和智能体发布', category: 'agent', tags: ['免费', '开源'], rating: 5, domain: 'dify.ai', externalUrl: 'https://dify.ai' },
  { id: 603, name: 'FastGPT', description: '基于大语言模型的知识库问答系统，快速构建企业级智能客服', category: 'agent', tags: ['免费', '开源'], rating: 4, domain: 'fastgpt.in', externalUrl: 'https://fastgpt.in' },
  // ── 编程 ──
  { id: 701, name: 'GitHub Copilot', description: 'AI 编程助手，在编辑器内实时提供代码补全和逻辑建议', category: 'coding', tags: ['付费', '爆款'], rating: 5, isHot: true, domain: 'github.com', externalUrl: 'https://github.com/features/copilot' },
  { id: 702, name: 'Cursor', description: '集成了 AI 的下一代代码编辑器，支持自然语言写代码', category: 'coding', tags: ['付费', '推荐'], rating: 5, isHot: true, domain: 'cursor.com', externalUrl: 'https://www.cursor.com' },
  { id: 703, name: 'Replit', description: '在线 IDE 与 AI 编程平台，一键部署和托管应用', category: 'coding', tags: ['免费', '付费'], rating: 4, domain: 'replit.com', externalUrl: 'https://replit.com' },
]

export default function ToolsMarketPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTools = aiTools.filter((tool) =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getToolsByCategory = (category: string) => {
    if (category === 'all') return filteredTools
    return filteredTools.filter((tool) => tool.category === category)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <span className="text-xl">🏢</span>
            <span>良朋社OPC</span>
          </Link>
          <span className="font-bold text-gray-900">AI 工具导航</span>
          <div className="w-24"></div>
        </div>
        <div className="px-5 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索 AI 工具..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      </header>

      <main className="px-5 py-6">
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="text-orange-500" size={20} />
            <span className="font-bold text-gray-900">🔥 OPC 独家自研工具专区</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {opcTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.href}
                className={`bg-gradient-to-br ${tool.color} rounded-xl p-4 text-white hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{tool.name}</span>
                  <Zap size={16} />
                </div>
                <p className="text-white/80 text-xs mt-1">{tool.description}</p>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full mt-2 inline-block">去用</span>
              </Link>
            ))}
          </div>
        </section>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start gap-2 overflow-x-auto py-1">
            <TabsTrigger value="all" className="flex-shrink-0">全部</TabsTrigger>
            <TabsTrigger value="writing" className="flex-shrink-0">AI写作</TabsTrigger>
            <TabsTrigger value="painting" className="flex-shrink-0">AI绘画</TabsTrigger>
            <TabsTrigger value="video" className="flex-shrink-0">AI视频</TabsTrigger>
            <TabsTrigger value="digitalhuman" className="flex-shrink-0">AI数字人</TabsTrigger>
            <TabsTrigger value="agent" className="flex-shrink-0">
              <span className="inline-flex items-center gap-1.5">
                <Bot size={14} className="text-purple-600" />
                <span>智能体</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="coding" className="flex-shrink-0">
              <span className="inline-flex items-center gap-1.5">
                <Code size={14} className="text-cyan-600" />
                <span>编程</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="design" className="flex-shrink-0">设计素材</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getToolsByCategory('all').map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="writing" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getToolsByCategory('writing').map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="painting" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getToolsByCategory('painting').map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="video" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getToolsByCategory('video').map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="digitalhuman" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getToolsByCategory('digitalhuman').map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="agent" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getToolsByCategory('agent').map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="coding" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getToolsByCategory('coding').map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="design" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getToolsByCategory('design').map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* AI 调查表生成 — 通哥「AI 智能体知识变现 4 步法」入口 */}
        <div className="mt-6 relative bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-5 md:p-6 shadow-xl overflow-hidden">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl" />
          <div className="relative flex flex-col md:flex-row items-center gap-5 text-white">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30">
              <FileText size={28} className="text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="text-[11px] font-semibold text-amber-100 mb-1 tracking-wider">
                📝 知识变现第一步
              </div>
              <h3 className="text-base md:text-lg font-bold mb-1.5">
                AI 生成智能诊断表
              </h3>
              <p className="text-xs md:text-sm text-amber-50/90 leading-relaxed">
                输入你的行业，AI 一键生成痛点调查表，帮你精准锁定目标人群。
              </p>
            </div>
            <Link
              href="/tools/survey-gen"
              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-orange-600 text-sm font-bold rounded-xl hover:scale-105 transition-transform shadow-lg"
            >
              <Wand2 size={16} />
              立即体验 AI 表单生成
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* 开发者招商横幅 */}
        <div className="mt-10 relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center gap-5 text-white">
            <div className="flex-1">
              <div className="text-xs text-blue-100 mb-1.5">🤖 工具开发者招募</div>
              <h3 className="text-lg md:text-xl font-bold mb-2">
                你是工具开发者？
              </h3>
              <p className="text-sm text-blue-50/90">
                点击这里上架你的工具，获得 OPC 生态免费推广
              </p>
            </div>
            <Link
              href="/tools/submit"
              className="flex-shrink-0 px-5 py-2.5 bg-white text-blue-600 text-sm font-semibold rounded-xl hover:scale-105 transition-transform shadow-lg"
            >
              立即上架 →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

function ToolCard({ tool }: { tool: Tool }) {
  const [imgError, setImgError] = useState(false)
  const logoUrl = tool.domain ? `https://logo.clearbit.com/${tool.domain}?size=400` : ''

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="aspect-[2/1] bg-white relative overflow-hidden flex items-center justify-center">
          {tool.domain && !imgError ? (
            // 优先用 Clearbit 拉取真实公司 logo
            <img
              src={logoUrl}
              alt={tool.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-contain p-6"
            />
          ) : (
            // 兜底：透明背景 + Bot 图标 + 工具名
            <div className="flex flex-col items-center justify-center gap-2 px-4 text-center">
              <Bot className="text-gray-400" size={40} strokeWidth={1.5} />
              <span className="text-xl md:text-2xl font-bold text-gray-700 tracking-wide">
                {tool.name}
              </span>
            </div>
          )}
          {tool.isHot && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              🔥 爆款
            </span>
          )}
          {tool.isMemberOnly && (
            <span className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
              会员专享
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-1">{tool.name}</h3>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{tool.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {tool.tags.map((tag) => (
                <span
                  key={tag}
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    tag === '免费'
                      ? 'bg-green-50 text-green-600'
                      : tag === '付费'
                      ? 'bg-red-50 text-red-600'
                      : tag === '推荐'
                      ? 'bg-blue-50 text-blue-600'
                      : tag === '爆款'
                      ? 'bg-orange-50 text-orange-600'
                      : tag === '开源'
                      ? 'bg-gray-100 text-gray-600'
                      : tag === '会员专享'
                      ? 'bg-purple-50 text-purple-600'
                      : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
            {tool.rating && (
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xs">
                    {i < (tool.rating || 0) ? '⭐' : '☆'}
                  </span>
                ))}
              </div>
            )}
          </div>
          <a
            href={tool.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-1.5 w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>立即前往</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}