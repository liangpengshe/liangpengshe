'use client'

import { useState } from 'react'

type DifyApp = {
  key: string
  name: string
  desc: string
  color: string
  emoji: string
  method: 'POST' | 'GET'
  path: string
  body: any
  enabled: boolean
  fields: Array<{
    key: string
    label: string
    type: 'text' | 'textarea' | 'date' | 'select'
    placeholder?: string
    options?: string[]
    required?: boolean
    defaultValue?: string
  }>
}

const APPS: DifyApp[] = [
  {
    key: 'TOOL',
    name: 'AI 工具栈推荐器',
    desc: '根据用户业务需求，智能推荐 AI 工具组合',
    color: 'from-blue-500 to-cyan-500',
    emoji: '🛠️',
    method: 'POST',
    path: '/api/ai/tools-recommend',
    enabled: true,
    fields: [
      {
        key: 'userInput',
        label: '业务需求描述',
        type: 'textarea',
        placeholder: '例如：我想做 AI 数字人短视频带货，请推荐工具栈',
        required: true,
        defaultValue: '我想做 AI 数字人短视频带货，请推荐工具栈',
      },
    ],
  },
  {
    key: 'PLAN',
    name: 'AI 个人商业规划师',
    desc: '基于年龄/收入目标/背景，生成 AI 商业规划报告',
    color: 'from-purple-500 to-pink-500',
    emoji: '🎯',
    method: 'POST',
    path: '/api/ai/project-plan',
    enabled: true,
    fields: [
      { key: 'name', label: '姓名', type: 'text', required: true, defaultValue: '张三' },
      { key: 'phone', label: '手机号', type: 'text', required: true, defaultValue: '13800138000' },
      { key: 'birthday', label: '出生日期', type: 'date', required: true, defaultValue: '1990-01-01' },
      {
        key: 'targetIncome',
        label: '目标年收入',
        type: 'select',
        required: true,
        options: ['30万', '50万', '100万', '200万', '500万'],
        defaultValue: '100万',
      },
      {
        key: 'background',
        label: '职业背景',
        type: 'textarea',
        required: true,
        defaultValue: '5 年电商运营经验，熟悉抖音/小红书，想用 AI 转型一人公司',
      },
    ],
  },
  {
    key: 'DIAGNOSE',
    name: 'AI 企业转型诊断师',
    desc: '为传统企业诊断 AI 转型路径与优先动作',
    color: 'from-amber-500 to-orange-500',
    emoji: '🩺',
    method: 'POST',
    path: '/api/ai/diagnose',
    enabled: true,
    fields: [
      { key: 'name', label: '姓名', type: 'text', required: true, defaultValue: '李总' },
      { key: 'phone', label: '联系方式', type: 'text', required: true, defaultValue: '13900139000' },
      {
        key: 'role',
        label: '角色',
        type: 'select',
        required: true,
        options: ['创业者', '企业高管', '产品经理', '运营负责人', '市场负责人', '其他'],
        defaultValue: '创业者',
      },
      {
        key: 'goals',
        label: '目标（逗号分隔）',
        type: 'text',
        required: true,
        defaultValue: '降本增效,流量获取,品牌升级',
      },
      {
        key: 'description',
        label: '现状描述',
        type: 'textarea',
        required: true,
        defaultValue: '传统制造企业，年营收 2000 万，员工 50 人，想用 AI 升级内容营销与客户运营',
      },
    ],
  },
  {
    key: 'DAILY',
    name: 'AI 智富日报生成器',
    desc: '聚合昨日活动，生成每日 AI 智富日报',
    color: 'from-pink-500 to-rose-500',
    emoji: '🌅',
    method: 'POST',
    path: '/api/ai/daily-brief',
    enabled: true,
    fields: [
      { key: 'userId', label: '用户 ID', type: 'text', required: true, defaultValue: 'test-opc-001' },
      { key: 'force', label: '强制刷新（true/false）', type: 'text', defaultValue: 'true' },
    ],
  },
  {
    key: 'BRAND',
    name: 'AI 品牌赋能分析师',
    desc: '为品牌方生成 AI 增长赋能报告（暂未启用）',
    color: 'from-slate-400 to-slate-600',
    emoji: '🏷️',
    method: 'POST',
    path: '/api/ai/brand-analyze',
    enabled: false,
    fields: [
      { key: 'name', label: '联系人', type: 'text', required: true },
      { key: 'phone', label: '联系方式', type: 'text', required: true },
      { key: 'brand', label: '品牌名', type: 'text', required: true },
      { key: 'industry', label: '行业', type: 'text', required: true },
    ],
  },
]

