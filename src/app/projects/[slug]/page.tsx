/**
 * 项目库 · 独立项目 SOP 详情页（沉浸式 SOP 通关计划 · 顶级体验重构版）
 * ------------------------------------------------------------
 * 路由: /projects/[slug]
 *
 * 设计目标（Duolingo / Linear 风格）：
 *   1. [Task 1] 关卡胶囊进度条：8 个独立水平方块串联，呼吸感当前态
 *   2. [Task 2] 专注模式手风琴：一次只展开一个主步骤 + 圆形选择框子步骤
 *   3. [Task 3] 付费解锁·欲望钩子：未付费用户看到渐变提示卡 + 升级弹窗
 *   4. [Task 4] AI 情境助手：悬浮按钮 + 底部无边框对话框，调用 /api/ai/practice-script
 *   5. [Task 5] 游戏化即时反馈：弹簧动画 + cheerMessages 闪光特效
 *   6. [Task 6] 移动端触控：所有按钮 min-h-44px，动画流畅无抖动
 *
 * 数据源: src/data/project-items.ts（统一的 9 个项目方向）
 * 进度持久化:
 *   - localStorage key: opc_sop_progress::{slug}       → 已完成主步骤数
 *   - localStorage key: opc_sop_subprogress::{slug}    → 子步骤完成 set
 *   - PATCH /api/projects/step-progress (body: { slug, completedSteps, totalSteps })
 * ------------------------------------------------------------
 */
'use client'

import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
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
  Brain,
  X,
  Crown,
  Zap,
  Circle,
  Check,
  MessageSquare,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getProjectBySlug, type ProjectItem } from '@/data/project-items'
import { pickCheer, readUserLevel, type OPCLevel } from '@/data/cheerMessages'
import { cn } from '@/lib/utils'
import { HotTopicsReminder, AICommentBoard } from '@/components/community/AICommentBoard'

/** 勋章持久化 key：localStorage 标记某个项目已完成 + 颁发勋章 */
const MEDAL_STORAGE_KEY = 'opc_sop_medals'
/** 当前 session 内是否已弹过奖杯（避免重复打扰） */
const MEDAL_MODAL_SESSION_KEY = 'opc_sop_medal_modal_shown'

// ════════════════════════════════════════════════════════════════
// 类型定义
// ════════════════════════════════════════════════════════════════

interface SubStep {
  id: string
  title: string
  desc: string
  actionUrl?: string
  actionLabel?: string
  /**
   * 多行胶囊按钮列表（任务升级：单 subStep 携带多个外部工具跳转）
   * - 仅作为"一键打开外部工具"快捷通道，无打卡功能
   * - 圆形打卡圈仍由外层 subStep 卡片独立控制
   */
  extraLinks?: { label: string; href: string }[]
}

interface SOPTask {
  id: number
  title: string
  desc: string
  actionUrl?: string
  actionLabel?: string
  /** 该步骤的子步骤列表（用于沉浸式 SOP 展示） */
  subSteps: SubStep[]
}

interface PaywallState {
  open: boolean
  stepIndex: number
}

/** [Task 2] 第 3 步完成时的"精准选品"付费解锁拦截 */
interface UnlockStepModalState {
  open: boolean
}

interface AICoachState {
  open: boolean
  loading: boolean
  stepTitle: string
  subStepTitle: string
  actionUrl?: string
  guidance: string
}

const STORAGE_PREFIX = 'opc_sop_progress::'
const SUB_STORAGE_PREFIX = 'opc_sop_subprogress::'
/** 付费会员判断 localStorage key */
const MEMBER_LEVEL_KEY = 'membership_level'
/** 沉浸式 SOP：免费用户可看到的主步骤上限（前面这 N 步完全免费） */
const FREE_MAIN_STEPS = 2
// 测试模式开关：设为 true 时可强制解锁第 4-9 步（idx >= 3）进行开发测试，上线前请设为 false
const UNLOCK_ALL_STEPS_FOR_TESTING = true

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

function readSubProgress(slug: string): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const v = window.localStorage.getItem(SUB_STORAGE_PREFIX + slug)
    if (!v) return new Set()
    const arr = JSON.parse(v) as string[]
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function writeSubProgress(slug: string, set: Set<string>) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SUB_STORAGE_PREFIX + slug, JSON.stringify(Array.from(set)))
  } catch {
    // 忽略
  }
}

/** 判断用户是否付费会员（69 元实操会员及以上） */
function readIsPaidMember(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const v = (window.localStorage.getItem(MEMBER_LEVEL_KEY) || '').toLowerCase()
    // 任意付费档位（> 0）即视为已解锁完整 SOP
    return v === 'paid' || v === '69' || v === '599' || v === '1980' || v === '5980' || v === 'practice'
  } catch {
    return false
  }
}

// ════════════════════════════════════════════════════════════════
// 子步骤生成器：每个主步骤自动生成 3 个可执行子步骤
// （保留 1 个原 actionUrl 作为可选项）
// ════════════════════════════════════════════════════════════════

function buildSubSteps(task: SOPTask, idx: number, project: ProjectItem): SubStep[] {
  // 不同 step idx 的固定模板
  const tpl = (() => {
    if (idx === 0) {
      return [
        { title: '收集入驻材料', desc: '按平台要求准备身份证、银行卡、营业执照等基础资料' },
        { title: '提交入驻申请', desc: '在目标平台提交实名注册，等待审核' },
        { title: '激活账号权限', desc: '完成首次登录，绑定手机号 + 设置安全验证' },
      ]
    }
    if (idx === 1) {
      return [
        { title: '完善基础资料', desc: '上传头像、填写简介、设置账号定位标签' },
        { title: '绑定支付通道', desc: '完成支付宝 / 微信 / 银联支付绑定' },
        { title: '配置自动发货', desc: '设置数字商品 / 一件代发自动履约模板' },
      ]
    }
    if (idx === 2) {
      return [
        { title: '建立选品对比表', desc: '用 AI 工具抓取榜单数据，建立 3-5 个候选品类' },
        { title: '筛选高复购方向', desc: '通过复购率、客单价、利润率三维筛选' },
        { title: '锁定首批 SKU', desc: '最终敲定 3-5 个首批上架方向' },
      ]
    }
    if (idx === 3) {
      return [
        { title: 'AI 批量出图', desc: '用 AI 工具批量生成 10-20 款主图 + 详情图' },
        { title: '撰写爆款标题', desc: '通过 AI 提炼 3-5 个高点击率标题模板' },
        { title: '完成首批上架', desc: '配置价格 / 库存 / SKU，发布上线' },
      ]
    }
    if (idx === 4) {
      return [
        { title: '优化主图转化', desc: 'A/B 测试主图，提升点击率 10%+' },
        { title: '投放优惠券', desc: '设置首单礼 + 复购券，提升转化' },
        { title: '建立私域沉淀', desc: '引导加微 / 进群，构建可复访流量池' },
      ]
    }
    if (idx === 5) {
      return [
        { title: '配置客服话术', desc: 'AI 智能客服 7×24 自动应答' },
        { title: '自动化履约', desc: '订单全流程自动化，24h 内发货' },
        { title: '售后闭环', desc: '退换货流程标准化，提升复购' },
      ]
    }
    if (idx === 6) {
      return [
        { title: 'UV / 转化分析', desc: '分析流量结构与转化漏斗' },
        { title: '爆款复盘', desc: '识别 Top 20% 爆品规律' },
        { title: '运营策略调整', desc: '基于数据调整选品 + 投放 + 客服策略' },
      ]
    }
    if (idx === 7) {
      return [
        { title: '梳理 SOP 文档', desc: '把跑通的流程标准化为可复制手册' },
        { title: '招募矩阵成员', desc: '招 1-3 个徒弟 / 兼职开始复制' },
        { title: '多店 / 多号上线', desc: '把 SOP 复制到第 2、3、4 个账号' },
      ]
    }
    // 兜底
    return [
      { title: '完成基础配置', desc: `按 ${task.title} 要求完成基础配置` },
      { title: '验证结果', desc: '截图 / 记录关键数据，验证执行效果' },
      { title: '记录到复盘文档', desc: '把执行结果写入个人复盘库' },
    ]
  })()
  return tpl.map((s, i) => ({
    id: `step${idx}-sub${i + 1}`,
    title: s.title,
    desc: s.desc,
    // 第一个子步骤继承原 step 的 actionUrl（如果有）
    actionUrl: i === 0 ? task.actionUrl : undefined,
    actionLabel: i === 0 ? task.actionLabel : undefined,
  }))
}

