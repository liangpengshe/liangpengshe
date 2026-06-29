'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Rocket,
  Shield,
  Gift,
  Radio,
  Users,
  Handshake,
  Calendar,
  Building2,
  Cloud,
  Sparkles,
  X,
  CheckCircle2,
  Send,
  User,
  Phone,
  FileText,
  Tag as TagIcon,
  Copy,
  ShoppingBag,
  Wheat,
  Cake,
  Bot,
  Check,
  Download,
  MessageCircle,
  TrendingUp,
  Zap,
} from 'lucide-react'
import AIMatchmakerWidget from '@/components/AIMatchmakerWidget'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const partners = [
  { name: '硅基流动', icon: Cloud, premium: true },
  { name: '智谱AI', icon: Sparkles, premium: true },
  { name: '阿里云', icon: Building2, premium: false },
  { name: '腾讯云', icon: Building2, premium: true },
  { name: 'Dify', icon: Sparkles, premium: false },
  { name: 'Midjourney', icon: Sparkles, premium: false },
]

// AI 赋能实体经济的商业中台四大板块（2x2 网格）
const businessSections = [
  {
    id: 'traffic',
    icon: Rocket,
    title: 'AI 全链路流量引擎',
    desc: '从 AI 选题、生成脚本到矩阵分发，让实体好物触达全国流量池。',
    tags: ['小红书 AI 爆文', '抖音 AI 切片', '视频号 AI 矩阵', '亚马逊 AI 选品'],
    color: 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200',
    iconColor: 'text-orange-500',
    iconBg: 'bg-gradient-to-br from-orange-400 to-amber-500',
    layer: '流量层',
    layerColor: 'bg-orange-100 text-orange-700',
    hasAiPlan: false,
  },
  {
    id: 'media',
    icon: Radio,
    title: '品牌 AI 内容与公关中台',
    desc: 'AI 一键生成品牌故事、科技新闻稿，打通行业媒体分发通路。',
    tags: ['AI 品牌故事', '科技媒体宣发', 'AI 新闻稿生成', 'KOL 私域承接'],
    color: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
    iconColor: 'text-green-500',
    iconBg: 'bg-gradient-to-br from-green-400 to-emerald-500',
    layer: '媒体层',
    layerColor: 'bg-green-100 text-green-700',
    hasAiPlan: false,
  },
  {
    id: 'resource',
    icon: Shield,
    title: 'OPC 本地化选品生态圈',
    desc: '连接原产地供应链、本地商会与全国 OPC 主理人，实现好物直达终端。',
    tags: ['原产地直供', 'OPC 主理人网络', 'AI 选品供应链', '地方商会'],
    color: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200',
    iconColor: 'text-blue-500',
    iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500',
    layer: '资源层',
    layerColor: 'bg-blue-100 text-blue-700',
    hasAiPlan: false,
  },
  {
    id: 'product',
    icon: ShoppingBag,
    title: '智富严选 · AI 赋能好物',
    desc: '以 AI 赋能潮汕美食、特色农品等实体好物，让传统商品拥抱数字营销。',
    tags: ['潮汕/食品', 'AI 营销方案', '非遗/好物', '主理人分销'],
    color: 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200',
    iconColor: 'text-violet-500',
    iconBg: 'bg-gradient-to-br from-violet-400 to-purple-500',
    layer: '实物层',
    layerColor: 'bg-violet-100 text-violet-700',
    hasAiPlan: true,
  },
]

