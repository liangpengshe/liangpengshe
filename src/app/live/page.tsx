'use client'

import Link from 'next/link'
import { ArrowRight, Radio, Calendar, Sparkles, Users, Bell, PlayCircle, CheckCircle2 } from 'lucide-react'
import ClientLayout from '@/components/ClientLayout'

/**
 * 良朋社 OPC · 线上直播公开课（占位页）
 *
 * 设计定位：
 *   - 首期 / 预告 状态，引导扫码预约 / 添加客服
 *   - 与 /salon 线下沙龙形成"线上为主 · 线下为辅"的入口关系
 *   - 后续可接入第三方直播 SDK（视频号 / 抖音直播 / 自建 OBS）
 *
 * 冷启动期策略：
 *   - 不夸大在线人数
 *   - 文案围绕"首期 / 预约 / 提前进群"展开
 */
export default function LivePage() {
  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pb-20">
        {/* ════════ Hero ════════ */}
        <section className="relative overflow-hidden border-b border-amber-100">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-16">
            <div className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold mb-4">
              <Radio size={12} className="animate-pulse" />
              直播预告 · 首期公开课
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              📺 良朋社 OPC · 线上直播公开课
            </h1>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl">
              <strong className="text-amber-700">把"AI + 生意"讲明白。</strong>
              <br className="hidden md:block" />
              每周一场 · 主题式实操 · 直播间连麦答疑。
            </p>

            {/* 直播状态卡片 */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm border border-amber-200/60 p-5 md:p-6 max-w-2xl">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
                  <PlayCircle size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-extrabold text-slate-900">首期预告</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      即将开播
                    </span>
                  </div>
                  <h2 className="mt-1.5 text-sm md:text-base font-extrabold text-slate-800">
                    主题一：把"生意"做成"资产"——AI 数字店群从 0 到 1
                  </h2>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={11} />
                      周三 20:00
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users size={11} />
                      内测预约中
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Bell size={11} />
                      开播前 30 分钟提醒
                    </span>
                  </div>
                </div>
              </div>

              {/* 主 CTA */}
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold py-3 px-5 rounded-xl shadow-md shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99] transition-transform text-sm"
                  data-testid="live-reserve-btn"
                >
                  <Bell size={14} />
                  预约提醒（添加客服）
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-bold py-3 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm"
                >
                  回首页
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ════════ 直播课表（预告） ════════ */}
        <section className="max-w-4xl mx-auto px-4 pt-8 md:pt-12">
          <div className="flex items-center gap-2 px-1 mb-4">
            <Sparkles size={16} className="text-amber-600" />
            <h2 className="text-base md:text-lg font-extrabold text-slate-900">近期直播排期</h2>
            <span className="text-[10px] text-slate-500 ml-1">（持续更新中）</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                tag: '首期',
                tone: 'bg-rose-100 text-rose-700',
                title: '把生意做成资产：AI 数字店群从 0 到 1',
                meta: '周三 20:00 · 主理人亲讲',
                desc: '选品 / 上架 / 客服 / 复购全流程，附实操 SOP。',
              },
              {
                tag: '预告',
                tone: 'bg-blue-100 text-blue-700',
                title: 'AI 自媒体矩阵 · 30 天冷启动',
                meta: '下周二 20:00',
                desc: '从定位到变现，5 步走完一轮闭环。',
              },
              {
                tag: '预告',
                tone: 'bg-violet-100 text-violet-700',
                title: '城市主理人 · 0 库存联运',
                meta: '下周四 20:00',
                desc: '本地化运营 + 总部 SOP 物料，分站系统如何赚钱。',
              },
              {
                tag: '回放',
                tone: 'bg-slate-100 text-slate-600',
                title: '《OPC 智富思维》双引擎总览',
                meta: '已上线 · 限时回看',
                desc: '交易型 + 流量型双引擎底层逻辑一次讲透。',
              },
            ].map((s, i) => (
              <article
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-full ${s.tone}`}
                  >
                    {s.tag}
                  </span>
                  <span className="text-[10px] text-slate-500">{s.meta}</span>
                </div>
                <h3 className="text-sm md:text-base font-extrabold text-slate-900 leading-snug">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-[12px] text-slate-600 leading-relaxed">{s.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ════════ 直播福利说明 ════════ */}
        <section className="max-w-4xl mx-auto px-4 pt-8">
          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl shadow-lg p-5 md:p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} />
              <h2 className="text-base md:text-lg font-extrabold">直播间专属福利</h2>
            </div>
            <ul className="space-y-1.5 text-sm">
              {[
                '直播间首发 SOP 资料（仅直播间领取）',
                '连麦答疑：把你的项目 / 选品摆上来',
                '首期内测用户优先体验 AI 数字店群系统',
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5 text-amber-200" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ════════ 底部引导（线下沙龙降级为辅助入口） ════════ */}
        <section className="max-w-4xl mx-auto px-4 pt-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
            <p className="text-sm text-slate-600">
              也想参加
              <Link href="/salon" className="mx-1 text-blue-600 font-bold hover:underline">
                线下沙龙
              </Link>
              ？本地开课信息持续更新中。
            </p>
          </div>
        </section>
      </div>
    </ClientLayout>
  )
}
