'use client'

import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import ClientLayout from '@/components/ClientLayout'

export default function TermsPage() {
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
              <FileText size={20} className="text-blue-500" />
              <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600">
                服务条款
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-3">
              服务条款
            </h1>
            <p className="text-xs text-slate-400 mb-6">
              最后更新：2026 年 7 月
            </p>

            <div className="prose prose-sm max-w-none text-slate-700 space-y-4 leading-relaxed">
              <section>
                <h2 className="text-base font-bold text-slate-900 mb-2">1. 服务说明</h2>
                <p>
                  良朋社 OPC 是一套面向"一人公司（OPC）"创业者的 AI 智富操作系统，提供以下服务：
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>AI 智富诊断（19.9 元付费 1v1 咨询）</li>
                  <li>学习路径（SOP 任务 + 积分闯关）</li>
                  <li>工具库 / 项目库 / 资源库 内容浏览</li>
                  <li>会员订阅（月度 69 元 / 年度 199 元）</li>
                  <li>深度陪跑（1980 元 / 年）和城市主理人合作（5980 元）</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-bold text-slate-900 mb-2">2. 用户行为规范</h2>
                <p>您承诺不在平台上从事以下行为：</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>发布虚假、侵权、违规内容</li>
                  <li>恶意刷量、滥用免费资源</li>
                  <li>违反国家法律法规的行为</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-bold text-slate-900 mb-2">3. 退款政策</h2>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>诊断服务</strong>：未消费可在 24 小时内申请退款</li>
                  <li><strong>会员订阅</strong>：7 天内未使用核心功能可全额退款</li>
                  <li><strong>深度陪跑 / 城市主理人</strong>：详见具体服务协议</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-bold text-slate-900 mb-2">4. 免责说明</h2>
                <p>
                  平台提供的所有内容（AI 诊断建议、工具推荐、SOP 流程）仅供参考，
                  <strong>不构成任何投资或经营承诺</strong>。商业决策由您自行判断并承担相应责任。
                </p>
              </section>

              <section>
                <h2 className="text-base font-bold text-slate-900 mb-2">5. 争议解决</h2>
                <p>
                  如发生服务争议，请优先通过 <Link href="/contact" className="text-blue-600 hover:underline">客服通道</Link> 协商；
                  协商不成的，提交平台运营方所在地有管辖权的人民法院诉讼解决。
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  )
}
