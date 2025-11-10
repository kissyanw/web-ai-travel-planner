import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

/**
 * 多源图片搜索API
 * 按优先级尝试多个图片源，确保获取与景点高度相关的图片
 */

interface ImageResult {
  url: string
  description: string
  source: string
}

// 验证图片是否与景点相关（更严格的验证）
function isImageRelevant(imageUrl: string, imageTitle: string, activityName: string, locationName?: string): boolean {
  const lowerUrl = imageUrl.toLowerCase()
  const lowerTitle = imageTitle.toLowerCase()
  const lowerDesc = imageTitle.toLowerCase() // description和title合并检查
  const lowerActivity = activityName.toLowerCase()
  const lowerLocation = locationName?.toLowerCase() || ''
  
  // 提取景点核心关键词（去除常见词汇和标点）
  const cleanActivity = lowerActivity
    .replace(/[的|地|得|公园|景区|景点|旅游|观光|（|）|\(|\)|店|总店|分店|购物中心|观景台|国家森林公园|烈士陵园|博物馆|会馆|轻轨站|地铁站]/g, '')
    .trim()
  
  // 如果清理后为空，使用原始名称
  const activityKeywords = cleanActivity.length > 0 
    ? cleanActivity.split(/\s+/).filter(k => k.length > 1)
    : [lowerActivity.replace(/[的|地|得|（|）|\(|\)]/g, '').trim()].filter(k => k.length > 1)
  
  // 如果关键词为空，拒绝所有图片（太模糊）
  if (activityKeywords.length === 0) {
    return false
  }
  
  // 检查URL或标题中是否包含景点核心关键词（必须匹配）
  const hasActivityKeyword = activityKeywords.some(keyword => {
    if (keyword.length < 2) return false
    // 关键词必须完整出现在URL或标题中
    return lowerUrl.includes(keyword) || lowerTitle.includes(keyword) || lowerDesc.includes(keyword)
  })
  
  // 如果没有匹配到任何关键词，直接拒绝
  if (!hasActivityKeyword) {
    return false
  }
  
  // 排除明显不相关的图片类型
  const irrelevantPatterns = [
    /logo/i, /icon/i, /symbol/i, /emblem/i, /flag/i,
    /map/i, /diagram/i, /chart/i, /graph/i,
    /\.svg$/i, /\.gif$/i,
    /placeholder/i, /default/i, /sample/i,
    /random/i, /picsum/i, /lorem/i
  ]
  
  const isIrrelevant = irrelevantPatterns.some(pattern => 
    pattern.test(lowerUrl) || pattern.test(lowerTitle) || pattern.test(lowerDesc)
  )
  
  if (isIrrelevant) {
    return false
  }
  
  // 对于餐厅、商店等，如果名称中包含店名，必须匹配店名关键词
  if (lowerActivity.includes('店') || lowerActivity.includes('餐厅') || lowerActivity.includes('饭')) {
    // 提取店名关键词（去除"店"、"餐厅"等后缀）
    const shopKeywords = lowerActivity
      .replace(/[店|餐厅|饭|菜|面|馆]/g, '')
      .replace(/[（|）|\(|\)]/g, '')
      .trim()
      .split(/\s+/)
      .filter(k => k.length > 1)
    
    if (shopKeywords.length > 0) {
      const hasShopKeyword = shopKeywords.some(keyword => 
        lowerUrl.includes(keyword) || lowerTitle.includes(keyword) || lowerDesc.includes(keyword)
      )
      if (!hasShopKeyword) {
        return false // 餐厅/商店必须匹配店名
      }
    }
  }
  
  return true
}

