'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAudio } from '@/hooks/useAudio'
import {
  Clock,
  MapPin,
  Users,
  Brain,
  Wrench,
  Wallet,
  User,
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle2,
} from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const mentors = [
  {
    name: '陈默',
    title: 'AI商业战略专家',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20business%20man%20portrait%20headshot%20confident%20smile&image_size=square',
    stats: ['助力 500+ 企业', '单个项目降本 30%', 'AI变现顾问'],
    quote: 'AI不是取代人，而是让每个人都拥有一支军队',
  },
  {
    name: '林薇',
    title: '内容增长操盘手',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20business%20woman%20portrait%20headshot%20confident%20smile&image_size=square',
    stats: ['操盘GMV 10亿+', '小红书涨粉百万', '内容变现导师'],
    quote: '好内容自带流量，AI让好内容量产',
  },
  {
    name: '张野',
    title: '数据驱动专家',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20tech%20man%20portrait%20headshot%20smart%20glasses&image_size=square',
    stats: ['流量ROI提升 200%', '数据看板搭建', '增长黑客'],
    quote: '没有数据的决策，都是赌博',
  },
  {
    name: '王澜',
    title: 'AI工具应用导师',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20creative%20woman%20portrait%20headshot%20modern%20style&image_size=square',
    stats: ['培训 1000+ 学员', 'AI工具矩阵搭建', '效率专家'],
    quote: '工具的差距，就是效率的差距',
  },
]

const agenda = [
  {
    time: '13:30',
    title: '签到入场',
    desc: '领取资料包，自由交流',
    icon: Users,
  },
  {
    time: '14:00',
    title: '商业认知破局',
    desc: '直击老板获客贵、人力成本高的痛点，AI如何重构商业模式',
    icon: Brain,
    duration: '1小时',
  },
  {
    time: '15:00',
    title: 'AI工具实操演示',
    desc: '现场演示AI图文生成、AI数字人直播，即时产出可落地内容',
    icon: Wrench,
    duration: '1小时',
  },
  {
    time: '16:15',
    title: '变现闭环发布',
    desc: '带走AI电商/自媒体的落地赚钱项目，现场对接资源',
    icon: Wallet,
    duration: '45分钟',
  },
  {
    time: '17:00',
    title: '合影留念',
    desc: '自由交流，扫码入群',
    icon: Users,
  },
]

const galleryImages = [
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=business%20seminar%20audience%20taking%20notes%20modern%20conference%20room&image_size=landscape_16_9',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20workshop%20hands%20on%20laptops%20collaborative%20learning&image_size=landscape_16_9',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=business%20networking%20coffee%20break%20professional%20event&image_size=landscape_16_9',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=speaker%20presenting%20on%20stage%20with%20AI%20visuals%20modern&image_size=landscape_16_9',
]

