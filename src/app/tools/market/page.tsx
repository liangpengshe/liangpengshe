'use client'

import { useState } from 'react'
import { Search, Zap, ArrowRight, Flame } from 'lucide-react'
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
}

const opcTools = [
  { id: 1, name: '豹纹工坊', description: 'AI驱动的内容生产引擎', category: 'writing', color: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-100', textColor: 'text-amber-600', icon: 'Zap', href: '/tools/leopard' },
  { id: 2, name: '灵犀 AI', description: '智能对话助手', category: 'writing', color: 'from-purple-500 to-indigo-600', bgColor: 'bg-purple-100', textColor: 'text-purple-600', icon: 'Brain', href: '/tools/lingxi' },
  { id: 3, name: '先锋派数字人', description: 'AI数字人视频生成平台', category: 'video', color: 'from-cyan-500 to-blue-600', bgColor: 'bg-cyan-100', textColor: 'text-cyan-600', icon: 'Users', href: '/tools/pioneer' },
]

const aiTools: Tool[] = [
  { id: 101, name: 'ChatGPT', description: 'OpenAI 推出的强大对话模型', category: 'writing', tags: ['免费', '推荐'], rating: 5, isHot: true, imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ChatGPT%20AI%20chatbot%20interface%20modern%20minimalist&image_size=landscape_4_3', externalUrl: 'https://chat.openai.com' },
  { id: 102, name: 'Claude', description: 'Anthropic 开发的 AI 助手', category: 'writing', tags: ['免费'], rating: 4, imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Claude%20AI%20assistant%20blue%20gradient%20interface&image_size=landscape_4_3', externalUrl: 'https://claude.ai' },
  { id: 103, name: '豆包', description: '字节跳动推出的智能助手', category: 'writing', tags: ['免费'], rating: 4, imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Doubao%20AI%20chat%20interface%20yellow%20orange%20theme&image_size=landscape_4_3', externalUrl: 'https://www.doubao.com' },
  { id: 201, name: 'Midjourney', description: '领先的 AI 图像生成工具', category: 'painting', tags: ['付费', '爆款'], rating: 5, isHot: true, imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Midjourney%20AI%20art%20generation%20colorful%20creative&image_size=landscape_4_3', externalUrl: 'https://www.midjourney.com' },
  { id: 202, name: 'DALL-E', description: 'OpenAI 的图像生成模型', category: 'painting', tags: ['免费'], rating: 4, imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=DALL-E%20AI%20image%20generator%20futuristic%20interface&image_size=landscape_4_3', externalUrl: 'https://labs.openai.com' },
  { id: 203, name: 'Stable Diffusion', description: '开源的文本到图像模型', category: 'painting', tags: ['免费', '开源'], rating: 4, imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Stable%20Diffusion%20AI%20art%20neural%20network%20abstract&image_size=landscape_4_3', externalUrl: 'https://stablediffusionweb.com' },
  { id: 301, name: 'Runway', description: 'AI 视频创作平台', category: 'video', tags: ['付费', '爆款'], rating: 5, isHot: true, imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Runway%20AI%20video%20editor%20modern%20dark%20theme&image_size=landscape_4_3', externalUrl: 'https://runwayml.com' },
  { id: 302, name: 'Pika', description: '文本转视频 AI 工具', category: 'video', tags: ['免费'], rating: 4, imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Pika%20AI%20video%20generation%20colorful%20motion&image_size=landscape_4_3', externalUrl: 'https://pika.art' },
  { id: 303, name: 'Synthesia', description: 'AI 视频生成与数字人', category: 'video', tags: ['付费'], rating: 4, imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Synthesia%20AI%20video%20digital%20human%20professional&image_size=landscape_4_3', externalUrl: 'https://www.synthesia.io' },
  { id: 401, name: 'Character AI', description: '角色化对话 AI 平台', category: 'digitalhuman', tags: ['免费'], rating: 4, imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Character%20AI%20avatar%20chat%20colorful%20interface&image_size=landscape_4_3', externalUrl: 'https://character.ai' },
  { id: 402, name: 'D-ID', description: 'AI 驱动的数字人视频', category: 'digitalhuman', tags: ['付费'], rating: 4, imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=D-ID%20AI%20digital%20human%20video%20creation&image_size=landscape_4_3', externalUrl: 'https://www.d-id.com' },
  { id: 403, name: 'HeyGen', description: 'AI 数字人视频生成', category: 'digitalhuman', tags: ['付费', '会员专享'], isMemberOnly: true, rating: 4, imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=HeyGen%20AI%20avatar%20video%20professional&image_size=landscape_4_3', externalUrl: 'https://www.heygen.com' },
  { id: 501, name: 'IconScout', description: 'AI 图标与素材生成', category: 'design', tags: ['免费'], rating: 4, imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=IconScout%20AI%20icons%20design%20colorful&image_size=landscape_4_3', externalUrl: 'https://iconscout.com' },
  { id: 502, name: 'Remove.bg', description: 'AI 背景去除工具', category: 'design', tags: ['免费'], rating: 4, imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Remove.bg%20AI%20background%20removal%20tool&image_size=landscape_4_3', externalUrl: 'https://www.remove.bg' },
  { id: 503, name: 'Uizard', description: 'AI 界面设计工具', category: 'design', tags: ['付费'], rating: 4, imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Uizard%20AI%20UI%20design%20tool%20modern&image_size=landscape_4_3', externalUrl: 'https://uizard.io' },
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

          <TabsContent value="design" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getToolsByCategory('design').map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

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
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="aspect-[2/1] bg-gray-100 relative overflow-hidden">
          {tool.imageUrl ? (
            <img
              src={tool.imageUrl}
              alt={tool.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-xl">🖼️</span>
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