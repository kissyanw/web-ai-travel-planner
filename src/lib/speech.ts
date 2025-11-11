// 科大讯飞语音识别
export class XfyunSpeechRecognizer {
  private appId: string
  private apiKey: string
  private apiSecret: string
  private ws: WebSocket | null = null
  private onResultCallback: ((text: string) => void) | null = null
  private onErrorCallback: ((error: Error) => void) | null = null

  constructor(appId: string, apiKey: string, apiSecret: string) {
    this.appId = appId
    this.apiKey = apiKey
    this.apiSecret = apiSecret
  }

  // 生成WebSocket鉴权URL
  private async generateAuthUrl(): Promise<string> {
    const url = 'wss://iat-api.xfyun.cn/v2/iat'
    const host = 'iat-api.xfyun.cn'
    const path = '/v2/iat'
    const date = new Date().toUTCString()

    // 生成签名字符串
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`
    const signatureSha = await this.hmacSHA1(signatureOrigin, this.apiSecret)
    
    // 将十六进制字符串转换为Base64
    const signatureBytes = Uint8Array.from(
      signatureSha.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    )
    const signature = btoa(String.fromCharCode.apply(null, Array.from(signatureBytes)))

    // 生成authorization字符串
    const authorizationOrigin = `api_key="${this.apiKey}", algorithm="hmac-sha1", headers="host date request-line", signature="${signature}"`
    const authorization = btoa(authorizationOrigin)

    // 生成完整URL
    return `${url}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`
  }

  // HMAC-SHA1签名（使用Web Crypto API）
  private async hmacSHA1(message: string, secret: string): Promise<string> {
    if (typeof window === 'undefined') {
      throw new Error('HMAC只能在浏览器环境中使用')
    }

    try {
      const encoder = new TextEncoder()
      const keyData = encoder.encode(secret)
      const messageData = encoder.encode(message)

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
      )

      const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
      const hashArray = Array.from(new Uint8Array(signature))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } catch (error) {
      console.error('HMAC签名失败:', error)
      throw new Error('HMAC签名失败')
    }
  }

  // 开始录音识别
  async startRecognizing(
    onResult: (text: string) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    this.onResultCallback = onResult
    this.onErrorCallback = onError

    if (!this.appId || !this.apiKey || !this.apiSecret) {
      throw new Error('科大讯飞API配置不完整')
    }

    try {
      const authUrl = await this.generateAuthUrl()
      this.ws = new WebSocket(authUrl)

      this.ws.onopen = () => {
        console.log('WebSocket连接已建立')
      }

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.code === 0 && data.data) {
          const text = data.data.result?.ws
            ?.map((w: any) => w.cw?.map((cw: any) => cw.w).join('')).join('') || ''
          if (text && this.onResultCallback) {
            this.onResultCallback(text)
          }
        } else if (data.code !== 0) {
          if (this.onErrorCallback) {
            this.onErrorCallback(new Error(data.message || '识别错误'))
          }
        }
      }

      this.ws.onerror = (error) => {
        if (this.onErrorCallback) {
          this.onErrorCallback(new Error('WebSocket连接错误'))
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket连接已关闭')
      }
    } catch (error) {
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error)
      }
    }
  }

  // 发送音频数据
  sendAudio(audioData: ArrayBuffer): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const frame = {
        common: {
          app_id: this.appId
        },
        business: {
          language: 'zh_cn',
          domain: 'iat',
          accent: 'mandarin'
        },
        data: {
          status: 1, // 1表示第一帧，2表示中间帧，3表示最后一帧
          format: 'audio/L16;rate=16000',
          encoding: 'raw',
          audio: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(audioData))))
        }
      }
      this.ws.send(JSON.stringify(frame))
    }
  }

  // 结束识别
  stopRecognizing(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.onResultCallback = null
    this.onErrorCallback = null
  }
}

// 使用浏览器原生语音识别API（备选方案）
export class BrowserSpeechRecognizer {
  private recognition: SpeechRecognition | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        if (this.recognition) {
          this.recognition.lang = 'zh-CN'
          this.recognition.continuous = true
          this.recognition.interimResults = true
        }
      }
    }
  }

  startRecognizing(
    onResult: (text: string) => void,
    onError: (error: Error) => void
  ): void {
    if (!this.recognition) {
      onError(new Error('浏览器不支持语音识别'))
      return
    }

    this.recognition.onresult = (event) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }
      if (finalTranscript) {
        onResult(finalTranscript)
      }
    }

    this.recognition.onerror = (event) => {
      onError(new Error(`识别错误: ${event.error}`))
    }

    this.recognition.start()
  }

  stopRecognizing(): void {
    if (this.recognition) {
      this.recognition.stop()
    }
  }
}