// ════════════════════════════════════════════════════════════════
// 5/8 步 SOP 数据模型（按项目类别动态生成）
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

/** 根据 project 类别生成 SOP 8 步 + 配套子步骤 */
function buildSOPTasks(project: ProjectItem): SOPTask[] {
  const cat = project.category
  const slug = project.slug

  // ════════════════════════════════════════════════════════════════
  // 四大网店项目 · 9 步 SOP（数字店群 / 无货源 / 有货源 / 跨境电商）
  // ════════════════════════════════════════════════════════════════

  // 步骤 3-9 共享描述（项目间差异化：开店申请 + 开店工具）
  const SHARED_E_COMMERCE_STEPS: Omit<SOPTask, 'subSteps'>[] = [
    { id: 3, title: '第 3 步 · 基础设置', desc: '完善店铺基础信息：头像、简介、绑定支付通道（支付宝/微信），配置发货模板与店铺公告。', actionUrl: 'https://www.agiso.com', actionLabel: '⚡ 配置支付与发货' },
    { id: 4, title: '第 4 步 · 精准选品', desc: '利用 AI 工具（灵犀 AI / 店侦探 / 蝉妈妈）锁定 3-5 个高复购候选品类，输出选品对比表。', actionUrl: 'https://www.lingxixai.com', actionLabel: '🦊 打开灵犀 AI 选品' },
    { id: 5, title: '第 5 步 · 货品上架', desc: 'AI 批量生成商品图片、标题与详情，完成首批 10-20 个 SKU 上架。', actionUrl: 'https://www.baowenplus.com', actionLabel: '🐆 打开豹纹工坊（豹纹+）批量出图' },
    { id: 6, title: '第 6 步 · 网店运营', desc: '开始日常运营：优化主图/标题/详情页转化率，设置优惠券与首单礼，建立复购路径。', actionUrl: MIDJOURNEY, actionLabel: '🎨 打开 Midjourney 优化主图' },
    { id: 7, title: '第 7 步 · 客服物流', desc: '配置自动化客服话术 + 自动发货脚本，7×24 小时即时交付，订单全流程自动化。', actionUrl: 'https://www.agiso.com', actionLabel: '⚡ 配置自动发货' },
    { id: 8, title: '第 8 步 · 数据分析', desc: '分析店铺 UV、转化率、客单价、复购率，定位爆款与待优化项，调整选品 + 投放策略。', actionUrl: 'https://www.dianzhentan.com', actionLabel: '🕵️ 打开店侦探分析数据' },
    { id: 9, title: '第 9 步 · 矩阵放大', desc: '将跑通的 SOP 复制到 3-10 个店铺 / 多平台账号矩阵铺货裂变，构建可复用的运营手册。', actionUrl: DOUYIN_REGISTER, actionLabel: '🎵 打开抖店后台复制矩阵' },
  ]

  // 项目 1：AI数字店群项目 (slug: ai-digital-shop-group)
  if (slug === 'ai-digital-shop-group') {
    const tasks = buildWithSubs(project, [
      { id: 1, title: '第 1 步 · 开店申请', desc: '完成淘宝数字店铺入驻，提交资质并激活商品类目。', actionUrl: 'https://ishop.taobao.com/', actionLabel: '🛒 打开淘宝商家后台' },
      { id: 2, title: '第 2 步 · 开店工具', desc: '配置阿奇索自动发货、千牛工作台等首批运营工具。', actionUrl: 'https://www.aqisuo.com/', actionLabel: '⚡ 打开阿奇索自动发货' },
      ...SHARED_E_COMMERCE_STEPS,
    ])
    // 精准覆盖：仅替换第 1 步 subSteps 为开店申请专属 3 项
    // （其他项目走各自的 if 分支，此处改动不影响 ai-no-stock-shop-group / ai-stock-shop-group / ai-cross-border）
    if (tasks[0]) {
      tasks[0].subSteps = [
        {
          id: '1-1',
          title: '开通支付宝',
          desc: '注册并实名认证支付宝账号，用于店铺收款与资金流转。',
          actionUrl: 'https://www.alipay.com/',
          actionLabel: '🅰️ 打开支付宝',
        },
        {
          id: '1-2',
          title: '开通淘宝店铺',
          desc: '注册并开通淘宝个人店铺，提交身份验证资料。',
          actionUrl: 'https://ishop.taobao.com/',
          actionLabel: '🛒 打开淘宝开店',
        },
        {
          id: '1-3',
          title: '开店须知',
          desc: '保证金：2000元（可退）；运营资金：1000-3000元（用于首单、推广及基础销量）。1张身份证可开3个支付宝，对应开3家个人店。',
          // actionUrl 留空：纯文字须知，渲染时不显示跳转按钮
        },
      ]
    }
    // 精准覆盖：仅替换第 2 步 subSteps 为开店工具专属 3 项
    if (tasks[1]) {
      tasks[1].subSteps = [
        {
          id: '2-1',
          title: '下载淘宝千牛工作台',
          desc: '下载并安装淘宝官方店铺管理客户端，用于后台管理、订单处理与客服响应。',
          actionUrl: 'https://work.taobao.com/download.html?spm=a21dvs.24173238.0.0.26381544cFkHdz',
          actionLabel: '⬇️ 下载千牛工作台',
        },
        {
          id: '2-2',
          title: '安装店群运营插件包',
          desc: '下载并安装哈士奇、至尊宝电商插件；配置阿奇索自动发货与抖羚羊裂变工具。',
          actionUrl: 'https://hsq.dangxun.com/',
          actionLabel: '🦊 打开哈士奇插件',
          extraLinks: [
            { label: '哈士奇', href: 'https://hsq.dangxun.com/' },
            { label: '至尊宝', href: 'https://zzb.zzbtool.com' },
            { label: '阿奇索', href: 'https://www.agiso.com/' },
            { label: '抖羚羊', href: 'https://doulingyang.cn' },
          ],
        },
        {
          id: '2-3',
          title: '开通版权检测与AI辅助',
          desc: '开通天眼查版权检测，将百度网盘、夸克网盘接入 AI 辅助工作流。',
          actionUrl: 'https://banquan.tianyancha.com/zp',
          actionLabel: '🛡️ 打开天眼查版权检测',
          extraLinks: [
            { label: '天眼查', href: 'https://banquan.tianyancha.com/zp' },
            { label: '百度网盘', href: 'https://pan.baidu.com/' },
            { label: '夸克网盘', href: 'https://pan.quark.cn/' },
            { label: '任推邦', href: 'https://dtbd.cn/#/pages/login/register?invite_code=0389221&qd=self_fans_h5' },
          ],
        },
      ]
    }
    // 精准覆盖：仅替换第 3 步 subSteps 为基础设置专属 4 项（千牛工作台 4 大配置）
    // 4 个子任务的统一跳转入口在页面下方独立展示（📍 前往千牛工作台），子任务卡片内不再重复
    if (tasks[2]) {
      tasks[2].subSteps = [
        {
          id: '3-1',
          title: '设置物流模板',
          desc: '在千牛工作台 - 交易 - 物流服务中，设置运费模板，配置新疆西藏邮费，并设置售后地址。',
        },
        {
          id: '3-2',
          title: '设置客服电话与接待',
          desc: '在千牛工作台配置欢迎语、自动应答、自动催拍、自动核单等客服工具，并设置机器人接待。',
        },
        {
          id: '3-3',
          title: '缴纳保证金与资金管理',
          desc: '在千牛工作台 - 财务板块，缴纳 2000 元保证金（可免付），并设置聚合结算账户。',
        },
        {
          id: '3-4',
          title: '设置自动发货',
          desc: '在千牛工作台 - 服务 - 服务中心中，搜索并配置阿奇索自动发货工具。',
        },
      ]
    }
    // 精准覆盖：仅 ai-digital-shop-group 第 3 步的 desc 为千牛工作台 4 大配置专属描述
    if (tasks[2]) {
      tasks[2].desc = '在千牛工作台完成物流模板与售后地址设置、客服接待与自动跟单配置、保证金与资金管理，并接入阿奇索自动发货工具。'
    }
    return tasks
  }

  // 项目 2：AI无货源实物店群项目 (slug: ai-no-stock-shop-group)
  if (slug === 'ai-no-stock-shop-group') {
    return buildWithSubs(project, [
      { id: 1, title: '第 1 步 · 开店申请', desc: '完成拼多多/抖音小店商家入驻，提交资质并激活商品类目。', actionUrl: 'https://mms.pinduoduo.com/', actionLabel: '🍎 打开拼多多商家后台' },
      { id: 2, title: '第 2 步 · 开店工具', desc: '配置阿奇索 1688 代发工具、店侦探等无货源选品工具。', actionUrl: 'https://www.aqisuo.com/', actionLabel: '⚡ 打开阿奇索 1688 代发' },
      ...SHARED_E_COMMERCE_STEPS,
    ])
  }

  // 项目 3：AI有货源实物店群项目 (slug: ai-stock-shop-group)
  if (slug === 'ai-stock-shop-group') {
    return buildWithSubs(project, [
      { id: 1, title: '第 1 步 · 开店申请', desc: '完成天猫企业旗舰店或抖店品牌入驻，提交资质并激活商品类目。', actionUrl: 'https://www.tmall.com/', actionLabel: '🛒 打开天猫商家后台' },
      { id: 2, title: '第 2 步 · 开店工具', desc: '配置阿奇索企业 ERP、抖店品牌营销工具等运营系统。', actionUrl: 'https://www.aqisuo.com/', actionLabel: '⚡ 配置阿奇索企业 ERP' },
      ...SHARED_E_COMMERCE_STEPS,
    ])
  }

  // 项目 4：AI跨境电商项目 (slug: ai-cross-border)
  if (slug === 'ai-cross-border') {
    return buildWithSubs(project, [
      { id: 1, title: '第 1 步 · 开店申请', desc: '完成亚马逊/Shopify全球店铺入驻，提交资质并激活商品类目。', actionUrl: 'https://sellercentral.amazon.com/', actionLabel: '� 打开亚马逊全球开店' },
      { id: 2, title: '第 2 步 · 开店工具', desc: '配置 Dify 自动翻译、多语言生成工具和跨境物流对接系统。', actionUrl: 'https://www.dify.ai/', actionLabel: '🤖 打开 Dify 自动翻译' },
      ...SHARED_E_COMMERCE_STEPS,
    ])
  }

  // 旧版兜底（已废弃 · 保留以防未知 slug）
  if (slug === 'ai-digital-shop' || slug === 'ai-no-stock-physical-shop' || slug === 'ai-branded-physical-shop') {
    return buildWithSubs(project, SHARED_E_COMMERCE_STEPS.filter((_, idx) => idx > 0).map((s) => ({ ...s, id: idx + 1 })))
  }

  // AI 自媒体运营项目 · 8 步
  if (slug === 'ai-self-media') {
    return buildWithSubs(project, [
      { id: 1, title: '第 1 步 · 账号申请', desc: '完成小红书 / 抖音 / 视频号主流自媒体平台账号注册，完善实名认证。', actionUrl: XHS_CREATOR, actionLabel: '📕 打开小红书创作者中心' },
      { id: 2, title: '第 2 步 · 基础设置', desc: '配置账号定位、头像、简介及粉丝互动基础设置，明确垂类人设。', actionUrl: DOUYIN_CREATOR, actionLabel: '🎵 打开抖音创作者中心' },
      { id: 3, title: '第 3 步 · 精准选题', desc: '利用 AI 工具（豹纹工坊（豹纹+）/ 灵犀 AI）锁定 30 天爆款选题库。', actionUrl: 'https://www.baowenplus.com', actionLabel: '🐆 打开豹纹工坊（豹纹+）选题' },
      { id: 4, title: '第 4 步 · 内容生成', desc: 'AI 批量生成图文 / 短视频内容（含文案 + 配图 + 配音 + 字幕）。', actionUrl: MIDJOURNEY, actionLabel: '🎨 打开 Midjourney 批量出图' },
      { id: 5, title: '第 5 步 · 内容发布', desc: '小红书 + 抖音 + 视频号多平台同步发布，并优化标题 / 标签 / 封面。', actionUrl: XHS_CREATOR, actionLabel: '📕 一键同步发布到小红书' },
      { id: 6, title: '第 6 步 · 媒体运营', desc: '主动互动 / 评论维护 / 私信回复，沉淀私域并接入流量主 + 商单。', actionUrl: DOUYIN_CREATOR, actionLabel: '🎵 打开抖音创作者后台' },
      { id: 7, title: '第 7 步 · 数据分析', desc: '分析播放 / 互动 / 涨粉 / 转化数据，定位爆款规律与待优化项。', actionUrl: 'https://www.dianzhentan.com', actionLabel: '🕵️ 打开店侦探数据分析' },
      { id: 8, title: '第 8 步 · 多号复制', desc: '将跑通的内容模型复制到 5-10 个账号 / 多平台矩阵放大。', actionUrl: 'https://www.xianfengpai.com.cn', actionLabel: '🎬 打开先锋派数字人矩阵' },
    ])
  }

  if (cat === '数字产品') {
    return buildWithSubs(project, [
      { id: 1, title: '第 1 步 · 选品定位', desc: `锁定 1 个细分品类（如 PPT 模板 / 头像定制 / 简历优化），明确你的核心交付物。`, actionUrl: 'https://www.baowenplus.com', actionLabel: '🦊 打开灵犀 AI 辅助选品' },
      { id: 2, title: '第 2 步 · 店铺注册', desc: '前往淘宝/小红书商家后台完成实名注册，预计 30 分钟。', actionUrl: TAOBAO_REGISTER, actionLabel: '🛒 打开淘宝商家后台' },
      { id: 3, title: '第 3 步 · AI 批量出图', desc: '用 AI 工具批量生成 10-20 款商品素材，零设计基础也能日更 10 个 SKU。', actionUrl: MIDJOURNEY, actionLabel: '🎨 打开 Midjourney' },
      { id: 4, title: '第 4 步 · 智能客服上线', desc: '配置自动发货 + AI 客服话术，7×24 小时自动成交。' },
      { id: 5, title: '第 5 步 · 内容矩阵冷启动', desc: '小红书 / 抖音双平台账号同步搭建，每天 3 条爆款笔记冷启。', actionUrl: XHS_CREATOR, actionLabel: '📕 打开小红书创作者中心' },
    ])
  }

  if (cat === '实物电商' || cat === '品牌实物') {
    return buildWithSubs(project, [
      { id: 1, title: '第 1 步 · 选品调研', desc: '用 AI 抓取 1688 爆款数据，筛选 3-5 个稳定货源，建立选品对比表。', actionUrl: 'https://www.dianzhentan.com', actionLabel: '🕵️ 打开店侦探' },
      { id: 2, title: '第 2 步 · 店铺注册', desc: project.level === 'trader' ? '一件代发小店：淘宝 / 拼多多 / 抖店 三选一完成注册。' : '品牌旗舰店：天猫/京东企业主体注册，准备好营业执照。', actionUrl: project.level === 'trader' ? PINDUODUO_REGISTER : TAOBAO_REGISTER, actionLabel: '🏪 打开商家后台' },
      { id: 3, title: '第 3 步 · AI 详情页', desc: 'AI 批量生成 50 个 SKU 主图 + 详情页文案，零设计也能日更。', actionUrl: DEEPSEEK, actionLabel: '🐋 打开 Deepseek' },
      { id: 4, title: '第 4 步 · 客服 + 物流配置', desc: '配置自动发货 + AI 智能客服，订单全流程自动化。', actionUrl: 'https://www.agiso.com', actionLabel: '⚡ 打开阿奇索自动发货' },
      { id: 5, title: '第 5 步 · 投流测试', desc: '小额投放测试 7 天 ROI，筛出爆品后主推。', actionUrl: DOUYIN_REGISTER, actionLabel: '🎵 打开抖店后台' },
    ])
  }

  if (cat === '全球电商') {
    return buildWithSubs(project, [
      { id: 1, title: '第 1 步 · 选市场', desc: '美国 / 欧洲 / 东南亚 三选一，匹配你的资源与时区。' },
      { id: 2, title: '第 2 步 · 跨境主体注册', desc: 'TikTok Shop 美区需美国主体（可先用 SSN 走个人店铺）。', actionUrl: AMAZON_REGISTER, actionLabel: '📦 打开亚马逊全球开店' },
      { id: 3, title: '第 3 步 · AI 多语言素材', desc: 'AI 生成英语 / 西班牙语 / 印尼语商品页，0 外语门槛。', actionUrl: DEEPSEEK, actionLabel: '🐋 打开 Deepseek' },
      { id: 4, title: '第 4 步 · 数字人口播', desc: '用数字人 + AI 配音生成 30 条短视频，本地化投放。', actionUrl: 'https://www.xianfengpai.com.cn', actionLabel: '🎬 打开先锋派数字人' },
      { id: 5, title: '第 5 步 · 冷启动投放', desc: 'Spark Ads + 联盟营销冷启，单月 GMV 破 1 万美金。', actionUrl: DOUYIN_CREATOR, actionLabel: '🎵 打开 TikTok 创作者' },
    ])
  }

  if (cat === '内容赛道') {
    return buildWithSubs(project, [
      { id: 1, title: '第 1 步 · 选垂类 + 人设', desc: '锁定 1 个内容垂类 + 人设（如 AI 工具测评 / 职场干货 / 生活方式）。' },
      { id: 2, title: '第 2 步 · 创作者平台注册', desc: '小红书 + 抖音双平台创作者中心注册 + 实名认证。', actionUrl: XHS_CREATOR, actionLabel: '📕 打开小红书创作者中心' },
      { id: 3, title: '第 3 步 · AI 选题 + 文案', desc: '用 AI 工具生成 30 天选题库 + 爆款文案，10 倍提效。', actionUrl: 'https://www.baowenplus.com', actionLabel: '🐆 打开豹纹工坊（豹纹+）' },
      { id: 4, title: '第 4 步 · AI 出图 + 剪辑', desc: 'AI 批量生成封面图 + 视频剪辑，0 后期也能日更 3 条。', actionUrl: MIDJOURNEY, actionLabel: '🎨 打开 Midjourney' },
      { id: 5, title: '第 5 步 · 流量主 + 商单接入', desc: '万粉后接入流量主 + 商单通道，客单价 5K+。', actionUrl: DOUYIN_CREATOR, actionLabel: '🎵 打开抖音创作者中心' },
    ])
  }

  if (cat === '技术研发') {
    return buildWithSubs(project, [
      { id: 1, title: '第 1 步 · MVP 边界', desc: '定义最小可行产品功能，砍掉一切不必要的特性。' },
      { id: 2, title: '第 2 步 · 技术选型', desc: 'Next.js + Supabase + Stripe 黄金栈，2 周可上线。', actionUrl: 'https://www.trae.cn', actionLabel: '🛠️ 打开 TRAE IDE' },
      { id: 3, title: '第 3 步 · AI 辅助编程', desc: '用 Cursor / TRAE AI 辅助编程，7 天内出 MVP。', actionUrl: DEEPSEEK, actionLabel: '🐋 打开 Deepseek' },
      { id: 4, title: '第 4 步 · 支付 + 部署', desc: '接入 Stripe / 微信支付，部署到 Vercel / 阿里云。' },
      { id: 5, title: '第 5 步 · 海外冷启', desc: 'Product Hunt + Twitter(X) 海外冷启动，获取首批 100 个用户。' },
    ])
  }

  if (cat === '渠道销售') {
    return buildWithSubs(project, [
      { id: 1, title: '第 1 步 · 选品签约', desc: '签约 1-2 个优质 AI 工具代理，拿到官方分成比例。' },
      { id: 2, title: '第 2 步 · 私域种子', desc: '冷启动 100 人私域种子用户，准备 30 套成交话术。' },
      { id: 3, title: '第 3 步 · 分销体系', desc: '搭建分销分成 + 邀请码体系，自动追踪转化。' },
      { id: 4, title: '第 4 步 · 内容种草', desc: '在小红书 / 视频号做工具测评种草，引流私域。', actionUrl: XHS_CREATOR, actionLabel: '📕 打开小红书' },
      { id: 5, title: '第 5 步 · 裂变放大', desc: '邀请奖励 + 拼团 + 直播转化，月入 10 万+。' },
    ])
  }

  if (cat === '企业服务') {
    return buildWithSubs(project, [
      { id: 1, title: '第 1 步 · 选行业', desc: '餐饮 / 教培 / 医美 / 家居 任选 1 个垂直，匹配本地企业资源。' },
      { id: 2, title: '第 2 步 · GEO 模板', desc: 'AI 批量生成 50+ 城市落地页，本地化 SEO 一次性铺开。' },
      { id: 3, title: '第 3 步 · 客户 BD', desc: '陌拜 / 转介绍 / 商会活动获取前 5 个种子客户。' },
      { id: 4, title: '第 4 步 · 案例包装', desc: '把前 5 个客户案例包装成可复制的标杆。' },
      { id: 5, title: '第 5 步 · 转介绍闭环', desc: '服务交付 + 客户转介绍，规模化复制到全国。' },
    ])
  }

  return buildWithSubs(project, [
    { id: 1, title: '第 1 步 · 启动准备', desc: '完成账号注册、实名认证、基础资料搭建。' },
    { id: 2, title: '第 2 步 · 选品定位', desc: '锁定目标细分品类，明确核心交付物。' },
    { id: 3, title: '第 3 步 · AI 工具配置', desc: '配置 AI 工具（豹纹工坊（豹纹+）/ 灵犀 AI / 先锋派数字人）提效 10 倍。', actionUrl: 'https://www.baowenplus.com', actionLabel: '🐆 打开豹纹工坊（豹纹+）' },
    { id: 4, title: '第 4 步 · 内容生产', desc: 'AI 批量生成首批 10 条内容 / 素材 / 商品页。' },
    { id: 5, title: '第 5 步 · 冷启动投放', desc: '单平台跑通首单 / 首粉闭环，准备规模化复制。' },
  ])
}

