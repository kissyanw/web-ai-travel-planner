import axios from 'axios'
import { getConfig } from './config'
import { createSupabaseClient } from './supabase'
import { type Activity } from './ai'

export interface ActivityImage {
  id: string
  plan_id: string
  activity_name: string
  image_url: string
  image_description?: string
  created_at: string
}

// 搜索地点相关图片（多源搜索，优先使用图片搜索API）
export async function searchActivityImages(
  activityName: string,
  locationName?: string
): Promise<Array<{ url: string; description: string }>> {
  const config = getConfig()
  
  // 优先使用多源图片搜索API（Wikipedia、Unsplash、Pexels等）
  try {
    const searchParams = new URLSearchParams({
      activityName,
      ...(locationName && { locationName }),
      // 可以添加图片API keys（如果配置了）
      ...(config.unsplashKey && { unsplashKey: config.unsplashKey }),
      ...(config.pexelsKey && { pexelsKey: config.pexelsKey }),
    })

    const response = await axios.get(
      `/api/images/search?${searchParams.toString()}`,
      {
        timeout: 15000, // 15秒超时
      }
    )

    const images = response.data?.images || []
    const message = response.data?.message
    
    // 如果明确返回"未找到相关图片"，直接返回空数组，不尝试其他方法
    if (message === '未找到相关图片' || (images.length === 0 && message)) {
      console.warn(`No relevant images found for: ${activityName}, returning empty array`)
      return [] // 返回空数组，不显示无关图片
    }
    
    if (images.length > 0) {
      console.log(`Found ${images.length} relevant images from image search APIs`)
      return images.map((img: any) => ({
        url: img.url,
        description: img.description || `${activityName}${locationName ? ` (${locationName})` : ''}`
      }))
    }
  } catch (error: any) {
    console.warn('Image search API failed, trying AI search:', error.message)
  }

  // 如果图片搜索API没有结果，尝试使用AI搜索（但AI搜索的结果也需要验证相关性）
  if (config.llmApiKey) {
    try {
      const response = await axios.post(
        '/api/ai/search-images',
        {
          activityName,
          locationName,
          apiKey: config.llmApiKey,
          apiUrl: config.llmApiUrl,
          model: config.llmModel || 'qwen-plus',
        },
        {
          timeout: 60000, // 60秒超时
        }
      )

      const images = response.data.images || []
      if (images.length > 0) {
        // 严格验证AI返回的图片是否相关
        const relevantImages = images.filter((img: any) => {
          const url = (img.url || '').toLowerCase()
          const desc = (img.description || '').toLowerCase()
          const activity = activityName.toLowerCase()
          
          // 提取景点核心关键词（更严格的清理）
          const cleanActivity = activity
            .replace(/[的|地|得|公园|景区|景点|旅游|观光|（|）|\(|\)|店|总店|分店|购物中心|观景台|国家森林公园|烈士陵园|博物馆|会馆|轻轨站|地铁站|餐厅|饭|菜|面|馆]/g, '')
            .trim()
          
          const activityKeywords = cleanActivity.length > 0 
            ? cleanActivity.split(/\s+/).filter(k => k.length > 1)
            : [activity.replace(/[的|地|得|（|）|\(|\)]/g, '').trim()].filter(k => k.length > 1)
          
          // 必须包含至少一个核心关键词
          const hasKeyword = activityKeywords.length > 0 && activityKeywords.some(keyword => 
            keyword.length >= 2 && (url.includes(keyword) || desc.includes(keyword))
          )
          
          // 排除明显不相关的图片
          const isIrrelevant = /placeholder|default|sample|random|picsum|lorem|\.svg|\.gif/i.test(url) ||
                              /placeholder|default|sample|random|picsum|lorem/i.test(desc)
          
          return hasKeyword && !isIrrelevant
        })
        
        if (relevantImages.length > 0) {
          console.log(`Found ${relevantImages.length} relevant images from AI search`)
          return relevantImages
        } else {
          console.warn('AI search returned images but none passed strict relevance check')
          return [] // 返回空数组，不显示无关图片
        }
      }
    } catch (error: any) {
      console.warn('AI image search failed:', error.message)
    }
  }

  // 如果所有方法都失败，返回空数组而不是显示无关图片
  console.warn(`No relevant images found for: ${activityName}, returning empty array`)
  return []
}

// 保存图片到数据库
export async function saveActivityImages(
  planId: string,
  activityName: string,
  images: Array<{ url: string; description?: string }>
): Promise<void> {
  const supabase = createSupabaseClient()
  
  // 先删除该地点已有的图片（避免重复）
  await supabase
    .from('activity_images')
    .delete()
    .eq('plan_id', planId)
    .eq('activity_name', activityName)

  // 插入新图片
  if (images.length > 0) {
    const imageRecords = images.map(img => ({
      plan_id: planId,
      activity_name: activityName,
      image_url: img.url,
      image_description: img.description || '',
    }))

    const { error } = await supabase
      .from('activity_images')
      .insert(imageRecords)

    if (error) {
      console.error('Error saving images:', error)
      throw error
    }
  }
}

// 从数据库加载地点图片
export async function loadActivityImages(
  planId: string,
  activityName: string
): Promise<ActivityImage[]> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('activity_images')
    .select('*')
    .eq('plan_id', planId)
    .eq('activity_name', activityName)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error loading images:', error)
    return []
  }

  return data || []
}

// 批量搜索并保存所有活动的图片
export async function searchAndSaveAllActivityImages(
  planId: string,
  activities: Activity[]
): Promise<void> {
  // 并发搜索所有活动的图片（限制并发数，提高速度）
  const batchSize = 5 // 增加批次大小以提高速度
  for (let i = 0; i < activities.length; i += batchSize) {
    const batch = activities.slice(i, i + batchSize)
    
    // 使用 Promise.allSettled 确保所有请求都能完成，即使有失败的
    await Promise.allSettled(
      batch.map(async (activity) => {
        try {
          // 先检查数据库中是否已有图片
          const existingImages = await loadActivityImages(planId, activity.name)
          if (existingImages && existingImages.length > 0) {
            console.log(`Images already exist for ${activity.name}, skipping search`)
            return // 如果已有图片，跳过搜索
          }
          
          const images = await searchActivityImages(
            activity.name,
            activity.location.name
          )
          
          if (images.length > 0) {
            await saveActivityImages(planId, activity.name, images)
            console.log(`Saved ${images.length} images for ${activity.name}`)
          }
        } catch (error) {
          console.error(`Error processing images for ${activity.name}:`, error)
          // 继续处理其他活动，不中断整个流程
        }
      })
    )
  }
}

// 不再使用备用方案生成随机图片
// 如果找不到相关图片，返回空数组，避免显示误导性的无关图片
function generateFallbackImages(
  activityName: string,
  locationName?: string
): Array<{ url: string; description: string }> {
  // 返回空数组，不显示无关图片
  return []
}

