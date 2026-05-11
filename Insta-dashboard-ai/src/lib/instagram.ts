import type { Reel } from './types'

// Web endpoint — less aggressively rate-limited than i.instagram.com mobile API
const BASE = 'https://www.instagram.com/api/v1'
const APP_ID = '936619743392459'

function getHeaders(csrfToken = ''): Record<string, string> {
  const session = process.env.INSTAGRAM_SESSION_ID ?? ''
  const cookie = csrfToken
    ? `sessionid=${session}; csrftoken=${csrfToken}`
    : `sessionid=${session}`
  return {
    'Cookie': cookie,
    'x-ig-app-id': APP_ID,
    'x-asbd-id': '198387',
    'x-csrftoken': csrfToken,
    // Desktop Chrome UA — datacenter IPs + iPhone UA = instant 429
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://www.instagram.com/',
    'Origin': 'https://www.instagram.com',
    'x-requested-with': 'XMLHttpRequest',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
  }
}

// Warm-up request: visit instagram.com first to get a fresh CSRF token
// Mimics real browser behaviour before hitting API endpoints
async function getCsrfToken(): Promise<string> {
  try {
    const session = process.env.INSTAGRAM_SESSION_ID ?? ''
    const res = await fetch('https://www.instagram.com/', {
      headers: {
        'Cookie': `sessionid=${session}`,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10_000),
    })
    // Extract csrftoken from Set-Cookie
    const setCookies = res.headers.getSetCookie?.() ?? []
    for (const c of setCookies) {
      const m = c.match(/csrftoken=([^;]+)/)
      if (m) return m[1]
    }
    // Also try to find csrftoken in existing Cookie header response
    const cookies = res.headers.get('set-cookie') ?? ''
    const m = cookies.match(/csrftoken=([^;]+)/)
    if (m) return m[1]
  } catch { /* fall through */ }
  return ''
}

export async function getUserId(username: string): Promise<{ userId: string; csrfToken: string }> {
  const csrfToken = await getCsrfToken()

  const res = await fetch(
    `${BASE}/users/web_profile_info/?username=${encodeURIComponent(username)}`,
    { headers: getHeaders(csrfToken), signal: AbortSignal.timeout(15_000) }
  )
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Instagram profile lookup failed (${res.status}): ${body.slice(0, 200)}`)
  }
  const data = await res.json()
  const userId = data?.data?.user?.id
  if (!userId) throw new Error(`User @${username} not found or account is private`)

  // Refresh CSRF from response cookies if available
  const setCookies = res.headers.getSetCookie?.() ?? []
  let freshCsrf = csrfToken
  for (const c of setCookies) {
    const m = c.match(/csrftoken=([^;]+)/)
    if (m) { freshCsrf = m[1]; break }
  }

  return { userId: String(userId), csrfToken: freshCsrf }
}

export async function getUserReels(userId: string, limit: number, csrfToken: string): Promise<Reel[]> {
  const body = new URLSearchParams({
    target_user_id: userId,
    page_size: String(Math.min(limit, 50)),
    max_id: '',
  })

  const res = await fetch(`${BASE}/clips/user/`, {
    method: 'POST',
    headers: {
      ...getHeaders(csrfToken),
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
    const code = (m.code as string) ?? ''
    const videoVersions = (m.video_versions as Array<{ url: string }> | undefined) ?? []
    const imageVersions = (m.image_versions2 as { candidates?: Array<{ url: string }> } | undefined)
    const videoUrl = videoVersions[0]?.url
    const captionObj = m.caption as { text?: string } | null
    const takenAt = (m.taken_at as number) ?? 0

    return {
      id: String(m.pk ?? m.id ?? Math.random()),
      url: `https://www.instagram.com/reel/${code}/`,
      timestamp: takenAt ? new Date(takenAt * 1000).toISOString() : '',
      likes: Number(m.like_count ?? 0),
      views: Number(m.play_count ?? m.view_count ?? 0),
      comments: Number(m.comment_count ?? 0),
      caption: ((captionObj?.text ?? '') as string).slice(0, 600),
      videoUrl,
      audioUrl: videoUrl,
      thumbnailUrl: imageVersions?.candidates?.[0]?.url,
      duration: m.video_duration as number | undefined,
      ownerUsername: ((m.user as { username?: string } | undefined)?.username ?? ''),
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
