/**
 * 项目库 · 独立项目 SOP 详情页（任务 3+4+5 合并实现）
 * ------------------------------------------------------------
 * 路由: /projects/[slug]
 *
 * 设计目标：
 *   1. 完全脱离 /market 四库 layout，纯净独立
 *   2. 顶部封面区 + 进度条（X/5 步骤）
 *   3. 主体时间线：Duolingo 风格纵向任务流
 *      - 已完成：绿色边框 + 左侧对勾 + 灰色淡化
 *      - 当前：蓝色边框 + 呼吸动效 + 完成按钮
 *      - 未开始：灰色边框 + 锁定
 *   4. 任务状态由 localStorage + PATCH /api/projects/step-progress 共同维护
 *   5. 底部收尾：100% 完成时出现绿底白字华丽横幅
 *   6. 底部仅保留一个"返回项目库"胶囊按钮（bg-slate-100）
 *
 * 数据源: src/data/project-items.ts（统一的 8 个项目方向）
 * 进度持久化:
 *   - localStorage key: opc_sop_progress::{slug}
 *   - PATCH /api/projects/step-progress (body: { slug, stepIndex, completed })
 * ------------------------------------------------------------
 */
'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Rocket,
  Lock,
  ExternalLink,
  Target,
  Tag,
  Loader2,
  PartyPopper,
  TrendingUp,
  ShoppingBag,
  Video,
  Store,
  Wrench,
  Globe,
  Bot,
  Building,
  Trophy,
  Award,
  type LucideIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getProjectBySlug, type ProjectItem } from '@/data/project-items'
import { cn } from '@/lib/utils'
import { HotTopicsReminder, AICommentBoard } from '@/components/community/AICommentBoard'

/** 勋章持久化 key：localStorage 标记某个项目已完成 + 颁发勋章 */
const MEDAL_STORAGE_KEY = 'opc_sop_medals'
/** 当前 session 内是否已弹过奖杯（避免重复打扰） */
const MEDAL_MODAL_SESSION_KEY = 'opc_sop_medal_modal_shown'

// ════════════════════════════════════════════════════════════════
// 类型与本地存储 key
// ════════════════════════════════════════════════════════════════

interface SOPTask {
  id: number
  title: string
  desc: string
  /** 可选：跳转到外部链接（注册店铺、访问工具等） */
  actionUrl?: string
  actionLabel?: string
}

const STORAGE_PREFIX = 'opc_sop_progress::'

function readProgress(slug: string): number {
  if (typeof window === 'undefined') return 0
  try {
    const v = window.localStorage.getItem(STORAGE_PREFIX + slug)
    if (!v) return 0
    const n = parseInt(v, 10)
    if (isNaN(n) || n < 0) return 0
    return n
  } catch {
    return 0
  }
}

function writeProgress(slug: string, completedCount: number) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_PREFIX + slug, String(completedCount))
  } catch {
    // 忽略
  }
}

// ════════════════════════════════════════════════════════════════
// 5 步 SOP 数据模型（按项目类别动态生成 5 步）
// 核心要求：步骤可执行、有 actionUrl、可点击完成
// ════════════════════════════════════════════════════════════════

const TAOBAO_REGISTER = 'https://ishop.taobao.com/openshop/tb_open_shop_landing.htm'
const PINDUODUO_REGISTER = 'https://mms.pinduoduo.com/login/register?redirectUrl=https%3A%2F%2Fmms.pinduoduo.com%2Fhome%2F'
const XHS_REGISTER = 'https://zhaoshang.xiaohongshu.com/merchant/login?settleFrom=login_page_pc'
const DOUYIN_REGISTER = 'https://fxg.jinritemai.com/'
const WECHAT_CHANNEL_REGISTER = 'https://channels.weixin.qq.com/login.html'
const AMAZON_REGISTER = 'https://sellercentral.amazon.com'
const DOUYIN_CREATOR = 'https://creator.douyin.com'
const XHS_CREATOR = 'https://creator.xiaohongshu.com'
const DEEPSEEK = 'https://www.deepseek.com'
const MIDJOURNEY = 'https://www.midjourney.com'