const supplyDemand: { id: string; tag: string; tagColor: string; title: string; time: string; desc: string }[] = [
  {
    id: '1',
    tag: '找人',
    tagColor: 'bg-blue-100 text-blue-700',
    title: '深圳本地AI个体户，寻带货供应链合作',
    time: '2小时前',
    desc: '本人擅长AI内容创作，希望找到稳定的供应链货源，共同打造AI电商品牌。',
  },
  {
    id: '2',
    tag: '找项目',
    tagColor: 'bg-emerald-100 text-emerald-700',
    title: '寻求GEO全域增长陪跑服务',
    time: '5小时前',
    desc: '跨境电商卖家，希望学习AI驱动的全域增长策略，提升海外市场竞争力。',
  },
  {
    id: '3',
    tag: '找合作',
    tagColor: 'bg-violet-100 text-violet-700',
    title: 'AI法律咨询工具寻求渠道合作',
    time: '1天前',
    desc: '自研AI法律助手工具，寻求律所、企业服务平台等渠道合作伙伴。',
  },
  {
    id: '4',
    tag: '找资源',
    tagColor: 'bg-amber-100 text-amber-700',
    title: '寻找本地优质数字人直播硬件供应商',
    time: '2天前',
    desc: 'OPC 主理人寻找深圳本地具备高性价比的数字人直播硬件设备渠道。',
  },
  {
    id: '5',
    tag: '找人',
    tagColor: 'bg-blue-100 text-blue-700',
    title: '杭州电商团队寻找AI图文代运营合伙人',
    time: '3天前',
    desc: '杭州本地电商团队，急需懂AI图文内容生产的合伙人共同开拓市场。',
  },
  {
    id: '6',
    tag: '找项目',
    tagColor: 'bg-emerald-100 text-emerald-700',
    title: '寻求小红书矩阵AI自动化工具开发合作',
    time: '5天前',
    desc: '拥有百万粉丝矩阵账号，需要一套自动化内容发布与评论区管理的AI工具。',
  },
  {
    id: '7',
    tag: '找资源',
    tagColor: 'bg-amber-100 text-amber-700',
    title: '寻找稳定靠谱的AI视频素材版权库',
    time: '1周前',
    desc: '自媒体创业者，需要大量版权明确的AI视频素材，用于批量生产短视频。',
  },
  {
    id: '8',
    tag: '找合作',
    tagColor: 'bg-violet-100 text-violet-700',
    title: 'AI智能体初创团队寻找FA或投资机构对接',
    time: '1周前',
    desc: '专注垂直行业智能体研发的团队，寻求融资与孵化资源对接。',
  },
  {
    id: '9',
    tag: '找人',
    tagColor: 'bg-blue-100 text-blue-700',
    title: '成都本地AI教练寻求与当地商会合作办沙龙',
    time: '2周前',
    desc: '在成都做AI商业培训，希望对接当地商会资源，合作开展线下AI沙龙活动。',
  },
  {
    id: '10',
    tag: '找项目',
    tagColor: 'bg-emerald-100 text-emerald-700',
    title: '跨境电商卖家寻求AI数字人直播陪跑服务',
    time: '2周前',
    desc: '主营TikTok跨境直播，急需OPC体系内的AI数字人搭建与直播陪跑服务。',
  },
]

// ─── 智富严选：4 个分类 Tab ───
const productCategories = [
  { id: 'all', label: '全部', icon: ShoppingBag, color: 'from-violet-500 to-purple-600' },
  { id: 'ai', label: 'AI 智富工具', icon: Bot, color: 'from-blue-500 to-cyan-600' },
  { id: 'agri', label: '精选农品/食品', icon: Wheat, color: 'from-amber-500 to-orange-600', emoji: '🌾' },
  { id: 'chaoshan', label: '潮汕/特色美食', icon: Cake, color: 'from-rose-500 to-pink-600', emoji: '🥮' },
] as const

// ─── 产品数据（每个产品都有营销方案） ───
type ProductCategory = 'ai' | 'agri' | 'chaoshan'

interface Product {
  id: string
  name: string
  category: ProductCategory
  categoryLabel: string
  emoji: string
  bgFrom: string
  bgTo: string
  tagline: string
  desc: string
  highlights: string[]
  origin: string
  // AI 自动生成的营销方案（写死但贴近真实）
  marketingPlan: {
    title: string
    hooks: string[]
    videoScript: string[]
    channels: string[]
    cta: string
  }
}