/** 把基础 SOP 数据加上子步骤 */
function buildWithSubs(project: ProjectItem, base: Omit<SOPTask, 'subSteps'>[]): SOPTask[] {
  return base.map((t, i) => ({
    ...t,
    subSteps: buildSubSteps(t as SOPTask, i, project),
  }))
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
  const [currentStep, setCurrentStep] = useState(0) // 已完成主步骤数
  const [subDone, setSubDone] = useState<Set<string>>(new Set()) // 子步骤完成集合
  const [mounted, setMounted] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showMedalModal, setShowMedalModal] = useState(false)

  // 沉浸式 SOP 体验新增 state
  const [isPaidMember, setIsPaidMember] = useState(false)
  const [expandedStep, setExpandedStep] = useState<number>(0) // 专注模式：只展开一个主步骤
  const [paywall, setPaywall] = useState<PaywallState>({ open: false, stepIndex: 0 })
  // [Task 2] ai-digital-shop-group 第 3 步完成时的"精准选品"付费解锁拦截
  const [unlockStepModal, setUnlockStepModal] = useState<UnlockStepModalState>({ open: false })
  // [Task 3] ai-digital-shop-group 第 3 步：4 个子任务全部打卡后，弹出橙黄色"解锁实操会员"横幅
  const [showUnlockBanner, setShowUnlockBanner] = useState(false)
  const [aiCoach, setAICoach] = useState<AICoachState>({
    open: false,
    loading: false,
    stepTitle: '',
    subStepTitle: '',
    guidance: '',
  })
  const [cheerMsg, setCheerMsg] = useState<string | null>(null)
  const [cheerVisible, setCheerVisible] = useState(false)
  const cheerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tasksRef = useRef<HTMLDivElement | null>(null)

  // 加载项目 + 读取本地进度 + 会员状态
  useEffect(() => {
    const p = getProjectBySlug(slug)
    if (!p) {
      setNotFound(true)
      return
    }
    setProject(p)
    const totalForSlug = buildSOPTasks(p).length
    const saved = readProgress(slug)
    setCurrentStep(Math.min(saved, totalForSlug))
    setSubDone(readSubProgress(slug))
    setIsPaidMember(readIsPaidMember())
    setMounted(true)
  }, [slug])

  const tasks = useMemo<SOPTask[]>(() => {
    if (!project) return []
    return buildSOPTasks(project)
  }, [project])

  const totalSteps = tasks.length
  const progressPct = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0
  const isCompleted = totalSteps > 0 && currentStep >= totalSteps

  // 自动展开当前主步骤（仅在 mounted 后设置一次）
  // [测试模式] 默认展开第 4 步（idx=3），便于编辑与全流程测试
  useEffect(() => {
    if (mounted && !isCompleted) {
      if (UNLOCK_ALL_STEPS_FOR_TESTING) {
        setExpandedStep(3)
      } else {
        setExpandedStep(Math.min(currentStep, totalSteps - 1))
      }
    }
  }, [mounted]) // eslint-disable-line react-hooks/exhaustive-deps

  // 加载完成后判断是否显示庆祝横幅 + 勋章弹窗
  useEffect(() => {
    if (mounted && isCompleted) {
      setShowCelebration(true)
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
        const alreadyShown = window.sessionStorage.getItem(MEDAL_MODAL_SESSION_KEY)
        if (!alreadyShown) {
          window.sessionStorage.setItem(MEDAL_MODAL_SESSION_KEY, slug)
          setTimeout(() => setShowMedalModal(true), 300)
        }
      } catch {
        // 静默
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
      // 静默失败
    } finally {
      setSyncing(false)
    }
  }

  // 触发鼓励语（带闪光特效）
  const triggerCheer = useCallback((context: 'sub-step-done' | 'main-step-done' | 'all-steps-done') => {
    const level: OPCLevel = readUserLevel()
    const msg = pickCheer(level, context)
    setCheerMsg(msg)
    setCheerVisible(true)
    if (cheerTimerRef.current) clearTimeout(cheerTimerRef.current)
    cheerTimerRef.current = setTimeout(() => setCheerVisible(false), 3200)
  }, [])

  // 标记某个子步骤完成（圆形选择框点击）
  const handleToggleSubStep = useCallback(
    (stepIdx: number, subId: string) => {
      setSubDone((prev) => {
        const next = new Set(prev)
        const key = `step${stepIdx}-${subId}`
        if (next.has(key)) {
          next.delete(key)
          writeSubProgress(slug, next)
          return next
        }
        next.add(key)
        writeSubProgress(slug, next)
        // 子步骤反馈（仅在新增完成时触发）
        triggerCheer('sub-step-done')
        // 判断该主步骤是否全部子步骤完成
        const task = tasks[stepIdx]
        if (task) {
          const allKeys = task.subSteps.map((s) => `step${stepIdx}-${s.id}`)
          const allDone = allKeys.every((k) => next.has(k))
          if (allDone) {
            // [Task 2] ai-digital-shop-group 第 3 步完成时拦截：阻止进入第 4 步精准选品
            // 条件：1) 当前是 ai-digital-shop-group；2) 完成的是第 3 步（stepIdx=2）；3) 用户未付费
            // [测试模式] UNLOCK_ALL_STEPS_FOR_TESTING 为 true 时跳过拦截
            // 已完成所有子步骤的 subDone 仍会写入 localStorage，仅阻止 currentStep 推进
            if (
              !UNLOCK_ALL_STEPS_FOR_TESTING &&
              slug === 'ai-digital-shop-group' &&
              stepIdx === 2 &&
              !isPaidMember
            ) {
              triggerCheer('main-step-done')
              setUnlockStepModal({ open: true })
              // [Task 3] 同时显示第 3 步底部的"解锁实操会员"橙黄色横幅
              setShowUnlockBanner(true)
              return next
            }
            // [Task 3] ai-digital-shop-group 第 3 步（已付费用户）：子步骤全完成时也展示横幅
            // （即便已付费，横幅仍可作为"已解锁享受完整 SOP"的正向激励）
            if (slug === 'ai-digital-shop-group' && stepIdx === 2) {
              setShowUnlockBanner(true)
            }
            // 推进到下一个主步骤
            const nextMain = Math.max(currentStep, stepIdx + 1)
            if (nextMain > currentStep) {
              setCurrentStep(nextMain)
              persistStep(nextMain)
              setExpandedStep(Math.min(nextMain, totalSteps - 1))
              triggerCheer(nextMain >= totalSteps ? 'all-steps-done' : 'main-step-done')
            } else {
              triggerCheer('main-step-done')
            }
          }
        }
        return next
      })
    },
    [slug, tasks, currentStep, totalSteps, triggerCheer, isPaidMember]
  )

  // 重置进度
  const handleResetProgress = () => {
    setCurrentStep(0)
    setSubDone(new Set())
    writeProgress(slug, 0)
    writeSubProgress(slug, new Set())
    setShowCelebration(false)
    setShowMedalModal(false)
    setExpandedStep(0)
    try {
      window.sessionStorage.removeItem(MEDAL_MODAL_SESSION_KEY)
    } catch {
      // 静默
    }
  }

  // 打开 AI 教练对话框
  const openAICoach = useCallback(
    async (stepIdx: number, subIdx: number) => {
      const task = tasks[stepIdx]
      const sub = task?.subSteps[subIdx]
      if (!task || !sub) return
      setAICoach({
        open: true,
        loading: true,
        stepTitle: task.title,
        subStepTitle: sub.title,
        actionUrl: sub.actionUrl,
        guidance: '',
      })
      try {
        const r = await fetch('/api/ai/practice-script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectTitle: project?.title || '当前项目',
            stepTitle: task.title,
            subStepTitle: sub.title,
            actionUrl: sub.actionUrl,
          }),
        })
        const j = await r.json().catch(() => null)
        const guidance = j?.data?.guidance || '暂无指引，请稍后再试。'
        setAICoach((prev) => ({ ...prev, loading: false, guidance }))
      } catch {
        setAICoach((prev) => ({
          ...prev,
          loading: false,
          guidance: '网络异常，请稍后再试。',
        }))
      }
    },
    [tasks, project?.title]
  )

  /**
   * 任务 3：一键召唤 AI 私教（项目 SOP 上下文）
   * - 写入 localStorage（opc_ai_assistant_step::slug）供 AIAssistant 读取
   * - 写入 sessionStorage 项目标题缓存（避免闪烁）
   * - 派发 lps:open-ai-assistant 自定义事件，AIAssistant 展开面板
   */
  const openAIAssistantForTask = useCallback(
    (stepIdx: number) => {
      if (typeof window === 'undefined') return
      const task = tasks[stepIdx]
      if (!task) return
      try {
        // 1. 写入当前步骤到 localStorage（任务 1 在 AIAssistant 中读取）
        window.localStorage.setItem(`opc_ai_assistant_step::${slug}`, String(stepIdx))
        // 2. 写入主步骤进度（确保 AIAssistant 读取到正确的 currentStep）
        if (typeof currentStep === 'number' && currentStep > 0) {
          window.localStorage.setItem(`opc_sop_progress::${slug}`, String(currentStep))
        }
        // 3. 缓存项目标题到 sessionStorage
        if (project?.title) {
          window.sessionStorage.setItem(`opc_project_title::${slug}`, project.title)
        }
        // 4. 派发自定义事件
        window.dispatchEvent(
          new CustomEvent('lps:open-ai-assistant', {
            detail: {
              slug,
              stepId: stepIdx,
              stepTitle: task.title,
            },
          })
        )
      } catch {
        // 静默
      }
    },
    [slug, project?.title, tasks, currentStep]
  )

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
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl min-h-[44px]"
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
              {isPaidMember && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-400/40 backdrop-blur-sm border border-amber-300/60 text-white rounded-full px-2.5 py-1 font-bold">
                  <Crown size={11} />
                  会员专享
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

      {/* ════════ 主体：沉浸式 SOP 通关计划 ═════ */}
      <main className="px-4 -mt-6">
        <div className="max-w-3xl mx-auto">
          {/* ─────── [Task 1] 关卡胶囊进度条（8 段）─────── */}
          <section className="bg-white rounded-2xl shadow-sm p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-blue-600" />
                <h2 className="text-base md:text-lg font-bold text-slate-900">关卡进度</h2>
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
            <div className="flex items-center gap-1.5 md:gap-2">
              {tasks.map((_, i) => {
                const isDone = i < currentStep
                const isCurrent = i === currentStep && !isCompleted
                return (
                  <motion.div
                    key={i}
                    initial={false}
                    animate={
                      isCurrent
                        ? { scale: [1, 1.06, 1] }
                        : { scale: 1 }
                    }
                    transition={
                      isCurrent
                        ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                        : { type: 'spring', stiffness: 320, damping: 22 }
                    }
                    className={cn(
                      'flex-1 h-7 md:h-8 rounded-full border flex items-center justify-center text-[10px] md:text-xs font-bold tabular-nums transition-colors',
                      isDone && 'bg-emerald-500 border-emerald-500 text-white',
                      isCurrent && 'bg-blue-50 border-blue-500 text-blue-700 shadow-md shadow-blue-200/50',
                      !isDone && !isCurrent && 'bg-slate-100 border-slate-200 text-slate-400'
                    )}
                  >
                    {isDone ? <Check size={12} className="md:hidden" strokeWidth={3} /> : null}
                    {isDone ? <Check size={14} className="hidden md:block" strokeWidth={3} /> : null}
                    {!isDone && (
                      <span>
                        {i + 1}
                        <span className="opacity-60">/{totalSteps}</span>
                      </span>
                    )}
                  </motion.div>
                )
              })}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span>完成 {progressPct}%</span>
              <span className="hidden md:inline">预计 5 天可完成全部 {totalSteps} 步</span>
              <span className="md:hidden">{totalSteps} 步通关计划</span>
            </div>
          </section>

          {/* ─────── [Task 2] 专注模式：单步展开 + 圆形选择框 ─────── */}
          <section ref={tasksRef} className="mt-6 flex flex-col gap-3 w-full max-w-3xl mx-auto">
            {tasks.map((task, idx) => {
              const isDone = idx < currentStep
              const isActive = idx === currentStep
              // 测试模式：idx >= 3 的步骤直接视为已解锁
              const isLocked = UNLOCK_ALL_STEPS_FOR_TESTING && idx >= 3 ? false : idx > currentStep
              const isExpanded = expandedStep === idx
              const isFree = idx < FREE_MAIN_STEPS
              const allSubsDone = task.subSteps.every((s) => subDone.has(`step${idx}-${s.id}`))
              const completedSubsCount = task.subSteps.filter((s) => subDone.has(`step${idx}-${s.id}`)).length

              // 未解锁：缩略卡
              if (isLocked) {
                return (
                  <button
                    type="button"
                    key={task.id}
                    onClick={() => setExpandedStep(idx)}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors min-h-[48px]"
                  >
                    <div className="w-9 h-9 flex-shrink-0 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
                      <Lock size={14} className="text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-700 truncate">
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        需先完成前 {idx} 步
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5 tabular-nums">
                      {idx + 1}/{totalSteps}
                    </div>
                  </button>
                )
              }

              // 已完成：可展开的折叠卡
              if (isDone && !isExpanded) {
                return (
                  <button
                    type="button"
                    key={task.id}
                    onClick={() => setExpandedStep(idx)}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors min-h-[48px]"
                  >
                    <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
                      <CheckCircle2 size={18} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-emerald-800 truncate line-through opacity-70">
                        {task.title}
                      </div>
                      <div className="text-[11px] text-emerald-600 mt-0.5">
                        ✅ 已完成 · {completedSubsCount}/{task.subSteps.length} 子任务
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 bg-emerald-100 rounded-full px-2 py-0.5">
                      查看
                    </div>
                  </button>
                )
              }

              // 展开态（当前活跃 or 用户主动展开）
              return (
                <motion.div
                  layout
                  key={task.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                  className={cn(
                    'relative rounded-2xl border p-5 md:p-6',
                    isActive && 'bg-white border-blue-300 ring-2 ring-blue-400/40 shadow-xl shadow-blue-100/50',
                    !isActive && isDone && 'bg-emerald-50/30 border-emerald-200',
                  )}
                >
                  {/* 顶部：步骤标识 + 标题 */}
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 md:w-11 md:h-11 flex-shrink-0 rounded-full flex items-center justify-center font-extrabold text-sm shadow-md',
                        isActive && 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white ring-4 ring-blue-100',
                        !isActive && isDone && 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white'
                      )}
                    >
                      {isDone ? <CheckCircle2 size={20} strokeWidth={2.5} /> : task.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base md:text-lg font-extrabold text-slate-900 leading-tight">
                          {task.title}
                        </h3>
                        {isFree ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5">
                            <Sparkles size={9} />
                            体验
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0.5">
                            <Crown size={9} />
                            会员
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs md:text-sm text-slate-600 leading-relaxed">
                        {task.desc}
                      </p>
                    </div>
                    {isActive && (
                      <button
                        type="button"
                        onClick={() => setExpandedStep(-1)}
                        className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded min-h-[44px] flex items-center"
                      >
                        收起
                      </button>
                    )}
                  </div>

                  {/* 子步骤列表 */}
                  <div className="mt-5 flex flex-col gap-2">
                    {task.subSteps.map((sub, subIdx) => {
                      const subKey = `step${idx}-${sub.id}`
                      const subChecked = subDone.has(subKey)
                      // 付费门控：未付费 + 超出免费配额 = 锁定
                      // [Task 2] 例外：ai-digital-shop-group 第 3 步（idx=2）允许打卡
                      // [测试模式] 例外：idx >= 3 的步骤强制解锁
                      const isSubLocked =
                        !UNLOCK_ALL_STEPS_FOR_TESTING &&
                        !isPaidMember &&
                        idx >= FREE_MAIN_STEPS &&
                        !(slug === 'ai-digital-shop-group' && idx === 2)
                      return (
                        <div
                          key={sub.id}
                          className={cn(
                            'group relative flex items-start gap-3 rounded-xl border p-3 md:p-3.5 transition-all min-h-[64px]',
                            subChecked
                              ? 'border-emerald-200 bg-emerald-50/50'
                              : isSubLocked
                                ? 'border-slate-200 bg-slate-50/40'
                                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                          )}
                        >
                          {/* 圆形选择框（Notion 风格） */}
                          <button
                            type="button"
                            onClick={() => !isSubLocked && handleToggleSubStep(idx, sub.id)}
                            disabled={isSubLocked}
                            className={cn(
                              'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all min-h-[28px]',
                              subChecked
                                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-500 text-white shadow-sm'
                                : isSubLocked
                                  ? 'border-slate-200 bg-slate-100 cursor-not-allowed'
                                  : 'border-slate-300 bg-white group-hover:border-blue-500 hover:scale-110 active:scale-95'
                            )}
                            aria-label={subChecked ? '取消完成' : '标记完成'}
                          >
                            <AnimatePresence>
                              {subChecked && (
                                <motion.div
                                  initial={{ scale: 0, rotate: -90 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  exit={{ scale: 0, rotate: 90 }}
                                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                                >
                                  <Check size={16} strokeWidth={3.5} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </button>

                          {/* 子步骤内容 */}
                          <div className="flex-1 min-w-0">
                            <div
                              className={cn(
                                'text-sm font-bold leading-snug',
                                subChecked ? 'text-slate-400 line-through' : 'text-slate-900'
                              )}
                            >
                              {sub.title}
                            </div>
                            <div
                              className={cn(
                                'mt-0.5 text-xs leading-relaxed',
                                subChecked ? 'text-slate-400' : 'text-slate-500'
                              )}
                            >
                              {sub.desc}
                            </div>
                            {/* 多行胶囊按钮（任务升级：仅作快捷通道，无打卡功能） */}
                            {sub.extraLinks && sub.extraLinks.length > 0 && !subChecked && !isSubLocked && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {sub.extraLinks.map((lk, lkIdx) => (
                                  <a
                                    key={`${sub.id}-lk-${lkIdx}`}
                                    href={lk.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition min-h-[28px] inline-flex items-center gap-1"
                                  >
                                    <ExternalLink size={10} className="text-slate-400" />
                                    {lk.label}
                                  </a>
                                ))}
                              </div>
                            )}
                            {/* 操作链接 */}
                            {sub.actionUrl && !subChecked && !isSubLocked && (
                              <a
                                href={sub.actionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors min-h-[28px]"
                              >
                                <ExternalLink size={11} />
                                {sub.actionLabel || '打开相关工具'}
                              </a>
                            )}
                          </div>

                          {/* AI 助手悬浮按钮 [Task 4] */}
                          {!subChecked && !isSubLocked && (
                            <button
                              type="button"
                              onClick={() => openAICoach(idx, subIdx)}
                              className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all min-h-[36px]"
                              aria-label="AI 助手"
                            >
                              <Brain size={16} />
                            </button>
                          )}
                        </div>
                      )
                    })}

                    {/* [Task 新增] ai-digital-shop-group 第 3 步：4 个子任务共用统一的"前往千牛工作台"全局跳转入口
                        - 位置：subSteps 列表下方、付费解锁横幅上方
                        - 仅当 slug === 'ai-digital-shop-group' 且 idx === 2 时渲染
                        - 子任务卡片内的重复按钮已在数据层移除 */}
                    {slug === 'ai-digital-shop-group' && idx === 2 && (
                      <a
                        href="https://work.taobao.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 bg-blue-50/50 hover:bg-blue-100 border border-blue-200/50 text-blue-700 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors w-fit min-h-[40px] shadow-sm hover:shadow-md active:scale-[0.98]"
                      >
                        <span aria-hidden="true">📍</span>
                        <span>前往千牛工作台</span>
                        <ExternalLink size={12} className="text-blue-500" />
                        <span aria-hidden="true">→</span>
                      </a>
                    )}

                    {/* [Task 3] 付费解锁·欲望钩子：
                          - ai-digital-shop-group 第 3 步（idx=2）：受 showUnlockBanner 控制，默认隐藏，子任务全完成时弹出
                          - 其他项目/步骤：保持原逻辑（!isPaidMember && idx >= FREE_MAIN_STEPS）
                          - [测试模式] idx >= 3 不显示付费横幅 */}
                    {(() => {
                      if (UNLOCK_ALL_STEPS_FOR_TESTING && idx >= 3) return null
                      const isAiShopStep3 = slug === 'ai-digital-shop-group' && idx === 2
                      const shouldShow = isAiShopStep3
                        ? showUnlockBanner && !isPaidMember
                        : !isPaidMember && idx >= FREE_MAIN_STEPS
                      if (!shouldShow) return null
                      return (
                        <motion.div
                          key="unlock-banner"
                          initial={{ opacity: 0, y: 24, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 12, scale: 0.98 }}
                          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                          className="mt-2 relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border border-amber-200 p-4"
                        >
                          <div className="absolute -top-6 -right-6 w-20 h-20 bg-amber-300/30 rounded-full blur-2xl" />
                          <div className="relative flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md">
                              <Crown size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-extrabold text-amber-900 leading-tight">
                                🔒 完成该步骤需要加入实操会员
                              </div>
                              <p className="mt-1 text-xs text-amber-800/80 leading-relaxed">
                                您当前已完成前 {currentStep} 步，离这个进阶玩法只差一步之遥。加入会员，您不仅能看到详细清单，还能获得 AI 随行教练的实时反馈。
                              </p>
                              <Link
                                href="/pricing#plan-monthly-69"
                                onClick={() => setPaywall({ open: false, stepIndex: 0 })}
                                className="mt-3 inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-extrabold px-4 py-2 rounded-lg shadow-sm hover:shadow-md active:scale-95 transition-all min-h-[36px]"
                              >
                                <Zap size={12} />
                                解锁并开启陪跑 →
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })()}

                    {/* [Task 2] 继续至精准选品按钮：仅 ai-digital-shop-group 第 3 步 + 已付费 + 子步骤全完成时显示 */}
                    {slug === 'ai-digital-shop-group' &&
                      idx === 2 &&
                      isPaidMember &&
                      (() => {
                        const allSubs = task.subSteps.map((s) => `step${idx}-${s.id}`)
                        const allSubDone = allSubs.every((k) => subDone.has(k))
                        if (!allSubDone) return null
                        const nextMain = idx + 1
                        const alreadyAdvanced = currentStep > idx
                        return (
                          <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-extrabold text-emerald-900">
                                🎉 千牛工作台 4 大配置已完成
                              </div>
                              <p className="mt-0.5 text-xs text-emerald-800/80 leading-relaxed">
                                基础设置已就位，下一步进入"精准选品"——用 AI 锁定 3-5 个高复购候选品类。
                              </p>
                            </div>
                            <button
                              type="button"
                              disabled={alreadyAdvanced}
                              onClick={() => {
                                if (alreadyAdvanced) return
                                const nm = Math.max(currentStep, nextMain)
                                setCurrentStep(nm)
                                persistStep(nm)
                                setExpandedStep(Math.min(nm, totalSteps - 1))
                                triggerCheer('main-step-done')
                              }}
                              className={cn(
                                'inline-flex items-center justify-center gap-1.5 text-xs font-extrabold px-4 py-2.5 rounded-lg shadow-sm transition-all min-h-[44px] whitespace-nowrap',
                                alreadyAdvanced
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white hover:shadow-md active:scale-95'
                              )}
                            >
                              {alreadyAdvanced ? '已进入下一步' : '继续至精准选品 →'}
                            </button>
                          </div>
                        )
                      })()}
                  </div>

                  {/* 任务 3：一键召唤 AI 私教入口（任务卡片底部 · 右侧） */}
                  <div className="mt-4 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => openAIAssistantForTask(idx)}
                      className="inline-flex items-center gap-1.5 text-[11px] md:text-xs font-bold text-violet-700 hover:text-white bg-violet-50 hover:bg-gradient-to-r hover:from-violet-500 hover:to-purple-600 border border-violet-200 hover:border-transparent px-2.5 py-1.5 rounded-full transition-all min-h-[32px] shadow-sm hover:shadow-md active:scale-95"
                      aria-label="咨询AI教练"
                      title="召唤 AI 私教，针对此步骤给你实操答疑"
                    >
                      <MessageSquare size={12} />
                      <span>咨询AI教练</span>
                    </button>
                  </div>

                  {/* 主步骤完成时的反馈条 */}
                  {isDone && allSubsDone && (
                    <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <Sparkles size={11} />
                      已完成本关所有子任务
                    </div>
                  )}
                </motion.div>
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
                    className="inline-flex items-center justify-center gap-1.5 bg-white text-emerald-700 font-extrabold text-sm px-4 py-2.5 rounded-xl shadow-md hover:scale-105 transition-transform min-h-[44px]"
                  >
                    <Rocket size={15} />
                    进入矩阵放大
                  </Link>
                  <button
                    type="button"
                    onClick={handleResetProgress}
                    className="inline-flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/30 transition-colors min-h-[44px]"
                  >
                    重新开始
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* ════════ [Task 4] AI 教练底部对话框 ═════ */}
      <AnimatePresence>
        {aiCoach.open && (
          <motion.div
            key="ai-coach"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl border-t-2 border-violet-300 max-h-[70vh] flex flex-col"
          >
            {/* 顶部把手 + 标题 */}
            <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                  <Brain size={16} />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900">
                    AI 随行教练
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {aiCoach.stepTitle} · {aiCoach.subStepTitle}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAICoach((p) => ({ ...p, open: false }))}
                className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 min-h-[36px]"
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            </div>

            {/* 内容区 */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {aiCoach.loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Loader2 size={28} className="animate-spin text-violet-500" />
                  <div className="text-xs text-slate-500">AI 教练正在为你生成指引…</div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                  {aiCoach.guidance}
                </div>
              )}
              {aiCoach.actionUrl && !aiCoach.loading && (
                <a
                  href={aiCoach.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md active:scale-95 transition-all min-h-[40px]"
                >
                  <ExternalLink size={12} />
                  立即打开目标平台
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════ [Task 3] 付费解锁弹窗（欲望钩子）══════ */}
      <AnimatePresence>
        {paywall.open && (
          <motion.div
            key="paywall"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[55] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setPaywall({ open: false, stepIndex: 0 })}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="relative w-full max-w-md bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-amber-200 overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-300/40 rounded-full blur-3xl" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-rose-300/40 rounded-full blur-3xl" />

              <button
                type="button"
                onClick={() => setPaywall({ open: false, stepIndex: 0 })}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/60 hover:bg-white flex items-center justify-center text-slate-500 min-h-[36px]"
                aria-label="关闭"
              >
                <X size={16} />
              </button>

              <div className="relative text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg mb-4">
                  <Crown size={28} className="text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-extrabold text-amber-900 leading-tight">
                  🔒 解锁完整 SOP 子步骤
                </h3>
                <p className="mt-3 text-sm text-slate-700 leading-relaxed text-left">
                  这套细致的 SOP 子步骤是 <strong>69 元实操会员</strong> 的专属权益。加入会员，您不仅能看到详细清单，还能获得 <strong>AI 随行教练的实时反馈</strong>，让每一步都走对。
                </p>

                <div className="mt-5 space-y-2 text-left">
                  {[
                    { emoji: '🎯', label: `解锁全 ${tasks.length} 步 + ${tasks.reduce((sum, t) => sum + t.subSteps.length, 0)} 个子任务 SOP` },
                    { emoji: '🧠', label: 'AI 随行教练 7×24 实时指引' },
                    { emoji: '📚', label: '良朋社 OPC 智富社群每日资源对接' },
                  ].map((b) => (
                    <div key={b.label} className="flex items-center gap-2 text-xs text-slate-700">
                      <span>{b.emoji}</span>
                      <span>{b.label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    href="/join"
                    onClick={() => setPaywall({ open: false, stepIndex: 0 })}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-extrabold px-5 py-3 rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all min-h-[48px]"
                  >
                    <Zap size={14} />
                    解锁并开启指导 →
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPaywall({ open: false, stepIndex: 0 })}
                    className="text-xs text-slate-500 hover:text-slate-700 min-h-[44px]"
                  >
                    稍后再说
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════ [Task 2] 第 3 步完成时的"精准选品"付费解锁拦截（仅 ai-digital-shop-group）══════ */}
      <AnimatePresence>
        {unlockStepModal.open && slug === 'ai-digital-shop-group' && (
          <motion.div
            key="unlock-step-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[56] flex items-center justify-center px-4 bg-black/55 backdrop-blur-sm"
            onClick={() => setUnlockStepModal({ open: false })}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 md:p-7 shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br from-blue-300/30 to-violet-300/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-br from-amber-200/30 to-rose-200/30 rounded-full blur-3xl pointer-events-none" />

              <button
                type="button"
                onClick={() => setUnlockStepModal({ open: false })}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 min-h-[36px]"
                aria-label="关闭"
              >
                <X size={16} />
              </button>

              <div className="relative text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg mb-4">
                  <Lock size={26} className="text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-extrabold text-slate-900 leading-tight">
                  🔓 解锁核心选品权限
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed text-left">
                  精准选品是店群项目的核心。要解锁后续步骤与完整 AI 选品支持，请加入<strong className="text-slate-900">实操会员</strong>或<strong className="text-slate-900">陪跑计划</strong>。
                </p>

                <div className="mt-5 space-y-2.5 text-left">
                  {[
                    { emoji: '🎯', label: '解锁 4-8 步精准选品 SOP + AI 选品工具栈' },
                    { emoji: '🧠', label: 'AI 随行教练 7×24 实操答疑' },
                    { emoji: '📈', label: '精准选品后 100% 复购方向 + 客单提升' },
                  ].map((b) => (
                    <div key={b.label} className="flex items-start gap-2 text-xs text-slate-700">
                      <span>{b.emoji}</span>
                      <span className="leading-relaxed">{b.label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  {/* 按钮 A：69 元/月 */}
                  <Link
                    href="/pricing#plan-monthly-69"
                    onClick={() => setUnlockStepModal({ open: false })}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-extrabold px-5 py-3 rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all min-h-[48px]"
                  >
                    <Sparkles size={14} />
                    【69元/月 解锁】 →
                  </Link>
                  {/* 按钮 B：199 元/年 */}
                  <Link
                    href="/pricing#plan-annual-199"
                    onClick={() => setUnlockStepModal({ open: false })}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-extrabold px-5 py-3 rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all min-h-[48px]"
                  >
                    <Crown size={14} />
                    【199元/年 会员】 →
                  </Link>
                  {/* 按钮 C：598/1980 陪跑（双选项） */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/pricing#plan-light-598"
                      onClick={() => setUnlockStepModal({ open: false })}
                      className="inline-flex items-center justify-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-extrabold px-3 py-3 rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all min-h-[48px]"
                    >
                      <Zap size={12} />
                      598 轻陪跑
                    </Link>
                    <Link
                      href="/pricing#plan-deep-1980"
                      onClick={() => setUnlockStepModal({ open: false })}
                      className="inline-flex items-center justify-center gap-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-extrabold px-3 py-3 rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all min-h-[48px]"
                    >
                      <Target size={12} />
                      1980 深度陪跑
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUnlockStepModal({ open: false })}
                    className="text-xs text-slate-500 hover:text-slate-700 min-h-[44px]"
                  >
                    稍后再说，继续逛逛
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════ [Task 5] 鼓励语闪光特效（页面中央）══════ */}
      <AnimatePresence>
        {cheerVisible && cheerMsg && (
          <motion.div
            key="cheer"
            initial={{ opacity: 0, scale: 0.5, y: 30 }}
            animate={{
              opacity: 1,
              scale: [0.5, 1.1, 1],
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed inset-x-0 top-1/3 z-[60] flex items-center justify-center px-4 pointer-events-none"
          >
            <div className="relative">
              {/* 闪光光晕 */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0.8, 0],
                }}
                transition={{ duration: 1.2, repeat: 0 }}
                className="absolute inset-0 rounded-full bg-amber-300 blur-2xl"
              />
              {/* 中心粒子 */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.5],
                    x: Math.cos((i / 8) * Math.PI * 2) * 60,
                    y: Math.sin((i / 8) * Math.PI * 2) * 60,
                  }}
                  transition={{ duration: 1.4, delay: 0.1, ease: 'easeOut' }}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-amber-400"
                />
              ))}
              <div className="relative bg-gradient-to-r from-amber-400 via-yellow-400 to-rose-400 text-white text-base md:text-lg font-extrabold px-6 py-3 md:px-8 md:py-4 rounded-2xl shadow-2xl border-2 border-white/60">
                {cheerMsg}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════ 奖杯弹窗（100% 完成时的中央仪式感特效）══════ */}
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
              <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-emerald-50 rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-amber-200 overflow-hidden">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-300/40 rounded-full blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-300/40 rounded-full blur-3xl" />
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
                    <motion.div
                      animate={{ scale: [0, 1.2, 1], rotate: [0, 180, 360] }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg ring-2 ring-white"
                    >
                      <Award size={16} className="text-white" />
                    </motion.div>
                  </motion.div>

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
                    《{project.title}》SOP 全 {totalSteps} 步完成 · 勋章已永久存入你的账户
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8, duration: 0.4 }}
                    className="mt-6 flex flex-col sm:flex-row gap-2 w-full"
                  >
                    <Link
                      href="/scale-up"
                      onClick={() => setShowMedalModal(false)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white text-sm font-extrabold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all min-h-[48px]"
                    >
                      <Rocket size={15} />
                      进入矩阵放大
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShowMedalModal(false)}
                      className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-colors min-h-[48px]"
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

      {/* ════════ 底部固定：仅"返回项目库"胶囊按钮 ═════ */}
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
