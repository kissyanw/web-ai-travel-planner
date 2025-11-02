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
              <p><strong>方式一：</strong>在设置页面配置（推荐）</p>
              <p><strong>方式二：</strong>创建 <code className="bg-gray-100 px-1 rounded">.env.local</code> 文件：</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key`}
              </pre>
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
