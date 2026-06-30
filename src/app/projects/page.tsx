'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
  // 双引擎新增图标
  Bot,
  Briefcase,
  Cpu,
  GraduationCap,
  Smartphone,
  Building,
  Target,
  TrendingUp,
  DollarSign,
  Award,
  Zap,
  FileText,
  Download,
  X,
  Lightbulb,
  Rocket,
  MessageCircle,
  Network,
  ChevronRight,
  HeartHandshake,
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

// ─── 双引擎：项目模型 + AI 商业计划书 ───
type EngineId = 'personal' | 'franchise'

interface EngineProject {
  id: string
  title: string
  desc: string
  icon: LucideIcon
  color: string // 渐变 className
  iconBg: string
  tags: string[]
  highlights: string[]
  budget: string
  cycle: string
  income: string
  /** 商业计划书结构化内容 */
  plan: {
    prospect: string // 项目前景
    investment: string // 启动投入
    returns: string // 预期回报
    resources: string[] // OPC 生态资源匹配
  }
}

// ─── 引擎一：OPC 个人智富（4 个项目）───
const engine1Projects: EngineProject[] = [
  {
    id: 'ai-content',
    title: 'AI 内容创作与流量变现',
    desc: 'AI 批量生成图文 / 短视频，接单或做流量赚广告佣金。',
    icon: Video,
    color: 'bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 border-blue-200',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    tags: ['低门槛', '可副业', '可全职'],
    highlights: ['日更 30 篇爆款笔记', '矩阵 10 倍起号速度', '单账号月入 1-3 万'],
    budget: '3,000 - 8,000 元',
    cycle: '7-15 天启动',
    income: '首月 5K+，3 个月稳定 1-3 万/月',
    plan: {
      prospect: 'AI 内容生产已是 2025 年最大的个体创业机会。全球 AI 内容工具用户已破 3 亿，小红书 / 抖音 / 视频号三大平台对 AI 优质内容给予 2-3 倍流量倾斜。个人创作者可借助 OPC 全栈 AI 工具，一人就是一个内容工厂。',
      investment: '启动资金 3,000-8,000 元（包含 AI 工具年费 1,000 + 拍摄设备 2,000 + 投流测试预算 5,000）。OPC 平台提供工具 + 培训 + 流量扶持，无需房租、无需团队。',
      returns: '第 1 个月：单平台跑通模型，收入 5K-1 万；第 3 个月：矩阵 5 个账号，月入 1-3 万；第 6 个月：建立私域，客单价提升至 5K+，月入 5-10 万。',
      resources: [
        'OPC 全栈 AI 工具包（含剪映 AI / GPT / Suno 等 30+ 工具）',
        '弓老师 + 吕老师 1V1 内容诊断 3 次',
        '5000+ 主理人互推流量池',
        'OPC 品牌供应链选品库',
      ],
    },
  },
  {
    id: 'digital-human',
    title: '数字人 IP 矩阵',
    desc: '用数字人代替真人出镜，7×24 小时直播带货。',
    icon: Bot,
    color: 'bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 border-indigo-200',
    iconBg: 'bg-gradient-to-br from-indigo-500 to-violet-500',
    tags: ['高阶玩法', 'AI 直播'],
    highlights: ['24h 无人值守', '多账号矩阵', '单 GMV 10w+'],
    budget: '8,000 - 20,000 元',
    cycle: '15-30 天上线',
    income: '首月 1-3 万，半年后 10-30 万/月',
    plan: {
      prospect: '数字人直播是 2026 年最大的 AI 变现赛道之一。淘宝 / 抖音 / 视频号均已开放数字人直播通道，单个数字人直播间日均 GMV 可达 5-20 万。OPC 已与多家数字人技术方达成战略合作，可获得最低成本接入。',
      investment: '启动资金 8,000-20,000 元（数字人系统年费 5,000 + 直播设备 3,000 + 选品铺货 5,000 + 投流预算 5,000）。可先 1 个账号跑通，再矩阵复制。',
      returns: '第 1 个月：单直播间跑通，月 GMV 5-15 万；第 3 个月：3 个矩阵账号，月 GMV 30-80 万；第 6 个月：5+ 账号 + 培训他人，月入 10-30 万。',
      resources: [
        'OPC 数字人直播系统（厂商直供，5 折）',
        '弓老师数字人调优 1V1 辅导',
        'OPC 严选选品库（3000+ SKU）',
        '主理人分销联盟 + AI 客服',
      ],
    },
  },
  {
    id: 'private-sop',
    title: '私域 AI 成交 SOP',
    desc: '从加粉到成交，打造一套全自动 AI 私域成交系统。',
    icon: MessageCircle,
    color: 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border-sky-200',
    iconBg: 'bg-gradient-to-br from-sky-500 to-blue-500',
    tags: ['高客单', '可复制'],
    highlights: ['AI 自动跟进', '转化率提升 3 倍', '月成交 100+ 单'],
    budget: '1,000 - 5,000 元',
    cycle: '3-7 天部署',
    income: '首月 1-3 万，3 个月后 5-20 万/月',
    plan: {
      prospect: '私域 + AI 是 2025-2026 年最高 ROI 的变现模型。AI 私域成交 SOP 可将传统 1V1 销售效率提升 5-10 倍，单个主理人可同时维护 500+ 精准客户。OPC 私域 AI 工具已服务 200+ 主理人。',
      investment: '启动资金 1,000-5,000 元（AI 工具 500/月 + 微信生态 0 元 + 引流投流 3,000）。纯轻资产，无需囤货。',
      returns: '第 1 周：搭建 SOP 跑通，加粉 500+；第 1 个月：成交 20-50 单，月入 1-3 万；第 3 个月：成熟 SOP，月入 5-20 万；可同时复制到 3-5 个垂直行业。',
      resources: [
        'OPC 私域 AI 工具包（企微 SCRM + AI 客服）',
        '卢老师 1V1 私域诊断 2 次',
        '加粉 SOP + 30 套成交话术模板',
        '主理人分销联盟 + 转介绍激励',
      ],
    },
  },
  {
    id: 'global-ecom',
    title: 'AI 出海电商陪跑',
    desc: '利用 AI 做跨境选品、素材生成、多语言运营，低门槛出海。',
    icon: Globe,
    color: 'bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 border-cyan-200',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-teal-500',
    tags: ['蓝海市场', 'AI 选品'],
    highlights: ['AI 多语种生成', '全球 7 大平台', '单店月入 2-5 万美金'],
    budget: '5,000 - 15,000 元',
    cycle: '15-30 天起店',
    income: '首月 1-3 万美金，半年后 10-50 万/月',
    plan: {
      prospect: '跨境出海是 AI 创业的终极蓝海。AI 选品 + AI 多语种素材生成让一个人就能运营一个国际电商品牌。亚马逊 / Shopee / TikTok Shop / 独立站 4 大渠道同步打通。',
      investment: '启动资金 5,000-15,000 元（建站工具 2,000 + 选品样品 3,000 + 投流 5,000 + AI 工具 1,000）。OPC 提供 AI 选品数据库 + 多语种模型微调。',
      returns: '第 1 个月：单店铺开通，跑通模型，月入 5K-1 万美金；第 3 个月：3 个站点矩阵，月入 2-5 万美金；第 6 个月：5+ 站点 + 培训他人，月入 10-50 万美金。',
      resources: [
        'OPC AI 选品数据库（亚马逊 / Shopee / TikTok Shop 实时数据）',
        'AI 多语种素材生成工作流',
        '于老师 1V1 出海陪跑 3 次',
        'OPC 海外仓 + 物流合作伙伴',
        '主理人海外分销网络',
      ],
    },
  },
]

