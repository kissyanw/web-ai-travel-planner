// API配置管理
export const getConfig = () => {
  if (typeof window === 'undefined') {
    // 服务端
    return {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      amapKey: process.env.NEXT_PUBLIC_AMAP_KEY || '',
      xfyunAppId: process.env.NEXT_PUBLIC_XFYUN_APP_ID || '',
      xfyunApiKey: process.env.NEXT_PUBLIC_XFYUN_API_KEY || '',
      xfyunApiSecret: process.env.NEXT_PUBLIC_XFYUN_API_SECRET || '',
      llmApiKey: process.env.NEXT_PUBLIC_LLM_API_KEY || '',
      llmApiUrl: process.env.NEXT_PUBLIC_LLM_API_URL || '',
      llmModel: process.env.NEXT_PUBLIC_LLM_MODEL || 'qwen-plus',
      unsplashKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '',
      pexelsKey: process.env.NEXT_PUBLIC_PEXELS_API_KEY || '',
    }
  } else {
    // 客户端 - 从localStorage或环境变量获取
    const storedConfig = localStorage.getItem('api-config')
    if (storedConfig) {
      try {
        return JSON.parse(storedConfig)
      } catch {
        // 解析失败，使用默认值
      }
    }
    
    return {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      amapKey: localStorage.getItem('amap-key') || process.env.NEXT_PUBLIC_AMAP_KEY || '',
      xfyunAppId: localStorage.getItem('xfyun-app-id') || '',
      xfyunApiKey: localStorage.getItem('xfyun-api-key') || '',
      xfyunApiSecret: localStorage.getItem('xfyun-api-secret') || '',
      llmApiKey: localStorage.getItem('llm-api-key') || process.env.NEXT_PUBLIC_LLM_API_KEY || '',
      llmApiUrl: localStorage.getItem('llm-api-url') || process.env.NEXT_PUBLIC_LLM_API_URL || '',
      llmModel: localStorage.getItem('llm-model') || 'qwen-plus',
      unsplashKey: localStorage.getItem('unsplash-key') || process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '',
      pexelsKey: localStorage.getItem('pexels-key') || process.env.NEXT_PUBLIC_PEXELS_API_KEY || '',
    }
  }
}

export const saveConfig = (config: Record<string, string>) => {
  if (typeof window !== 'undefined') {
    const currentConfig = getConfig()
    const newConfig = { ...currentConfig, ...config }
    
    // 保存到localStorage
    Object.entries(config).forEach(([key, value]) => {
      if (key.includes('key') || key.includes('secret') || key.includes('id') || key.includes('url')) {
        localStorage.setItem(key.replace(/^NEXT_PUBLIC_/, '').toLowerCase().replace(/_/g, '-'), value)
      }
    })
    
    localStorage.setItem('api-config', JSON.stringify(newConfig))
  }
}
