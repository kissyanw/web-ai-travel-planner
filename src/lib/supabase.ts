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
  // 先获取配置
  const config = getSupabaseConfig()
  
  // 如果有配置，使用手动创建的客户端（更可靠）
  if (config.url && config.key && config.url !== 'https://placeholder.supabase.co') {
    return createClient(config.url, config.key)
  }
  
  // 尝试使用 auth helpers（需要环境变量）
  try {
    return createClientComponentClient()
  } catch (error) {
    // 如果失败，创建一个假的客户端（避免崩溃）
    console.warn('Supabase not configured. Please configure in settings page.')
    return createClient('https://placeholder.supabase.co', 'placeholder-key')
  }
}

// 服务端使用（用于 API 路由）
export const createServerSupabaseClient = (request: Request) => {
  const config = getSupabaseConfig()
  
  if (!config.url || !config.key) {
    throw new Error('Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  
  // 从请求头中获取 Authorization token
  const authHeader = request.headers.get('authorization')
  const accessToken = authHeader?.replace('Bearer ', '')
  
  // 从请求中提取 cookies
  const cookieHeader = request.headers.get('cookie') || ''
  
  // 创建 Supabase 客户端
  const client = createClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: {
        getItem: () => {
          // 如果有 access token，返回 session 数据
          if (accessToken) {
            return JSON.stringify({
              access_token: accessToken,
              token_type: 'bearer',
            })
          }
          return null
        },
        setItem: () => {},
        removeItem: () => {},
      },
    },
    global: {
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    },
  })
  
  return client
}
