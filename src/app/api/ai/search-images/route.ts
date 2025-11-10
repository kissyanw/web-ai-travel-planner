import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { activityName, locationName, apiKey, apiUrl, model } = body

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key not provided' },
        { status: 400 }
      )
    }

    if (!activityName) {
      return NextResponse.json(
        { error: 'Activity name is required' },
        { status: 400 }
      )
    }

    // 构建搜索提示词，让大模型返回图片URL
    // 使用更具体的搜索关键词，提高图片相关性
    const searchQuery = locationName 
      ? `${activityName} ${locationName} travel tourism landmark`
      : `${activityName} travel tourism landmark`
    
    const prompt = `请为以下旅游地点搜索并提供3-5张高质量的真实图片URL。地点信息：
- 名称：${activityName}
${locationName ? `- 位置：${locationName}` : ''}

搜索关键词：${searchQuery}

请返回JSON格式，包含图片URL数组：
{
  "images": [
    {
      "url": "图片URL（必须是可公开访问的真实图片URL）",
      "description": "图片描述"
    }
  ]
}

严格要求：
1. 图片URL必须是真实可访问的URL，且URL或描述中必须包含景点名称的核心关键词
2. 图片必须与地点高度相关，展示该地点的真实特色和外观
3. 如果找不到与地点相关的图片，返回空数组：{"images": []}
4. 绝对不要返回无关的通用旅行图片、随机图片或占位图片
5. 只返回JSON，不要其他文字

重要提示：
- 图片URL或描述中必须包含景点名称的核心关键词（如"${activityName.replace(/[的|地|得|（|）|\(|\)|店|总店|分店]/g, '').trim()}"）
- 如果无法找到包含这些关键词的相关图片，必须返回空数组
- 不要使用随机图片、占位图片或通用旅行图片
- 只返回与地点真实相关的图片，否则返回空数组`

    // 支持阿里云通义千问API格式（兼容OpenAI格式）
    let apiEndpoint = apiUrl
    if (apiUrl && apiUrl.includes('dashscope')) {
      if (!apiUrl.includes('/chat/completions')) {
        if (apiUrl.includes('dashscope-intl')) {
          apiEndpoint = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions'
        } else if (!apiUrl.includes('/compatible-mode/v1')) {
          apiEndpoint = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
        } else {
          apiEndpoint = apiUrl.endsWith('/') 
            ? `${apiUrl}chat/completions`
            : `${apiUrl}/chat/completions`
        }
      }
    }

    // 调用大模型API
    const response = await axios.post(
      apiEndpoint,
      {
        model: model || 'qwen-plus',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 60000, // 60秒超时
      }
    )

    const content = response.data.choices?.[0]?.message?.content || ''

    // 提取JSON内容
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // 如果大模型没有返回有效JSON，返回空数组
      console.warn('AI did not return valid JSON')
      return NextResponse.json({ images: [] })
    }

    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.images && Array.isArray(parsed.images) && parsed.images.length > 0) {
        // 严格验证URL是否有效且相关
        const validImages = parsed.images.filter((img: any) => {
          if (!img.url || typeof img.url !== 'string' || !img.url.startsWith('http')) {
            return false
          }
          
          // 验证相关性：URL或描述必须包含景点名称的核心关键词
          const url = img.url.toLowerCase()
          const desc = (img.description || '').toLowerCase()
          const activity = activityName.toLowerCase()
          
          // 提取核心关键词
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
        
        if (validImages.length > 0) {
          return NextResponse.json({ images: validImages })
        } else {
          console.warn('AI returned images but none passed relevance check')
          return NextResponse.json({ images: [] })
        }
      } else {
        // 如果返回空数组，直接返回
        return NextResponse.json({ images: [] })
      }
    } catch (parseError) {
      console.error('Error parsing LLM response:', parseError)
      return NextResponse.json({ images: [] })
    }
  } catch (error: any) {
    console.error('Error searching images:', error)
    
    // 即使出错也返回空数组，不返回无关图片
    return NextResponse.json({ images: [] })
  }
}

// 不再使用备用方案，如果找不到相关图片，返回空数组
// 这样可以避免显示误导性的无关图片

