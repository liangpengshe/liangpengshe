import { NextResponse } from 'next/server'

/**
 * POST /api/diagnosis/generate
 * 留空占位：未来真实接入 Dify 商业诊断工作流
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    // 模拟处理
    await new Promise((r) => setTimeout(r, 300))
    return NextResponse.json({
      success: true,
      message: 'Mock 报告生成成功（占位接口）',
      data: {
        score: 85,
        payload: body,
      },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
