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
      googleApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
      googleSearchEngineId: process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID || '',
      bingApiKey: process.env.NEXT_PUBLIC_BING_API_KEY || '',
    }
  } else {
    // 客户端 - 从localStorage或环境变量获取
    // 先获取环境变量（构建时嵌入的）
    const envConfig = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      amapKey: process.env.NEXT_PUBLIC_AMAP_KEY || '',
      llmApiKey: process.env.NEXT_PUBLIC_LLM_API_KEY || '',
      llmApiUrl: process.env.NEXT_PUBLIC_LLM_API_URL || '',
      llmModel: process.env.NEXT_PUBLIC_LLM_MODEL || 'qwen-plus',
      unsplashKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '',
      pexelsKey: process.env.NEXT_PUBLIC_PEXELS_API_KEY || '',
      googleApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
      googleSearchEngineId: process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID || '',
      bingApiKey: process.env.NEXT_PUBLIC_BING_API_KEY || '',
    }
    
    // 从localStorage获取配置
    const storedConfig = localStorage.getItem('api-config')
    if (storedConfig) {
      try {
        const parsed = JSON.parse(storedConfig)
        // 合并配置：localStorage优先，但环境变量作为默认值
        return {
          ...envConfig,
          ...parsed,
          // 如果localStorage中没有，使用环境变量
          supabaseUrl: parsed.supabaseUrl || envConfig.supabaseUrl,
          supabaseAnonKey: parsed.supabaseAnonKey || envConfig.supabaseAnonKey,
          amapKey: parsed.amapKey || envConfig.amapKey,
          llmApiKey: parsed.llmApiKey || envConfig.llmApiKey,
          llmApiUrl: parsed.llmApiUrl || envConfig.llmApiUrl,
          llmModel: parsed.llmModel || envConfig.llmModel,
        }
      } catch {
        // 解析失败，使用环境变量
      }
    }
    
    // 从旧的localStorage键读取（兼容旧版本）
    return {
      ...envConfig,
      supabaseUrl: envConfig.supabaseUrl || '',
      supabaseAnonKey: envConfig.supabaseAnonKey || '',
      amapKey: localStorage.getItem('amap-key') || envConfig.amapKey,
      xfyunAppId: localStorage.getItem('xfyun-app-id') || '',
      xfyunApiKey: localStorage.getItem('xfyun-api-key') || '',
      xfyunApiSecret: localStorage.getItem('xfyun-api-secret') || '',
      llmApiKey: localStorage.getItem('llm-api-key') || envConfig.llmApiKey,
      llmApiUrl: localStorage.getItem('llm-api-url') || envConfig.llmApiUrl,
      llmModel: localStorage.getItem('llm-model') || envConfig.llmModel,
      unsplashKey: localStorage.getItem('unsplash-key') || envConfig.unsplashKey,
      pexelsKey: localStorage.getItem('pexels-key') || envConfig.pexelsKey,
      googleApiKey: localStorage.getItem('google-api-key') || envConfig.googleApiKey,
      googleSearchEngineId: localStorage.getItem('google-search-engine-id') || envConfig.googleSearchEngineId,
      bingApiKey: localStorage.getItem('bing-api-key') || envConfig.bingApiKey,
    }
  }
}

export const saveConfig = (config: Record<string, string>) => {
  if (typeof window !== 'undefined') {
    const currentConfig = getConfig()
    const newConfig = { ...currentConfig, ...config }
    
    // 保存到localStorage（统一保存到api-config）
    localStorage.setItem('api-config', JSON.stringify(newConfig))
    
    // 同时保存到旧的localStorage键（兼容性）
    if (config.amapKey) localStorage.setItem('amap-key', config.amapKey)
    if (config.xfyunAppId) localStorage.setItem('xfyun-app-id', config.xfyunAppId)
    if (config.xfyunApiKey) localStorage.setItem('xfyun-api-key', config.xfyunApiKey)
    if (config.xfyunApiSecret) localStorage.setItem('xfyun-api-secret', config.xfyunApiSecret)
    if (config.llmApiKey) localStorage.setItem('llm-api-key', config.llmApiKey)
    if (config.llmApiUrl) localStorage.setItem('llm-api-url', config.llmApiUrl)
    if (config.llmModel) localStorage.setItem('llm-model', config.llmModel)
    
    // 如果保存了Supabase配置，刷新页面以应用新配置
    if (config.supabaseUrl || config.supabaseAnonKey) {
      // 延迟刷新，让用户看到保存成功的消息
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }
}
