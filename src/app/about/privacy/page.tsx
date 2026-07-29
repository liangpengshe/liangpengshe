'use client'

import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'
import ClientLayout from '@/components/ClientLayout'

export default function PrivacyPage() {
  return (
    <ClientLayout>
      <div className="min-h-screen bg-slate-50 px-5 py-8">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-4 transition-colors"
          >
            <ArrowLeft size={14} />
            返回首页
          </Link>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={20} className="text-blue-500" />
              <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600">
                隐私政策
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-3">
              隐私政策
            </h1>
            <p className="text-xs text-slate-400 mb-6">
              最后更新：2026 年 7 月
            </p>

            <div className="prose prose-sm max-w-none text-slate-700 space-y-4 leading-relaxed">
              <section>
                <h2 className="text-base font-bold text-slate-900 mb-2">1. 我们收集的信息</h2>
                <p>
                  良朋社 OPC（以下简称"我们"）仅收集为您提供服务所必需的最少信息：
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>手机号</strong>：用于登录验证、订单通知、会员身份识别</li>
                  <li><strong>学习进度</strong>：如 OPC 类型、学习分数，用于个性化推荐</li>
                  <li><strong>投稿内容</strong>：您主动提交的资源投稿（公开展示）</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-bold text-slate-900 mb-2">2. 信息使用范围</h2>
                <p>
                  我们承诺：您的个人信息仅用于平台内服务交付，<strong>绝不出售给任何第三方</strong>。
                  不会用于电话骚扰、短信营销等任何形式的商业转售。
                </p>
              </section>

              <section>
                <h2 className="text-base font-bold text-slate-900 mb-2">3. 您的权利</h2>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>随时查看、更正、删除您的个人信息</li>
                  <li>导出您的投稿内容与学习记录</li>
                  <li>注销账户后 30 天内彻底删除所有数据</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-bold text-slate-900 mb-2">4. 联系我们</h2>
                <p>
                  如有隐私相关问题，请通过 <Link href="/contact" className="text-blue-600 hover:underline">联系我们</Link> 页面提交反馈，我们会在 3 个工作日内回复。
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  )
}
