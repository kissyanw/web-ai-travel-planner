import axios from 'axios'
import { getConfig } from './config'

export interface TravelRequest {
  destination: string
  days: number
  budget: number
  travelers: number
  preferences: string[]
  additionalInfo?: string
}

export interface TravelPlan {
  id: string
  destination: string
  days: number
  budget: number
  travelers: number
  preferences: string[]
  itinerary: DayPlan[]
  estimatedCost: number
  createdAt: string
  updatedAt: string
}

export interface DayPlan {
  day: number
  date: string
  activities: Activity[]
  estimatedCost: number
}

export interface Activity {
  time: string
  type: 'attraction' | 'restaurant' | 'hotel' | 'transport'
  name: string
  description: string
  location: {
    name: string
    lat?: number
    lng?: number
  }
  estimatedCost?: number
  duration?: string
}

// 调用LLM API生成旅行计划
export async function generateTravelPlan(request: TravelRequest): Promise<TravelPlan> {
  const config = getConfig()
  
  if (!config.llmApiKey) {
    throw new Error('LLM API Key not configured. Please set it in settings.')
  }

  // 优化prompt，使其更简洁高效
  const prompt = `生成${request.destination}的${request.days}天旅行计划。

要求：预算${request.budget}元，${request.travelers}人，偏好：${request.preferences.join('、')}
${request.additionalInfo ? `额外要求：${request.additionalInfo}` : ''}

返回JSON格式，每天2-4个活动：
{
  "itinerary": [
    {
      "day": 1,
      "date": "2024-01-01",
      "activities": [
        {
          "time": "09:00",
          "type": "attraction",
          "name": "景点名",
          "description": "简短描述",
          "location": {"name": "地址", "lat": 35.6762, "lng": 139.6503},
          "estimatedCost": 100,
          "duration": "2小时"
        }
      ],
      "estimatedCost": 500
    }
  ],
  "estimatedCost": ${request.budget}
}

只返回JSON，不要其他文字。`

  try {
    // 通过API路由调用，避免CORS问题
    const response = await axios.post(
      '/api/ai/generate-plan',
      {
        prompt,
        apiKey: config.llmApiKey,
        apiUrl: config.llmApiUrl,
        model: config.llmModel || 'qwen-plus',
      },
      {
        timeout: 120000, // 120秒超时（AI生成可能需要更长时间）
      }
    )

    const planData = response.data.planData
    if (planData && planData.itinerary) {
      return formatPlanResponse(planData, request)
    }
    throw new Error('Invalid response format from LLM')
  } catch (error: any) {
    console.error('Error generating travel plan:', error)
    
    // 提供更详细的错误信息
    if (error.response) {
      // 服务器返回了错误响应
      const status = error.response.status
      const data = error.response.data
      
      if (status === 401) {
        throw new Error('API Key无效，请检查LLM API Key配置')
      } else if (status === 403) {
        throw new Error('API访问被拒绝，请检查API Key权限')
      } else if (status === 429) {
        throw new Error('API请求频率过高，请稍后重试')
      } else if (status === 500) {
        throw new Error('API服务器错误，请稍后重试')
      } else {
        throw new Error(`API请求失败 (${status}): ${data?.error || data?.message || '未知错误'}`)
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      if (error.code === 'ECONNABORTED') {
        throw new Error('请求超时，请检查网络连接或稍后重试')
      } else if (error.message.includes('Network Error')) {
        throw new Error('网络错误：无法连接到API服务器。请检查：\n1. 网络连接是否正常\n2. API URL是否正确\n3. 是否需要使用代理')
      } else {
        throw new Error(`网络错误: ${error.message}`)
      }
    } else {
      // 其他错误
      throw new Error(`生成计划失败: ${error.message || '未知错误'}`)
    }
  }
}

function formatPlanResponse(data: any, request: TravelRequest): TravelPlan {
  const id = `plan-${Date.now()}`
  const now = new Date().toISOString()
  
  return {
    id,
    destination: request.destination,
    days: request.days,
    budget: request.budget,
    travelers: request.travelers,
    preferences: request.preferences,
    itinerary: data.itinerary || [],
    estimatedCost: data.estimatedCost || request.budget,
    createdAt: now,
    updatedAt: now
  }
}

// 分析费用并给出建议
export async function analyzeBudget(plan: TravelPlan, actualExpenses: Record<string, number>): Promise<string> {
  const config = getConfig()
  
  if (!config.llmApiKey) {
    return '请配置LLM API Key以使用预算分析功能'
  }

  const prompt = `分析以下旅行计划的预算情况：

计划预算：${plan.budget}元
预估费用：${plan.estimatedCost}元
实际支出：${Object.values(actualExpenses).reduce((a, b) => a + b, 0)}元

详细支出：
${JSON.stringify(actualExpenses, null, 2)}

请给出预算分析和建议，包括：
1. 预算执行情况
2. 超支或节约的项目
3. 优化建议
4. 后续行程的预算调整建议`

  try {
    const response = await axios.post(
      '/api/ai/analyze-budget',
      {
        prompt,
        apiKey: config.llmApiKey,
        apiUrl: config.llmApiUrl,
        model: config.llmModel || 'qwen-plus',
      },
      {
        timeout: 30000, // 30秒超时
      }
    )

    return response.data.analysis || '分析完成'
  } catch (error: any) {
    console.error('Error analyzing budget:', error)
    if (error.response) {
      return `预算分析失败: ${error.response.data?.error || error.message}`
    }
    return `预算分析失败: ${error.message || '网络错误'}`
  }
}
