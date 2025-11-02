import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, apiKey, apiUrl, model } = body

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key not provided' },
        { status: 400 }
      )
    }

    // 支持阿里云通义千问API格式（兼容OpenAI格式）
    if (apiUrl && apiUrl.includes('dashscope')) {
      // 使用兼容模式端点，如果URL不正确则自动修正
      let dashscopeUrl = apiUrl
      
      // 确保URL包含完整的chat/completions路径
      if (!apiUrl.includes('/chat/completions')) {
        if (apiUrl.includes('dashscope-intl')) {
          dashscopeUrl = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions'
        } else if (!apiUrl.includes('/compatible-mode/v1')) {
          dashscopeUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
        } else {
          // 如果有compatible-mode但没有chat/completions，添加它
          dashscopeUrl = apiUrl.endsWith('/') 
            ? `${apiUrl}chat/completions`
            : `${apiUrl}/chat/completions`
        }
      }
      
      // 使用OpenAI兼容格式
      const response = await axios.post(
        dashscopeUrl,
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
            'Content-Type': 'application/json'
          },
          timeout: 30000,
        }
      )

      const analysis = response.data.choices?.[0]?.message?.content || '分析完成'

      return NextResponse.json({ analysis })
    } else {
      // 支持OpenAI格式
      const response = await axios.post(
        apiUrl || 'https://api.openai.com/v1/chat/completions',
        {
          model: model || 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000,
        }
      )

      const analysis = response.data.choices?.[0]?.message?.content || '分析完成'
      return NextResponse.json({ analysis })
    }
  } catch (error: any) {
    console.error('Budget analysis API error:', error)
    
    if (error.response) {
      return NextResponse.json(
        { 
          error: error.response.data?.message || error.response.data?.error || 'API request failed',
          details: error.response.data
        },
        { status: error.response.status || 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze budget',
        details: error.message
      },
      { status: 500 }
    )
  }
}