// ─── 引擎二：AI 招商加盟（4 个项目）───
const engine2Projects: EngineProject[] = [
  {
    id: 'digital-human-agent',
    title: 'AI 数字人直播硬件全国代理',
    desc: '整套数字人直播设备 + AI 系统，面向全国招募城市代理商。',
    icon: Cpu,
    color: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-orange-200',
    iconBg: 'bg-gradient-to-br from-orange-500 to-amber-500',
    tags: ['城市代理', '高利润'],
    highlights: ['单台毛利 8000+', '区域独家保护', '总部 1V1 扶持'],
    budget: '50,000 - 200,000 元',
    cycle: '30 天签约',
    income: '首年 100-500 万',
    plan: {
      prospect: '数字人直播硬件市场 2026 年规模超 200 亿，年增速 80%+。OPC 联合头部数字人厂商推出"城市合伙人计划"，3 年内扶持 100 个城市独家代理，每个城市市场容量 500-2000 万。',
      investment: '城市代理费 5-20 万 + 首批铺货 20-50 万 + 演示厅装修 10-30 万 + 团队 3-5 人。OPC 提供：独家区域保护 + 总部培训 + 客户引流。',
      returns: '第 1 季度：签约 10-30 家商户，营收 30-100 万；第 1 年：签约 100-300 家，年营收 300-1000 万，净利 100-500 万；3 年目标：城市龙头，年营收 2000 万+。',
      resources: [
        '数字人厂商直供（OPC 战略价）',
        '弓老师 1V1 招商陪跑 6 次',
        'OPC 品牌授权 + VI 体系',
        '全国 100+ 主理人分销网络',
        '总部商学院年度培训',
      ],
    },
  },
  {
    id: 'edu-hardware',
    title: 'AI 智能教育硬件城市合伙人',
    desc: '搭载 AI 大模型的儿童教育硬件，面向教培机构、经销商招商。',
    icon: GraduationCap,
    color: 'bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-amber-200',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
    tags: ['教培赛道', '政策友好'],
    highlights: ['AI 大模型加持', '家长复购率 90%+', '教委推荐目录'],
    budget: '80,000 - 300,000 元',
    cycle: '45 天起盘',
    income: '首年 200-800 万',
    plan: {
      prospect: 'AI 教育硬件是 2026 年最受关注的政策友好赛道。教育部"人工智能 + 教育"白皮书已出台，AI 学习机 / 智能笔 / 智能台灯等品类年增速超 100%。OPC 已与 3 家头部厂商达成 OEM 合作。',
      investment: '城市合伙人费 8-30 万 + 首批铺货 30-80 万 + 体验店 / 进校推广 20-50 万 + 团队 5-8 人。OPC 提供：教委关系对接 + 招商模板 + 培训体系。',
      returns: '第 1 季度：签约 30-80 家教培机构，营收 80-300 万；第 1 年：签约 200-500 家机构 + 经销商，年营收 800-2000 万，净利 200-800 万。',
      resources: [
        'AI 教育硬件 OEM 渠道（OPC 战略价）',
        '吕老师 1V1 教培招商陪跑 8 次',
        'OPC 教育品牌授权 + 招商手册',
        '全国 100+ 主理人 + 500+ 教培分销',
        '总部年度招商大会 + 行业展会',
      ],
    },
  },
  {
    id: 'enterprise-ai',
    title: '企业 AI 定制化系统加盟',
    desc: '基于 OPC 四库全胜架构，向全国中小企业输出标准化 AI 系统定制服务。',
    icon: Building,
    color: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-yellow-200',
    iconBg: 'bg-gradient-to-br from-yellow-500 to-orange-500',
    tags: ['To B 高客单', 'OPC 架构'],
    highlights: ['单项目 5-50 万', 'OPC 四库全胜', '持续 SaaS 收入'],
    budget: '100,000 - 500,000 元',
    cycle: '60 天交付',
    income: '首年 300-2000 万',
    plan: {
      prospect: '中国企业 AI 化转型是未来 5 年最大 ToB 机会。OPC"四库全胜"架构（知识库 / 工具库 / 案例库 / 主理人库）已打磨 3 年，可标准化复制给全国 100+ 城市合伙人。',
      investment: '城市合伙人费 10-50 万 + 团队 5-10 人（销售 + 实施） + 演示环境 20 万。OPC 提供：标准化产品 + 销售工具 + 培训认证。',
      returns: '第 1 季度：签约 5-15 家企业，单项目 5-50 万；第 1 年：签约 50-150 家企业，年营收 500-3000 万，净利 300-2000 万；3 年目标：区域龙头，营收破亿。',
      resources: [
        'OPC 四库全胜架构授权（含知识库 / 工具库 / 案例库 / 主理人库）',
        '于老师 1V1 ToB 销售陪跑 12 次',
        'OPC 企业品牌 + 标杆案例授权',
        '总部 AI 工程师 + 解决方案团队',
        '全国 1000+ 主理人企业客户网络',
      ],
    },
  },
  {
    id: 'retail-ai',
    title: 'AI 智慧零售解决方案代理',
    desc: '实体零售店的 AI 数字人导购、AI 库存管理系统的全国招募。',
    icon: Store,
    color: 'bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 border-rose-200',
    iconBg: 'bg-gradient-to-br from-rose-500 to-orange-500',
    tags: ['实体赋能', '持续分成'],
    highlights: ['AI 数字人导购', '智能库存', '年分成 30%'],
    budget: '60,000 - 250,000 元',
    cycle: '30 天起盘',
    income: '首年 150-600 万',
    plan: {
      prospect: '实体零售 AI 化是 2026 年最确定性的升级方向。中国 8000 万实体门店中已有 5% 开始 AI 化采购，年市场规模 1500 亿。OPC 联合 3 家头部零售 AI 厂商推出区域独家代理。',
      investment: '城市代理费 6-25 万 + 首批硬件铺货 20-50 万 + 地推团队 5-10 人 + 演示设备 10 万。OPC 提供：客户线索 + 销售培训 + 持续分成。',
      returns: '第 1 季度：签约 30-100 家门店，营收 80-300 万；第 1 年：签约 200-500 家门店 + 持续 SaaS 分成 30%，年营收 500-1500 万，净利 150-600 万。',
      resources: [
        '零售 AI 厂商直供（OPC 战略价）',
        '卢老师 1V1 零售招商陪跑 6 次',
        'OPC 零售品牌授权 + 招商工具包',
        '全国 500+ 零售主理人分销网络',
        '总部年度零售 AI 大会',
      ],
    },
  },
]

