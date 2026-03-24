import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { parseReceipt } from '@/lib/openai'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { imageUrl } = await req.json()
    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })
    }

    const parsed = await parseReceipt(imageUrl)
    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error('Parse API error:', err)
    // Handle JSON parse errors gracefully with a 422 status
    if (err.message.includes('JSON')) {
      return NextResponse.json({ error: 'Failed to parse GPT response as JSON' }, { status: 422 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