// 1. Wikipedia API搜索（免费，无需key，地标图片丰富）
async function searchWikipediaImages(
  activityName: string,
  locationName?: string
): Promise<ImageResult[]> {
  try {
    // 构建搜索查询（优先使用中文Wikipedia）
    // 使用更精确的搜索词，提高相关性
    const searchQuery = activityName // 只使用景点名称，避免位置信息干扰搜索
    
    // 先尝试中文Wikipedia，减少超时时间并添加重试机制
    let searchResponse
    try {
      searchResponse = await axios.get('https://zh.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          format: 'json',
          list: 'search',
          srsearch: searchQuery,
          srlimit: 3, // 减少搜索数量，提高速度
          origin: '*'
        },
        timeout: 5000, // 减少超时时间
        headers: {
          'User-Agent': 'TravelPlanner/1.0'
        }
      })
    } catch (timeoutError) {
      // 如果超时，直接返回空数组，不阻塞其他图片源
      console.warn('Wikipedia search timeout, skipping')
      return []
    }

    const pages = searchResponse.data?.query?.search || []
    
    // 验证搜索结果的相关性：页面标题必须包含景点名称的关键词
    const relevantPages = pages.filter((page: any) => {
      const pageTitle = page.title.toLowerCase()
      const activityKeywords = activityName
        .toLowerCase()
        .replace(/[的|地|得|（|）|\(|\)]/g, '')
        .split(/\s+/)
        .filter(k => k.length > 1)
      
      // 页面标题必须包含至少一个关键词
      return activityKeywords.length > 0 && activityKeywords.some(keyword => pageTitle.includes(keyword))
    })
    
    if (relevantPages.length === 0) {
      // 如果中文Wikipedia没有相关结果，尝试英文Wikipedia
      try {
        const enSearchResponse = await axios.get('https://en.wikipedia.org/w/api.php', {
          params: {
            action: 'query',
            format: 'json',
            list: 'search',
            srsearch: searchQuery,
            srlimit: 3,
            origin: '*'
          },
          timeout: 5000,
          headers: {
            'User-Agent': 'TravelPlanner/1.0'
          }
        })
        const enPages = enSearchResponse.data?.query?.search || []
        
        // 同样验证英文结果的相关性
        const relevantEnPages = enPages.filter((page: any) => {
          const pageTitle = page.title.toLowerCase()
          const activityKeywords = activityName
            .toLowerCase()
            .replace(/[的|地|得|（|）|\(|\)]/g, '')
            .split(/\s+/)
            .filter(k => k.length > 1)
          return activityKeywords.length > 0 && activityKeywords.some(keyword => pageTitle.includes(keyword))
        })
        
        if (relevantEnPages.length === 0) return []
        
        // 处理英文Wikipedia结果（只处理相关页面）
        return await fetchWikipediaPageImages(relevantEnPages, activityName, locationName, 'en')
      } catch (enError) {
        console.warn('English Wikipedia search failed:', enError)
        return []
      }
    }

    // 处理中文Wikipedia结果（只处理相关页面）
    return await fetchWikipediaPageImages(relevantPages, activityName, locationName, 'zh')
  } catch (error) {
    console.error('Wikipedia search error:', error)
    return []
  }
}

