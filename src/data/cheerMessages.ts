/**
 * 沉浸式 SOP 通关计划 · 游戏化鼓励语
 * ------------------------------------------------------------
 * 当用户完成一个主步骤的最后一个子任务时，随机抽取一条鼓励语
 * 通过 cheerMessages.ts 数据文件统一管理：
 *   - 按 opc_level（trader / flow / system / asset）切换情绪词
 *   - 区分「主步骤完成」「SOP 全程完成」两种语境
 *   - 统一入口 pickCheer(level, context) 便于 UI 层调用
 * ------------------------------------------------------------
 */

export type OPCLevel = 'trader' | 'flow' | 'system' | 'asset'
export type CheerContext = 'main-step-done' | 'all-steps-done' | 'sub-step-done'

interface CheerBank {
  /** 主步骤完成时显示（5/8 步里程碑） */
  main: string[]
  /** SOP 全 8 步通关时显示（带奖杯） */
  finale: string[]
  /** 子步骤完成时显示（轻量反馈） */
  sub: string[]
}

/**
 * 4 个 OPC 等级各一套鼓励语
 *  - trader：交易型（卖货、爆款、首单）
 *  - flow：流量型（涨粉、爆文、矩阵）
 *  - system：系统型（系统、签单、客单）
 *  - asset：资产型（资产、被动收入、放大）
 */
export const CHEER_MESSAGES: Record<OPCLevel, CheerBank> = {
  trader: {
    main: [
      '🥳 太棒了！开店申请入门已完成！',
      '🔥 加油！你离跑通首单又近了一步！',
      '💰 选品方向已锁定，爆款正在路上！',
      '🛒 货品已上架，第一笔订单还会远吗？',
      '🚀 网店运营节奏已建立，复购正在生成！',
      '📈 客服发货全自动化，效率直接拉满！',
      '🎯 数据分析已通盘，爆品策略更清晰！',
      '🏆 矩阵放大准备就绪，多店指日可待！',
    ],
    finale: [
      '🎉 8 步 SOP 全通关！你已具备多店矩阵的运营能力！',
      '💎 数字网店专家认证达成，下一步直通矩阵放大！',
      '🥇 跑通数字店铺全链路，恭喜获得【执行力勋章】！',
    ],
    sub: [
      '✅ 子任务完成！',
      '👍 进度 +1，继续保持！',
      '💪 做得不错！',
    ],
  },
  flow: {
    main: [
      '🎬 账号基础已搭好，爆款内容蓄势待发！',
      '🌟 选题库已就位，灵感永不枯竭！',
      '📝 AI 内容生成已跑通，单条爆款正在路上！',
      '🚀 内容已发布到多平台，流量引擎启动！',
      '💬 媒体运营节奏已建立，粉丝正在涌入！',
      '📊 数据分析已开启，爆款规律越来越清晰！',
      '🎯 多号复制方案已就绪，矩阵号即将起飞！',
      '🏆 流量引擎全链路打通，等待规模化引爆！',
    ],
    finale: [
      '🎉 8 步 SOP 全通关！你已具备自媒体矩阵的内容能力！',
      '💎 自媒体操盘手认证达成，下一步直通矩阵放大！',
      '🥇 跑通内容全链路，恭喜获得【内容力勋章】！',
    ],
    sub: [
      '✅ 子任务完成！',
      '👍 进度 +1，继续保持！',
      '💪 做得不错！',
    ],
  },
  system: {
    main: [
      '🛠️ MVP 边界已锁定，技术债务最小化！',
      '⚙️ 技术选型已敲定，开发效率拉满！',
      '💻 AI 辅助编程已集成，开发速度 10 倍提升！',
      '🚀 支付 + 部署已就绪，MVP 即将上线！',
      '🌍 海外冷启方案已明确，首批用户在路上！',
      '🎯 系统集成完成，可对外签约交付！',
      '📈 系统稳定性达标，规模化运营无压力！',
      '🏆 系统能力已建全，TO B 签单就绪！',
    ],
    finale: [
      '🎉 8 步 SOP 全通关！你已具备系统型 OPC 的交付能力！',
      '💎 系统架构师认证达成，下一步直通 B 端签约！',
      '🥇 跑通系统型全链路，恭喜获得【系统力勋章】！',
    ],
    sub: [
      '✅ 子任务完成！',
      '👍 进度 +1，继续保持！',
      '💪 做得不错！',
    ],
  },
  asset: {
    main: [
      '🏗️ 数字资产已建立，复利引擎开始运转！',
      '💰 渠道签约完成，被动收入通道已开启！',
      '📦 资产上线就绪，规模化复制准备就绪！',
      '🌍 海外渠道已打通，资产价值持续放大！',
      '📈 资产收益率优化中，复合增长曲线成型！',
      '🎯 资产配置完善，风险对冲已部署！',
      '🚀 资产证券化路径清晰，资本化道路打通！',
      '🏆 数字资产生态已闭环，进入自由财富阶段！',
    ],
    finale: [
      '🎉 8 步 SOP 全通关！你已具备资产型 OPC 的复利能力！',
      '💎 数字资产专家认证达成，下一步直通资本化通道！',
      '🥇 跑通资产型全链路，恭喜获得【资产力勋章】！',
    ],
    sub: [
      '✅ 子任务完成！',
      '👍 进度 +1，继续保持！',
      '💪 做得不错！',
    ],
  },
}

/**
 * 统一入口：抽取一条鼓励语
 *  - level：当前 OPC 等级（默认 trader）
 *  - context：主步骤 / 全程 / 子步骤
 */
export function pickCheer(
  level: OPCLevel = 'trader',
  context: CheerContext = 'main-step-done'
): string {
  const bank = CHEER_MESSAGES[level] ?? CHEER_MESSAGES.trader
  const list =
    context === 'all-steps-done' ? bank.finale : context === 'sub-step-done' ? bank.sub : bank.main
  if (!list || list.length === 0) {
    return '🎉 太棒了！继续保持！'
  }
  return list[Math.floor(Math.random() * list.length)]
}

/**
 * 从 localStorage 读取用户当前 OPC 等级（容错处理）
 */
export function readUserLevel(): OPCLevel {
  if (typeof window === 'undefined') return 'trader'
  try {
    const v = (window.localStorage.getItem('opc_level') || '').toLowerCase()
    if (v === 'trader' || v === 'flow' || v === 'system' || v === 'asset') {
      return v as OPCLevel
    }
  } catch {
    /* 静默 */
  }
  return 'trader'
}
