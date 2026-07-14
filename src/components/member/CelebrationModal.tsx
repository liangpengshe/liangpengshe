'use client'

/**
 * 进化四：游戏化激励 · 高光闪耀动画 + 勋章解锁弹窗
 * ------------------------------------------------------------
 * - 打卡瞬间弹出的全屏高光动画（framer-motion keyframes）
 * - 包含激励文案 + 勋章解锁（若新解锁）
 * - 7 天勋章解锁后引导领取优惠券
 * ------------------------------------------------------------
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Trophy, ArrowRight, X, Flame, Award } from 'lucide-react'
import type { Medal } from '@/lib/streak-store'

export interface CelebrationData {
  /** 今日打卡次数 */
  todayPunches: number
  /** 当前连胜天数 */
  currentStreak: number
  /** 距下一里程碑还差几天（0 = 已达最高） */
  daysToNextMilestone: number
  /** 新解锁的勋章（若有） */
  newMedal: Medal | null
  /** 连胜是否刚刚 +1 */
  streakIncreased: boolean
}

interface Props {
  open: boolean
  data: CelebrationData | null
  onClose: () => void
  onClaimCoupon?: (medal: Medal) => void
}

export function CelebrationModal({ open, data, onClose, onClaimCoupon }: Props) {
  // 防止服务端渲染动画抖动
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !data) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          {/* 高光背景：径向渐变 + 旋转光环 */}
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            exit={{ scale: 0, rotate: 720 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-300/40 via-yellow-200/30 to-orange-300/40 blur-3xl" />
          </motion.div>

          {/* 中心卡片 */}
          <motion.div
            initial={{ scale: 0.3, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.6, y: -20, opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.1, type: 'spring', stiffness: 200 }}
            className="relative pointer-events-auto w-[90vw] max-w-md"
          >
            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* 顶部渐变光带 */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 overflow-hidden">
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.5, repeat: 1, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </div>

              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-500 shadow"
              >
                <X size={14} />
              </button>

              {/* 内容区 */}
              <div className="relative pt-12 pb-6 px-6 text-center">
                {/* 高光图标 */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
                  className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/50 mb-3"
                >
                  {data.newMedal ? (
                    <span className="text-4xl">{data.newMedal.emoji}</span>
                  ) : (
                    <Sparkles size={36} className="text-white drop-shadow" />
                  )}
                </motion.div>

                {/* 主标题 */}
                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-extrabold text-slate-900 mb-1"
                >
                  {data.newMedal
                    ? `🏆 恭喜解锁【${data.newMedal.name}】`
                    : data.streakIncreased
                      ? `🔥 连胜 +1！当前 ${data.currentStreak} 天`
                      : `✅ 打卡成功！`}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-slate-600 leading-relaxed"
                >
                  今日已打卡 <strong className="text-amber-600">{data.todayPunches}</strong> 项
                  {data.daysToNextMilestone > 0 ? (
                    <>
                      ，距离下一阶段解锁还差{' '}
                      <strong className="text-amber-600">{data.daysToNextMilestone}</strong> 天
                    </>
                  ) : (
                    <>！已达成最高里程碑 🎉</>
                  )}
                </motion.p>

                {/* 勋章解锁详情 */}
                {data.newMedal && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl"
                  >
                    <div className="flex items-center gap-2 mb-2 justify-center">
                      <Trophy size={16} className="text-amber-600" />
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                        奖励
                      </span>
                    </div>
                    <p className="text-sm font-bold text-amber-900 mb-1">
                      {data.newMedal.reward}
                    </p>
                    {data.newMedal.couponAmount && onClaimCoupon && (
                      <button
                        onClick={() => onClaimCoupon(data.newMedal!)}
                        className="mt-2 inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-extrabold rounded-lg shadow-md hover:shadow-lg transition-all"
                      >
                        🎁 立即领取 ¥{data.newMedal.couponAmount} 优惠券
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </motion.div>
                )}

                {/* 关闭按钮 */}
                <button
                  onClick={onClose}
                  className="mt-5 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors"
                >
                  继续前进 →
                </button>
              </div>
            </div>
          </motion.div>

          {/* 飞溅粒子 */}
          <Particles />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Particles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: 0,
            scale: 1.5,
            x: Math.cos((i / 12) * 2 * Math.PI) * 250,
            y: Math.sin((i / 12) * 2 * Math.PI) * 250,
          }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500"
        />
      ))}
    </div>
  )
}
