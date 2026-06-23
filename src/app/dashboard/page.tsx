import { auth, signOut } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">请先登录</p>
      </div>
    )
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email || '' },
    include: {
      projects: true,
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  const stats = {
    totalProjects: user?.projects.length || 0,
    completedTasks: 0,
    todayActivities: user?.activities.length || 0,
  }

  const quickActions = [
    { icon: '📋', label: '创建项目', href: '/projects/new' },
    { icon: '📝', label: '添加任务', href: '/tasks/new' },
    { icon: '🤖', label: 'AI助手', href: '/ai' },
    { icon: '📊', label: '数据分析', href: '/analytics' },
  ]

  return (
    <div className="min-h-screen bg-liangpeng-background">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏢</span>
              <span className="text-xl font-bold text-liangpeng-primary">良朋社OPC</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">欢迎回来，{user?.name || session.user.email}</span>
              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/auth/login' })
                }}
              >
                <button type="submit" className="text-gray-500 hover:text-gray-700 transition-colors">
                  退出登录
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="page-container">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">仪表板</h1>
          <p className="text-gray-500 mt-1">查看你的工作概览</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: '总项目数', value: stats.totalProjects, color: 'bg-liangpeng-primary' },
            { label: '完成任务', value: stats.completedTasks, color: 'bg-green-500' },
            { label: '今日活动', value: stats.todayActivities, color: 'bg-liangpeng-accent' },
          ].map((stat, index) => (
            <div
              key={index}
              className={`${stat.color} text-white rounded-xl p-6`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <p className="text-white/80 text-sm mb-2">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">最近活动</h2>
            <div className="space-y-4">
              {user?.activities.length ? (
                user.activities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                      📌
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">{activity.description}</p>
                      <p className="text-gray-400 text-sm">{new Date(activity.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">暂无活动记录</p>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-2xl mb-2">{action.icon}</span>
                  <span className="text-sm text-gray-700">{action.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}