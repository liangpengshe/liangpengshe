'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Rocket,
  Shield,
  Gift,
  Radio,
  Users,
  Briefcase,
  Handshake,
  Calendar,
  Building2,
  Cloud,
  Sparkles,
} from 'lucide-react'
import AIMatchmakerWidget from '@/components/AIMatchmakerWidget'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const partners = [
  { name: '硅基流动', icon: Cloud },
  { name: '智谱AI', icon: Sparkles },
  { name: '阿里云', icon: Building2 },
  { name: '腾讯云', icon: Building2 },
  { name: 'Dify', icon: Sparkles },
  { name: 'Midjourney', icon: Sparkles },
]

const channels = [
  {
    icon: Rocket,
    title: '流量获取',
    subtitle: '多平台矩阵运营',
    links: ['抖音', '小红书', '腾讯视频号', '亚马逊'],
    color: 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100',
    iconColor: 'text-orange-500',
  },
  {
    icon: Shield,
    title: '圈层合作',
    subtitle: '优质商会资源',
    links: ['南山企服中心', '跨境电商协会', '地方商会'],
    color: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100',
    iconColor: 'text-blue-500',
  },
  {
    icon: Gift,
    title: '优质产品',
    subtitle: 'AI工具与SaaS',
    links: ['AI工具', 'SaaS插件', '免版税素材库'],
    color: 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100',
    iconColor: 'text-purple-500',
  },
  {
    icon: Radio,
    title: '媒体矩阵',
    subtitle: '科技与商业媒体',
    links: ['36氪', '科技媒体', '本地创业号'],
    color: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100',
    iconColor: 'text-green-500',
  },
]

const supplyDemand = [
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
    tagColor: 'bg-green-100 text-green-700',
    title: '寻求GEO全域增长陪跑服务',
    time: '5小时前',
    desc: '跨境电商卖家，希望学习AI驱动的全域增长策略，提升海外市场竞争力。',
  },
  {
    id: '3',
    tag: '找合作',
    tagColor: 'bg-purple-100 text-purple-700',
    title: 'AI法律咨询工具寻求渠道合作',
    time: '1天前',
    desc: '自研AI法律助手工具，寻求律所、企业服务平台等渠道合作伙伴。',
  },
]

export default function ResourcesPage() {
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

          <div className="flex flex-wrap justify-center gap-4">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-100 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
              >
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
            <h2 className="text-lg font-bold text-gray-900">增长与分发通道</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channels.map((channel, index) => (
              <div
                key={index}
                className={`${channel.color} border rounded-2xl p-5 hover:shadow-md transition-all duration-300`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm`}>
                    <channel.icon size={20} className={channel.iconColor} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{channel.title}</h3>
                    <p className="text-xs text-gray-500">{channel.subtitle}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {channel.links.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href="#"
                      className="text-xs bg-white/60 hover:bg-white px-2.5 py-1 rounded-full text-gray-700 transition-colors"
                    >
                      {link}
                    </a>
                  ))}
                </div>
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Handshake size={20} className="text-purple-500" />
              <h2 className="text-lg font-bold text-gray-900">OPC 内部供需广场</h2>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                发布需求
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-purple-600 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
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
            <button className="w-full py-3 rounded-xl font-medium text-blue-600 bg-white hover:bg-gray-50 transition-colors shadow-lg">
              提交合作意向
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  )
}