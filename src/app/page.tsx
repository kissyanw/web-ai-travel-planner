'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { Settings } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { user, loading, error } = useAuth()

  useEffect(() => {
    if (!loading && !error) {
      if (user) {
        router.push('/dashboard')
      } else if (error !== 'not-configured') {
        router.push('/auth')
      }
    }
  }, [user, loading, error, router])

  // 如果没有配置，显示配置提示
  if (!loading && error === 'not-configured') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <Settings className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              需要配置 Supabase
            </h1>
            <p className="text-gray-600">
              请先配置 Supabase 数据库连接信息才能使用此应用。
            </p>
          </div>
          <div className="space-y-4">
            <Link
              href="/settings"
              className="block w-full bg-primary text-white py-3 rounded-md hover:bg-primary/90 text-center font-semibold"
            >
              前往设置页面
            </Link>
            <div className="text-sm text-gray-500 space-y-2">
              <p><strong>说明：</strong>点击下面的按钮前往设置页面，填写Supabase配置信息即可开始使用。</p>
              <p className="text-xs mt-2">
                💡 提示：如果使用Docker镜像，环境变量可能已经配置，但需要先在设置页面保存一次以激活配置。
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}