// ─── 良朋社 IP 重构实战案例库 ───
interface CaseStudy {
  id: string
  title: string
  person: string
  period: string
  highlight: string
  metrics: { label: string; value: string }[]
  icon: LucideIcon
  color: string
  /** 标签（如"定位重构"、"信任重构"等） */
  tag: string
  /** 客户原名（化名） */
  originalName: string
  /** 转型路径 */
  transformation: string
  /** 核心结果 */
  result: string
}

const caseStudies: CaseStudy[] = [
  {
    id: 'case-1',
    title: '从程序员到 AI 数字人操盘手',
    person: '小陈 · 92 年 · 前阿里 P6',
    originalName: '小陈',
    period: '90 天',
    highlight: '借助 OPC 数字人 SOP，单人跑通 3 个直播间，6 个月 GMV 突破 500 万。',
    transformation: '后端程序员 → AI 数字人 IP 操盘手，搭建 3 个直播间矩阵',
    result: '月 GMV 85 万，净利 23 万/月',
    tag: '定位重构',
    metrics: [
      { label: '直播间', value: '3 个' },
      { label: '月 GMV', value: '85 万' },
      { label: '净利', value: '23 万/月' },
    ],
    icon: Bot,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'case-2',
    title: '三线城市教培老板，AI 出海跨境',
    person: '王姐 · 85 年 · 临沂教培校长',
    originalName: '王姐',
    period: '120 天',
    highlight: '用 OPC AI 选品 + 多语种 SOP，TikTok Shop 美区从 0 到月入 2 万美金。',
    transformation: '教培机构 → AI 跨境电商 IP，从国内赛道切换至全球市场',
    result: '月销售额 $28,000，复购率 34%',
    tag: '赛道重构',
    metrics: [
      { label: 'SKU', value: '120 个' },
      { label: '月销售', value: '$28,000' },
      { label: '复购', value: '34%' },
    ],
    icon: Globe,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'case-3',
    title: '国企 HR 转型 AI 私域主理人',
    person: 'Lily · 88 年 · 前央企 HR',
    originalName: 'Lily',
    period: '60 天',
    highlight: 'OPC 私域 AI SOP + 主理人分销，单月私域成交 92 单，月入 5.8 万。',
    transformation: '企业 HR → 私域 AI 成交教练，搭建高转化私域 SOP',
    result: '月成交 92 单，客单价 ¥630',
    tag: '信任重构',
    metrics: [
      { label: '私域', value: '1,200+' },
      { label: '月成交', value: '92 单' },
      { label: '客单价', value: '¥630' },
    ],
    icon: MessageCircle,
    color: 'from-rose-500 to-orange-500',
  },
  // ===== 9 个 IP 重构实战案例（新增）=====
  {
    id: 'case-4',
    title: '从疗愈大师到高客单商业导师',
    person: '清一老师 · 78 年 · 前身心灵疗愈师',
    originalName: '清一老师',
    period: '75 天',
    highlight: '用 4 步法 + 9 个 AI Agent 团队，把单次 199 元疗愈课升级为 3 万元商业导师课。',
    transformation: '身心灵疗愈 → 商业 IP 导师，从情绪服务到财富系统',
    result: '客单价从 199 提升到 30000+，月收 80 万+',
    tag: '定位重构',
    metrics: [
      { label: '客单价', value: '¥30,000' },
      { label: '月营收', value: '80 万+' },
      { label: 'AI 提效', value: '10 倍' },
    ],
    icon: Sparkles,
    color: 'from-violet-500 to-fuchsia-500',
  },
  {
    id: 'case-5',
    title: '亲子数字心理教练 IP 重构',
    person: '晓燕老师 · 80 年 · 前儿童心理咨询师',
    originalName: '晓燕老师',
    period: '90 天',
    highlight: 'AI 诊断表 + 直播连麦，建立"亲子心理 AI 教练"IP，月私域成交 120+ 单。',
    transformation: '线下心理咨询 → 数字亲子心理教练 IP，AI 辅助 7x24 服务',
    result: '月私域成交 120+ 单，客单价 980 元',
    tag: '产品重构',
    metrics: [
      { label: '月成交', value: '120+ 单' },
      { label: '客单价', value: '¥980' },
      { label: '复购率', value: '52%' },
    ],
    icon: HeartHandshake,
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'case-6',
    title: '私域 AI 成交教练 · 母婴赛道',
    person: '丹丹老师 · 87 年 · 前母婴店主',
    originalName: '丹丹老师',
    period: '60 天',
    highlight: 'AI 工作流把私域运营从 1V1 跑成 1V100，月成交从 3 万跃升到 28 万。',
    transformation: '传统母婴店主 → 私域 AI 成交教练，AI 工作流覆盖 5 大触点',
    result: '月成交 28 万，AI 替代 3 个员工',
    tag: '内容重构',
    metrics: [
      { label: '月成交', value: '¥28 万' },
      { label: 'AI 替代', value: '3 人' },
      { label: '触达', value: '10 倍' },
    ],
    icon: Users,
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'case-7',
    title: '前大厂工程师 → AI 商业 IP 讲师',
    person: 'Leo 老师 · 90 年 · 前字节 P7',
    originalName: 'Leo 老师',
    period: '120 天',
    highlight: '技术背景 + 4 步法，搭建"AI 商业 IP 讲师"定位，半年线上营收破 200 万。',
    transformation: '技术专家 → 商业 IP 讲师，把技术能力封装成可复制产品',
    result: '半年营收 200 万+，学员 800+',
    tag: '内容重构',
    metrics: [
      { label: '半年营收', value: '200 万' },
      { label: '学员', value: '800+' },
      { label: '完课率', value: '87%' },
    ],
    icon: GraduationCap,
    color: 'from-indigo-500 to-blue-500',
  },
  {
    id: 'case-8',
    title: '实体店老板 → AI 招商操盘手',
    person: '陈总 · 82 年 · 前餐饮连锁创始人',
    originalName: '陈总',
    period: '90 天',
    highlight: '把 10 年餐饮经验重构为"AI 招商操盘"课程，单月收 12 个城市合伙人。',
    transformation: '实体连锁老板 → AI 招商操盘手，把单店经验封装为系统化产品',
    result: '月签 12 个城市合伙人，单笔 5 万+',
    tag: '成交重构',
    metrics: [
      { label: '月签', value: '12 城' },
      { label: '单笔', value: '5 万+' },
      { label: '总额', value: '60 万+/月' },
    ],
    icon: Building,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'case-9',
    title: '营养师 → 高客单健康 IP 操盘手',
    person: 'Anna 老师 · 85 年 · 前医院营养师',
    originalName: 'Anna 老师',
    period: '90 天',
    highlight: 'AI 直播 + 高客单交付，半年营收 150 万，私域沉淀 5000+ 高净值用户。',
    transformation: '医院营养师 → 高客单健康 IP 操盘手，AI 直播 + 私域矩阵',
    result: '半年营收 150 万，私域 5000+ 用户',
    tag: '信任重构',
    metrics: [
      { label: '半年营收', value: '150 万' },
      { label: '私域', value: '5,000+' },
      { label: '客单价', value: '¥3,000' },
    ],
    icon: HeartHandshake,
    color: 'from-rose-500 to-pink-500',
  },
]

