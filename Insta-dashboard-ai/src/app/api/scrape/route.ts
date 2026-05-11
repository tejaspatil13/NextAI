import { NextRequest, NextResponse } from 'next/server'
import { getUserId, getUserReels, tagPerformance, usernameFromUrl } from '@/lib/instagram'

export async function POST(req: NextRequest) {
  if (!process.env.INSTAGRAM_SESSION_ID) {
    return NextResponse.json(
      { error: 'INSTAGRAM_SESSION_ID not set in .env.local. See CLAUDE.md for setup instructions.' },
      { status: 500 }
    )
  }

  const { instagramUrl, limit } = await req.json() as { instagramUrl: string; limit?: number }
  if (!instagramUrl) {
    return NextResponse.json({ error: 'instagramUrl required' }, { status: 400 })
  }

  const username = usernameFromUrl(instagramUrl)
  const fetchLimit = limit ?? 30

  try {
    const { userId, csrfToken } = await getUserId(username)
    const reels = await getUserReels(userId, fetchLimit, csrfToken)
    const tagged = tagPerformance(reels)
    return NextResponse.json({ reels: tagged })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