/** 根据 project 类别生成 5 步 SOP 数据 */
function buildSOPTasks(project: ProjectItem): SOPTask[] {
  const cat = project.category
  const slug = project.slug

  // ════════════════════════════════════════════════════════════════
  // 任务 A：三大网店项目 · 统一 8 步 SOP 流程
  // 适用项目:
  //   - AI 数字网店项目 (ai-digital-shop)
  //   - AI 无货源实物网店项目 (ai-no-stock-physical-shop)
  //   - AI 有货源实物网店项目 (ai-branded-physical-shop)
  // 流程顺序: 开店申请 → 基础设置 → 精准选品 → 货品上架 →
  //          网店运营 → 客服发货 → 数据分析 → 多店复制
  // 严格保留 actionUrl 字段，确保 UI 跳转逻辑不变
  // ════════════════════════════════════════════════════════════════
  if (slug === 'ai-digital-shop') {
    return [
      { id: 1, title: '第 1 步 · 开店申请', desc: '完成淘宝/小红书数字店铺平台入驻，提交资质并激活数字商品类目。', actionUrl: TAOBAO_REGISTER, actionLabel: '🛒 打开淘宝商家后台' },
      { id: 2, title: '第 2 步 · 基础设置', desc: '完善店铺基础信息，绑定支付通道（支付宝 / 微信）与数字商品自动发货配置。', actionUrl: 'https://www.agiso.com', actionLabel: '⚡ 打开阿奇索自动发货' },
      { id: 3, title: '第 3 步 · 精准选品', desc: '利用 AI 工具（灵犀 AI）+ 平台榜单，锁定 3-5 个高复购数字商品方向。', actionUrl: 'https://www.lingxixai.com', actionLabel: '🦊 打开灵犀 AI 选品' },
      { id: 4, title: '第 4 步 · 货品上架', desc: 'AI 批量生成商品图片、标题与详情，完成首批 10-20 款数字商品上架。', actionUrl: 'https://www.baowenplus.com', actionLabel: '🐆 打开豹纹工坊批量出图' },
      { id: 5, title: '第 5 步 · 网店运营', desc: '开始运营动作：优化主图 / 标题 / 详情页转化率，建立客户复购路径。', actionUrl: MIDJOURNEY, actionLabel: '🎨 打开 Midjourney 优化主图' },
      { id: 6, title: '第 6 步 · 客服发货', desc: '配置自动化客服话术与自动发货脚本，7×24 小时即时交付数字商品。', actionUrl: 'https://www.agiso.com', actionLabel: '⚡ 配置自动发货' },
      { id: 7, title: '第 7 步 · 数据分析', desc: '分析店铺 UV、转化率、客单价与复购率，定位爆款与滞销款。', actionUrl: 'https://www.dianzhentan.com', actionLabel: '🕵️ 打开店侦探分析数据' },
      { id: 8, title: '第 8 步 · 多店复制', desc: '将跑通的数字店铺 SOP 复制到淘宝 / 小红书 / 抖店多平台账号矩阵。', actionUrl: DOUYIN_REGISTER, actionLabel: '🎵 打开抖店后台复制矩阵' },
    ]
  }

  if (slug === 'ai-no-stock-physical-shop') {
    return [
      { id: 1, title: '第 1 步 · 开店申请', desc: '完成拼多多/淘宝一件代发小店入驻，提交身份证 + 银行卡即可激活。', actionUrl: PINDUODUO_REGISTER, actionLabel: '🍎 打开拼多多商家后台' },
      { id: 2, title: '第 2 步 · 基础设置', desc: '完善店铺基础信息，绑定支付与一件代发物流模板（无需囤货）。', actionUrl: 'https://www.agiso.com', actionLabel: '⚡ 配置代发物流模板' },
      { id: 3, title: '第 3 步 · 精准选品', desc: '用店侦探 / 蝉妈妈 AI 抓取 1688 爆款数据，筛选 3-5 个稳定无货源蓝海品。', actionUrl: 'https://www.dianzhentan.com', actionLabel: '🕵️ 打开店侦探选品' },
      { id: 4, title: '第 4 步 · 货品上架', desc: 'AI 批量生成 50 个 SKU 主图 + 详情页文案，零设计也能日更。', actionUrl: DEEPSEEK, actionLabel: '🐋 打开 Deepseek 生成详情页' },
      { id: 5, title: '第 5 步 · 网店运营', desc: '优化转化率与客户留存：设置优惠券、限时折扣、首单礼，提升自然流量。', actionUrl: PINDUODUO_REGISTER, actionLabel: '🍎 打开拼多多营销中心' },
      { id: 6, title: '第 6 步 · 客服发货', desc: '配置自动客服话术 + 1688 一键代发，订单全流程自动化（24h 内发货）。', actionUrl: 'https://www.agiso.com', actionLabel: '⚡ 打开阿奇索自动发货' },
      { id: 7, title: '第 7 步 · 数据分析', desc: '分析店铺流量、转化与 ROI，筛选出爆品主推，砍掉滞销品。', actionUrl: 'https://www.dianzhentan.com', actionLabel: '🕵️ 打开店侦探分析数据' },
      { id: 8, title: '第 8 步 · 多店复制', desc: '将跑通的一件代发 SOP 复制到 5-10 个店铺 / 平台账号矩阵铺货。', actionUrl: DOUYIN_REGISTER, actionLabel: '🎵 打开抖店复制矩阵' },
    ]
  }

  if (slug === 'ai-branded-physical-shop') {
    return [
      { id: 1, title: '第 1 步 · 开店申请', desc: '完成天猫/京东企业主体旗舰店入驻，提交营业执照 + 品牌资质。', actionUrl: TAOBAO_REGISTER, actionLabel: '🛒 打开淘宝/天猫商家后台' },
      { id: 2, title: '第 2 步 · 基础设置', desc: '完善品牌店铺信息，绑定企业支付、ERP 库存与顺丰/京东物流配置。', actionUrl: 'https://www.agiso.com', actionLabel: '⚡ 配置企业 ERP 物流' },
      { id: 3, title: '第 3 步 · 精准选品', desc: '用 AI 提炼品牌核心差异化卖点，锁定 5-8 个高溢价 SKU 主推方向。', actionUrl: 'https://www.lingxixai.com', actionLabel: '🦊 打开灵犀 AI 卖点提炼' },
      { id: 4, title: '第 4 步 · 货品上架', desc: 'AI 批量生成品牌主图、详情页与短视频素材，强化品牌调性。', actionUrl: 'https://www.baowenplus.com', actionLabel: '🐆 打开豹纹工坊' },
      { id: 5, title: '第 5 步 · 网店运营', desc: '品牌内容矩阵 + 私域沉淀：小红书 / 抖音 / 视频号三平台账号同步搭建。', actionUrl: XHS_CREATOR, actionLabel: '📕 打开小红书品牌号' },
      { id: 6, title: '第 6 步 · 客服发货', desc: '配置品牌专属客服话术 + 自动化履约，48h 内完成质检发货。', actionUrl: 'https://www.agiso.com', actionLabel: '⚡ 配置品牌客服与发货' },
      { id: 7, title: '第 7 步 · 数据分析', desc: '分析品牌搜索词、复购率与 LTV，优化后续产品线与广告投放策略。', actionUrl: 'https://www.dianzhentan.com', actionLabel: '🕵️ 打开店侦探品牌分析' },
      { id: 8, title: '第 8 步 · 多店复制', desc: '将品牌店铺 SOP 复制到天猫 + 京东 + 抖店多平台旗舰店矩阵。', actionUrl: DOUYIN_REGISTER, actionLabel: '🎵 打开抖店品牌店' },
    ]
  }

  // ════════════════════════════════════════════════════════════════
  // 任务 B：AI 自媒体运营项目 · 8 步 SOP 流程
  // 适用项目: AI 自媒体运营项目 (ai-self-media)
  // 流程顺序: 账号申请 → 基础设置 → 精准选题 → 内容生成 →
  //          内容发布 → 媒体运营 → 数据分析 → 多号复制
  // 严格保留 actionUrl / id / 结构，与 UI 渲染解耦
  // ════════════════════════════════════════════════════════════════
  if (slug === 'ai-self-media') {
    return [
      { id: 1, title: '第 1 步 · 账号申请', desc: '完成小红书 / 抖音 / 视频号主流自媒体平台账号注册，完善实名认证。', actionUrl: XHS_CREATOR, actionLabel: '📕 打开小红书创作者中心' },
      { id: 2, title: '第 2 步 · 基础设置', desc: '配置账号定位、头像、简介及粉丝互动基础设置，明确垂类人设。', actionUrl: DOUYIN_CREATOR, actionLabel: '🎵 打开抖音创作者中心' },
      { id: 3, title: '第 3 步 · 精准选题', desc: '利用 AI 工具（豹纹工坊 / 灵犀 AI）锁定 30 天爆款选题库。', actionUrl: 'https://www.baowenplus.com', actionLabel: '🐆 打开豹纹工坊选题' },
      { id: 4, title: '第 4 步 · 内容生成', desc: 'AI 批量生成图文 / 短视频内容（含文案 + 配图 + 配音 + 字幕）。', actionUrl: MIDJOURNEY, actionLabel: '🎨 打开 Midjourney 批量出图' },
      { id: 5, title: '第 5 步 · 内容发布', desc: '小红书 + 抖音 + 视频号多平台同步发布，并优化标题 / 标签 / 封面。', actionUrl: XHS_CREATOR, actionLabel: '📕 一键同步发布到小红书' },
      { id: 6, title: '第 6 步 · 媒体运营', desc: '主动互动 / 评论维护 / 私信回复，沉淀私域并接入流量主 + 商单。', actionUrl: DOUYIN_CREATOR, actionLabel: '🎵 打开抖音创作者后台' },
      { id: 7, title: '第 7 步 · 数据分析', desc: '分析播放 / 互动 / 涨粉 / 转化数据，定位爆款规律与待优化项。', actionUrl: 'https://www.dianzhentan.com', actionLabel: '🕵️ 打开店侦探数据分析' },
      { id: 8, title: '第 8 步 · 多号复制', desc: '将跑通的内容模型复制到 5-10 个账号 / 多平台矩阵放大。', actionUrl: 'https://www.xianfengpai.com.cn', actionLabel: '🎬 打开先锋派数字人矩阵' },
    ]
  }

  if (cat === '数字产品') {
    return [
      { id: 1, title: '第 1 步 · 选品定位', desc: `锁定 1 个细分品类（如 PPT 模板 / 头像定制 / 简历优化），明确你的核心交付物。`, actionUrl: 'https://www.baowenplus.com', actionLabel: '🦊 打开灵犀 AI 辅助选品' },
      { id: 2, title: '第 2 步 · 店铺注册', desc: '前往淘宝/小红书商家后台完成实名注册，预计 30 分钟。', actionUrl: TAOBAO_REGISTER, actionLabel: '🛒 打开淘宝商家后台' },
      { id: 3, title: '第 3 步 · AI 批量出图', desc: '用 AI 工具批量生成 10-20 款商品素材，零设计基础也能日更 10 个 SKU。', actionUrl: MIDJOURNEY, actionLabel: '🎨 打开 Midjourney' },
      { id: 4, title: '第 4 步 · 智能客服上线', desc: '配置自动发货 + AI 客服话术，7×24 小时自动成交。' },
      { id: 5, title: '第 5 步 · 内容矩阵冷启动', desc: '小红书 / 抖音双平台账号同步搭建，每天 3 条爆款笔记冷启。', actionUrl: XHS_CREATOR, actionLabel: '📕 打开小红书创作者中心' },
    ]
  }

  if (cat === '实物电商' || cat === '品牌实物') {
    return [
      { id: 1, title: '第 1 步 · 选品调研', desc: '用 AI 抓取 1688 爆款数据，筛选 3-5 个稳定货源，建立选品对比表。', actionUrl: 'https://www.dianzhentan.com', actionLabel: '🕵️ 打开店侦探' },
      { id: 2, title: '第 2 步 · 店铺注册', desc: project.level === 'trader' ? '一件代发小店：淘宝 / 拼多多 / 抖店 三选一完成注册。' : '品牌旗舰店：天猫/京东企业主体注册，准备好营业执照。', actionUrl: project.level === 'trader' ? PINDUODUO_REGISTER : TAOBAO_REGISTER, actionLabel: '🏪 打开商家后台' },
      { id: 3, title: '第 3 步 · AI 详情页', desc: 'AI 批量生成 50 个 SKU 主图 + 详情页文案，零设计也能日更。', actionUrl: DEEPSEEK, actionLabel: '🐋 打开 Deepseek' },
      { id: 4, title: '第 4 步 · 客服 + 物流配置', desc: '配置自动发货 + AI 智能客服，订单全流程自动化。', actionUrl: 'https://www.agiso.com', actionLabel: '⚡ 打开阿奇索自动发货' },
      { id: 5, title: '第 5 步 · 投流测试', desc: '小额投放测试 7 天 ROI，筛出爆品后主推。', actionUrl: DOUYIN_REGISTER, actionLabel: '🎵 打开抖店后台' },
    ]
  }

  if (cat === '全球电商') {
    return [
      { id: 1, title: '第 1 步 · 选市场', desc: '美国 / 欧洲 / 东南亚 三选一，匹配你的资源与时区。' },
      { id: 2, title: '第 2 步 · 跨境主体注册', desc: 'TikTok Shop 美区需美国主体（可先用 SSN 走个人店铺）。', actionUrl: AMAZON_REGISTER, actionLabel: '📦 打开亚马逊全球开店' },
      { id: 3, title: '第 3 步 · AI 多语言素材', desc: 'AI 生成英语 / 西班牙语 / 印尼语商品页，0 外语门槛。', actionUrl: DEEPSEEK, actionLabel: '🐋 打开 Deepseek' },
      { id: 4, title: '第 4 步 · 数字人口播', desc: '用数字人 + AI 配音生成 30 条短视频，本地化投放。', actionUrl: 'https://www.xianfengpai.com.cn', actionLabel: '🎬 打开先锋派数字人' },
      { id: 5, title: '第 5 步 · 冷启动投放', desc: 'Spark Ads + 联盟营销冷启，单月 GMV 破 1 万美金。', actionUrl: DOUYIN_CREATOR, actionLabel: '🎵 打开 TikTok 创作者' },
    ]
  }

  if (cat === '内容赛道') {
    return [
      { id: 1, title: '第 1 步 · 选垂类 + 人设', desc: '锁定 1 个内容垂类 + 人设（如 AI 工具测评 / 职场干货 / 生活方式）。' },
      { id: 2, title: '第 2 步 · 创作者平台注册', desc: '小红书 + 抖音双平台创作者中心注册 + 实名认证。', actionUrl: XHS_CREATOR, actionLabel: '📕 打开小红书创作者中心' },
      { id: 3, title: '第 3 步 · AI 选题 + 文案', desc: '用 AI 工具生成 30 天选题库 + 爆款文案，10 倍提效。', actionUrl: 'https://www.baowenplus.com', actionLabel: '🐆 打开豹纹工坊' },
      { id: 4, title: '第 4 步 · AI 出图 + 剪辑', desc: 'AI 批量生成封面图 + 视频剪辑，0 后期也能日更 3 条。', actionUrl: MIDJOURNEY, actionLabel: '🎨 打开 Midjourney' },
      { id: 5, title: '第 5 步 · 流量主 + 商单接入', desc: '万粉后接入流量主 + 商单通道，客单价 5K+。', actionUrl: DOUYIN_CREATOR, actionLabel: '🎵 打开抖音创作者中心' },
    ]
  }

  if (cat === '技术研发') {
    return [
      { id: 1, title: '第 1 步 · MVP 边界', desc: '定义最小可行产品功能，砍掉一切不必要的特性。' },
      { id: 2, title: '第 2 步 · 技术选型', desc: 'Next.js + Supabase + Stripe 黄金栈，2 周可上线。', actionUrl: 'https://www.trae.cn', actionLabel: '🛠️ 打开 TRAE IDE' },
      { id: 3, title: '第 3 步 · AI 辅助编程', desc: '用 Cursor / TRAE AI 辅助编程，7 天内出 MVP。', actionUrl: DEEPSEEK, actionLabel: '🐋 打开 Deepseek' },
      { id: 4, title: '第 4 步 · 支付 + 部署', desc: '接入 Stripe / 微信支付，部署到 Vercel / 阿里云。' },
      { id: 5, title: '第 5 步 · 海外冷启', desc: 'Product Hunt + Twitter(X) 海外冷启动，获取首批 100 个用户。' },
    ]
  }

  if (cat === '渠道销售') {
    return [
      { id: 1, title: '第 1 步 · 选品签约', desc: '签约 1-2 个优质 AI 工具代理，拿到官方分成比例。' },
      { id: 2, title: '第 2 步 · 私域种子', desc: '冷启动 100 人私域种子用户，准备 30 套成交话术。' },
      { id: 3, title: '第 3 步 · 分销体系', desc: '搭建分销分成 + 邀请码体系，自动追踪转化。' },
      { id: 4, title: '第 4 步 · 内容种草', desc: '在小红书 / 视频号做工具测评种草，引流私域。', actionUrl: XHS_CREATOR, actionLabel: '📕 打开小红书' },
      { id: 5, title: '第 5 步 · 裂变放大', desc: '邀请奖励 + 拼团 + 直播转化，月入 10 万+。' },
    ]
  }

  if (cat === '企业服务') {
    return [
      { id: 1, title: '第 1 步 · 选行业', desc: '餐饮 / 教培 / 医美 / 家居 任选 1 个垂直，匹配本地企业资源。' },
      { id: 2, title: '第 2 步 · GEO 模板', desc: 'AI 批量生成 50+ 城市落地页，本地化 SEO 一次性铺开。' },
      { id: 3, title: '第 3 步 · 客户 BD', desc: '陌拜 / 转介绍 / 商会活动获取前 5 个种子客户。' },
      { id: 4, title: '第 4 步 · 案例包装', desc: '把前 5 个客户案例包装成可复制的标杆。' },
      { id: 5, title: '第 5 步 · 转介绍闭环', desc: '服务交付 + 客户转介绍，规模化复制到全国。' },
    ]
  }

  // 兜底（general）
  return [
    { id: 1, title: '第 1 步 · 启动准备', desc: '完成账号注册、实名认证、基础资料搭建。' },
    { id: 2, title: '第 2 步 · 选品定位', desc: '锁定目标细分品类，明确核心交付物。' },
    { id: 3, title: '第 3 步 · AI 工具配置', desc: '配置 AI 工具（豹纹工坊 / 灵犀 AI / 先锋派数字人）提效 10 倍。', actionUrl: 'https://www.baowenplus.com', actionLabel: '🐆 打开豹纹工坊' },
    { id: 4, title: '第 4 步 · 内容生产', desc: 'AI 批量生成首批 10 条内容 / 素材 / 商品页。' },
    { id: 5, title: '第 5 步 · 冷启动投放', desc: '单平台跑通首单 / 首粉闭环，准备规模化复制。' },
  ]
}

