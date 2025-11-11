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

    // 构建搜索提示词
    const searchPrompt = `请为以下旅游地点搜索3-5张真实的相关图片URL。要求：
1. 图片必须与地点高度相关
2. 必须是真实的、可访问的图片URL（以http://或https://开头）
3. 优先使用Wikipedia、Unsplash、Pexels等知名图片网站
4. 返回JSON格式，包含url和description字段
5. 不要返回占位符、示例图片或无效URL

地点名称：${activityName}${locationName ? `\n地点位置：${locationName}` : ''}

请返回JSON数组格式，例如：
[
  {
    "url": "https://example.com/image1.jpg",
    "description": "图片描述"
  }
]`

    // 支持阿里云通义千问API格式（兼容OpenAI格式）
    let dashscopeUrl = apiUrl
    if (apiUrl && apiUrl.includes('dashscope')) {
      // 确保URL包含完整的chat/completions路径
      if (!apiUrl.includes('/chat/completions')) {
        if (apiUrl.includes('dashscope-intl')) {
          dashscopeUrl = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions'
        } else if (!apiUrl.includes('/compatible-mode/v1')) {
          dashscopeUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
        } else {
          dashscopeUrl = apiUrl.endsWith('/') 
            ? `${apiUrl}chat/completions`
            : `${apiUrl}/chat/completions`
        }
      }
    } else if (!apiUrl || !apiUrl.includes('openai')) {
      // 如果没有指定URL或不是OpenAI，默认使用通义千问
      dashscopeUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
    }

    // 使用OpenAI兼容格式
    const response = await axios.post(
      dashscopeUrl,
      {
        model: model || 'qwen-plus',
        messages: [
          {
            role: 'user',
            content: searchPrompt
          }
        ],
        temperature: 0.3, // 降低温度以获得更准确的结果
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000,
      }
    )

    const content = response.data.choices?.[0]?.message?.content || ''

    // 提取JSON内容
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      try {
        const images = JSON.parse(jsonMatch[0])
        
        // 验证和过滤图片
        const validImages = images.filter((img: any) => {
          if (!img.url || typeof img.url !== 'string') return false
          if (!img.url.startsWith('http://') && !img.url.startsWith('https://')) return false
          // 排除占位符和无效URL
          if (/placeholder|default|sample|random|picsum|lorem/i.test(img.url)) return false
          return true
        })

        console.log(`[服务器] ✅ AI搜索成功：为"${activityName}"找到 ${validImages.length}/${images.length} 张有效图片`)

        return NextResponse.json({ images: validImages })
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError)
        return NextResponse.json(
          { error: 'AI did not return valid JSON', images: [] },
          { status: 500 }
        )
      }
    } else {
      console.warn('AI did not return JSON array in response')
      return NextResponse.json(
        { error: 'AI did not return valid JSON', images: [] },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('AI image search error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'AI image search failed', 
        images: [],
        details: error.response?.data 
      },
      { status: 500 }
    )
  }
}

