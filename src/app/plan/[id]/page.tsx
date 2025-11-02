'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createSupabaseClient } from '@/lib/supabase'
import MapView from '@/components/MapView'
import { type TravelPlan, type Activity } from '@/lib/ai'
import { ArrowLeft, Calendar, DollarSign, Users, MapPin, Plus } from 'lucide-react'
import VoiceInput from '@/components/VoiceInput'
import { analyzeBudget } from '@/lib/ai'

export default function PlanDetailPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const planId = params.id as string

  const [plan, setPlan] = useState<TravelPlan | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(true)
  const [activeDay, setActiveDay] = useState(0)
  const [expenses, setExpenses] = useState<Record<string, number>>({})
  const [budgetAnalysis, setBudgetAnalysis] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [voiceExpense, setVoiceExpense] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && planId) {
      loadPlan()
    }
  }, [user, planId])

  const loadPlan = async () => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('travel_plans')
        .select('*')
        .eq('id', planId)
        .single()

      if (error) throw error

      // 加载费用记录
      const { data: expenseData } = await supabase
        .from('expenses')
        .select('*')
        .eq('plan_id', planId)

      if (expenseData) {
        const expenseMap: Record<string, number> = {}
        expenseData.forEach((exp) => {
          expenseMap[exp.activity_id || exp.id] = exp.amount
        })
        setExpenses(expenseMap)
      }

      setPlan({
        id: data.id,
        destination: data.destination,
        days: data.days,
        budget: data.budget,
        travelers: data.travelers,
        preferences: data.preferences || [],
        itinerary: data.itinerary || [],
        estimatedCost: data.estimated_cost || data.budget,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      })
    } catch (error) {
      console.error('Error loading plan:', error)
    } finally {
      setLoadingPlan(false)
    }
  }

  const handleAddExpense = async (activityId: string, amount: number) => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.from('expenses').upsert({
        plan_id: planId,
        activity_id: activityId,
        amount,
        user_id: user?.id,
      })

      if (error) throw error

      setExpenses((prev) => ({ ...prev, [activityId]: amount }))
    } catch (error) {
      console.error('Error adding expense:', error)
    }
  }

  const handleVoiceExpense = (text: string) => {
    setVoiceExpense(text)
    // 简单解析语音输入的费用
    const amountMatch = text.match(/(\d+)元/)
    if (amountMatch && plan) {
      const amount = parseInt(amountMatch[1])
      // 假设添加到当前活动
      const currentActivities = plan.itinerary[activeDay]?.activities || []
      if (currentActivities.length > 0) {
        handleAddExpense(currentActivities[0].name, amount)
      }
    }
  }

  const handleAnalyzeBudget = async () => {
    if (!plan) return

    setAnalyzing(true)
    try {
      const analysis = await analyzeBudget(plan, expenses)
      setBudgetAnalysis(analysis)
    } catch (error) {
      console.error('Error analyzing budget:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading || loadingPlan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">计划不存在</p>
      </div>
    )
  }

  const currentDay = plan.itinerary[activeDay]
  const allActivities: Activity[] = plan.itinerary.flatMap((day) => day.activities)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{plan.destination}</h1>
          <div className="flex gap-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {plan.days} 天
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              预算: ¥{plan.budget.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {plan.travelers} 人
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 地图视图 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">行程地图</h2>
          <MapView activities={allActivities} />
        </div>

        {/* 费用记录 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">费用记录</h2>
          <VoiceInput onResult={handleVoiceExpense} />
          {voiceExpense && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-gray-700">
              识别：{voiceExpense}
            </div>
          )}

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">总支出</span>
              <span className="font-semibold">
                ¥{Object.values(expenses).reduce((a, b) => a + b, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">剩余预算</span>
              <span className={`font-semibold ${
                plan.budget - Object.values(expenses).reduce((a, b) => a + b, 0) < 0
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}>
                ¥{(plan.budget - Object.values(expenses).reduce((a, b) => a + b, 0)).toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleAnalyzeBudget}
              disabled={analyzing}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
            >
              {analyzing ? '分析中...' : 'AI预算分析'}
            </button>

            {budgetAnalysis && (
              <div className="mt-4 p-4 bg-blue-50 rounded text-sm whitespace-pre-wrap">
                {budgetAnalysis}
              </div>
            )}
          </div>
        </div>

        {/* 日程选择 */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {plan.itinerary.map((day, index) => (
              <button
                key={index}
                onClick={() => setActiveDay(index)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  activeDay === index
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                第 {day.day} 天
              </button>
            ))}
          </div>
        </div>

        {/* 当天行程 */}
        {currentDay && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">第 {currentDay.day} 天</h2>
              <span className="text-sm text-gray-600">
                预估费用: ¥{currentDay.estimatedCost.toLocaleString()}
              </span>
            </div>

            <div className="space-y-4">
              {currentDay.activities.map((activity, index) => (
                <div
                  key={index}
                  className="border-l-4 border-primary pl-4 py-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-800">
                          {activity.time}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          activity.type === 'attraction'
                            ? 'bg-blue-100 text-blue-700'
                            : activity.type === 'restaurant'
                            ? 'bg-green-100 text-green-700'
                            : activity.type === 'hotel'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {activity.type === 'attraction'
                            ? '景点'
                            : activity.type === 'restaurant'
                            ? '餐厅'
                            : activity.type === 'hotel'
                            ? '住宿'
                            : '交通'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {activity.name}
                      </h3>
                      {activity.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {activity.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {activity.location.name}
                        </div>
                        {activity.duration && (
                          <span>预计时长: {activity.duration}</span>
                        )}
                        {activity.estimatedCost && (
                          <span>预估费用: ¥{activity.estimatedCost}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {expenses[activity.name] ? (
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-800">
                            ¥{expenses[activity.name].toLocaleString()}
                          </div>
                          <button
                            onClick={() => handleAddExpense(activity.name, expenses[activity.name])}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            修改
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const amount = prompt('请输入实际支出金额（元）')
                            if (amount) {
                              handleAddExpense(activity.name, parseFloat(amount))
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm"
                        >
                          <Plus className="w-3 h-3" />
                          记录费用
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