// ════════════════════════════════════════════════════════════════
// 分类 → 渐变色与图标
// ════════════════════════════════════════════════════════════════

const CATEGORY_STYLE: Record<string, { Icon: LucideIcon; gradient: string }> = {
  '数字产品':     { Icon: Bot,           gradient: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700' },
  '实物电商':     { Icon: ShoppingBag,   gradient: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700' },
  '品牌实物':     { Icon: Store,         gradient: 'bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600' },
  '全球电商':     { Icon: Globe,         gradient: 'bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-700' },
  '内容赛道':     { Icon: Video,         gradient: 'bg-gradient-to-br from-pink-500 via-rose-500 to-red-600' },
  '技术研发':     { Icon: Wrench,        gradient: 'bg-gradient-to-br from-slate-600 via-slate-800 to-slate-900' },
  '渠道销售':     { Icon: TrendingUp,    gradient: 'bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500' },
  '企业服务':     { Icon: Building,      gradient: 'bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700' },
}

// ════════════════════════════════════════════════════════════════
// 主页面
// ════════════════════════════════════════════════════════════════

export default function ProjectSOPPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const slug = params?.slug || ''

  const [project, setProject] = useState<ProjectItem | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [currentStep, setCurrentStep] = useState(0) // 已完成步骤数 (0..5)
  const [mounted, setMounted] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  // 任务 2：100% 完成时的奖杯弹窗
  const [showMedalModal, setShowMedalModal] = useState(false)
  const tasksRef = useRef<HTMLDivElement | null>(null)

  // 加载项目 + 读取本地进度
  useEffect(() => {
    const p = getProjectBySlug(slug)
    if (!p) {
      setNotFound(true)
      return
    }
    setProject(p)
    // 任务 A：三大网店项目升级为 8 步 SOP，统一上限为 buildSOPTasks 实际长度
    const totalForSlug = buildSOPTasks(p).length
    const saved = readProgress(slug)
    setCurrentStep(Math.min(saved, totalForSlug))
    setMounted(true)
  }, [slug])

  const tasks = useMemo<SOPTask[]>(() => {
    if (!project) return []
    return buildSOPTasks(project)
  }, [project])

  const totalSteps = tasks.length
  const progressPct = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0
  const isCompleted = totalSteps > 0 && currentStep >= totalSteps

  // 加载完成后判断是否显示庆祝横幅 + 勋章弹窗
  useEffect(() => {
    if (mounted && isCompleted) {
      setShowCelebration(true)
      // 任务 2：颁发 OPC 执行力勋章（写入 localStorage）
      // 当前 session 内仅弹一次奖杯模态框，避免重复打扰
      try {
        const stored = window.localStorage.getItem(MEDAL_STORAGE_KEY)
        const medals: Record<string, { awardedAt: string; slug: string; title: string }> = stored
          ? JSON.parse(stored)
          : {}
        if (!medals[slug]) {
          medals[slug] = {
            slug,
            title: project?.title || slug,
            awardedAt: new Date().toISOString(),
          }
          window.localStorage.setItem(MEDAL_STORAGE_KEY, JSON.stringify(medals))
        }
        // sessionStorage 记录本会话已展示过，避免反复弹出
        const alreadyShown = window.sessionStorage.getItem(MEDAL_MODAL_SESSION_KEY)
        if (!alreadyShown) {
          window.sessionStorage.setItem(MEDAL_MODAL_SESSION_KEY, slug)
          // 延后 300ms 让横幅先出现，再叠奖杯弹窗
          setTimeout(() => setShowMedalModal(true), 300)
        }
      } catch {
        // 静默：localStorage 写入失败不影响主流程
      }
    }
  }, [mounted, isCompleted, slug, project?.title])

  // 步骤完成后同步到后端
  const persistStep = async (completedCount: number) => {
    if (typeof window === 'undefined') return
    writeProgress(slug, completedCount)
    setSyncing(true)
    try {
      await fetch('/api/projects/step-progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          completedSteps: completedCount,
          totalSteps,
        }),
      })
    } catch {
      // 静默失败，本地进度已写入
    } finally {
      setSyncing(false)
    }
  }

  // 标记某一步为完成
  const handleCompleteStep = (stepIndex: number) => {
    const next = Math.max(currentStep, stepIndex + 1)
    if (next === currentStep) return
    setCurrentStep(next)
    persistStep(next)
  }

  // 重置进度（仅在庆祝横幅上提供）
  const handleResetProgress = () => {
    setCurrentStep(0)
    persistStep(0)
    setShowCelebration(false)
    setShowMedalModal(false)
    // 清掉本会话的弹窗标记，以便重新完成后再次弹出
    try {
      window.sessionStorage.removeItem(MEDAL_MODAL_SESSION_KEY)
    } catch {
      // 静默
    }
  }

  // 404 兜底
  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-3">🤷</div>
          <h1 className="text-xl font-extrabold text-slate-900 mb-2">项目不存在</h1>
          <p className="text-sm text-slate-500 mb-5">该项目可能已下架或链接错误</p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => router.push('/market/projects')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl"
            >
              返回项目库
            </button>
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    )
  }

  const style = CATEGORY_STYLE[project.category] ?? {
    Icon: Sparkles,
    gradient: 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900',
  }
  const CategoryIcon = style.Icon

  return (
    <div className="min-h-screen bg-slate-50 pb-24" suppressHydrationWarning>
      {/* ════════ Hero 顶部封面（无图，纯 CSS 渐变）══════ */}
      <header className={`relative ${style.gradient} text-white overflow-hidden`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.08]">
            <CategoryIcon size={360} strokeWidth={0.6} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50" />
        </div>

        <div className="relative px-4 pt-6 pb-10 md:pt-10 md:pb-14">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/market/projects"
              className="inline-flex items-center gap-1.5 text-white/90 hover:text-white text-xs md:text-sm bg-white/15 hover:bg-white/25 backdrop-blur px-3 py-1.5 rounded-full transition-colors"
            >
              <ArrowLeft size={14} />
              返回项目库
            </Link>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-2.5 py-1">
                <Tag size={11} />
                {project.category}
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-2.5 py-1 uppercase">
                {project.level} OPC
              </span>
              {project.recommend && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-400/30 backdrop-blur-sm border border-amber-300/40 text-amber-50 rounded-full px-2.5 py-1 font-bold">
                  🔥 优先推荐
                </span>
              )}
            </div>

            <h1 className="mt-4 text-2xl md:text-4xl font-extrabold leading-tight flex items-center gap-2">
              <span className="text-3xl md:text-5xl">{project.categoryEmoji}</span>
              {project.title}
            </h1>
            <p className="mt-2 text-sm md:text-base text-white/85 leading-relaxed">
              {project.desc}
            </p>
          </div>
        </div>
      </header>

      {/* ════════ 主体：进度条 + Duolingo 风格任务流 ═════ */}
      <main className="px-4 -mt-6">
        <div className="max-w-3xl mx-auto">
          {/* 进度条卡片 */}
          <section className="bg-white rounded-2xl shadow-sm p-5 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-blue-600" />
                <h2 className="text-base md:text-lg font-bold text-slate-900">任务进度</h2>
                {syncing && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                    <Loader2 size={10} className="animate-spin" />
                    同步中
                  </span>
                )}
              </div>
              <span className="text-blue-600 font-extrabold text-base md:text-lg tabular-nums">
                {currentStep}/{totalSteps}
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>完成 {progressPct}%</span>
              <span>预计 5 天可完成全部 5 步</span>
            </div>
          </section>

          {/* 5 步任务流（Duolingo 风格） */}
          <section ref={tasksRef} className="mt-6 flex flex-col gap-4 w-full max-w-3xl mx-auto">
            {tasks.map((task, idx) => {
              const isDone = idx < currentStep
              const isActive = idx === currentStep
              const isLocked = idx > currentStep
              return (
                <div
                  key={task.id}
                  style={
                    isActive
                      ? { animation: 'sopPulse 2.4s ease-in-out infinite' }
                      : undefined
                  }
                  className={cn(
                    'relative rounded-xl border p-5 transition-all duration-300',
                    isDone && 'bg-slate-50/80 border-green-200 opacity-75',
                    isActive && 'bg-white border-blue-300 ring-2 ring-blue-400/40 shadow-lg shadow-blue-100/50',
                    isLocked && 'bg-white border-slate-200'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* 步骤编号 / 状态图标 */}
                    <div className="flex-shrink-0">
                      {isDone ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white flex items-center justify-center shadow-md">
                          <CheckCircle2 size={20} strokeWidth={2.5} />
                        </div>
                      ) : isActive ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md ring-4 ring-blue-100">
                          {task.id}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-extrabold text-sm border-2 border-slate-200">
                          {isLocked ? <Lock size={16} /> : task.id}
                        </div>
                      )}
                    </div>

                    {/* 任务内容 */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={cn(
                          'text-base md:text-lg font-bold leading-tight',
                          isDone ? 'text-slate-500 line-through' : 'text-slate-900'
                        )}
                      >
                        {task.title}
                      </h3>
                      <p
                        className={cn(
                          'mt-1.5 text-xs md:text-sm leading-relaxed',
                          isDone ? 'text-slate-400' : 'text-slate-600'
                        )}
                      >
                        {task.desc}
                      </p>

                      {/* 操作链接（如有） */}
                      {task.actionUrl && !isDone && (
                        <a
                          href={task.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <ExternalLink size={12} />
                          {task.actionLabel || '打开相关工具'}
                        </a>
                      )}

                      {/* 当前步骤：完成按钮 */}
                      {isActive && (
                        <button
                          type="button"
                          onClick={() => handleCompleteStep(idx)}
                          className="mt-4 w-full md:w-auto inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-extrabold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
                        >
                          <CheckCircle2 size={15} />
                          完成此步骤
                        </button>
                      )}

                      {/* 已完成：提示 + 撤销（点击再次完成上一级即可） */}
                      {isDone && (
                        <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                          <Sparkles size={11} />
                          已完成 · 进度 +1
                        </div>
                      )}

                      {/* 未开始：提示锁定 */}
                      {isLocked && (
                        <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
                          <Lock size={11} />
                          需先完成前 {idx} 步
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </section>

          {/* ════════ 任务 4：其他 OPC 的热议提醒 + 留言板 ═════ */}
          <HotTopicsReminder slug={slug} projectTitle={project.title} />
          <div className="mt-3">
            <AICommentBoard
              slug={slug}
              title={`${project.title} · 写下卡点`}
              variant="full"
            />
          </div>

          {/* ════════ 100% 完成时华丽横幅 ═════ */}
          {isCompleted && showCelebration && (
            <section className="mt-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white p-5 md:p-7 shadow-xl shadow-green-500/30">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl" />
              <div className="relative flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30 animate-bounce">
                  <PartyPopper size={28} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-extrabold leading-tight">
                    🎉 恭喜你完成该 SOP 任务，你已解锁【矩阵放大】入口！
                  </h3>
                  <p className="mt-1 text-sm text-white/90 leading-relaxed">
                    项目 {project.title} 的 {totalSteps} 步落地路径已全部跑通，并已获得【<strong>OPC 执行力勋章</strong>】🏅。
                    下一步可进入 STEP 04 矩阵放大，多店 / 多号矩阵复制。
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <Link
                    href="/scale-up"
                    className="inline-flex items-center justify-center gap-1.5 bg-white text-emerald-700 font-extrabold text-sm px-4 py-2.5 rounded-xl shadow-md hover:scale-105 transition-transform"
                  >
                    <Rocket size={15} />
                    进入矩阵放大
                  </Link>
                  <button
                    type="button"
                    onClick={handleResetProgress}
                    className="inline-flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/30 transition-colors"
                  >
                    重新开始
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* ════════ 任务 2：奖杯弹窗（100% 完成时的中央仪式感特效）══════ */}
      <AnimatePresence>
        {showMedalModal && isCompleted && (
          <motion.div
            key="medal-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMedalModal(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0, rotate: -180, y: 50 }}
              animate={{
                scale: [0, 1.15, 0.95, 1],
                rotate: [-180, 0, 8, -4, 0],
                y: 0,
              }}
              transition={{
                duration: 1.2,
                times: [0, 0.5, 0.7, 0.9, 1],
                ease: 'easeOut',
              }}
              className="relative w-full max-w-md"
            >
              {/* 奖杯卡片 */}
              <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-emerald-50 rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-amber-200 overflow-hidden">
                {/* 背景光斑 */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-300/40 rounded-full blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-300/40 rounded-full blur-3xl" />
                {/* 粒子 */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0.5],
                      x: [0, (i % 2 ? 1 : -1) * (40 + (i * 8))],
                      y: [0, (i % 3 ? 1 : -1) * (40 + (i * 6))],
                    }}
                    transition={{
                      duration: 1.6,
                      delay: 0.3 + i * 0.05,
                      repeat: 0,
                    }}
                    className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-amber-400"
                    style={{ translateX: '-50%', translateY: '-50%' }}
                  />
                ))}

                <div className="relative flex flex-col items-center text-center">
                  {/* 奖杯图标（带绿金渐变光泽 + 持续旋转脉冲） */}
                  <motion.div
                    animate={{
                      rotate: [0, -3, 3, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 shadow-2xl shadow-amber-400/50 flex items-center justify-center ring-4 ring-amber-200/60"
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/40 to-transparent" />
                    <Trophy size={56} className="text-white drop-shadow-lg relative z-10" strokeWidth={2} />
                    {/* 顶部星星 */}
                    <motion.div
                      animate={{ scale: [0, 1.2, 1], rotate: [0, 180, 360] }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg ring-2 ring-white"
                    >
                      <Award size={16} className="text-white" />
                    </motion.div>
                  </motion.div>

                  {/* 文案：动画结束后（1.2s 后）展示勋章文案 */}
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.4 }}
                    className="mt-5 text-xl md:text-2xl font-extrabold bg-gradient-to-r from-amber-700 via-emerald-700 to-teal-700 bg-clip-text text-transparent leading-tight"
                  >
                    🏆 OPC 执行力勋章
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3, duration: 0.4 }}
                    className="mt-2 text-sm md:text-base text-slate-700 font-semibold leading-relaxed"
                  >
                    您已解锁【矩阵放大】入口，并获得了【OPC 执行力勋章】！
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6, duration: 0.4 }}
                    className="mt-1 text-xs text-slate-500"
                  >
                    《{project.title}》SOP 全 8 步完成 · 勋章已永久存入你的账户
                  </motion.p>

                  {/* 按钮组 */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8, duration: 0.4 }}
                    className="mt-6 flex flex-col sm:flex-row gap-2 w-full"
                  >
                    <Link
                      href="/scale-up"
                      onClick={() => setShowMedalModal(false)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white text-sm font-extrabold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <Rocket size={15} />
                      进入矩阵放大
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShowMedalModal(false)}
                      className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-colors"
                    >
                      稍后查看
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════ 底部固定：仅"返回项目库"胶囊按钮（任务 3 要求）══════ */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 md:p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-3xl mx-auto flex items-center gap-2 md:gap-3">
          <Link
            href="/market/projects"
            className="flex-1 block text-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs md:text-sm font-bold px-3 py-3 rounded-xl transition-colors min-h-[48px] flex items-center justify-center"
          >
            <span className="inline-flex items-center gap-1.5">
              <ArrowLeft size={14} />
              返回项目库
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
