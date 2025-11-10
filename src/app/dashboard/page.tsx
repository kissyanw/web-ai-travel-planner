'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'
import { Settings, Plus, LogOut, MapPin, Calendar, DollarSign, Trash2 } from 'lucide-react'

interface TravelPlan {
  id: string
  destination: string
  days: number
  budget: number
  travelers: number
  preferences: string[]
  estimatedCost: number
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [plans, setPlans] = useState<TravelPlan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadPlans()
    }
  }, [user])

  const loadPlans = async () => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('travel_plans')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPlans(data || [])
    } catch (error) {
      console.error('Error loading plans:', error)
    } finally {
      setLoadingPlans(false)
    }
  }

  const handleDeletePlan = async (planId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('确定要删除这个旅行计划吗？此操作无法撤销。')) {
      return
    }

    try {
      // 获取当前 session 以便在请求中传递认证信息
      const supabase = createSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      // 如果有 session，将 access token 添加到请求头
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`/api/plans?id=${planId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include', // 确保 cookies 被发送
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '删除失败')
      }

      // 重新加载计划列表
      await loadPlans()
    } catch (error: any) {
      console.error('Error deleting plan:', error)
      alert(error.message || '删除计划失败，请重试')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth')
  }

  if (loading || loadingPlans) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">我的旅行计划</h1>
            <div className="flex gap-4">
              <Link
                href="/settings"
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/plan/new"
          className="mb-6 inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          创建新计划
        </Link>

        {plans.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">还没有旅行计划</p>
            <p className="text-gray-400 text-sm mt-2">点击上方按钮创建您的第一个旅行计划</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative group"
              >
                <Link
                  href={`/plan/${plan.id}`}
                  className="block"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {plan.destination}
                    </h2>
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{plan.days} 天</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>预算: ¥{plan.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{plan.travelers} 人</span>
                  </div>
                </div>

                {plan.preferences && plan.preferences.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {plan.preferences.slice(0, 3).map((pref, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        {pref}
                      </span>
                    ))}
                  </div>
                )}

                  <div className="mt-4 text-xs text-gray-400">
                    {new Date(plan.created_at).toLocaleDateString('zh-CN')}
                  </div>
                </Link>
                
                {/* 删除按钮 */}
                <button
                  onClick={(e) => handleDeletePlan(plan.id, e)}
                  className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all opacity-60 hover:opacity-100"
                  title="删除计划"
                  aria-label="删除计划"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