// 辅助函数：获取Wikipedia页面的图片
async function fetchWikipediaPageImages(
  pages: any[],
  activityName: string,
  locationName: string | undefined,
  lang: 'zh' | 'en'
): Promise<ImageResult[]> {
  const images: ImageResult[] = []
  const baseUrl = lang === 'zh' ? 'https://zh.wikipedia.org' : 'https://en.wikipedia.org'
  
  // 获取每个页面的图片（最多处理前3个页面）
  for (const page of pages.slice(0, 3)) {
    try {
      const pageId = page.pageid
      const pageResponse = await axios.get(`${baseUrl}/w/api.php`, {
        params: {
          action: 'query',
          format: 'json',
          pageids: pageId,
          prop: 'pageimages|images',
          piprop: 'original|thumbnail',
          pithumbsize: 800,
          imlimit: 10,
          origin: '*'
        },
        timeout: 8000,
        headers: {
          'User-Agent': 'TravelPlanner/1.0 (https://github.com/your-repo)'
        }
      })

      const pageData = pageResponse.data?.query?.pages?.[pageId]
      
      // 优先使用页面主图（pageimages），但需要验证相关性
      if (pageData?.original?.source) {
        const imageTitle = page.title || activityName
        if (isImageRelevant(pageData.original.source, imageTitle, activityName, locationName)) {
          images.push({
            url: pageData.original.source,
            description: `${activityName}${locationName ? ` (${locationName})` : ''} - Wikipedia`,
            source: 'wikipedia'
          })
        }
      } else if (pageData?.thumbnail?.source) {
        const imageTitle = page.title || activityName
        if (isImageRelevant(pageData.thumbnail.source, imageTitle, activityName, locationName)) {
          images.push({
            url: pageData.thumbnail.source.replace(/\/\d+px-/, '/800px-'),
            description: `${activityName}${locationName ? ` (${locationName})` : ''} - Wikipedia`,
            source: 'wikipedia'
          })
        }
      }
      
      // 获取页面中的其他图片（限制数量以提高速度）
      const pageImages = pageData?.images || []
      for (const img of pageImages.slice(0, 3)) { // 减少处理数量
        if (images.length >= 3) break // 只获取3张相关图片
        
        const imageTitle = img.title.replace(/^File:/, '')
        // 跳过一些不相关的文件类型
        if (imageTitle.match(/\.(svg|ogg|webm|ogv|pdf)$/i)) continue
        
        // 验证图片标题是否相关
        if (!isImageRelevant('', imageTitle, activityName, locationName)) {
          continue // 跳过不相关的图片
        }
        
        try {
          const imageInfoResponse = await axios.get(`${baseUrl}/w/api.php`, {
            params: {
              action: 'query',
              format: 'json',
              titles: `File:${imageTitle}`,
              prop: 'imageinfo',
              iiprop: 'url',
              iiurlwidth: 800,
              origin: '*'
            },
            timeout: 3000, // 减少超时时间
            headers: {
              'User-Agent': 'TravelPlanner/1.0'
            }
          })

          const imageInfo = Object.values(imageInfoResponse.data?.query?.pages || {})[0] as any
          const imageUrl = imageInfo?.imageinfo?.[0]?.thumburl || imageInfo?.imageinfo?.[0]?.url
          
          if (imageUrl && 
              !images.some(img => img.url === imageUrl) &&
              isImageRelevant(imageUrl, imageTitle, activityName, locationName)) {
            images.push({
              url: imageUrl,
              description: `${activityName}${locationName ? ` (${locationName})` : ''} - Wikipedia`,
              source: 'wikipedia'
            })
          }
        } catch (imgError) {
          // 跳过单个图片错误，继续处理其他图片
          continue
        }
      }
    } catch (pageError) {
      // 跳过单个页面错误，继续处理其他页面
      continue
    }
  }

  // 只返回验证过的相关图片
  return images.slice(0, 3) // 最多返回3张相关图片
}

// 2. Unsplash Search API（需要API key，但免费）
async function searchUnsplashImages(
  activityName: string,
  locationName?: string,
  apiKey?: string
): Promise<ImageResult[]> {
  if (!apiKey) return []
  
  try {
    // 使用更精确的搜索查询，提高相关性
    const query = activityName // 只使用景点名称，Unsplash会自动匹配相关图片
    
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: query,
        per_page: 10, // 获取更多结果以便筛选
        orientation: 'landscape',
        order_by: 'relevance' // 按相关性排序
      },
      headers: {
        'Authorization': `Client-ID ${apiKey}`
      },
      timeout: 5000
    })

    const results = response.data?.results || []
    // 过滤并验证图片相关性
    return results
      .map((photo: any) => ({
        url: photo.urls?.regular || photo.urls?.small,
        description: photo.description || photo.alt_description || `${activityName} - Unsplash`,
        source: 'unsplash',
        title: photo.alt_description || photo.description || ''
      }))
      .filter((img: ImageResult & { title?: string }) => {
        if (!img.url) return false
        // 验证图片描述是否与景点相关
        return isImageRelevant(img.url, img.title || img.description, activityName, locationName)
      })
      .slice(0, 3) // 只返回最相关的3张
      .map(({ title, ...img }) => img) // 移除临时title字段
  } catch (error) {
    console.error('Unsplash search error:', error)
    return []
  }
}

