'use client'

import { useState } from 'react'
import ClientLayout from '@/components/ClientLayout'

export default function PartnerPage() {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    phone: '',
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setIsSubmitted(true)
      } else {
        setErrorMessage(data.error || '提交失败，请稍后重试')
      }
    } catch (error) {
      console.error('提交失败:', error)
      setErrorMessage('网络异常，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const benefits = [
    {
      icon: '🏷️',
      title: '品牌授权',
      description: '获得良朋社OPC品牌授权，共享全国品牌影响力',
    },
    {
      icon: '📋',
      title: '标准化沙龙SOP',
      description: '完整的线下沙龙运营流程，一键复制成功经验',
    },
    {
      icon: '🤖',
      title: 'AI工具库',
      description: '独家AI工具资源，赋能本地企业数字化转型',
    },
    {
      icon: '👥',
      title: '落地陪跑系统',
      description: '总部团队全程陪跑，确保城市业务顺利启动',
    },
  ]

  return (
    <ClientLayout>
      <div className="min-h-screen bg-slate-50">
        <section className="px-5 py-12 bg-gradient-to-br from-blue-600 to-indigo-700">
          <div className="text-center text-white">
            <div className="text-4xl mb-4">🤝</div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4">
              携手共赢：良朋社OPC全国城市合伙人招募
            </h1>
            <p className="text-blue-100 max-w-md mx-auto">
              我们在深圳跑通了AI商业落地的全链路闭环，现面向全国招募合伙人，提供品牌授权、标准化沙龙SOP、AI工具库和落地陪跑系统。
            </p>
          </div>
        </section>

        <section className="px-5 py-12">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">合作权益</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
              >
                <div className="text-3xl mb-3">{benefit.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 py-12 bg-blue-50">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">申请成为城市合伙人</h2>
          <p className="text-gray-600 text-center mb-8 text-sm">
            填写以下信息，我们的招商团队将在24小时内与您联系
          </p>

          {isSubmitted ? (
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">申请已提交！</h3>
              <p className="text-gray-600">
                申请已提交，工作人员将在1个工作日内联系您
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入您的姓名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    意向城市 <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <option value="other">其他城市</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    联系方式 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入手机号码"
                  />
                </div>

                {errorMessage && (
                  <div className="text-red-500 text-sm">{errorMessage}</div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {isSubmitting ? '提交中...' : '提交意向申请'}
              </button>
            </form>
          )}
        </section>

        <section className="px-5 py-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-center">联系我们</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg mb-1">📞</div>
                <p className="text-sm text-gray-600">招商热线</p>
                <p className="font-medium text-gray-900">400-888-OPC</p>
              </div>
              <div>
                <div className="text-lg mb-1">📧</div>
                <p className="text-sm text-gray-600">邮箱</p>
                <p className="font-medium text-gray-900">partner@liangpengshe.com</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ClientLayout>
  )
}