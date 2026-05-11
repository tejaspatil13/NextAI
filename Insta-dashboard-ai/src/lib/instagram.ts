import type { Reel } from './types'

const BASE = 'https://i.instagram.com/api/v1'
const APP_ID = '936619743392459'

function getHeaders(): HeadersInit {
  const session = process.env.INSTAGRAM_SESSION_ID ?? ''
  return {
    'Cookie': `sessionid=${session}`,
    'x-ig-app-id': APP_ID,
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.instagram.com/',
    'Origin': 'https://www.instagram.com',
    'x-requested-with': 'XMLHttpRequest',
  }
}

function parseCsrfToken(setCookieHeaders: string[]): string {
  for (const header of setCookieHeaders) {
    const match = header.match(/csrftoken=([^;]+)/)
    if (match) return match[1]
  }
  return 'missing'
}

export async function getUserId(username: string): Promise<{ userId: string; csrfToken: string }> {
  const res = await fetch(
    `${BASE}/users/web_profile_info/?username=${encodeURIComponent(username)}`,
    { headers: getHeaders(), signal: AbortSignal.timeout(15_000) }
  )
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Instagram profile lookup failed (${res.status}): ${body.slice(0, 200)}`)
  }
  const data = await res.json()
  const userId = data?.data?.user?.id
  if (!userId) throw new Error(`User @${username} not found or account is private`)

  const setCookies = res.headers.getSetCookie?.() ?? []
  const csrfToken = parseCsrfToken(setCookies)

  return { userId: String(userId), csrfToken }
}

export async function getUserReels(userId: string, limit: number, csrfToken: string): Promise<Reel[]> {
  const body = new URLSearchParams({
    target_user_id: userId,
    page_size: String(Math.min(limit, 50)),
    max_id: '',
  })

  const session = process.env.INSTAGRAM_SESSION_ID ?? ''
  const res = await fetch(`${BASE}/clips/user/`, {
    method: 'POST',
    headers: {
      ...getHeaders() as Record<string, string>,
      'Cookie': `sessionid=${session}; csrftoken=${csrfToken}`,
      'x-csrftoken': csrfToken,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
    signal: AbortSignal.timeout(20_000),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Instagram reels fetch failed (${res.status}): ${text.slice(0, 200)}`)
  }

  const data = await res.json()
  const items: Array<{ media: Record<string, unknown> }> = data?.items ?? []

  return items.map((item) => {
    const m = item.media
    const code = m.code as string ?? ''
    const videoVersions = (m.video_versions as Array<{ url: string }> | undefined) ?? []
    const imageVersions = (m.image_versions2 as { candidates?: Array<{ url: string }> } | undefined)
    const videoUrl = videoVersions[0]?.url
    const captionObj = m.caption as { text?: string } | null
    const takenAt = m.taken_at as number ?? 0

    return {
      id: String(m.pk ?? m.id ?? Math.random()),
      url: `https://www.instagram.com/reel/${code}/`,
      timestamp: takenAt ? new Date(takenAt * 1000).toISOString() : '',
      likes: Number(m.like_count ?? 0),
      views: Number(m.play_count ?? m.view_count ?? 0),
      comments: Number(m.comment_count ?? 0),
      caption: (captionObj?.text ?? '').slice(0, 600),
      videoUrl,
      audioUrl: videoUrl,
      thumbnailUrl: imageVersions?.candidates?.[0]?.url,
      duration: m.video_duration as number | undefined,
      ownerUsername: (m.user as { username?: string } | undefined)?.username ?? '',
    }
  })
}

export function tagPerformance(reels: Reel[]): Reel[] {
  if (reels.length === 0) return reels
  const avg = reels.reduce((s, r) => s + r.views, 0) / reels.length
  return reels.map((r) => ({
    ...r,
    performance: r.views >= avg * 1.4 ? 'top' : r.views < avg * 0.6 ? 'low' : 'mid',
  }))
}

export function usernameFromUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '')
}
