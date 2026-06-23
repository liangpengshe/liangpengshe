'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import AIProjectPlanner from '@/components/AIProjectPlanner'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

interface Project {
  id: string
  title: string
  cover: string
  tags: string
  time: string
  summary: string
  slug: string
  category: string
}

const projects: Project[] = [
  {
    id: '1',
    title: 'AI 选品 + 一键生成详情页',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20ecommerce%20product%20listing%20dashboard%20with%20neon%20blue%20gradient%20modern%20UI&image_size=landscape_16_9',
    tags: '新手友好',
    time: '3天',
    summary: '利用 AI 分析竞品数据，自动生成产品标题、卖点和详情页文案，配合 Midjourney 生成主图，降低 70% 运营人力成本。',
    slug: 'ai-product-detail',
    category: 'ai-ecommerce',
  },
  {
    id: '2',
    title: '私域流量自动触达 SOP',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20chatbot%20automation%20workflow%20diagram%20purple%20gradient%20futuristic&image_size=landscape_16_9',
    tags: '进阶玩法',
    time: '7天',
    summary: '通过 AI 分析用户行为，自动生成个性化私聊话术，实现 7×24 小时精准触达，提升 3 倍转化效率。',
    slug: 'ai-private-domain',
    category: 'ai-ecommerce',
  },
  {
    id: '3',
    title: '小红书爆款笔记流水线',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=social%20media%20content%20production%20workflow%20pink%20gradient%20creative&image_size=landscape_16_9',
    tags: '新手友好',
    time: '2天',
    summary: '输入关键词，AI 自动生成选题、文案、配图建议，一天产出 10 篇高质量笔记，日产出提升 10 倍。',
    slug: 'xiaohongshu-ai',
    category: 'ai-media',
  },
  {
    id: '4',
    title: '抖音 AI 数字人直播',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20virtual%20influencer%20live%20streaming%20studio%20cyberpunk%20aesthetic&image_size=landscape_16_9',
    tags: '进阶玩法',
    time: '10天',
    summary: '用 D-ID 生成数字人，配合 AI 实时问答系统，实现无人值守直播带货，24 小时不间断直播。',
    slug: 'douyin-ai-live',
    category: 'ai-media',
  },
  {
    id: '5',
    title: 'AI 会议纪要 + 行动追踪',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20meeting%20notes%20productivity%20dashboard%20clean%20minimal%20design&image_size=landscape_16_9',
    tags: '新手友好',
    time: '1天',
    summary: '录音转写后自动提取要点、生成会议纪要、创建待办事项，自动追踪进度，节省 80% 会议时间。',
    slug: 'ai-meeting-notes',
    category: 'ai-toolbox',
  },
  {
    id: '6',
    title: '一键生成 PPT 方案',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20presentation%20generator%20professional%20slides%20golden%20gradient&image_size=landscape_16_9',
    tags: '新手友好',
    time: '2天',
    summary: '输入业务需求，AI 自动生成完整 PPT 框架、内容和配图建议，秒出专业方案，效率提升 5 倍。',
    slug: 'ai-ppt-generator',
    category: 'ai-toolbox',
  },
  {
    id: '7',
    title: '年入百万的一人电商拆解',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=business%20success%20story%20case%20study%20growth%20chart%20celebration&image_size=landscape_16_9',
    tags: '进阶玩法',
    time: '5天',
    summary: '完整复盘一个从 0 到年入百万的一人电商案例，包含选品、流量、转化全流程，可直接复制的成功路径。',
    slug: 'one-person-ecommerce',
    category: 'case-study',
  },
  {
    id: '8',
    title: 'AI 律师助理实战案例',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20legal%20assistant%20contract%20review%20professional%20office&image_size=landscape_16_9',
    tags: '进阶玩法',
    time: '7天',
    summary: '如何用 AI 辅助法律文书撰写、合同审查、案例检索，大幅提升律师工作效率，效率提升 300%。',
    slug: 'ai-legal-assistant',
    category: 'case-study',
  },
  {
    id: '9',
    title: 'AI 客服自动回复系统',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20customer%20service%20chatbot%20support%20center%20friendly%20interface&image_size=landscape_16_9',
    tags: '进阶玩法',
    time: '5天',
    summary: '搭建基于大模型的智能客服系统，自动识别用户意图，生成标准化回复，客服成本降低 60%。',
    slug: 'ai-customer-service',
    category: 'ai-ecommerce',
  },
  {
    id: '10',
    title: 'AI 视频字幕 + 剪辑自动化',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=video%20editing%20AI%20automation%20timeline%20interface%20modern%20dark&image_size=landscape_16_9',
    tags: '新手友好',
    time: '3天',
    summary: '自动生成字幕、识别重点片段、生成剪辑建议，大幅提升视频制作效率，剪辑时间缩短 70%。',
    slug: 'ai-video-editing',
    category: 'ai-media',
  },
  {
    id: '11',
    title: 'AI 知识库搭建指南',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20knowledge%20base%20library%20digital%20brain%20futuristic&image_size=landscape_16_9',
    tags: '进阶玩法',
    time: '7天',
    summary: '将个人经验、行业资料转化为 AI 知识库，让 AI 成为你的专属顾问，开启知识变现新路径。',
    slug: 'ai-knowledge-base',
    category: 'ai-toolbox',
  },
  {
    id: '12',
    title: 'AI 心理咨询师副业拆解',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20mental%20health%20chatbot%20therapy%20warm%20friendly%20interface&image_size=landscape_16_9',
    tags: '进阶玩法',
    time: '5天',
    summary: '如何用 AI 辅助心理咨询，提供 7×24 小时陪伴服务，开创副业收入，副业月入过万。',
    slug: 'ai-mental-health',
    category: 'case-study',
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

export default function ProjectsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getCategoryProjects = (category: string) => {
    return projects.filter((p) => p.category === category)
  }

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
              <TabsTrigger
                value="ai-ecommerce"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r from-blue-500 to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <ShoppingBag size={16} />
                <span>🛒 AI 电商实战</span>
              </TabsTrigger>
              <TabsTrigger
                value="ai-media"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r from-pink-500 to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Video size={16} />
                <span>🎬 AI 自媒体引流</span>
              </TabsTrigger>
              <TabsTrigger
                value="ai-toolbox"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r from-emerald-500 to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Wrench size={16} />
                <span>🔧 AI 高效工具箱</span>
              </TabsTrigger>
              <TabsTrigger
                value="case-study"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r from-amber-500 to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <BookOpen size={16} />
                <span>📖 案例深度拆解</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai-ecommerce" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getCategoryProjects('ai-ecommerce').map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ai-media" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getCategoryProjects('ai-media').map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ai-toolbox" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getCategoryProjects('ai-toolbox').map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="case-study" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getCategoryProjects('case-study').map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>
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

function ProjectCard({ project }: { project: Project }) {
  const isBeginner = project.tags === '新手友好'

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="relative overflow-hidden rounded-t-2xl" style={{ aspectRatio: '2/1' }}>
        <img
          src={project.cover}
          alt={project.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="p-5">
        <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${isBeginner ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {project.tags}
        </span>

        <h3 className="text-lg font-bold mt-2 text-gray-900">
          {project.title}
        </h3>

        <div className="flex items-center gap-1.5 mt-1">
          <Clock size={14} className="text-slate-500" />
          <span className="text-sm text-slate-500">预估完成：{project.time}</span>
        </div>

        <p className="mt-2 text-slate-600 text-sm line-clamp-2">
          {project.summary}
        </p>

        <button className="w-full mt-4 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition-transform shadow-md">
          查看完整 SOP
        </button>
      </div>
    </div>
  )
}