'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    try {
      const supabase = createSupabaseClient()
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      
      // 检查是否有配置
      if (typeof window !== 'undefined') {
        const storedConfig = localStorage.getItem('api-config')
        let configUrl = supabaseUrl
        let configKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        
        // 从localStorage读取配置
        if (storedConfig) {
          try {
            const config = JSON.parse(storedConfig)
            if (config.supabaseUrl) configUrl = config.supabaseUrl
            if (config.supabaseAnonKey) configKey = config.supabaseAnonKey
          } catch {
            // 解析失败，继续使用环境变量
          }
        }
        
        const hasConfig = configUrl && configKey
        
        if (!hasConfig) {
          // 没有配置，设置loading为false但不报错
          if (mounted) {
            setLoading(false)
            setError('not-configured')
          }
          return
        }
      }

      // 获取当前用户
      supabase.auth.getUser()
        .then(({ data: { user }, error }) => {
          if (!mounted) return
          
          if (error && error.message.includes('Invalid API key')) {
            setError('invalid-config')
          } else {
            setUser(user)
          }
          setLoading(false)
        })
        .catch((err) => {
          if (!mounted) return
          console.error('Auth error:', err)
          setError('auth-error')
          setLoading(false)
        })

      // 监听认证状态变化
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return
        setUser(session?.user ?? null)
        setError(null)
        setLoading(false)
      })

      return () => {
        mounted = false
        subscription.unsubscribe()
      }
    } catch (err) {
      if (!mounted) return
      console.error('Failed to initialize Supabase:', err)
      setError('init-error')
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return data
    } catch (err: any) {
      throw err
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      return data
    } catch (err: any) {
      throw err
    }
  }

  const signOut = async () => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err: any) {
      throw err
    }
  }

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  }
}
