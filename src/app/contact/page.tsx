'use client'

import Link from 'next/link'
import ClientLayout from '@/components/ClientLayout'
import {
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Sparkles,
  ArrowRight,
  Mail,
  Clock,
  ChevronRight,
} from 'lucide-react'

export default function ContactPage() {
  // 高德地图深大/西丽片区「讯美科技广场」坐标（参考）
  const AMAP_URL =
    'https://uri.amap.com/marker?position=113.9527,22.5428&name=讯美科技广场&src=liangpengshe&coordinate=gaode&callnative=1'

  return (
    <ClientLayout>
      <div className="min-h-screen bg-slate-50 pb-12">
        {/* ═══ 顶部标题区 ═══ */}
        <section className="px-4 pt-8 pb-4 max-w-lg mx-auto md:max-w-4xl md:mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-4">
              <Phone size={28} className="text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
              📞 联系我们
            </h1>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              良朋社 <span className="font-bold text-amber-600">OPC</span> 智富生态系统 · 商务合作与咨询
            </p>
          </div>
        </section>

        {/* ═══ 核心信息卡片 ═══ */}
        <section className="px-4 max-w-lg mx-auto md:max-w-4xl md:mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
            {/* 公司主体 */}
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 flex-shrink-0 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl flex items-center justify-center">
                <Building2 size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-gray-400 tracking-wider mb-1">
                  公司主体
                </div>
                <div className="text-base font-bold text-gray-900 leading-relaxed">
                  深圳市如时如密科技有限公司
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Shenzhen Rushi Rumi Technology Co., Ltd.
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* 线下地址 */}
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 flex-shrink-0 bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-xl flex items-center justify-center">
                <MapPin size={20} className="text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-gray-400 tracking-wider mb-1">
                  线下地址
                </div>
                <div className="text-base font-bold text-gray-900 leading-relaxed">
                  讯美科技园 3 号楼 12 层
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  中科创客学院 · 深圳市南山区
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  建议地铁 5 号线 · 大学城 / 西丽站
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* 营业时间 */}
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 flex-shrink-0 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 rounded-xl flex items-center justify-center">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-gray-400 tracking-wider mb-1">
                  拜访时间
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  周一至周五 10:00 – 19:00
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  周末沙龙日请提前预约
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 辅助入口：商务合作 + 智富沙龙 ═══ */}
        <section className="px-4 mt-4 max-w-lg mx-auto md:max-w-4xl md:mx-auto">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/partner"
              className="group relative block bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-4 shadow-md shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/15 rounded-full blur-2xl" />
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-2">
                  <Briefcase size={20} className="text-yellow-200" />
                </div>
                <div className="text-sm font-bold mb-1">商务合作</div>
                <div className="text-[10px] text-blue-100 leading-relaxed mb-2">
                  智富合伙人 · 城市招募
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-yellow-200 group-hover:gap-2 transition-all">
                  立即加入
                  <ArrowRight size={12} />
                </div>
              </div>
            </Link>

            <Link
              href="/salon"
              className="group relative block bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-4 shadow-md shadow-amber-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/15 rounded-full blur-2xl" />
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-2">
                  <Sparkles size={20} className="text-yellow-100" />
                </div>
                <div className="text-sm font-bold mb-1">智富沙龙</div>
                <div className="text-[10px] text-amber-100 leading-relaxed mb-2">
                  线下交流 · 立即报名
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-yellow-100 group-hover:gap-2 transition-all">
                  查看场次
                  <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* ═══ 地图占位（深色质感 + 高德跳转） ═══ */}
        <section className="px-4 mt-4 max-w-lg mx-auto md:max-w-4xl md:mx-auto">
          <a
            href={AMAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group block relative bg-gradient-to-br from-slate-200 via-slate-100 to-blue-50 rounded-2xl overflow-hidden border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all"
          >
            {/* 装饰网格背景 */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

            {/* 中心标记 */}
            <div className="relative h-48 md:h-56 flex items-center justify-center">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-xl border-4 border-rose-500 mb-3 animate-bounce">
                  <MapPin size={28} className="text-rose-500" />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-rose-500 rotate-45" />
                </div>
                <div className="text-sm font-bold text-slate-700">讯美科技园 3 号楼</div>
                <div className="text-xs text-slate-500 mt-1">点击下方按钮导航前往</div>
              </div>
            </div>

            {/* 底部操作栏 */}
            <div className="relative bg-white/90 backdrop-blur border-t border-slate-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Mail size={14} className="text-blue-500" />
                <span>高德地图导航</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-blue-600 group-hover:gap-2 transition-all">
                📍 导航前往
                <ChevronRight size={14} />
              </div>
            </div>
          </a>
        </section>

        {/* ═══ 底部备案信息 ═══ */}
        <section className="px-4 mt-6 max-w-lg mx-auto md:max-w-4xl md:mx-auto">
          <div className="text-center text-[11px] text-gray-400 leading-relaxed">
            <div>© 2026 深圳市如时如密科技有限公司</div>
            <div className="mt-1">良朋社 OPC · 智富生态系统</div>
          </div>
        </section>
      </div>
    </ClientLayout>
  )
}