export default function SalonPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const { playSound, playTTS } = useAudio()

  const handleSignup = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/pay/salon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 99 }),
      })
      const data = await response.json()
      if (data.success) {
        setSubmitSuccess(true)
        // 金币音效 + 语音播报成功
        playSound('/sounds/coin.wav')
        playTTS('报名成功，请准时到场。')
        setTimeout(() => {
          setSubmitSuccess(false)
          setIsSubmitting(false)
        }, 3000)
      }
    } catch (error) {
      console.error('报名失败:', error)
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
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1 mb-4">
            <MapPin size={14} className="text-blue-400" />
            <span className="text-xs text-slate-300">深圳·讯美广场 线下公开课</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            AI商业落地与变现
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              4小时实战公开课
            </span>
          </h1>

          <p className="text-slate-400 text-lg mb-6">
            不讲技术原理，只讲降本、提效、搞钱
          </p>

          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm text-white">
              <Clock size={16} />
              7月20日 13:30
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm text-white">
              <MapPin size={16} />
              讯美广场12楼·中科院会议室
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm text-white">
              <Users size={16} />
              限50席
            </span>
          </div>
        </div>
      </motion.header>

      <motion.section
        {...fadeUp}
        className="px-4 py-8"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            三重核心收获
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border-l-4 border-blue-500">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Brain size={24} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">🧠 认知破局</h3>
                  <p className="text-slate-600 text-sm">
                    直击老板获客贵、人力成本高的痛点，用AI视角重新审视商业本质
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border-l-4 border-purple-500">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Wrench size={24} className="text-purple-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">🧰 工具实操</h3>
                  <p className="text-slate-600 text-sm">
                    现场演示AI图文生成、AI数字人直播，即时产出可落地的内容成果
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border-l-4 border-green-500">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Wallet size={24} className="text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">💰 变现闭环</h3>
                  <p className="text-slate-600 text-sm">
                    带走AI电商/自媒体的落地赚钱项目，现场完成首单变现规划
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        {...fadeUp}
        className="px-4 py-8 bg-white"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">导师阵容</h2>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide -mx-4 px-4">
            {mentors.map((mentor, index) => (
              <div
                key={index}
                className="snap-center flex-shrink-0 w-64 bg-slate-50 rounded-2xl p-5"
              >
                <div className="relative mb-4">
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-20 h-20 rounded-full mx-auto object-cover ring-4 ring-white shadow-lg"
                  />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {mentor.title}
                  </div>
                </div>

                <h3 className="text-center font-bold text-gray-900 text-lg">{mentor.name}</h3>

                <div className="mt-4 space-y-2">
                  {mentor.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="flex items-center gap-2 text-sm">
                      <Star size={14} className="text-amber-400" />
                      <span className="text-gray-600">{stat}</span>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-xs text-gray-500 italic border-l-2 border-gray-200 pl-3">
                  "{mentor.quote}"
                </p>
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
          <h2 className="text-xl font-bold text-gray-900 mb-6">活动议程</h2>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500" />

            <div className="space-y-6">
              {agenda.map((item, index) => (
                <div key={index} className="relative flex gap-4">
                  <div className="relative z-10 w-12 h-12 rounded-full bg-white border-4 border-blue-500 flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} className="text-blue-500" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{item.time}</span>
                      {item.duration && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          {item.duration}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        {...fadeUp}
        className="px-4 py-8 bg-white"
      >
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">往期高光回顾</h2>

          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide -mx-4 px-4">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-64 rounded-2xl overflow-hidden relative group"
              >
                <img
                  src={image}
                  alt={`往期活动 ${index + 1}`}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play size={32} className="text-white" />
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
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔥</span>
              <span className="text-sm font-medium opacity-80">限时早鸟价</span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold">99</span>
              <span className="text-lg">元</span>
              <span className="text-sm opacity-70 line-through ml-2">原价 299元</span>
            </div>

            <p className="text-white/80 mb-6">
              门票费全额抵扣现场任意OPC服务/产品费用，相当于免费参加
            </p>

            <button
              onClick={handleSignup}
              disabled={isSubmitting || submitSuccess}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                submitSuccess
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-blue-600 hover:bg-gray-50 hover:scale-105'
              } shadow-lg`}
            >
              {submitSuccess ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 size={20} />
                  报名成功！
                </span>
              ) : isSubmitting ? (
                '提交中...'
              ) : (
                '立即报名'
              )}
            </button>
          </div>
        </div>
      </motion.section>

      <footer className="px-4 py-8 bg-slate-900 text-white">
        <div className="max-w-lg mx-auto md:max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-xl font-bold">OPC</span>
              </div>
              <div>
                <h3 className="font-bold">良朋社 OPC</h3>
                <p className="text-xs text-gray-400">一人公司 × AI 商业操作系统</p>
              </div>
            </div>
            <div className="text-sm text-gray-400 text-center md:text-right">
              <p>主办方：良朋社 OPC 商业社区</p>
              <p className="text-xs mt-1">咨询热线：400-888-9999</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}