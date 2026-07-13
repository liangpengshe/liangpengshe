'use client'

import { Sparkles, Coins, Crown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type UserStage,
  type VIPTier,
  getOPCLevelMeta,
  getVIPTierMeta,
  getStageLabel,
} from '@/lib/user-stage'

/**
 * 商业作战地图 · 顶部概览
 *
 *  - flex flex-col md:flex-row justify-between items-start
 *  - 左侧：头像 + 昵称 + OPC 等级徽章
 *  - 右侧：会员权益徽章 + 良朋币余额徽章
 *  - 底部醒目横条："你在 OPC 创业的【第 X 阶段】"
 */
export interface ProfileHeaderProps {
  userName: string
  userAvatar?: string
  userStage: UserStage | null
  coinsBalance: number
  className?: string
}

const VIP_TONE_ICON: Record<VIPTier, React.ReactNode> = {
  trial: '🎟️',
  basic: '🎫',
  pro: '👑',
}

const STAGE_TONE: Record<string, { bg: string; text: string; emoji: string }> = {
  diagnosis: { bg: 'bg-blue-500', text: 'text-blue-100', emoji: '🩺' },
  learning: { bg: 'bg-emerald-500', text: 'text-emerald-100', emoji: '📚' },
  operation: { bg: 'bg-rose-500', text: 'text-rose-100', emoji: '🛠️' },
  scaling: { bg: 'bg-amber-500', text: 'text-amber-100', emoji: '🚀' },
}

export function ProfileHeader({
  userName,
  userAvatar,
  userStage,
  coinsBalance,
  className,
}: ProfileHeaderProps) {
  const opcMeta = getOPCLevelMeta(userStage?.opcLevel)
  const vipMeta = getVIPTierMeta(userStage?.vipTier)
  const currentStageKey = userStage?.current || 'diagnosis'
  const stageTone = STAGE_TONE[currentStageKey] || STAGE_TONE.diagnosis

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700',
        'text-white shadow-xl shadow-blue-500/20',
        className
      )}
    >
      {/* 装饰光斑 */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-400/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-cyan-400/15 rounded-full blur-3xl" />

      <div className="relative p-5 md:p-6">
        {/* 顶部：左 头像+昵称 / 右 会员+余额 */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* 左侧：头像 / 昵称 / 等级徽章 */}
          <div className="flex items-start gap-3 md:gap-4">
            <div
              className={cn(
                'flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl',
                'bg-white/15 backdrop-blur-sm border border-white/20',
                'flex items-center justify-center text-3xl md:text-4xl',
                'shadow-lg shadow-black/10'
              )}
            >
              {userAvatar || '👤'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={12} className="text-amber-300" />
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
                  商业作战地图
                </span>
              </div>
              <h1 className="text-lg md:text-xl font-extrabold leading-tight">
                你好，{userName}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {userStage?.opcLevel ? (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
                      'bg-white/15 backdrop-blur-sm border border-white/20',
                      'text-[10px] md:text-xs font-bold'
                    )}
                  >
                    <span>🏅</span>
                    <span>{opcMeta.label}</span>
                  </span>
                ) : (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
                      'bg-white/10 backdrop-blur-sm border border-white/15',
                      'text-[10px] md:text-xs font-medium text-white/80'
                    )}
                  >
                    <span>{opcMeta.emoji}</span>
                    <span>{opcMeta.label}</span>
                  </span>
                )}
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
                    'bg-white/10 backdrop-blur-sm border border-white/15',
                    'text-[10px] md:text-xs font-medium text-white/85'
                  )}
                >
                  <TrendingUp size={10} />
                  <span>
                    完成 {userStage?.completed.length ?? 0} / 4 阶段
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* 右侧：会员 + 良朋币徽章 */}
          <div className="flex flex-row md:flex-col gap-2 md:items-end">
            {/* 会员权益徽章 */}
            <div
              className={cn(
                'flex-1 md:flex-none inline-flex items-center gap-2',
                'px-3 py-2 rounded-xl',
                'bg-white/15 backdrop-blur-sm border border-white/20',
                'text-xs font-bold'
              )}
            >
              <span className="text-base">
                {VIP_TONE_ICON[userStage?.vipTier || 'trial']}
              </span>
              <div className="text-left">
                <div className="text-[9px] font-normal text-white/70 leading-none">
                  会员权益
                </div>
                <div className="text-xs font-bold leading-tight mt-0.5">
                  {vipMeta.label}
                </div>
              </div>
              <Crown size={12} className="text-amber-300 ml-1" />
            </div>
            {/* 良朋币余额徽章 */}
            <div
              className={cn(
                'flex-1 md:flex-none inline-flex items-center gap-2',
                'px-3 py-2 rounded-xl',
                'bg-amber-400/20 backdrop-blur-sm border border-amber-300/40',
                'text-xs font-bold'
              )}
            >
              <Coins size={14} className="text-amber-300" />
              <div className="text-left">
                <div className="text-[9px] font-normal text-amber-100/80 leading-none">
                  良朋币余额
                </div>
                <div className="text-sm md:text-base font-extrabold leading-tight mt-0.5">
                  {coinsBalance.toLocaleString('zh-CN')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部醒目横条：当前阶段 */}
        <div
          className={cn(
            'mt-5 rounded-xl px-4 py-3',
            'bg-black/20 backdrop-blur-sm border border-white/15',
            'flex items-center gap-3'
          )}
        >
          <div
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0',
              stageTone.bg,
              'shadow-md'
            )}
          >
            {stageTone.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-medium text-white/70 uppercase tracking-wider">
              你在 OPC 创业的
            </div>
            <div className="text-base md:text-lg font-extrabold leading-tight">
              【第 {stageIndexOf(currentStageKey)} 阶段】{getStageLabel(currentStageKey)}
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end text-right">
            <div className="text-[10px] text-white/60">
              {userStage?.opcLevel ? '已选路径' : '未选路径'}
            </div>
            <div className="text-xs font-bold">
              {userStage?.opcLevel ? opcMeta.label : '前往诊断选择'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function stageIndexOf(key: string): number {
  const order = ['diagnosis', 'learning', 'operation', 'scaling']
  const i = order.indexOf(key)
  return i >= 0 ? i + 1 : 1
}

export default ProfileHeader
