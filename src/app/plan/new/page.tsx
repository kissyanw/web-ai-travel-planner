'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { generateTravelPlan, type TravelRequest } from '@/lib/ai'
import { createSupabaseClient } from '@/lib/supabase'
import { searchAndSaveAllActivityImages } from '@/lib/images'
import VoiceInput from '@/components/VoiceInput'
import { ArrowLeft, Mic } from 'lucide-react'

const chineseDigitMap: Record<string, number> = {
  零: 0,
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
}

const chineseUnitMap: Record<string, number> = {
  十: 10,
  百: 100,
  千: 1000,
  万: 10000,
}

interface ParsedVoiceData {
  destination?: string
  days?: number
  budget?: number
  travelers?: number
  preferences?: string[]
  additionalInfo?: string
}

const chineseTextToNumber = (input: string): number | null => {
  if (!input) return null
  let total = 0
  let section = 0
  let number = 0

  const sanitized = input.replace(/[^零一二两三四五六七八九十百千万]/g, '')
  if (!sanitized) return null

  for (const char of sanitized) {
    if (char in chineseDigitMap) {
      number = chineseDigitMap[char]
    } else if (char in chineseUnitMap) {
      const unit = chineseUnitMap[char]
      if (unit === 10000) {
        section = (section + (number || 1)) * unit
        total += section
        section = 0
      } else {
        section += (number || 1) * unit
      }
      number = 0
    }
  }

  return total + section + number
}

const parseNumericValue = (raw: string): number | null => {
  if (!raw) return null

  const cleaned = raw.replace(/[,，\s元块人民币]/g, '')
  if (!cleaned) return null

  const digitUnitMatch = cleaned.match(/^([\d]+(?:\.\d+)?)(万|千|百)?$/)
  if (digitUnitMatch) {
    const base = parseFloat(digitUnitMatch[1])
    if (Number.isNaN(base)) return null
    const unit = digitUnitMatch[2]
    const multiplier =
      unit === '万' ? 10000 : unit === '千' ? 1000 : unit === '百' ? 100 : 1
    return Math.round(base * multiplier)
  }

  const chineseValue = chineseTextToNumber(cleaned)
  if (chineseValue !== null) {
    return chineseValue
  }

  const fallbackNumeric = parseFloat(cleaned.replace(/[^\d.]/g, ''))
  if (!Number.isNaN(fallbackNumeric)) {
    return Math.round(fallbackNumeric)
  }

  return null
}

// 检测目的地是否在国外（基于常见国外目的地名称）
const isForeignDestination = (destination: string): boolean => {
  if (!destination) return false
  
  const normalized = destination.toLowerCase().trim()
  
  // 常见国外国家/地区列表
  const foreignCountries = [
    '日本', '韩国', '朝鲜', '新加坡', '马来西亚', '泰国', '越南', '菲律宾', '印度尼西亚', '印度', '斯里兰卡',
    '美国', '加拿大', '墨西哥', '巴西', '阿根廷', '智利', '秘鲁',
    '英国', '法国', '德国', '意大利', '西班牙', '葡萄牙', '荷兰', '比利时', '瑞士', '奥地利', '希腊', '土耳其',
    '俄罗斯', '澳大利亚', '新西兰', '南非', '埃及', '摩洛哥',
    'japan', 'korea', 'singapore', 'malaysia', 'thailand', 'vietnam', 'philippines', 'indonesia', 'india',
    'usa', 'united states', 'canada', 'mexico', 'brazil', 'argentina', 'chile', 'peru',
    'uk', 'united kingdom', 'france', 'germany', 'italy', 'spain', 'portugal', 'netherlands', 'belgium', 'switzerland', 'austria', 'greece', 'turkey',
    'russia', 'australia', 'new zealand', 'south africa', 'egypt', 'morocco'
  ]
  
  // 检查是否包含国外国家/地区名称
  return foreignCountries.some(country => 
    normalized.includes(country.toLowerCase()) || 
    normalized === country.toLowerCase()
  )
}

