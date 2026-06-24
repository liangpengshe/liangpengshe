import { useRef, useCallback } from 'react'

/**
 * 统一音频管理 Hook
 * - playSound(src): 播放本地短音效（如金币声、提示音）
 * - playTTS(text):  调用后端硅基流动 TTS 接口合成语音，失败自动降级为浏览器原生 TTS
 *
 * 依赖：SILICONFLOW_API_KEY（写入 .env），可选音效文件 public/sounds/coin.wav
 */
export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null)

  // 懒初始化 AudioContext（必须在用户交互后才能成功创建）
  const initAudio = useCallback(() => {
    if (typeof window === 'undefined') return
    if (!audioContextRef.current) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext
      if (Ctx) audioContextRef.current = new Ctx()
    }
    // 部分浏览器要求 resume
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => null)
    }
  }, [])

  // 播放本地音效（如 /sounds/coin.wav）
  const playSound = useCallback(
    async (src: string) => {
      try {
        initAudio()
        if (!audioContextRef.current) return
        const response = await fetch(src)
        if (!response.ok) throw new Error(`fetch ${src} ${response.status}`)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)
        const source = audioContextRef.current.createBufferSource()
        source.buffer = audioBuffer
        source.connect(audioContextRef.current.destination)
        source.start(0)
      } catch (e) {
        console.warn('[useAudio] 音效播放失败', src, e)
      }
    },
    [initAudio]
  )

  // 硅基流动 TTS 播放语音，失败降级为浏览器原生 SpeechSynthesis
  const playTTS = useCallback(async (text: string) => {
    if (!text || typeof text !== 'string') return
    // 1) 优先走后端硅基流动
    try {
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (res.ok) {
        const ct = res.headers.get('content-type') || ''
        if (ct.includes('audio')) {
          const blob = await res.blob()
          const url = URL.createObjectURL(blob)
          const audio = new Audio(url)
          audio.onended = () => URL.revokeObjectURL(url)
          await audio.play()
          return
        }
        // 后端返回 { status: 'fallback' } → 走降级
      }
    } catch (e) {
      console.warn('[useAudio] TTS 后端调用失败，降级浏览器', e)
    }

    // 2) 降级：浏览器原生 TTS
    try {
      if (typeof window === 'undefined' || !window.speechSynthesis) return
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'zh-CN'
      u.rate = 0.95
      u.pitch = 1.0
      window.speechSynthesis.speak(u)
    } catch (e) {
      console.warn('[useAudio] 浏览器 TTS 也失败', e)
    }
  }, [])

  return { playSound, playTTS }
}