const products: Product[] = [
  {
    id: 'ai-writer',
    name: 'AI 智能写作助手 Pro',
    category: 'ai',
    categoryLabel: 'AI 智富工具',
    emoji: '✍️',
    bgFrom: '#3b82f6',
    bgTo: '#06b6d4',
    tagline: '一键生成爆款文案',
    desc: '基于大模型的中文写作助手，支持小红书、抖音、公众号多平台调性。',
    highlights: ['10万+ 创作者使用', '日均产出 50w 字', '60+ 垂直模板'],
    origin: '深圳·南山',
    marketingPlan: {
      title: '《3 步让 AI 帮你写出 10w+》',
      hooks: [
        '为什么别人 1 小时能写 50 篇爆款，而你还在憋 1 篇？',
        'AI 不是替代文案，而是让一个文案 = 一个团队',
        '把"改稿 8 遍"变成"一键出 8 版"',
      ],
      videoScript: [
        '【0:00-0:05 钩子】"你还在一个字一个字憋爆款？"',
        '【0:05-0:25 痛点】展示改稿改到凌晨 3 点的真实场景',
        '【0:25-0:50 方案】演示 AI 写作助手 3 步生成爆款',
        '【0:50-1:00 CTA】"扫码免费领 7 天会员"',
      ],
      channels: ['小红书图文', '抖音短视频', '公众号软文', '视频号直播切片'],
      cta: '扫码领 7 天免费会员 + 60 套爆款模板',
    },
  },
  {
    id: 'ai-digital-human',
    name: 'OPC 数字人直播一体机',
    category: 'ai',
    categoryLabel: 'AI 智富工具',
    emoji: '🤖',
    bgFrom: '#8b5cf6',
    bgTo: '#ec4899',
    tagline: '24h 不停播，1 人 = 1 直播间',
    desc: '集成数字人主播 + AI 脚本 + 自动回复，主理人睡觉也在卖货。',
    highlights: ['日均 GMV ¥3w+', '0 基础开播', '3 分钟完成部署'],
    origin: '深圳·龙华',
    marketingPlan: {
      title: '《一个手机号，撬动 24 小时直播间》',
      hooks: [
        '她靠一台数字人，每天多赚 ¥8000',
        '主理人必备：让 AI 替你值夜班',
        '凌晨 3 点还在下单的，是 AI 数字人',
      ],
      videoScript: [
        '【0:00-0:08 反差】真人主播凌晨下播 vs 数字人继续卖货',
        '【0:08-0:30 真实数据】展示后台 GMV 实时滚动',
        '【0:30-0:55 操作】3 步完成"克隆-脚本-开播"',
        '【0:55-1:00 CTA】"前 100 名送 30 天免费试用"',
      ],
      channels: ['抖音直播', '视频号直播', '小红书短视频', '本地异业合作'],
      cta: '提交需求，免费领取《直播带货 SOP》+ 30 天试用',
    },
  },
  {
    id: 'wuchang-rice',
    name: '五常稻花香 2 号 · 当年新米',
    category: 'agri',
    categoryLabel: '精选农品/食品',
    emoji: '🌾',
    bgFrom: '#f59e0b',
    bgTo: '#ea580c',
    tagline: '黑土地 138 天慢养',
    desc: '黑龙江五常民乐乡直供，单季稻、一季米，0 抛光 0 勾兑。',
    highlights: ['民乐乡核心产区', '农残 195 项检测合格', '48h 鲜磨直发'],
    origin: '黑龙江·五常',
    marketingPlan: {
      title: '《一碗白米饭，能不能让孩子多吃 1 碗？》',
      hooks: [
        '超市 5 块钱的大米，孩子为什么不爱吃？',
        '当过妈妈才懂：白米饭也能吃出幸福感',
        '黑龙江五常原产地直供，从稻田到餐桌 48 小时',
      ],
      videoScript: [
        '【0:00-0:06 钩子】孩子把米饭推到一边',
        '【0:06-0:30 反转】用五常大米蒸的米饭，孩子主动添饭',
        '【0:30-0:55 溯源】实拍稻田、磨米、检测报告',
        '【0:55-1:00 CTA】"拍 2 送 1，48h 直发"',
      ],
      channels: ['小红书母婴号', '视频号家庭号', '抖音直播切片', '本地社区团购'],
      cta: '拍 2 送 1，前 200 名送 1kg 试吃装',
    },
  },
  {
    id: 'wulanchabu-beef',
    name: '乌拉盖草原 · 草饲牛羊肉礼盒',
    category: 'agri',
    categoryLabel: '精选农品/食品',
    emoji: '🥩',
    bgFrom: '#dc2626',
    bgTo: '#b91c1c',
    tagline: '内蒙古乌拉盖原产地',
    desc: '草饲 18 个月、-18°C 冷链直发，年节送礼 / 家庭滋补首选。',
    highlights: ['草饲 18 个月', '顺丰冷链 24h', '持证屠宰检疫'],
    origin: '内蒙古·乌拉盖',
    marketingPlan: {
      title: '《给家人的肉，一定要"看得见"》',
      hooks: [
        '为什么妈妈说"外面的牛羊肉越来越没味"',
        '年节送礼送什么？认准这块"绿标"就够了',
        '乌拉盖草原直供：一口回到小时候',
      ],
      videoScript: [
        '【0:00-0:08 钩子】展示商超冷冻肉 vs 草饲鲜切',
        '【0:08-0:35 溯源】无人机拍乌拉盖草原 + 牧民放羊',
        '【0:35-0:55 烹饪】大厨实操 3 道家常菜',
        '【0:55-1:00 CTA】"礼盒立减 ¥120，加赠卤料包"',
      ],
      channels: ['抖音直播', '视频号中老年号', '小红书美食号', '企业团购定制'],
      cta: '年节礼盒立减 ¥120，前 100 名加赠卤料包',
    },
  },
  {
    id: 'chaoshan-beef-ball',
    name: '潮汕手打牛肉丸 · 顺丰冷链',
    category: 'chaoshan',
    categoryLabel: '潮汕/特色美食',
    emoji: '🍡',
    bgFrom: '#f43f5e',
    bgTo: '#be123c',
    tagline: '非遗传承 · 古法手打',
    desc: '选用黄牛后腿肉，纯手工锤打 30 分钟，0 弹力胶 0 猪肉混掺。',
    highlights: ['古法手打 30 分钟', '黄牛后腿肉 ≥ 95%', '潮汕非遗工艺'],
    origin: '广东·潮州',
    marketingPlan: {
      title: '《一颗牛肉丸，为什么能"打"出百万粉丝？》',
      hooks: [
        '潮汕人带 5 斤牛肉丸上飞机，被空姐追问链接',
        '为什么你买的牛肉丸没有"弹"起来？',
        '一颗牛肉丸的 30 分钟手打全过程',
      ],
      videoScript: [
        '【0:00-0:06 钩子】牛肉丸打在桌面上弹起',
        '【0:06-0:30 工艺】实拍师傅手打 30 分钟',
        '【0:30-0:55 试吃】潮汕人试吃 5 款牛肉丸',
        '【0:55-1:00 CTA】"买 2 送 1，顺丰冷链 24h"',
      ],
      channels: ['抖音美食号', '小红书潮汕文化', '视频号家庭号', '本地火锅店供货'],
      cta: '买 2 送 1，加赠 1 包手打鱼丸',
    },
  },
  {
    id: 'chaoshan-fish-ball',
    name: '潮汕达濠 · 手工鱼丸礼盒',
    category: 'chaoshan',
    categoryLabel: '潮汕/特色美食',
    emoji: '🐟',
    bgFrom: '#fb923c',
    bgTo: '#dc2626',
    tagline: '达濠百年老字号',
    desc: '选用那哥鱼/马鲛鱼鲜打，0 淀粉 0 添加剂，煲汤/打火锅一绝。',
    highlights: ['那哥鱼鲜打', '0 淀粉 0 添加', '达濠老字号工艺'],
    origin: '广东·汕头',
    marketingPlan: {
      title: '《广东妈妈的私房汤，秘密就在这包鱼丸》',
      hooks: [
        '为什么广东人煲汤一定要放"那哥鱼"',
        '孩子不爱吃鱼？试试这颗会"跳舞"的鱼丸',
        '达濠百年老字号，纯鱼肉打出来',
      ],
      videoScript: [
        '【0:00-0:06 钩子】孩子抢着喝鱼丸汤',
        '【0:06-0:30 工艺】实拍达濠老字号打鱼丸',
        '【0:30-0:55 场景】广东妈妈 3 道鱼丸家常菜',
        '【0:55-1:00 CTA】"买 2 送 1，48h 鲜达"',
      ],
      channels: ['小红书广东妈妈号', '抖音家常菜号', '视频号中老年号', '本地餐厅供货'],
      cta: '买 2 送 1，48h 鲜达，加赠 1 包鱼册',
    },
  },
]

