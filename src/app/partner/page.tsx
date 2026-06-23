'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin,
  Building2,
  DollarSign,
  Award,
  FileText,
  Bot,
  Users,
  ArrowRight,
  CheckCircle2,
  User,
  Smartphone,
} from 'lucide-react'
import Link from 'next/link'
import AIMatchmakerWidget from '@/components/AIMatchmakerWidget'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const stats = [
  {
    icon: MapPin,
    value: '5 场',
    label: '成功举办线下沙龙',
  },
  {
    icon: Building2,
    value: '70+ 家',
    label: '累计服务企业',
  },
  {
    icon: DollarSign,
    value: '300 万+',
    label: '帮助客户节省成本',
  },
]

const benefits = [
  {
    icon: Award,
    title: '品牌授权与背书',
    desc: '共享良朋社 OPC 品牌，中科院中科创科学院背书资源，提升本地影响力',
    color: 'border-blue-500',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    icon: FileText,
    title: '标准化沙龙 SOP',
    desc: '总部提供邀约、PPT、现场流程等整套执行文档，一键复制成功经验',
    color: 'border-purple-500',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
  },
  {
    icon: Bot,
    title: '全套 AI 工具库',
    desc: '开放内部自研工具（豹纹工坊、灵犀AI、先锋派数字人等），赋能本地企业',
    color: 'border-green-500',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-500',
  },
  {
    icon: Users,
    title: '深度陪跑与内训',
    desc: '总部提供 1v1 陪跑，协助本地第一场沙龙落地，全程保驾护航',
    color: 'border-amber-500',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
  },
]

export default function PartnerPage() {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    contact: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          city: formData.city,
          phone: formData.contact,
        }),
      })
      const data = await response.json()

      if (data.success) {
        setIsSubmitted(true)
        setFormData({ name: '', city: '', contact: '' })
      } else {
        setErrorMessage(data.error || '提交失败，请稍后重试')
      }
    } catch {
      setErrorMessage('网络异常，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <motion.header
        {...fadeUp}
        className="px-4 pt-20 pb-8 bg-gradient-to-b from-slate-900 to-slate-50"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="text-white/80 hover:text-white transition-colors text-sm">
              返回首页
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">
            携手共赢：良朋社 OPC 全国城市合伙人招募
          </h1>

          <p className="text-slate-400 text-lg mb-6">
            我们在深圳跑通了 AI 商业落地的全链路闭环，现面向全国招募城市合伙人。
          </p>

          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
              >
                <stat.icon size={20} className="mx-auto mb-2 text-blue-400" />
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.header>

      <motion.section
        {...fadeUp}
        className="px-4 py-8"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            合作模式与权益
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border-t-4 ${benefit.color}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${benefit.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <benefit.icon size={24} className={benefit.iconColor} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-slate-600 text-sm">{benefit.desc}</p>
                  </div>
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
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            加入我们，成为 OPC 城市主理人
          </h2>

          {isSubmitted ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                提交成功！
              </h3>
              <p className="text-slate-600 mb-4">
                您的合作意向已提交，我们将在 24 小时内与您联系。
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                继续提交其他城市
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    姓名
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="请输入您的姓名"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    意向城市
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">请选择意向城市</option>
                      <option value="beijing">北京</option>
                      <option value="shanghai">上海</option>
                      <option value="guangzhou">广州</option>
                      <option value="hangzhou">杭州</option>
                      <option value="chengdu">成都</option>
                      <option value="wuhan">武汉</option>
                      <option value="nanjing">南京</option>
                      <option value="shenzhen">深圳</option>
                      <option value="xian">西安</option>
                      <option value="chongqing">重庆</option>
                      <option value="tianjin">天津</option>
                      <option value="other">其他城市</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    微信号/手机号
                  </label>
                  <div className="relative">
                    <Smartphone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      placeholder="请输入微信号或手机号"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                    {errorMessage}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  '提交中...'
                ) : (
                  <>
                    提交合作意向
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.section>

      {/* AI 智能供需匹配模块 */}
      <section className="px-4 py-12">
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <AIMatchmakerWidget defaultCity="" />
        </div>
      </section>

      <footer className="px-4 py-8 bg-slate-900 text-white">
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-lg font-bold">OPC</span>
              </div>
              <div>
                <h3 className="font-bold">良朋社 OPC</h3>
                <p className="text-xs text-gray-400">一人公司 × AI 商业操作系统</p>
              </div>
            </div>
            <div className="text-sm text-gray-400 md:border-l md:border-gray-700 md:pl-4">
              <p>主办方：良朋社 OPC / 中科院中科创科学院</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}