// ─── 近期智富项目实战案例榜 ───
interface HotCase {
  id: string
  category: string // 分类标签
  categoryBg: string // 分类标签底色
  categoryText: string // 分类标签文字色
  title: string
  summary: string
  slug: string // 跳转的 SOP 详情页 slug
}

const hotCases: HotCase[] = [
  {
    id: 'hc-1',
    category: '内容变现',
    categoryBg: 'bg-blue-100',
    categoryText: 'text-blue-700',
    title: '3周搞定个人IP起号，借助AI数字人单月变现2万+',
    summary: '4条数字人短视频，绕过新号限流，直接变现。',
    slug: 'ai-douyin-clone',
  },
  {
    id: 'hc-2',
    category: '招商加盟',
    categoryBg: 'bg-orange-100',
    categoryText: 'text-orange-700',
    title: 'AI硬件厂商通过OPC主理人网络，1个月招募3个城市代理商',
    summary: '线下沙龙转化+线上SaaS分站，快速打开全国市场。',
    slug: 'ai-xiaohongshu-matrix',
  },
  {
    id: 'hc-3',
    category: '出海电商',
    categoryBg: 'bg-emerald-100',
    categoryText: 'text-emerald-700',
    title: '单人利用AI选品+AI批量视频，跨境单月做到5万美金销售额',
    summary: '利用AI搞定选品、主图和视频，一人顶一个运营团队。',
    slug: 'ai-tiktok-shop',
  },
  {
    id: 'hc-4',
    category: '私域成交',
    categoryBg: 'bg-violet-100',
    categoryText: 'text-violet-700',
    title: '用AI写朋友圈+自动回复，私域成交流水提升40%',
    summary: '私域自动打标，精准推送AI生成的产品话术。',
    slug: 'ai-private-traffic',
  },
  {
    id: 'hc-5',
    category: '农产品 AI 赋能',
    categoryBg: 'bg-rose-100',
    categoryText: 'text-rose-700',
    title: 'AI赋能潮汕月饼，10天本地社群团购卖出2000盒',
    summary: '用AI生成国潮风海报、爆款文案，精准触达本地老顾客。',
    slug: 'ai-pinduoduo',
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
  // 双引擎切换
  const [activeEngine, setActiveEngine] = useState<EngineId>('personal')
  // AI 商业计划书 Modal
  const [planProject, setPlanProject] = useState<EngineProject | null>(null)
  const [planCopied, setPlanCopied] = useState(false)

  const activeProjects = activeEngine === 'personal' ? engine1Projects : engine2Projects

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ─── Hero ─── */}
      <motion.header
        {...fadeUp}
        className="px-4 pt-20 pb-10 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-50"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1 mb-4">
            <Sparkles size={14} className="text-amber-300" />
            <span className="text-xs text-slate-200">良朋社 OPC · 2026 战略级双引擎</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            良朋社 OPC · <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-200 to-rose-200">智富项目双引擎</span>
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
            一条路用 AI 搞流量做变现，一条路做 AI 招商加盟全国扩张。
          </p>
        </div>
      </motion.header>

      {/* ─── 双引擎切换 Tabs ─── */}
      <motion.section
        {...fadeUp}
        className="px-4 pt-6 pb-2"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="grid grid-cols-2 gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <button
              onClick={() => setActiveEngine('personal')}
              className={`relative inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm md:text-base font-bold transition-all active:scale-[0.98] ${
                activeEngine === 'personal'
                  ? 'bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Lightbulb size={18} />
              <span>💡 引擎一：个人智富</span>
              {activeEngine === 'personal' && (
                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center text-[10px] font-bold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full shadow">
                  4 个
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveEngine('franchise')}
              className={`relative inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm md:text-base font-bold transition-all active:scale-[0.98] ${
                activeEngine === 'franchise'
                  ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Rocket size={18} />
              <span>🚀 引擎二：AI 招商加盟</span>
              {activeEngine === 'franchise' && (
                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center text-[10px] font-bold bg-rose-400 text-rose-900 px-1.5 py-0.5 rounded-full shadow">
                  4 个
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.section>

      {/* ─── Bento 2x2 网格：4 个引擎项目 ─── */}
      <motion.section
        {...fadeUp}
        className="px-4 py-4"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProjects.map((project) => (
              <EngineProjectCard
                key={project.id}
                project={project}
                onShowPlan={() => setPlanProject(project)}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── 良朋社 IP 重构实战案例（仅引擎一展示）─── */}
      {activeEngine === 'personal' && (
        <motion.section
          {...fadeUp}
          className="px-4 py-8"
        >
          <div className="max-w-lg mx-auto md:max-w-6xl">
            <div className="flex items-center gap-2 mb-4">
              <Award size={20} className="text-amber-500" />
              <h2 className="text-lg font-bold text-gray-900">良朋社 IP 重构实战案例库</h2>
              <span className="text-xs text-slate-500 ml-1">· 9 个真实主理人 90 天成果</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {caseStudies.map((cs) => (
                <CaseStudyCard key={cs.id} caseStudy={cs} />
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ─── 引擎二专属：加盟流程说明 ─── */}
      {activeEngine === 'franchise' && (
        <motion.section
          {...fadeUp}
          className="px-4 py-8"
        >
          <div className="max-w-lg mx-auto md:max-w-6xl">
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-6 md:p-7">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-orange-200/40 rounded-full" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Network size={20} className="text-orange-600" />
                  <h3 className="text-lg font-bold text-gray-900">城市合伙人 · 4 步落地</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[
                    { step: '01', title: '提交意向', desc: '填写城市 + 资金 + 团队' },
                    { step: '02', title: '总部面谈', desc: 'OPC 团队 1V1 视频评估' },
                    { step: '03', title: '签约授权', desc: '区域独家 + 培训认证' },
                    { step: '04', title: '启动扶持', desc: '首批客户引流 + 团队带教' },
                  ].map((item) => (
                    <div key={item.step} className="bg-white/70 backdrop-blur-sm border border-orange-100 rounded-xl p-3">
                      <div className="text-2xl font-bold text-orange-500 mb-1">{item.step}</div>
                      <div className="text-sm font-bold text-gray-900 mb-0.5">{item.title}</div>
                      <div className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      <motion.section
        {...fadeUp}
        className="px-4 pb-12"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                🔥 近期智富项目实战案例榜
              </h2>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                本期 5 个 OPC 主理人和个人创业者跑通的 AI 变现玩法，看看哪个适合你。
              </p>
            </div>

            <div className="space-y-3">
              {hotCases.map((hc) => (
                <div
                  key={hc.id}
                  className="flex items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${hc.categoryBg} ${hc.categoryText}`}
                      >
                        {hc.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 break-words">
                      {hc.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed break-words">
                      {hc.summary}
                    </p>
                  </div>
                  <Link
                    href={`/projects/${hc.slug}`}
                    className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg bg-white text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 border border-indigo-100 transition-all whitespace-nowrap"
                  >
                    <span>查看完整 SOP</span>
                    <ChevronRight size={14} />
                  </Link>
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

      {/* ─── AI 商业计划书 Modal ─── */}
      <BusinessPlanModal
        project={planProject}
        copied={planCopied}
        onClose={() => {
          setPlanProject(null)
          setPlanCopied(false)
        }}
        onCopy={async (text) => {
          try {
            if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(text)
            } else {
              const ta = document.createElement('textarea')
              ta.value = text
              ta.style.position = 'fixed'
              ta.style.opacity = '0'
              document.body.appendChild(ta)
              ta.select()
              document.execCommand('copy')
              document.body.removeChild(ta)
            }
            setPlanCopied(true)
            setTimeout(() => setPlanCopied(false), 2000)
          } catch (e) {
            console.error('复制失败:', e)
          }
        }}
      />
    </div>
  )
}

// ─── 引擎项目卡片（Bento 风格）───
function EngineProjectCard({ project, onShowPlan }: { project: EngineProject; onShowPlan: () => void }) {
  const Icon = project.icon
  return (
    <div className={`relative ${project.color} border-2 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col`}>
      {/* 顶部：图标 + 标签 */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${project.iconBg} flex items-center justify-center shadow-md`}>
          <Icon size={24} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1 mb-1">
            {project.tags.map((tag, i) => (
              <span key={i} className="text-[10px] font-medium text-slate-700 bg-white/70 border border-white/60 rounded-full px-1.5 py-0.5">
                {tag}
              </span>
            ))}
          </div>
          <h3 className="font-bold text-gray-900 text-base leading-tight">{project.title}</h3>
        </div>
      </div>

      {/* 描述 */}
      <p className="text-xs md:text-sm text-slate-700 leading-relaxed mb-3">
        {project.desc}
      </p>

      {/* 高亮标签 */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {project.highlights.map((h, i) => (
          <span
            key={i}
            className="text-[11px] text-slate-700 bg-white/70 border border-white/60 rounded-full px-2 py-0.5"
          >
            ✨ {h}
          </span>
        ))}
      </div>

      {/* 三项关键数据 */}
      <div className="grid grid-cols-3 gap-1.5 mb-3 bg-white/50 backdrop-blur-sm rounded-xl p-2">
        <div className="text-center">
          <div className="text-[9px] text-slate-500 mb-0.5">启动资金</div>
          <div className="text-[11px] font-bold text-slate-800">{project.budget}</div>
        </div>
        <div className="text-center border-x border-slate-200">
          <div className="text-[9px] text-slate-500 mb-0.5">上线周期</div>
          <div className="text-[11px] font-bold text-slate-800">{project.cycle}</div>
        </div>
        <div className="text-center">
          <div className="text-[9px] text-slate-500 mb-0.5">预期回报</div>
          <div className="text-[11px] font-bold text-slate-800">{project.income}</div>
        </div>
      </div>

      {/* AI 生成项目计划书按钮 */}
      <button
        onClick={onShowPlan}
        className="mt-auto w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
      >
        <Bot size={14} />
        <span>🤖 AI 生成项目计划书</span>
        <ChevronRight size={14} />
      </button>
    </div>
  )
}

// ─── 案例深度拆解卡片 ───
function CaseStudyCard({ caseStudy }: { caseStudy: CaseStudy }) {
  const Icon = caseStudy.icon
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
      {/* 顶部渐变条 + 标题 */}
      <div className={`bg-gradient-to-r ${caseStudy.color} p-4 text-white`}>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Icon size={16} className="text-white" />
          </div>
          <span className="text-[10px] font-bold bg-white/25 backdrop-blur-sm rounded-full px-1.5 py-0.5">
            {caseStudy.period}
          </span>
          <span className="text-[10px] font-bold bg-amber-300/90 text-amber-900 rounded-full px-1.5 py-0.5">
            🏷️ {caseStudy.tag}
          </span>
        </div>
        <h3 className="text-sm font-bold leading-tight">{caseStudy.title}</h3>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="text-[11px] text-slate-500 mb-2">
          👤 客户原名：<span className="font-semibold text-slate-700">{caseStudy.originalName}</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed mb-3">
          {caseStudy.highlight}
        </p>

        {/* 转型路径 + 核心结果 */}
        <div className="space-y-1.5 mb-3">
          <div className="text-[11px] text-slate-600 bg-blue-50 border border-blue-100 rounded-lg px-2 py-1.5">
            <span className="font-bold text-blue-700">🔀 转型路径：</span>{caseStudy.transformation}
          </div>
          <div className="text-[11px] text-slate-600 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1.5">
            <span className="font-bold text-emerald-700">🎯 核心结果：</span>{caseStudy.result}
          </div>
        </div>

        {/* 关键指标 */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {caseStudy.metrics.map((m, i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-2 text-center">
              <div className="text-[9px] text-slate-500 mb-0.5 leading-tight">{m.label}</div>
              <div className="text-[12px] font-bold text-slate-900 leading-tight">{m.value}</div>
            </div>
          ))}
        </div>

        {/* 查看完整案例按钮 */}
        <Link
          href="/ip-reconstruction"
          className="mt-auto w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all"
        >
          查看完整案例
          <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  )
}

// ─── AI 商业计划书 Modal ───
function BusinessPlanModal({
  project, onClose, copied, onCopy,
}: {
  project: EngineProject | null
  onClose: () => void
  copied: boolean
  onCopy: (text: string) => void
}) {
  const fullText = project
    ? `【${project.title}】AI 商业计划书\n\n一、项目前景\n${project.plan.prospect}\n\n二、启动投入\n${project.plan.investment}\n\n三、预期回报\n${project.plan.returns}\n\n四、OPC 生态资源匹配\n${project.plan.resources.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\n—— 由 OPC 双引擎 AI 自动生成`
    : ''

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="relative w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部渐变横幅 */}
            <div className={`relative px-6 pt-6 pb-5 text-white ${project.iconBg}`}>
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="关闭"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <project.icon size={28} className="text-white" />
                </div>
                <div>
                  <div className="text-[11px] text-white/80 mb-0.5">OPC 双引擎 · AI 自动生成</div>
                  <h3 className="text-lg md:text-xl font-bold leading-tight">{project.title}</h3>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="font-semibold bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                  💰 {project.budget}
                </span>
                <span className="font-semibold bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                  ⏱️ {project.cycle}
                </span>
                <span className="font-semibold bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                  📈 {project.income}
                </span>
              </div>
            </div>

            {/* 计划书正文（可滚动） */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
              <PlanSection
                title="一、项目前景"
                tone="blue"
                icon={<TrendingUp size={14} />}
              >
                <p className="text-sm text-slate-700 leading-relaxed">{project.plan.prospect}</p>
              </PlanSection>

              <PlanSection
                title="二、启动投入"
                tone="amber"
                icon={<DollarSign size={14} />}
              >
                <p className="text-sm text-slate-700 leading-relaxed">{project.plan.investment}</p>
              </PlanSection>

              <PlanSection
                title="三、预期回报"
                tone="emerald"
                icon={<Target size={14} />}
              >
                <p className="text-sm text-slate-700 leading-relaxed">{project.plan.returns}</p>
              </PlanSection>

              <PlanSection
                title="四、OPC 生态资源匹配"
                tone="violet"
                icon={<Network size={14} />}
              >
                <ul className="space-y-2">
                  {project.plan.resources.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </PlanSection>

              <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-xl p-3 flex items-start gap-2">
                <Sparkles size={16} className="text-violet-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  <span className="font-bold text-violet-700">💡 提示：</span>
                  本计划书由 OPC 双引擎 AI 基于项目数据自动生成，可在 1V1 咨询中由专属顾问进一步细化。
                </div>
              </div>
            </div>

            {/* 底部操作栏（固定） */}
            <div className="flex-shrink-0 px-5 py-3 bg-white border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                关闭
              </button>
              <button
                onClick={() => onCopy(fullText)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold rounded-xl transition-all active:scale-95 ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white hover:shadow-lg'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    已复制到剪贴板
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    一键复制计划书
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 子组件：计划书分区块
function PlanSection({ title, tone, icon, children }: {
  title: string
  tone: 'blue' | 'amber' | 'emerald' | 'violet'
  icon: React.ReactNode
  children: React.ReactNode
}) {
  const toneMap: Record<typeof tone, string> = {
    blue: 'bg-blue-50/70 border-blue-100',
    amber: 'bg-amber-50/70 border-amber-100',
    emerald: 'bg-emerald-50/70 border-emerald-100',
    violet: 'bg-violet-50/70 border-violet-100',
  }
  return (
    <div className={`rounded-2xl border p-4 ${toneMap[tone]}`}>
      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800 mb-2">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  )
}
