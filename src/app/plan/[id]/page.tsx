'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createSupabaseClient } from '@/lib/supabase'
import MapView from '@/components/MapView'
import { type TravelPlan, type Activity } from '@/lib/ai'
import { ArrowLeft, Calendar, DollarSign, Users, MapPin, Plus, Clock, TrendingUp, Image as ImageIcon } from 'lucide-react'
import VoiceInput from '@/components/VoiceInput'
import { analyzeBudget } from '@/lib/ai'
import { loadActivityImages, searchAndSaveAllActivityImages, type ActivityImage } from '@/lib/images'

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
  const [highlightedActivity, setHighlightedActivity] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [activityImages, setActivityImages] = useState<Record<string, ActivityImage[]>>({})
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({})

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

      const planData = {
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
      }
      setPlan(planData)

      // 加载所有活动的图片
      const allActivities = planData.itinerary.flatMap((day) => day.activities)
      await loadAllActivityImages(allActivities)
      
      // 后台搜索并保存新图片（如果数据库中没有）
      searchAndSaveAllActivityImages(planId, allActivities)
        .then(async () => {
          // 图片搜索完成后，重新加载图片
          await loadAllActivityImages(allActivities)
        })
        .catch((error) => {
          console.error('Error searching images:', error)
        })
    } catch (error) {
      console.error('Error loading plan:', error)
    } finally {
      setLoadingPlan(false)
    }
  }

  const loadAllActivityImages = async (activities: Activity[]) => {
    const imagesMap: Record<string, ActivityImage[]> = {}
    const loadingMap: Record<string, boolean> = {}

    // 先设置所有活动为加载中
    activities.forEach(activity => {
      loadingMap[activity.name] = true
    })
    setLoadingImages({ ...loadingImages, ...loadingMap })

    // 并行加载所有活动的图片
    await Promise.all(
      activities.map(async (activity) => {
        try {
          const images = await loadActivityImages(planId, activity.name)
          imagesMap[activity.name] = images
        } catch (error) {
          console.error(`Error loading images for ${activity.name}:`, error)
          imagesMap[activity.name] = []
        } finally {
          loadingMap[activity.name] = false
        }
      })
    )

    setActivityImages((prev) => ({ ...prev, ...imagesMap }))
    setLoadingImages((prev) => ({ ...prev, ...loadingMap }))
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
  const currentDayActivities = currentDay?.activities || []
  
  const handleActivityClick = async (activity: Activity) => {
    setHighlightedActivity(activity.name)
    setSelectedActivity(activity) // 设置选中的活动，触发地图跳转和详情显示
    
    // 如果该活动没有图片，尝试加载
    if (!activityImages[activity.name] || activityImages[activity.name].length === 0) {
      if (!loadingImages[activity.name]) {
        setLoadingImages((prev) => ({ ...prev, [activity.name]: true }))
        try {
          const images = await loadActivityImages(planId, activity.name)
          setActivityImages((prev) => ({ ...prev, [activity.name]: images }))
        } catch (error) {
          console.error(`Error loading images for ${activity.name}:`, error)
        } finally {
          setLoadingImages((prev) => ({ ...prev, [activity.name]: false }))
        }
      }
    }
    
    // 滚动到对应活动
    const element = document.getElementById(`activity-${activity.name}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0)
  const remainingBudget = plan.budget - totalExpenses

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 顶部导航栏 */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">返回</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{plan.destination}</h1>
                <div className="flex gap-4 mt-1 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {plan.days} 天
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {plan.travelers} 人
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'map'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                地图视图
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                列表视图
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 预算卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100 text-sm">总预算</span>
              <DollarSign className="w-5 h-5 opacity-80" />
            </div>
            <div className="text-2xl font-bold">¥{plan.budget.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100 text-sm">已支出</span>
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
            <div className="text-2xl font-bold">¥{totalExpenses.toLocaleString()}</div>
          </div>
          <div className={`bg-gradient-to-br rounded-xl shadow-lg p-6 ${
            remainingBudget >= 0
              ? 'from-purple-500 to-purple-600 text-white'
              : 'from-red-500 to-red-600 text-white'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${remainingBudget >= 0 ? 'text-purple-100' : 'text-red-100'}`}>
                剩余预算
              </span>
              <DollarSign className="w-5 h-5 opacity-80" />
            </div>
            <div className="text-2xl font-bold">¥{remainingBudget.toLocaleString()}</div>
          </div>
        </div>

        {/* 地图为主的布局 */}
        {viewMode === 'map' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：地图（占2/3） */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    行程地图
                  </h2>
                </div>
                <div className="h-[600px] w-full">
                  <MapView 
                    activities={allActivities}
                    onMarkerClick={handleActivityClick}
                    highlightedActivityId={highlightedActivity || undefined}
                    focusActivity={selectedActivity}
                  />
                </div>
              </div>
              
              {/* 地点详情面板 */}
              {selectedActivity && (
                <div className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden animate-in slide-in-from-bottom-4">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full text-white ${
                            selectedActivity.type === 'attraction'
                              ? 'bg-blue-500'
                              : selectedActivity.type === 'restaurant'
                              ? 'bg-green-500'
                              : selectedActivity.type === 'hotel'
                              ? 'bg-purple-500'
                              : 'bg-orange-500'
                          }`}>
                            {selectedActivity.type === 'attraction' ? '🏛️ 景点' : 
                             selectedActivity.type === 'restaurant' ? '🍽️ 餐厅' : 
                             selectedActivity.type === 'hotel' ? '🏨 住宿' : '🚗 交通'}
                          </span>
                          <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {selectedActivity.time}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedActivity.name}</h3>
                        {selectedActivity.description && (
                          <p className="text-gray-600 mb-4 leading-relaxed">{selectedActivity.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedActivity(null)}
                        className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="关闭详情"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    
                    {/* 详细信息 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span className="text-sm">{selectedActivity.location.name}</span>
                      </div>
                      {selectedActivity.duration && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-5 h-5 text-primary" />
                          <span className="text-sm">预计时长: {selectedActivity.duration}</span>
                        </div>
                      )}
                      {selectedActivity.estimatedCost !== undefined && selectedActivity.estimatedCost !== null && (
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                          <DollarSign className="w-5 h-5" />
                          <span className="text-sm">预估费用: ¥{selectedActivity.estimatedCost}</span>
                        </div>
                      )}
                      {expenses[selectedActivity.name] !== undefined && (
                        <div className="flex items-center gap-2 text-blue-600 font-semibold">
                          <DollarSign className="w-5 h-5" />
                          <span className="text-sm">实际支出: ¥{expenses[selectedActivity.name].toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* 图片展示 */}
                    {selectedActivity && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-primary" />
                          相关图片
                        </h4>
                        {loadingImages[selectedActivity.name] ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <span className="ml-3 text-gray-600">加载图片中...</span>
                          </div>
                        ) : activityImages[selectedActivity.name] && activityImages[selectedActivity.name].length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {activityImages[selectedActivity.name].slice(0, 6).map((image, index) => (
                              <div
                                key={image.id}
                                className="relative group cursor-pointer rounded-lg overflow-hidden aspect-video bg-gray-100"
                              >
                                <img
                                  src={image.image_url}
                                  alt={image.image_description || `${selectedActivity.name} - 图片 ${index + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYfliqDovb3lpLHotKU8L3RleHQ+PC9zdmc+'
                                  }}
                                />
                                {image.image_description && (
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-end">
                                    <p className="text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                                      {image.image_description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>暂无图片</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* 费用记录按钮 */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {expenses[selectedActivity.name] !== undefined ? (
                        <button
                          onClick={() => {
                            const amount = prompt('请输入实际支出金额（元）', expenses[selectedActivity.name].toString())
                            if (amount !== null) {
                              handleAddExpense(selectedActivity.name, parseFloat(amount))
                            }
                          }}
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-semibold transition-colors"
                        >
                          修改费用记录
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const amount = prompt('请输入实际支出金额（元）')
                            if (amount !== null) {
                              handleAddExpense(selectedActivity.name, parseFloat(amount))
                            }
                          }}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-semibold transition-colors"
                        >
                          <Plus className="w-4 h-4 inline mr-2" />
                          记录费用
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 右侧：当天行程列表（占1/3） */}
            <div className="space-y-6">
              {/* 日程选择 */}
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">选择日期</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {plan.itinerary.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveDay(index)}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                        activeDay === index
                          ? 'bg-primary text-white shadow-md scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      第 {day.day} 天
                    </button>
                  ))}
                </div>
              </div>

              {/* 当天行程 */}
              {currentDay && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">
                        第 {currentDay.day} 天
                      </h3>
                      <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                        ¥{currentDay.estimatedCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto">
                    <div className="p-4 space-y-4">
                      {currentDayActivities.map((activity, index) => (
                        <div
                          key={index}
                          id={`activity-${activity.name}`}
                          onClick={() => handleActivityClick(activity)}
                          className={`group cursor-pointer rounded-lg border-2 transition-all ${
                            highlightedActivity === activity.name
                              ? 'border-yellow-400 shadow-lg scale-105 bg-yellow-50'
                              : 'border-gray-200 hover:border-primary hover:shadow-md bg-white'
                          }`}
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {activity.time}
                                </span>
                                <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                  activity.type === 'attraction'
                                    ? 'bg-blue-100 text-blue-700'
                                    : activity.type === 'restaurant'
                                    ? 'bg-green-100 text-green-700'
                                    : activity.type === 'hotel'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {activity.type === 'attraction' ? '🏛️ 景点' : 
                                   activity.type === 'restaurant' ? '🍽️ 餐厅' : 
                                   activity.type === 'hotel' ? '🏨 住宿' : '🚗 交通'}
                                </span>
                              </div>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-1 group-hover:text-primary transition-colors">
                              {activity.name}
                            </h4>
                            {activity.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {activity.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate max-w-[120px]">{activity.location.name}</span>
                              </div>
                              {activity.duration && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {activity.duration}
                                </div>
                              )}
                            </div>
                            {activity.estimatedCost !== undefined && activity.estimatedCost !== null && (
                              <div className="mt-2 text-sm font-semibold text-green-600">
                                ¥{activity.estimatedCost}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 列表视图 - 带图片的详细行程 */
          <div className="space-y-6">
            {/* 地图预览 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  行程地图
                </h2>
              </div>
              <div className="flex-1 min-h-0" style={{ height: '400px' }}>
                <MapView 
                  activities={allActivities}
                  onMarkerClick={handleActivityClick}
                  highlightedActivityId={highlightedActivity || undefined}
                  focusActivity={selectedActivity}
                />
              </div>
            </div>
            
            {/* 地点详情面板 - 列表视图 */}
            {selectedActivity && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-in slide-in-from-bottom-4">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full text-white ${
                          selectedActivity.type === 'attraction'
                            ? 'bg-blue-500'
                            : selectedActivity.type === 'restaurant'
                            ? 'bg-green-500'
                            : selectedActivity.type === 'hotel'
                            ? 'bg-purple-500'
                            : 'bg-orange-500'
                        }`}>
                          {selectedActivity.type === 'attraction' ? '🏛️ 景点' : 
                           selectedActivity.type === 'restaurant' ? '🍽️ 餐厅' : 
                           selectedActivity.type === 'hotel' ? '🏨 住宿' : '🚗 交通'}
                        </span>
                        <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {selectedActivity.time}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedActivity.name}</h3>
                      {selectedActivity.description && (
                        <p className="text-gray-600 mb-4 leading-relaxed">{selectedActivity.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedActivity(null)}
                      className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="关闭详情"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  
                  {/* 详细信息 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="text-sm">{selectedActivity.location.name}</span>
                    </div>
                    {selectedActivity.duration && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-5 h-5 text-primary" />
                        <span className="text-sm">预计时长: {selectedActivity.duration}</span>
                      </div>
                    )}
                    {selectedActivity.estimatedCost !== undefined && selectedActivity.estimatedCost !== null && (
                      <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <DollarSign className="w-5 h-5" />
                        <span className="text-sm">预估费用: ¥{selectedActivity.estimatedCost}</span>
                      </div>
                    )}
                    {expenses[selectedActivity.name] !== undefined && (
                      <div className="flex items-center gap-2 text-blue-600 font-semibold">
                        <DollarSign className="w-5 h-5" />
                        <span className="text-sm">实际支出: ¥{expenses[selectedActivity.name].toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* 图片展示 */}
                  {selectedActivity && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-primary" />
                        相关图片
                      </h4>
                      {loadingImages[selectedActivity.name] ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <span className="ml-3 text-gray-600">加载图片中...</span>
                        </div>
                      ) : activityImages[selectedActivity.name] && activityImages[selectedActivity.name].length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {activityImages[selectedActivity.name].slice(0, 6).map((image, index) => (
                            <div
                              key={image.id}
                              className="relative group cursor-pointer rounded-lg overflow-hidden aspect-video bg-gray-100"
                            >
                              <img
                                src={image.image_url}
                                alt={image.image_description || `${selectedActivity.name} - 图片 ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYfliqDovb3lpLHotKU8L3RleHQ+PC9zdmc+'
                                }}
                              />
                              {image.image_description && (
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-end">
                                  <p className="text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                                    {image.image_description}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>暂无图片</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* 费用记录按钮 */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {expenses[selectedActivity.name] !== undefined ? (
                      <button
                        onClick={() => {
                          const amount = prompt('请输入实际支出金额（元）', expenses[selectedActivity.name].toString())
                          if (amount !== null) {
                            handleAddExpense(selectedActivity.name, parseFloat(amount))
                          }
                        }}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-semibold transition-colors"
                      >
                        修改费用记录
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const amount = prompt('请输入实际支出金额（元）')
                          if (amount !== null) {
                            handleAddExpense(selectedActivity.name, parseFloat(amount))
                          }
                        }}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-semibold transition-colors"
                      >
                        <Plus className="w-4 h-4 inline mr-2" />
                        记录费用
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 日程选择 */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">选择日期</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {plan.itinerary.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveDay(index)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                      activeDay === index
                        ? 'bg-primary text-white shadow-md scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    第 {day.day} 天
                  </button>
                ))}
              </div>
            </div>

            {/* 当天行程 - 带图片的卡片式布局 */}
            {currentDay && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">第 {currentDay.day} 天</h2>
                    <span className="text-sm text-gray-600 bg-white px-4 py-2 rounded-full font-semibold">
                      预估费用: ¥{currentDay.estimatedCost.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {currentDayActivities.map((activity, index) => (
                    <div
                      key={index}
                      id={`activity-${activity.name}`}
                      onClick={() => handleActivityClick(activity)}
                      className={`group cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${
                        highlightedActivity === activity.name
                          ? 'border-yellow-400 shadow-xl scale-[1.02] bg-yellow-50'
                          : 'border-gray-200 hover:border-primary hover:shadow-lg bg-white'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* 图片区域 */}
                        {activityImages[activity.name] && activityImages[activity.name].length > 0 ? (
                          <div className="md:w-64 w-full h-48 md:h-auto relative overflow-hidden bg-gray-100">
                            <img
                              src={activityImages[activity.name][0].image_url}
                              alt={activityImages[activity.name][0].image_description || activity.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                            <div className="absolute top-3 left-3">
                              <span className={`px-3 py-1 text-xs font-bold rounded-full text-white shadow-lg ${
                                activity.type === 'attraction'
                                  ? 'bg-blue-500'
                                  : activity.type === 'restaurant'
                                  ? 'bg-green-500'
                                  : activity.type === 'hotel'
                                  ? 'bg-purple-500'
                                  : 'bg-orange-500'
                              }`}>
                                {activity.type === 'attraction' ? '🏛️ 景点' : 
                                 activity.type === 'restaurant' ? '🍽️ 餐厅' : 
                                 activity.type === 'hotel' ? '🏨 住宿' : '🚗 交通'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="md:w-64 w-full h-48 md:h-auto relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <div className="absolute top-3 left-3">
                              <span className={`px-3 py-1 text-xs font-bold rounded-full text-white shadow-lg ${
                                activity.type === 'attraction'
                                  ? 'bg-blue-500'
                                  : activity.type === 'restaurant'
                                  ? 'bg-green-500'
                                  : activity.type === 'hotel'
                                  ? 'bg-purple-500'
                                  : 'bg-orange-500'
                              }`}>
                                {activity.type === 'attraction' ? '🏛️ 景点' : 
                                 activity.type === 'restaurant' ? '🍽️ 餐厅' : 
                                 activity.type === 'hotel' ? '🏨 住宿' : '🚗 交通'}
                              </span>
                            </div>
                            <ImageIcon className="w-12 h-12 text-gray-400 opacity-50" />
                          </div>
                        )}
                        
                        {/* 内容区域 */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                                  {activity.time}
                                </span>
                                {activity.duration && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    {activity.duration}
                                  </div>
                                )}
                              </div>
                              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                                {activity.name}
                              </h3>
                              {activity.description && (
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                  {activity.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{activity.location.name}</span>
                                </div>
                                {activity.estimatedCost !== undefined && activity.estimatedCost !== null && (
                                  <div className="flex items-center gap-1 font-semibold text-green-600">
                                    <DollarSign className="w-4 h-4" />
                                    ¥{activity.estimatedCost}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* 费用记录按钮 */}
                            <div className="ml-4">
                              {expenses[activity.name] !== undefined ? (
                                <div className="text-right">
                                  <div className="text-lg font-bold text-gray-800 mb-1">
                                    ¥{expenses[activity.name].toLocaleString()}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const amount = prompt('请输入实际支出金额（元）', expenses[activity.name].toString())
                                      if (amount !== null) {
                                        handleAddExpense(activity.name, parseFloat(amount))
                                      }
                                    }}
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    修改
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    const amount = prompt('请输入实际支出金额（元）')
                                    if (amount !== null) {
                                      handleAddExpense(activity.name, parseFloat(amount))
                                    }
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-semibold transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                  记录费用
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 费用记录和AI分析 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                费用记录与分析
              </h2>
              <VoiceInput onResult={handleVoiceExpense} />
              {voiceExpense && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
                  识别：{voiceExpense}
                </div>
              )}

              <button
                onClick={handleAnalyzeBudget}
                disabled={analyzing}
                className="mt-4 w-full px-4 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg hover:from-primary/90 hover:to-purple-600/90 disabled:opacity-50 font-semibold transition-all shadow-md"
              >
                {analyzing ? '分析中...' : '🤖 AI预算分析'}
              </button>

              {budgetAnalysis && (
                <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg text-sm whitespace-pre-wrap border border-blue-200">
                  {budgetAnalysis}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
