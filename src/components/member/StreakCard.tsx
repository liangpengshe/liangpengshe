'use client'

/**
 * 进化四：游戏化激励 · 连胜天数展示卡
 * ------------------------------------------------------------
 * - 展示当前连胜天数 + 今日打卡状态
 * - 提供"打卡"按钮（演示版用，实际通过任务完成事件触发）
 * - 已解锁勋章横排展示
 * ------------------------------------------------------------
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Calendar, CheckCircle2, Trophy, Sparkles, ArrowRight } from 'lucide-react'
import { getStreakSnapshot, punch, MEDALS, buildIncentiveText, nextMilestone, type StreakSnapshot, type MedalKey } from '@/lib/streak-store'
import { CelebrationModal, type CelebrationData } from './CelebrationModal'

interface Props {
  phone: string
  /** 触发打卡的事件名（演示用：可通过 dispatchEvent 触发） */
  onPunch?: (data: CelebrationData) => void
}

export function StreakCard({ phone, onPunch }: Props) {
  const [snapshot, setSnapshot] = useState<StreakSnapshot | null>(null)
  const [celebration, setCelebration] = useState<CelebrationData | null>(null)
  const [celebrationOpen, setCelebrationOpen] = useState(false)

  useEffect(() => {
    if (!phone) return
    setSnapshot(getStreakSnapshot(phone))

    // 监听自定义打卡事件（其他组件可 dispatchEvent 触发）
    const handler = () => doPunch()
    window.addEventListener('opc:punch', handler)
    return () => window.removeEventListener('opc:punch', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone])

  const doPunch = () => {
    if (!phone) return
    const result = punch(phone)
    setSnapshot(result.snapshot)
    const data: CelebrationData = {
      todayPunches: result.snapshot.todayPunches,
      currentStreak: result.snapshot.currentStreak,
      daysToNextMilestone: nextMilestone(result.snapshot.currentStreak),
      newMedal: result.newMedal,
      streakIncreased: result.streakIncreased,
    }
    setCelebration(data)
    setCelebrationOpen(true)
    onPunch?.(data)
  }

  if (!snapshot) return null

  const incentiveText = buildIncentiveText(snapshot)

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border border-amber-200/60 p-4 shadow-sm">
        {/* 背景装饰 */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center gap-3">
          {/* 火焰图标 */}
          <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Flame size={26} className="md:w-7 md:h-7 drop-shadow" />
          </div>

          {/* 数字 + 文案 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl md:text-3xl font-black text-orange-700 leading-none">
                {snapshot.currentStreak}
              </span>
              <span className="text-xs md:text-sm font-bold text-orange-600/80">天连胜</span>
              {snapshot.todayPunches > 0 && (
                <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                  <CheckCircle2 size={9} />
                  今日已打卡
                </span>
              )}
            </div>
            <p className="text-[10px] md:text-[11px] text-amber-800/80 mt-1 leading-snug">
              {incentiveText}
            </p>
          </div>

          {/* 打卡按钮 */}
          <button
            onClick={doPunch}
            disabled={!phone}
            className="flex-shrink-0 px-3 py-2 md:px-4 md:py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs md:text-sm font-extrabold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-1 disabled:opacity-50"
          >
            <Sparkles size={12} />
            {snapshot.hasPunchedToday ? '再打卡' : '打卡'}
          </button>
        </div>

        {/* 里程碑进度 */}
        <div className="relative mt-3 flex items-center gap-1">
          {(['streak-7', 'streak-30', 'streak-100'] as MedalKey[]).map((key) => {
            const medal = MEDALS[key]
            const unlocked = snapshot.unlockedMedals.includes(key)
            return (
              <div
                key={key}
                className={`flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg ${
                  unlocked
                    ? 'bg-amber-100 border border-amber-300'
                    : 'bg-white/60 border border-amber-100'
                }`}
              >
                <span className={`text-base ${unlocked ? '' : 'grayscale opacity-50'}`}>
                  {medal.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`text-[10px] font-bold ${unlocked ? 'text-amber-800' : 'text-slate-500'}`}>
                    {medal.requiredDays}天
                  </div>
                  <div className={`text-[8px] ${unlocked ? 'text-amber-700' : 'text-slate-400'}`}>
                    {unlocked ? '已解锁' : `${medal.requiredDays - snapshot.currentStreak > 0 ? medal.requiredDays - snapshot.currentStreak : 0}天`}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <CelebrationModal
        open={celebrationOpen}
        data={celebration}
        onClose={() => setCelebrationOpen(false)}
        onClaimCoupon={(medal) => {
          // 演示版：仅记录到 localStorage
          if (typeof window !== 'undefined') {
            const raw = window.localStorage.getItem('opc_coupons')
            const coupons = raw ? JSON.parse(raw) : []
            coupons.push({
              medal: medal.key,
              amount: medal.couponAmount || 0,
              claimedAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
            })
            window.localStorage.setItem('opc_coupons', JSON.stringify(coupons))
          }
          setCelebrationOpen(false)
        }}
      />
    </>
  )
}