// 生成产品占位图（data URL SVG，避免依赖外网）
function productImg(emoji: string, from: string, to: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${from}"/>
        <stop offset="100%" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#g)"/>
    <text x="200" y="248" font-size="180" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

// 智富严选板块专属 AI 营销方案（板块 4 ⚡️ 徽章点击时弹出）
const showcaseProduct: Product = {
  id: 'showcase',
  name: '智富严选 · AI 赋能好物',
  category: 'chaoshan',
  categoryLabel: '实物层 · 智富严选',
  emoji: '🛍️',
  bgFrom: '#7c3aed',
  bgTo: '#ec4899',
  tagline: 'AI 让好物自己会说话',
  desc: '为潮汕美食、特色农品、非遗好物提供 AI 营销方案 + OPC 主理人分销网络。',
  highlights: ['8 大品类', '500+ 款好物', '300+ OPC 主理人', 'AI 一键生成方案'],
  origin: 'OPC 全国供应链',
  marketingPlan: {
    title: '《让一颗潮汕牛肉丸，火遍全国主理人私域》',
    hooks: [
      '为什么同样的牛肉丸，你的只能卖 38 元/斤，他能卖 88 元还复购？',
      '不是产品不行，是没有让对的人讲对的故事',
      'OPC × AI：30 秒生成 50 个主理人专属分销文案',
    ],
    videoScript: [
      '【0:00-0:05 钩子】"一颗牛肉丸，3 句话卖断货"',
      '【0:05-0:20 痛点】传统供应商只会说"好吃"，主理人不知怎么推',
      '【0:20-0:45 方案】AI 自动生成 50 条不同主理人调性的带货文案 + 视频脚本',
      '【0:45-1:00 CTA】"扫码锁定你的 AI 营销方案 + OPC 分销网络"',
    ],
    channels: ['小红书主理人', '抖音探店号', '视频号直播', '微信私域社群', 'OPC 主理人分销网络'],
    cta: '一键提交产品，AI 为你定制方案，48h 内对接 OPC 主理人',
  },
}

export default function ResourcesPage() {
  // 三种发布表单的开关：null 表示全部关闭
  const [openDialog, setOpenDialog] = useState<null | 'demand' | 'supply' | 'partner'>(null)
  // 智富严选板块 ⚡️ 徽章 → 营销方案 Modal
  const [planProduct, setPlanProduct] = useState<Product | null>(null)
  const [copied, setCopied] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <motion.header
        {...fadeUp}
        className="px-4 pt-20 pb-8 bg-gradient-to-b from-slate-900 to-slate-50"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="text-white/80 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <span className="text-white/60 text-sm">返回主页</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">
            OPC 伙伴与赋能生态地图
          </h1>
          <p className="text-slate-400">
            连接顶尖算力、分发渠道与行业圈层，助力一人公司破圈增长
          </p>
        </div>
      </motion.header>

      <motion.section
        {...fadeUp}
        className="px-4 py-8"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="flex items-center gap-2 mb-6">
            <Building2 size={20} className="text-blue-500" />
            <h2 className="text-lg font-bold text-gray-900">基础设施底座</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="relative bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-100 flex flex-col items-center gap-2 hover:shadow-md hover:scale-105 transition-all duration-300"
              >
                {partner.premium && (
                  <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-0.5 text-[10px] font-medium text-white bg-gradient-to-r from-violet-500 to-purple-600 px-1.5 py-0.5 rounded-full shadow-sm">
                    <span aria-hidden>⚡</span>
                    战略合作
                  </span>
                )}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <partner.icon size={24} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        {...fadeUp}
        className="px-4 py-8"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="flex items-center gap-2 mb-6">
            <Rocket size={20} className="text-amber-500" />
            <h2 className="text-lg font-bold text-gray-900">AI 赋能实体经济 · 商业中台</h2>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mb-5 -mt-4">
            流量引进来 · 媒体塑心智 · 资源强承接 · 严选好物落地
          </p>

          {/* 2x2 网格：4 个商业板块 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {businessSections.map((section) => {
              const Icon = section.icon
              return (
                <div
                  key={section.id}
                  className={`relative ${section.color} border-2 rounded-2xl p-5 hover:shadow-md hover:scale-[1.01] transition-all duration-300 overflow-hidden`}
                >
                  {/* 板块徽章（智富严选专属 ⚡️ AI 营销方案） */}
                  {section.hasAiPlan && (
                    <button
                      onClick={() => setPlanProduct(showcaseProduct)}
                      className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 text-[10px] font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-2.5 py-1 rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                      <Zap size={10} fill="currentColor" />
                      <span>AI 营销方案</span>
                    </button>
                  )}

                  {/* 板块标题区 */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-xl ${section.iconBg} flex items-center justify-center shadow-sm`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-[10px] font-semibold ${section.layerColor} px-1.5 py-0.5 rounded`}>
                          {section.layer}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight">
                        {section.title}
                      </h3>
                    </div>
                  </div>

                  {/* 描述 */}
                  <p className="text-xs md:text-sm text-gray-600 mb-4 leading-relaxed">
                    {section.desc}
                  </p>

                  {/* 标签列表 */}
                  <div className="flex flex-wrap gap-1.5">
                    {section.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[11px] text-gray-700 bg-white/70 hover:bg-white border border-white/60 rounded-full px-2.5 py-1 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 底部大横幅：入驻入口 */}
          <div
            onClick={() => setOpenDialog('partner')}
            className="cursor-pointer relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-rose-500 rounded-2xl p-6 md:p-7 text-white shadow-xl hover:shadow-2xl hover:scale-[1.005] active:scale-[0.99] transition-all"
          >
            {/* 装饰光斑 */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -right-4 -bottom-10 w-40 h-40 bg-white/5 rounded-full" />
            <div className="absolute left-1/2 top-0 w-px h-full bg-white/10" />

            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="text-4xl md:text-5xl">🌾</div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5 mb-2">
                  <Sparkles size={11} />
                  OPC 供应链入驻
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-1.5 leading-tight">
                  您是优质农品 / 实体供应商？
                </h3>
                <p className="text-sm text-white/90 leading-relaxed">
                  点击提交，AI 为你定制营销，OPC 帮你对接渠道
                </p>
              </div>
              <div className="inline-flex items-center gap-2 text-sm md:text-base font-semibold bg-white text-violet-600 px-5 py-2.5 rounded-xl shadow-lg hover:scale-105 transition-transform whitespace-nowrap">
                一键提交入驻
                <span>→</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        {...fadeUp}
        className="px-4 py-8"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Handshake size={20} className="text-purple-500" />
              <h2 className="text-lg font-bold text-gray-900">OPC 内部供需广场</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpenDialog('demand')}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors active:scale-95"
              >
                发布需求
              </button>
              <button
                onClick={() => setOpenDialog('supply')}
                className="px-3 py-1.5 text-sm font-medium text-purple-600 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors active:scale-95"
              >
                发布资源
              </button>
            </div>
          </div>

          {/* AI 智能供需匹配 */}
          <div className="mb-6">
            <AIMatchmakerWidget compact />
          </div>

          <div className="space-y-4">
            {supplyDemand.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.tagColor}`}>
                      {item.tag}
                    </span>
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar size={12} />
                    <span>{item.time}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        {...fadeUp}
        className="px-4 py-8 pb-20"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Users size={24} />
              <h2 className="text-xl font-bold">成为我们的生态伙伴</h2>
            </div>
            <p className="text-white/80 mb-6">
              如果你是优质AI/算力/渠道服务商，欢迎与我们建立合作，共同构建一人公司的AI商业操作系统。
            </p>
            <button
              onClick={() => setOpenDialog('partner')}
              className="w-full py-3 rounded-xl font-medium text-blue-600 bg-white hover:bg-gray-50 active:scale-[0.98] transition-all shadow-lg"
            >
              提交合作意向
            </button>
          </div>
        </div>
      </motion.section>

      {/* 三类发布表单共用一个 Dialog 组件，按 openDialog 切换内容 */}
      <PublishDialog
        type={openDialog}
        onClose={() => setOpenDialog(null)}
      />

      {/* AI 营销方案预览 Modal */}
      <MarketingPlanModal
        product={planProduct}
        onClose={() => {
          setPlanProduct(null)
          setCopied(false)
        }}
        copied={copied}
        onCopy={async (text) => {
          try {
            if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(text)
            } else {
              // 兜底：旧浏览器或非 https
              const ta = document.createElement('textarea')
              ta.value = text
              ta.style.position = 'fixed'
              ta.style.opacity = '0'
              document.body.appendChild(ta)
              ta.select()
              document.execCommand('copy')
              document.body.removeChild(ta)
            }
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          } catch (e) {
            console.error('复制失败:', e)
          }
        }}
      />
    </div>
  )
}

// ─── 通用发布表单 Dialog ───
type DialogType = 'demand' | 'supply' | 'partner' | null

const DIALOG_META: Record<Exclude<DialogType, null>, { title: string; emoji: string; gradient: string; submitText: string }> = {
  demand: {
    title: '发布需求',
    emoji: '🛒',
    gradient: 'from-blue-500 to-indigo-600',
    submitText: '立即发布',
  },
  supply: {
    title: '发布资源',
    emoji: '🎁',
    gradient: 'from-purple-500 to-fuchsia-600',
    submitText: '立即发布',
  },
  partner: {
    title: '提交合作意向',
    emoji: '🤝',
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    submitText: '提交合作意向',
  },
}

function PublishDialog({ type, onClose }: { type: DialogType; onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ name: '', contact: '', title: '', content: '' })

  // 切换 type 或关闭时重置状态
  const close = () => {
    onClose()
    setTimeout(() => {
      setSuccess(false)
      setForm({ name: '', contact: '', title: '', content: '' })
    }, 200)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    // 模拟异步提交
    setTimeout(() => {
      setSubmitting(false)
      setSuccess(true)
    }, 700)
  }

  return (
    <AnimatePresence>
      {type && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4"
          onClick={close}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部彩色横幅 */}
            <div className={`relative bg-gradient-to-r ${DIALOG_META[type].gradient} text-white px-6 pt-6 pb-8`}>
              <button
                onClick={close}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="关闭"
              >
                <X size={16} />
              </button>
              <div className="text-3xl mb-2">{DIALOG_META[type].emoji}</div>
              <h3 className="text-xl font-bold">{DIALOG_META[type].title}</h3>
              <p className="text-xs text-white/80 mt-1">填写后我们会在 24 小时内联系你</p>
            </div>

            {/* 表单 / 成功状态 */}
            {success ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">提交成功！</h4>
                <p className="text-sm text-slate-600 mb-6">
                  我们的运营团队会尽快审核并联系你。
                </p>
                <button
                  onClick={close}
                  className="w-full py-3 rounded-xl font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  好的
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <Field
                  icon={<User size={14} />}
                  label="你的称呼"
                  placeholder="请输入姓名 / 网名"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  required
                />
                <Field
                  icon={<Phone size={14} />}
                  label="联系方式"
                  placeholder="微信号 / 手机号 / 邮箱"
                  value={form.contact}
                  onChange={(v) => setForm({ ...form, contact: v })}
                  required
                />
                {type === 'demand' || type === 'supply' ? (
                  <Field
                    icon={<TagIcon size={14} />}
                    label="标题"
                    placeholder="一句话描述你的需求 / 资源"
                    value={form.title}
                    onChange={(v) => setForm({ ...form, title: v })}
                    required
                  />
                ) : null}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
                    <FileText size={14} />
                    详细描述
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder={
                      type === 'partner'
                        ? '介绍下你公司的业务、可提供的资源、期望合作的方向…'
                        : '越具体越容易匹配到合适的对象（预算、时间、当前进度等）'
                    }
                    required
                    rows={4}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r ${DIALOG_META[type].gradient} hover:scale-[1.01] active:scale-[0.99] transition-transform shadow-lg flex items-center justify-center gap-2 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      提交中…
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      {DIALOG_META[type].submitText}
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 text-center">
                  提交即表示同意《OPC 用户协议》和《隐私政策》
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({
  icon, label, placeholder, value, onChange, required,
}: {
  icon: React.ReactNode
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
        {icon}
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
      />
    </div>
  )
}

// ─── AI 营销方案预览 Modal ───
function MarketingPlanModal({
  product, onClose, copied, onCopy,
}: {
  product: Product | null
  onClose: () => void
  copied: boolean
  onCopy: (text: string) => void
}) {
  const fullText = product
    ? `【${product.name}】AI 营销方案\n\n主题：${product.marketingPlan.title}\n\n🎯 3 个爆款钩子：\n${product.marketingPlan.hooks.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n\n🎬 60s 视频脚本：\n${product.marketingPlan.videoScript.join('\n')}\n\n📢 投放渠道：${product.marketingPlan.channels.join(' / ')}\n\n💡 行动号召：${product.marketingPlan.cta}\n\n—— 由 OPC 智富严选 AI 自动生成`
    : ''

  return (
    <AnimatePresence>
      {product && (
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
            className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部渐变横幅（产品色） */}
            <div
              className="relative px-6 pt-6 pb-5 text-white"
              style={{
                background: `linear-gradient(135deg, ${product.bgFrom} 0%, ${product.bgTo} 100%)`,
              }}
            >
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="关闭"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-4xl">{product.emoji}</div>
                <div>
                  <div className="text-[11px] text-white/80 mb-0.5">{product.categoryLabel}</div>
                  <h3 className="text-lg font-bold leading-tight">{product.name}</h3>
                </div>
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                <Sparkles size={11} />
                AI 自动生成的营销方案
              </div>
            </div>

            {/* 方案正文（可滚动） */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
              <Section title="📌 方案主题" tone="violet">
                <p className="text-sm font-semibold text-slate-800">{product.marketingPlan.title}</p>
              </Section>

              <Section title="🎯 3 个爆款钩子（任选其一）" tone="rose">
                <ol className="text-sm text-slate-700 space-y-1.5 list-decimal pl-5 marker:text-rose-500 marker:font-bold">
                  {product.marketingPlan.hooks.map((h, i) => (
                    <li key={i} className="leading-relaxed">{h}</li>
                  ))}
                </ol>
              </Section>

              <Section title="🎬 60s 短视频脚本框架" tone="blue">
                <div className="space-y-1.5">
                  {product.marketingPlan.videoScript.map((line, i) => (
                    <div
                      key={i}
                      className="text-xs text-slate-700 bg-white rounded-lg border border-slate-100 px-2.5 py-1.5 font-mono leading-relaxed"
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="📢 投放渠道" tone="amber">
                <div className="flex flex-wrap gap-1.5">
                  {product.marketingPlan.channels.map((c, i) => (
                    <span
                      key={i}
                      className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-0.5"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </Section>

              <Section title="💡 行动号召（CTA）" tone="emerald">
                <p className="text-sm text-emerald-700 font-medium leading-relaxed">
                  {product.marketingPlan.cta}
                </p>
              </Section>
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
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all active:scale-95 ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-md'
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
                    复制方案
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

// 子组件：方案分区块
function Section({ title, tone, children }: { title: string; tone: 'violet' | 'rose' | 'blue' | 'amber' | 'emerald'; children: React.ReactNode }) {
  const toneMap: Record<typeof tone, string> = {
    violet: 'bg-violet-50/60 border-violet-100',
    rose: 'bg-rose-50/60 border-rose-100',
    blue: 'bg-blue-50/60 border-blue-100',
    amber: 'bg-amber-50/60 border-amber-100',
    emerald: 'bg-emerald-50/60 border-emerald-100',
  }
  return (
    <div className={`rounded-2xl border p-3.5 ${toneMap[tone]}`}>
      <div className="text-[11px] font-bold text-slate-700 mb-2 tracking-wide">{title}</div>
      {children}
    </div>
  )
}