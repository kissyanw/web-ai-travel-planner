'use client'

import { useState, useEffect } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { BrowserSpeechRecognizer } from '@/lib/speech'

interface VoiceInputProps {
  onResult: (text: string) => void
}

export default function VoiceInput({ onResult }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const [recognizer, setRecognizer] = useState<BrowserSpeechRecognizer | null>(null)

  useEffect(() => {
    // 初始化语音识别器
    try {
      const rec = new BrowserSpeechRecognizer()
      setRecognizer(rec)
    } catch (err) {
      setError('浏览器不支持语音识别，请使用Chrome或Edge浏览器')
    }
  }, [])

  const startListening = () => {
    if (!recognizer) {
      setError('语音识别未初始化')
      return
    }

    setError('')
    setIsListening(true)
    setTranscript('')

    recognizer.startRecognizing(
      (text) => {
        setTranscript(text)
        onResult(text)
      },
      (err) => {
        setError(err.message)
        setIsListening(false)
      }
    )
  }

  const stopListening = () => {
    if (recognizer) {
      recognizer.stopRecognizing()
    }
    setIsListening(false)
  }

  useEffect(() => {
    return () => {
      if (recognizer) {
        recognizer.stopRecognizing()
      }
    }
  }, [recognizer])

  if (!recognizer) {
    return (
      <div className="text-sm text-gray-500">
        浏览器不支持语音识别，请使用Chrome或Edge浏览器
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            isListening
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          {isListening ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              正在录音...（点击停止）
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              开始语音输入
            </>
          )}
        </button>

        {transcript && (
          <div className="flex-1 p-3 bg-gray-50 rounded text-sm text-gray-700">
            {transcript}
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      <p className="text-xs text-gray-500">
        提示：说出你的旅行需求，例如&ldquo;我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子&rdquo;
      </p>
    </div>
  )
}
