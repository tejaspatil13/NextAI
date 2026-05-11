import { NextRequest, NextResponse } from 'next/server'
import { getUserId, getUserReels, tagPerformance, usernameFromUrl } from '@/lib/instagram'

// Edge runtime runs on Cloudflare's network — Instagram doesn't block those IPs
export const runtime = 'edge'

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 2000): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      const is429 = msg.includes('429')
      if (is429 && attempt < retries) {
        await new Promise(r => setTimeout(r, delayMs * (attempt + 1)))
        continue
      }
      throw e
    }
  }
  throw new Error('Max retries exceeded')
}

export async function POST(req: NextRequest) {
  if (!process.env.INSTAGRAM_SESSION_ID) {
    return NextResponse.json(
      { error: 'INSTAGRAM_SESSION_ID not set. Add it in Vercel → Settings → Environment Variables.' },
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
    const { userId, csrfToken } = await withRetry(() => getUserId(username))
    const reels = await withRetry(() => getUserReels(userId, fetchLimit, csrfToken))
    const tagged = tagPerformance(reels)
    return NextResponse.json({ reels: tagged })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