export default function TestDifyPage() {
  const [activeKey, setActiveKey] = useState<string>('TOOL')
  const [form, setForm] = useState<Record<string, Record<string, string>>>(() => {
    const m: Record<string, Record<string, string>> = {}
    APPS.forEach((a) => {
      m[a.key] = {}
      a.fields.forEach((f) => {
        m[a.key][f.key] = f.defaultValue || ''
      })
    })
    return m
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [rawText, setRawText] = useState<string>('')
  const [responseTime, setResponseTime] = useState<number>(0)

  const active = APPS.find((a) => a.key === activeKey)!

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [activeKey]: { ...prev[activeKey], [key]: value } }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setResult(null)
    setRawText('')
    setResponseTime(0)
    const t0 = Date.now()
    try {
      let url = active.path
      const opts: RequestInit = { method: active.method, headers: {} }
      let body: any = { ...form[activeKey] }

      // 处理 goals（diagnose 是数组）
      if (active.key === 'DIAGNOSE' && body.goals) {
        body.goals = body.goals.split(/[,，]/).map((s: string) => s.trim()).filter(Boolean)
      }
      // 处理 force（daily-brief 是 boolean）
      if (active.key === 'DAILY' && body.force !== undefined) {
        body.force = body.force === 'true' || body.force === '1'
      }

      if (active.method === 'POST') {
        (opts.headers as any)['Content-Type'] = 'application/json'
        opts.body = JSON.stringify(body)
      } else {
        const qs = new URLSearchParams(body).toString()
        url = `${url}?${qs}`
      }

      const res = await fetch(url, opts)
      const ct = res.headers.get('content-type') || ''
      const text = await res.text()
      setResponseTime(Date.now() - t0)
      setRawText(text)
      try {
        const json = JSON.parse(text)
        setResult(json)
      } catch {
        setResult({ __raw: text })
      }
    } catch (e: any) {
      setResponseTime(Date.now() - t0)
      setResult({ success: false, error: e.message || String(e) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* 顶部标题 */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
              🧪
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dify AI 路由手动测试台</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                真实环境变量 · 真实 Dify Workflows 调用 · 一键验证 5 个应用的连通性
              </p>
            </div>
            <a
              href="/"
              className="ml-auto px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              ← 返回首页
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：应用选择 */}
        <div className="lg:col-span-3 space-y-2">
          <div className="text-xs font-semibold text-gray-500 px-2 py-1">5 个 Dify 应用</div>
          {APPS.map((app) => {
            const isActive = activeKey === app.key
            return (
              <button
                key={app.key}
                onClick={() => {
                  setActiveKey(app.key)
                  setResult(null)
                  setRawText('')
                }}
                disabled={!app.enabled}
                className={`w-full text-left px-3 py-3 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'border-blue-500 bg-white shadow-md'
                    : app.enabled
                    ? 'border-gray-200 bg-white/60 hover:border-gray-300'
                    : 'border-dashed border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{app.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">
                      {app.name}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      DIFY_API_KEY_{app.key} {!app.enabled && '· 未启用'}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}

          {/* 环境状态卡 */}
          <div className="mt-4 p-3 bg-white border border-gray-200 rounded-xl text-xs">
            <div className="font-bold text-gray-700 mb-2">📋 环境状态</div>
            <div className="space-y-1 font-mono text-[11px]">
              <div>
                <span className="text-gray-400">DIFY_BASE_URL</span>
                <div className="text-gray-700 truncate">https://api.dify.ai/v1</div>
              </div>
              <div className="pt-1 border-t border-gray-100 mt-1">
                <span className="text-gray-400">已配置 Key</span>
                <div className="text-green-600 font-bold">
                  4/5 (BRAND 路由未实现)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 中间：表单 */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${active.color} text-white flex items-center justify-center text-sm font-bold`}
              >
                {active.emoji}
              </span>
              <h2 className="text-lg font-bold text-gray-900">{active.name}</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">{active.desc}</p>

            <div className="text-[10px] font-mono text-gray-400 mb-3 bg-gray-50 px-2 py-1 rounded">
              {active.method} {active.path}
              {active.enabled ? ' · 真实 Key 鉴权' : ' · 路由未实现'}
            </div>

            <div className="space-y-3">
              {active.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={form[activeKey][field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      disabled={!active.enabled}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={form[activeKey][field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      disabled={!active.enabled}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-50"
                    >
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === 'date' ? 'date' : 'text'}
                      value={form[activeKey][field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      disabled={!active.enabled}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !active.enabled}
              className={`w-full mt-4 px-4 py-3 rounded-xl text-white font-bold text-sm transition-all ${
                loading
                  ? 'bg-gray-400 cursor-wait'
                  : active.enabled
                  ? `bg-gradient-to-r ${active.color} hover:shadow-lg active:scale-[0.98]`
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  正在调用 Dify...
                </span>
              ) : active.enabled ? (
                `🚀 发送 ${active.method} 请求`
              ) : (
                '⚠️ 路由未启用'
              )}
            </button>
          </div>
        </div>

        {/* 右侧：响应结果 */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sticky top-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-900">📦 响应结果</h2>
              {responseTime > 0 && (
                <span className="text-[10px] font-mono text-gray-500">
                  ⏱ {responseTime}ms
                </span>
              )}
            </div>

            {!result && !loading && (
              <div className="text-center py-12 text-gray-400 text-sm">
                <div className="text-4xl mb-2">⏳</div>
                点击左侧"发送"按钮<br />开始测试 Dify 真实调用
              </div>
            )}

            {loading && (
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-4/5" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-3/5" />
                <div className="text-xs text-center text-gray-500 mt-4">
                  ⏳ 调用 Dify Workflows 中...
                </div>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-3">
                {/* 状态徽章 */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {result.success !== false ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">
                      ✅ SUCCESS
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded">
                      ❌ FAILED
                    </span>
                  )}
                  {result.aiSource && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        result.aiSource === 'dify'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      🤖 aiSource: {result.aiSource}
                    </span>
                  )}
                  {result.source && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
                      💾 {result.source}
                    </span>
                  )}
                  {result.model && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                      {result.model}
                    </span>
                  )}
                </div>

                {/* 数据字段速览 */}
                {result.data && (
                  <div className="space-y-1.5 text-[11px]">
                    {result.data.recommendations && (
                      <div className="px-2 py-1.5 bg-blue-50 border border-blue-200 rounded">
                        <span className="font-bold text-blue-700">
                          推荐工具：{Array.isArray(result.data.recommendations) ? result.data.recommendations.length : 0} 个
                        </span>
                      </div>
                    )}
                    {result.data.report && (
                      <div className="px-2 py-1.5 bg-amber-50 border border-amber-200 rounded">
                        <span className="font-bold text-amber-700">
                          诊断报告：{result.data.report.length} 字
                        </span>
                      </div>
                    )}
                    {result.data.plan && (
                      <div className="px-2 py-1.5 bg-purple-50 border border-purple-200 rounded">
                        <span className="font-bold text-purple-700">
                          规划报告：{result.data.plan.length} 字
                        </span>
                      </div>
                    )}
                    {result.data.content && (
                      <div className="px-2 py-1.5 bg-pink-50 border border-pink-200 rounded">
                        <span className="font-bold text-pink-700">
                          日报内容：{result.data.content.length} 字
                        </span>
                      </div>
                    )}
                    {result.data.workflowRunId && (
                      <div className="px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono text-[10px] text-slate-600">
                        run_id: {String(result.data.workflowRunId).slice(0, 30)}...
                      </div>
                    )}
                  </div>
                )}

                {/* 错误 */}
                {result.error && (
                  <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                    <span className="font-bold">错误：</span>
                    {result.error}
                  </div>
                )}

                {/* 报告正文预览 */}
                {(result.data?.report || result.data?.plan || result.data?.content) && (
                  <details className="bg-gray-50 border border-gray-200 rounded-lg">
                    <summary className="px-3 py-2 cursor-pointer text-xs font-bold text-gray-700 hover:bg-gray-100">
                      📄 查看报告正文
                    </summary>
                    <pre className="px-3 py-2 text-[10px] text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto border-t border-gray-200">
                      {result.data?.report || result.data?.plan || result.data?.content}
                    </pre>
                  </details>
                )}

                {/* 原始响应 */}
                <details className="bg-slate-900 text-slate-100 rounded-lg" open>
                  <summary className="px-3 py-2 cursor-pointer text-xs font-bold hover:bg-slate-800">
                    🔍 原始 JSON 响应
                  </summary>
                  <pre className="px-3 py-2 text-[10px] font-mono whitespace-pre-wrap break-all max-h-80 overflow-y-auto border-t border-slate-700">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部说明 */}
      <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-gray-500">
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
          <div className="font-bold text-gray-700">💡 如何解读结果</div>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              <span className="font-mono text-purple-600">aiSource: "dify"</span> = Dify 工作流调用成功，返回真实 AI 输出
            </li>
            <li>
              <span className="font-mono text-amber-600">aiSource: "fallback"</span> = Dify 调用失败（Key 错/字段名不匹配/超时），自动降级到内置模板
            </li>
            <li>
              <span className="font-mono text-blue-600">source: "memory"</span> = 数据存储到内存（Prisma/Supabase 不可用时降级）
            </li>
            <li>
              如果看到 <span className="font-mono">400</span> 错误，请在 Dify 控制台查看工作流"开始节点"的 input form 字段名
            </li>
            <li>
              <span className="font-mono">workflowRunId</span> = Dify 工作流运行实例 ID，可在 Dify 日志页面查询
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
