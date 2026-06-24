import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * 硅基流动 AI TTS（文本转语音）
 * - POST { text: string } → 返回 audio/mpeg 二进制
 * - 失败时返回 { status: 'fallback' }，前端会自动降级为浏览器原生 SpeechSynthesis
 *
 * 环境变量：SILICONFLOW_API_KEY
 * 模型：CosyVoice-300M-SFT（高质量中文语音）
 */
export async function POST(req: NextRequest) {
  let body: any = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }
  const text: string = (body?.text || '').toString().trim()
  if (!text) {
    return NextResponse.json({ error: '文本不能为空' }, { status: 400 })
  }
  if (text.length > 2000) {
    return NextResponse.json({ error: '文本过长（>2000 字）' }, { status: 413 })
  }

  const apiKey = process.env.SILICONFLOW_API_KEY
  if (!apiKey) {
    console.warn('[tts] 缺少 SILICONFLOW_API_KEY，降级')
    return NextResponse.json({ status: 'fallback', reason: 'no-api-key' })
  }

  try {
    const response = await fetch('https://api.siliconflow.cn/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'FunAudioLLM/CosyVoice2-0.5B',
        input: text,
        voice: 'FunAudioLLM/CosyVoice2-0.5B:alex',
        response_format: 'mp3',
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      console.error('[tts] 硅基流动失败', response.status, errText.slice(0, 200))
      return NextResponse.json({
        status: 'fallback',
        reason: `upstream-${response.status}`,
      })
    }

    const audioBuffer = await response.arrayBuffer()
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (e) {
    console.error('[tts] 异常', e)
    return NextResponse.json({ status: 'fallback', reason: 'exception' })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    provider: 'siliconflow',
    model: 'CosyVoice2-0.5B',
    requires: 'SILICONFLOW_API_KEY',
  })
}
