'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { generateTravelPlan, type TravelRequest } from '@/lib/ai'
import { createSupabaseClient } from '@/lib/supabase'
import VoiceInput from '@/components/VoiceInput'
import { ArrowLeft, Mic } from 'lucide-react'

export default function NewPlanPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<TravelRequest>({
    destination: '',
    days: 3,
    budget: 5000,
    travelers: 1,
    preferences: [],
    additionalInfo: '',
  })

  const [voiceInput, setVoiceInput] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  const preferenceOptions = [
    '美食',
    '自然风光',
    '历史文化',
    '购物',
    '娱乐',
    '亲子',
    '浪漫',
    '冒险',
    '休闲',
    '摄影',
    '动漫',
    '艺术',
  ]

  const togglePreference = (pref: string) => {
    setFormData((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(pref)
        ? prev.preferences.filter((p) => p !== pref)
        : [...prev.preferences, pref],
    }))
  }

  const handleVoiceInput = (text: string) => {
    setVoiceInput(text)
    // 简单解析语音输入
    // 可以后续改进为使用AI解析
    const destinationMatch = text.match(/去(.+?)[，,]/)
    if (destinationMatch) {
      setFormData((prev) => ({
        ...prev,
        destination: destinationMatch[1],
      }))
    }

    const daysMatch = text.match(/(\d+)天/)
    if (daysMatch) {
      setFormData((prev) => ({
        ...prev,
        days: parseInt(daysMatch[1]),
      }))
    }

    const budgetMatch = text.match(/(\d+)元/)
    if (budgetMatch) {
      setFormData((prev) => ({
        ...prev,
        budget: parseInt(budgetMatch[1]),
      }))
    }

    // 更新additionalInfo
    setFormData((prev) => ({
      ...prev,
      additionalInfo: prev.additionalInfo
        ? `${prev.additionalInfo} ${text}`
        : text,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setError('')

    try {
      // 如果有语音输入，合并到additionalInfo
      const request: TravelRequest = {
        ...formData,
        additionalInfo: voiceInput
          ? `${formData.additionalInfo} ${voiceInput}`
          : formData.additionalInfo,
      }

      // 生成旅行计划
      const plan = await generateTravelPlan(request)

      // 保存到数据库
      const supabase = createSupabaseClient()
      const { data, error: dbError } = await supabase
        .from('travel_plans')
        .insert({
          id: plan.id,
          user_id: user?.id,
          destination: plan.destination,
          days: plan.days,
          budget: plan.budget,
          travelers: plan.travelers,
          preferences: plan.preferences,
          itinerary: plan.itinerary,
          estimated_cost: plan.estimatedCost,
        })
        .select()
        .single()

      if (dbError) throw dbError

      router.push(`/plan/${plan.id}`)
    } catch (err: any) {
      console.error('Error creating plan:', err)
      setError(err.message || '创建计划失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">创建旅行计划</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 语音输入区域 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mic className="w-5 h-5" />
              语音输入（或直接填写表单）
            </h2>
            <VoiceInput onResult={handleVoiceInput} />
            {voiceInput && (
              <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-gray-700">
                识别结果：{voiceInput}
              </div>
            )}
          </div>

          {/* 目的地 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              目的地 *
            </label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) =>
                setFormData({ ...formData, destination: e.target.value })
              }
              required
              placeholder="例如：日本、北京、上海"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* 天数和预算 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                天数 *
              </label>
              <input
                type="number"
                value={formData.days}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    days: parseInt(e.target.value) || 1,
                  })
                }
                min="1"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                预算（元） *
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: parseInt(e.target.value) || 0,
                  })
                }
                min="0"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* 同行人数 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              同行人数 *
            </label>
            <input
              type="number"
              value={formData.travelers}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  travelers: parseInt(e.target.value) || 1,
                })
              }
              min="1"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* 旅行偏好 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              旅行偏好
            </label>
            <div className="flex flex-wrap gap-2">
              {preferenceOptions.map((pref) => (
                <button
                  key={pref}
                  type="button"
                  onClick={() => togglePreference(pref)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    formData.preferences.includes(pref)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>

          {/* 额外信息 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              额外信息
            </label>
            <textarea
              value={formData.additionalInfo}
              onChange={(e) =>
                setFormData({ ...formData, additionalInfo: e.target.value })
              }
              placeholder="例如：带孩子旅行，喜欢安静的地方..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                正在生成计划，请耐心等待（可能需要1-2分钟）...
              </span>
            ) : (
              '生成旅行计划'
            )}
          </button>
        </form>
      </main>
    </div>
  )
}