const extractStructuredData = (
  text: string,
  preferenceCandidates: string[]
): ParsedVoiceData => {
  const result: ParsedVoiceData = {}
  const normalized = text.trim()
  if (!normalized) return result

  const destinationMatch =
    normalized.match(/(?:去|到)([^\s，,。.0-9]{1,20}?)(?:旅游|旅行|玩|度假|看看|逛|$|[，。,.\s])/)
    || normalized.match(/(?:go to|visit)\s+([A-Za-z\s]+)/i)
  if (destinationMatch) {
    const destination = destinationMatch[1].trim()
    if (destination) {
      result.destination = destination.replace(/[，。,.\s]+$/, '')
    }
  }

  const daysNumericMatch = normalized.match(
    /(\d+(?:\.\d+)?)\s*(?:天|日|晚)/,
  )
  const daysChineseMatch = normalized.match(
    /([零一二两三四五六七八九十百千万]+)\s*(?:天|日|晚)/,
  )
  const daysValue =
    (daysNumericMatch && parseNumericValue(daysNumericMatch[1])) ??
    (daysChineseMatch && parseNumericValue(daysChineseMatch[1]))
  if (typeof daysValue === 'number' && daysValue > 0) {
    result.days = Math.max(1, Math.round(daysValue))
  }

  const budgetNumericMatch = normalized.match(
    /(?:预算|花费|费用|大概|大约|需要|控制在)\s*([0-9]+(?:\.[0-9]+)?)(万|千)?\s*(?:元|块|人民币)?/,
  )
  const budgetChineseMatch = normalized.match(
    /(?:预算|花费|费用|大概|大约|需要|控制在)\s*([零一二两三四五六七八九十百千万]+)\s*(?:元|块|人民币)?/,
  )
  let budgetValue: number | null = null
  if (budgetNumericMatch) {
    const unit = budgetNumericMatch[2]
    const multiplier =
      unit === '万' ? 10000 : unit === '千' ? 1000 : 1
    budgetValue = Math.round(parseFloat(budgetNumericMatch[1]) * multiplier)
  } else if (budgetChineseMatch) {
    budgetValue = parseNumericValue(budgetChineseMatch[1])
  }
  if (typeof budgetValue === 'number' && budgetValue >= 0) {
    result.budget = budgetValue
  }

  const travelersNumericMatch = normalized.match(
    /(?:同行|一起|共有|总共|我们|带着)?\s*(\d+(?:\.\d+)?)\s*(?:人|位|个)/,
  )
  const travelersChineseMatch = normalized.match(
    /(?:同行|一起|共有|总共|我们|带着)?\s*([零一二两三四五六七八九十百千万]+)\s*(?:人|位|个)/,
  )
  const travelersValue =
    (travelersNumericMatch && parseNumericValue(travelersNumericMatch[1])) ??
    (travelersChineseMatch && parseNumericValue(travelersChineseMatch[1]))
  if (typeof travelersValue === 'number' && travelersValue > 0) {
    result.travelers = Math.max(1, Math.round(travelersValue))
  }

  const matchedPreferences = preferenceCandidates.filter((pref) =>
    normalized.includes(pref),
  )
  if (matchedPreferences.length > 0) {
    result.preferences = matchedPreferences
  }

  result.additionalInfo = normalized

  return result
}

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

  // 用于显示的空值状态（允许用户清空输入框）
  const [daysInput, setDaysInput] = useState<string>('3')
  const [budgetInput, setBudgetInput] = useState<string>('5000')
  const [travelersInput, setTravelersInput] = useState<string>('1')

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
    const parsed = extractStructuredData(text, preferenceOptions)

    if (!Object.keys(parsed).length) return

    setFormData((prev) => {
      const next: TravelRequest = { ...prev }

      if (parsed.destination) {
        next.destination = parsed.destination
      }
      if (typeof parsed.days === 'number' && !Number.isNaN(parsed.days)) {
        next.days = parsed.days
        setDaysInput(parsed.days.toString())
      }
      if (typeof parsed.budget === 'number' && !Number.isNaN(parsed.budget)) {
        next.budget = parsed.budget
        setBudgetInput(parsed.budget.toString())
      }
      if (
        typeof parsed.travelers === 'number' &&
        !Number.isNaN(parsed.travelers)
      ) {
        next.travelers = parsed.travelers
        setTravelersInput(parsed.travelers.toString())
      }
      if (parsed.preferences && parsed.preferences.length > 0) {
        const mergedPreferences = Array.from(
          new Set([...prev.preferences, ...parsed.preferences]),
        )
        next.preferences = mergedPreferences
      }
      if (parsed.additionalInfo) {
        const alreadyIncludes = prev.additionalInfo?.includes(
          parsed.additionalInfo,
        ) ?? false
        next.additionalInfo = alreadyIncludes
          ? prev.additionalInfo
          : prev.additionalInfo
          ? `${prev.additionalInfo}\n${parsed.additionalInfo}`
          : parsed.additionalInfo
      }

      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setError('')

    try {
      // 如果有语音输入，合并到additionalInfo
      const request: TravelRequest = {
        ...formData,
        additionalInfo:
          voiceInput && !formData.additionalInfo?.includes(voiceInput)
            ? formData.additionalInfo
              ? `${formData.additionalInfo}\n${voiceInput}`
              : voiceInput
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

      // 异步搜索并保存所有活动的图片（不阻塞页面跳转）
      const allActivities = plan.itinerary.flatMap(day => day.activities)
      if (allActivities.length > 0) {
        // 在后台异步执行，不等待完成
        searchAndSaveAllActivityImages(plan.id, allActivities).catch(error => {
          console.error('Error searching and saving images:', error)
          // 静默失败，不影响用户体验
        })
      }

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
            {formData.destination && isForeignDestination(formData.destination) && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">⚠️ 提示：</span> 检测到您选择的是国外目的地。请注意，高德地图对国外地区（如韩国、日本等）的详细街道信息支持有限，可能无法在地图上显示完整的街道和建筑细节。这是高德地图数据源的限制。
                </p>
              </div>
            )}
          </div>

          {/* 天数和预算 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                天数 *
              </label>
              <input
                type="number"
                value={daysInput}
                onChange={(e) => {
                  const value = e.target.value
                  setDaysInput(value)
                  // 只有当输入是有效数字时才更新formData
                  const numValue = parseInt(value)
                  if (!isNaN(numValue) && numValue > 0) {
                    setFormData({
                      ...formData,
                      days: numValue,
                    })
                  }
                }}
                onBlur={(e) => {
                  // 失去焦点时，如果为空或无效，设置默认值
                  const value = e.target.value
                  const numValue = parseInt(value)
                  if (!value || isNaN(numValue) || numValue < 1) {
                    setDaysInput('1')
                    setFormData({
                      ...formData,
                      days: 1,
                    })
                  }
                }}
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
                value={budgetInput}
                onChange={(e) => {
                  const value = e.target.value
                  setBudgetInput(value)
                  // 只有当输入是有效数字时才更新formData
                  const numValue = parseInt(value)
                  if (!isNaN(numValue) && numValue >= 0) {
                    setFormData({
                      ...formData,
                      budget: numValue,
                    })
                  }
                }}
                onBlur={(e) => {
                  // 失去焦点时，如果为空或无效，设置默认值
                  const value = e.target.value
                  const numValue = parseInt(value)
                  if (!value || isNaN(numValue) || numValue < 0) {
                    setBudgetInput('0')
                    setFormData({
                      ...formData,
                      budget: 0,
                    })
                  }
                }}
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
              value={travelersInput}
              onChange={(e) => {
                const value = e.target.value
                setTravelersInput(value)
                // 只有当输入是有效数字时才更新formData
                const numValue = parseInt(value)
                if (!isNaN(numValue) && numValue > 0) {
                  setFormData({
                    ...formData,
                    travelers: numValue,
                  })
                }
              }}
              onBlur={(e) => {
                // 失去焦点时，如果为空或无效，设置默认值
                const value = e.target.value
                const numValue = parseInt(value)
                if (!value || isNaN(numValue) || numValue < 1) {
                  setTravelersInput('1')
                  setFormData({
                    ...formData,
                    travelers: 1,
                  })
                }
              }}
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
