import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// 获取Supabase配置
function getSupabaseConfig() {
  if (typeof window !== 'undefined') {
    // 客户端：先从localStorage获取
    const storedConfig = localStorage.getItem('api-config')
    if (storedConfig) {
      try {
        const config = JSON.parse(storedConfig)
        if (config.supabaseUrl && config.supabaseAnonKey) {
          return {
            url: config.supabaseUrl,
            key: config.supabaseAnonKey,
          }
        }
      } catch {
        // 解析失败，继续使用环境变量
      }
    }
  }

  // 使用环境变量
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  return {
    url: supabaseUrl,
    key: supabaseAnonKey,
  }
}

// 客户端组件使用
export const createSupabaseClient = () => {
  try {
    // 首先尝试使用 auth helpers（需要环境变量）
    return createClientComponentClient()
  } catch (error) {
    // 如果失败，尝试手动创建客户端
    const config = getSupabaseConfig()
    if (config.url && config.key) {
      return createClient(config.url, config.key)
    }
    
    // 如果都没有配置，创建一个假的客户端（避免崩溃）
    // 返回一个会失败但不会崩溃的客户端
    console.warn('Supabase not configured. Please configure in settings page.')
    return createClient('https://placeholder.supabase.co', 'placeholder-key')
  }
}

// 服务端使用
export const createServerSupabaseClient = () => {
  const config = getSupabaseConfig()
  
  if (!config.url || !config.key) {
    throw new Error('Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  
  return createClient(config.url, config.key)
}
