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
          max_tokens: 4000
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 120000, // 120秒超时（AI生成可能需要更长时间）
        }
      )

      const content = response.data.choices?.[0]?.message?.content || ''

      // 提取JSON内容
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const planData = JSON.parse(jsonMatch[0])
          return NextResponse.json({ planData })
        } catch (parseError) {
          console.error('JSON parse error:', parseError)
          return NextResponse.json(
            { error: 'Failed to parse LLM response as JSON', rawContent: content },
            { status: 500 }
          )
        }
      }

      return NextResponse.json(
        { error: 'No valid JSON found in LLM response', rawContent: content },
        { status: 500 }
      )
    } else {
      // 支持OpenAI格式或其他兼容OpenAI的API
      const response = await axios.post(
        apiUrl || 'https://api.openai.com/v1/chat/completions',
        {
          model: model || 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 120000, // 120秒超时
        }
      )

      const content = response.data.choices?.[0]?.message?.content || ''
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        try {
          const planData = JSON.parse(jsonMatch[0])
          return NextResponse.json({ planData })
        } catch (parseError) {
          console.error('JSON parse error:', parseError)
          return NextResponse.json(
            { error: 'Failed to parse LLM response as JSON', rawContent: content },
            { status: 500 }
          )
        }
      }

      return NextResponse.json(
        { error: 'No valid JSON found in LLM response', rawContent: content },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('API route error:', error)
    
    // 处理axios错误
    if (error.response) {
      const status = error.response.status
      const data = error.response.data
      
      return NextResponse.json(
        { 
          error: `API request failed: ${data?.message || data?.error || 'Unknown error'}`,
          status,
          details: data
        },
        { status }
      )
    } else if (error.request || error.code === 'ECONNABORTED') {
      return NextResponse.json(
        { 
          error: error.code === 'ECONNABORTED' 
            ? '请求超时：API服务器响应时间过长。这可能是因为：\n1. 网络连接较慢\n2. API服务器负载较高\n3. 生成内容较长需要更多时间\n\n请稍后重试，或检查网络连接。'
            : 'No response from API server',
          details: error.message,
          code: error.code
        },
        { status: 504 }
      )
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to process request',
          details: error.message
        },
        { status: 500 }
      )
    }
  }
}

