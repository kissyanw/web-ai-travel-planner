'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getConfig, saveConfig } from '@/lib/config'
import { ArrowLeft, Save } from 'lucide-react'

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [config, setConfig] = useState({
    supabaseUrl: '',
    supabaseAnonKey: '',
    amapKey: '',
    xfyunAppId: '',
    xfyunApiKey: '',
    xfyunApiSecret: '',
    llmApiKey: '',
    llmApiUrl: '',
    llmModel: 'qwen-plus',
  })

  useEffect(() => {
    // 允许未登录用户访问设置页面（因为需要先配置才能登录）
    // 加载配置
    const currentConfig = getConfig()
    setConfig({
      supabaseUrl: currentConfig.supabaseUrl || '',
      supabaseAnonKey: currentConfig.supabaseAnonKey || '',
      amapKey: currentConfig.amapKey || '',
      xfyunAppId: currentConfig.xfyunAppId || '',
      xfyunApiKey: currentConfig.xfyunApiKey || '',
      xfyunApiSecret: currentConfig.xfyunApiSecret || '',
      llmApiKey: currentConfig.llmApiKey || '',
      llmApiUrl: currentConfig.llmApiUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      llmModel: currentConfig.llmModel || 'qwen-plus',
    })
  }, [])

  const handleSave = () => {
    setSaving(true)
    setMessage('')

    try {
      saveConfig(config)
      setMessage('配置已保存！')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  // 不再需要等待用户登录，允许未登录用户配置

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </button>
          <h1 className="text-2xl font-bold text-gray-800">API配置</h1>
          <p className="text-sm text-gray-600 mt-2">
            配置各种API密钥以使用完整功能。这些信息仅存储在本地浏览器中。
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Supabase配置 */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Supabase配置</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supabase URL
                </label>
                <input
                  type="text"
                  value={config.supabaseUrl}
                  onChange={(e) => setConfig({ ...config, supabaseUrl: e.target.value })}
                  placeholder="https://xxx.supabase.co"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supabase Anon Key
                </label>
                <input
                  type="password"
                  value={config.supabaseAnonKey}
                  onChange={(e) => setConfig({ ...config, supabaseAnonKey: e.target.value })}
                  placeholder="eyJhbGc..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </section>

          {/* 高德地图配置 */}
          <section>
            <h2 className="text-lg font-semibold mb-4">高德地图配置</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                高德地图 API Key
              </label>
              <input
                type="password"
                value={config.amapKey}
                onChange={(e) => setConfig({ ...config, amapKey: e.target.value })}
                placeholder="您的高德地图API Key"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                申请地址：<a href="https://console.amap.com/dev/key/app" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">高德开放平台</a>
              </p>
            </div>
          </section>

          {/* 科大讯飞配置 */}
          <section>
            <h2 className="text-lg font-semibold mb-4">科大讯飞配置（可选）</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  App ID
                </label>
                <input
                  type="text"
                  value={config.xfyunAppId}
                  onChange={(e) => setConfig({ ...config, xfyunAppId: e.target.value })}
                  placeholder="您的科大讯飞App ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={config.xfyunApiKey}
                  onChange={(e) => setConfig({ ...config, xfyunApiKey: e.target.value })}
                  placeholder="您的科大讯飞API Key"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Secret
                </label>
                <input
                  type="password"
                  value={config.xfyunApiSecret}
                  onChange={(e) => setConfig({ ...config, xfyunApiSecret: e.target.value })}
                  placeholder="您的科大讯飞API Secret"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <p className="text-xs text-gray-500">
                注意：如未配置，系统将使用浏览器原生语音识别（Chrome/Edge）
              </p>
            </div>
          </section>

          {/* LLM配置 */}
          <section>
            <h2 className="text-lg font-semibold mb-4">大语言模型配置</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LLM API Key
                </label>
                <input
                  type="password"
                  value={config.llmApiKey}
                  onChange={(e) => setConfig({ ...config, llmApiKey: e.target.value })}
                  placeholder="您的LLM API Key（阿里云百炼或其他）"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LLM API URL
                </label>
                <input
                  type="text"
                  value={config.llmApiUrl}
                  onChange={(e) => setConfig({ ...config, llmApiUrl: e.target.value })}
                  placeholder="API地址（默认：阿里云通义千问）"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1">
                  阿里云通义千问：https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  模型名称
                </label>
                <input
                  type="text"
                  value={config.llmModel}
                  onChange={(e) => setConfig({ ...config, llmModel: e.target.value })}
                  placeholder="qwen-plus 或 gpt-3.5-turbo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </section>

          {message && (
            <div className={`p-4 rounded ${
              message.includes('失败') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '保存配置'}
          </button>
          
          {!user && config.supabaseUrl && config.supabaseAnonKey && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                ✅ <strong>配置已加载：</strong>检测到环境变量配置。点击&ldquo;保存配置&rdquo;后，页面会自动刷新，然后您就可以注册/登录账户了。
              </p>
            </div>
          )}
          
          {!user && (!config.supabaseUrl || !config.supabaseAnonKey) && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                💡 <strong>提示：</strong>请填写Supabase配置信息。配置保存后，页面会自动刷新，然后您就可以注册/登录账户了。
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