// 3. Pexels Search API（需要API key，但免费）
async function searchPexelsImages(
  activityName: string,
  locationName?: string,
  apiKey?: string
): Promise<ImageResult[]> {
  if (!apiKey) return []
  
  try {
    // 使用更精确的搜索查询
    const query = activityName // 只使用景点名称
    
    const response = await axios.get('https://api.pexels.com/v1/search', {
      params: {
        query: query,
        per_page: 10, // 获取更多结果以便筛选
        orientation: 'landscape'
      },
      headers: {
        'Authorization': apiKey
      },
      timeout: 5000
    })

    const photos = response.data?.photos || []
    // 过滤并验证图片相关性
    return photos
      .map((photo: any) => ({
        url: photo.src?.large || photo.src?.medium,
        description: photo.alt || `${activityName} - Pexels`,
        source: 'pexels',
        title: photo.alt || ''
      }))
      .filter((img: ImageResult & { title?: string }) => {
        if (!img.url) return false
        // 验证图片描述是否与景点相关
        return isImageRelevant(img.url, img.title || img.description, activityName, locationName)
      })
      .slice(0, 3) // 只返回最相关的3张
      .map(({ title, ...img }) => img) // 移除临时title字段
  } catch (error) {
    console.error('Pexels search error:', error)
    return []
  }
}

// 4. 使用特定格式的图片URL（直接搜索）
async function searchDirectImageUrls(
  activityName: string,
  locationName?: string
): Promise<ImageResult[]> {
  try {
    // 构建搜索查询
    const query = locationName 
      ? `${activityName} ${locationName}`.trim()
      : activityName
    
    // 使用一些公开的图片搜索服务
    // 注意：这些服务可能不稳定，作为备选方案
    const encodedQuery = encodeURIComponent(query)
    
    // 可以尝试使用一些图片CDN的搜索功能
    // 这里返回空数组，因为大多数需要API key
    return []
  } catch (error) {
    console.error('Direct image search error:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activityName = searchParams.get('activityName')
    const locationName = searchParams.get('locationName') || undefined
    const unsplashKey = searchParams.get('unsplashKey') || undefined
    const pexelsKey = searchParams.get('pexelsKey') || undefined

    if (!activityName) {
      return NextResponse.json(
        { error: 'activityName is required' },
        { status: 400 }
      )
    }

    const images: ImageResult[] = []
    
    // 按优先级尝试多个图片源，使用Promise.allSettled并行搜索以提高速度
    const searchPromises = []
    
    // 1. Wikipedia（免费，地标图片多）
    searchPromises.push(
      searchWikipediaImages(activityName, locationName).catch(() => [])
    )
    
    // 2. Unsplash（如果有API key）
    if (unsplashKey) {
      searchPromises.push(
        searchUnsplashImages(activityName, locationName, unsplashKey).catch(() => [])
      )
    }
    
    // 3. Pexels（如果有API key）
    if (pexelsKey) {
      searchPromises.push(
        searchPexelsImages(activityName, locationName, pexelsKey).catch(() => [])
      )
    }
    
    // 等待所有搜索完成
    const results = await Promise.allSettled(searchPromises)
    
    // 收集所有结果
    results.forEach(result => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        images.push(...result.value)
      }
    })
    
    // 去重（基于URL）
    const uniqueImages = Array.from(
      new Map(images.map(img => [img.url, img])).values()
    )
    
    // 最终验证：确保所有图片都是相关的
    const relevantImages = uniqueImages.filter(img => 
      isImageRelevant(img.url, img.description, activityName, locationName)
    )

    // 如果没有找到相关图片，返回空数组而不是无关图片
    if (relevantImages.length === 0) {
      console.warn(`No relevant images found for: ${activityName}`)
      return NextResponse.json({ 
        images: [],
        sources: [],
        message: '未找到相关图片'
      })
    }

    return NextResponse.json({ 
      images: relevantImages.slice(0, 5),
      sources: relevantImages.map(img => img.source)
    })
  } catch (error: any) {
    console.error('Image search error:', error)
    return NextResponse.json(
      { error: 'Image search failed', images: [] },
      { status: 500 }
    )
  }
}

