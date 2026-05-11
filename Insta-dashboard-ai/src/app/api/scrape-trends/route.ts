import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export interface ScrapedTrend {
  title: string
  traffic: string
  category: string
}

const CACHE_FILE = path.join(process.cwd(), 'data', 'trends.json')
const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

const CATEGORY_MAP: Record<string, string> = {
  cricket: 'Sports',
  ipl: 'Sports',
  icc: 'Sports',
  football: 'Sports',
  bollywood: 'Entertainment',
  movie: 'Entertainment',
  film: 'Entertainment',
  actor: 'Entertainment',
  actress: 'Entertainment',
  song: 'Entertainment',
  music: 'Entertainment',
  modi: 'Politics',
  bjp: 'Politics',
  congress: 'Politics',
  election: 'Politics',
  parliament: 'Politics',
  government: 'Politics',
  minister: 'Politics',
  meme: 'Viral',
  trend: 'Viral',
  viral: 'Viral',
  reels: 'Viral',
  iphone: 'Tech',
  samsung: 'Tech',
  ai: 'Tech',
  youtube: 'Tech',
}

function guessCategory(title: string): string {
  const lower = title.toLowerCase()
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(keyword)) return category
  }
  return 'Trending'
}

async function fetchTrends(): Promise<ScrapedTrend[]> {
  const res = await fetch(
    'https://trends.google.com/trending/rss?geo=IN',
    {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TrendsFetcher/1.0)' },
      signal: AbortSignal.timeout(15_000),
    }
  )
  if (!res.ok) throw new Error(`Google Trends RSS fetch failed: ${res.status}`)

  const xml = await res.text()

  // Extract titles — RSS has <title><![CDATA[...]]></title> or plain <title>...</title>
  const titles: string[] = []
  const trafficMap: Record<string, string> = {}

  const cdataMatches = Array.from(xml.matchAll(/<title><!\[CDATA\[(.+?)\]\]><\/title>/g))
  const plainMatches = Array.from(xml.matchAll(/<title>([^<]+)<\/title>/g))
  const rawTitles = cdataMatches.length > 0
    ? cdataMatches.map(m => m[1].trim())
    : plainMatches.map(m => m[1].trim()).slice(1) // skip first = channel title

  const trafficMatches = Array.from(xml.matchAll(/<ht:approx_traffic>([^<]+)<\/ht:approx_traffic>/g))
  rawTitles.forEach((t, i) => {
    if (t && t !== 'Google Trends') {
      titles.push(t)
      trafficMap[t] = trafficMatches[i]?.[1]?.trim() ?? ''
    }
  })

  return titles.slice(0, 20).map(title => ({
    title,
    traffic: trafficMap[title] ?? '',
    category: guessCategory(title),
  }))
}

function readCache(): { trends: ScrapedTrend[]; fetchedAt: string } | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8')
    const data = JSON.parse(raw) as { trends: ScrapedTrend[]; fetchedAt: string }
    const age = Date.now() - new Date(data.fetchedAt).getTime()
    if (age > CACHE_TTL_MS) return null
    return data
  } catch {
    return null
  }
}

function writeCache(trends: ScrapedTrend[]) {
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true })
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ trends, fetchedAt: new Date().toISOString() }))
  } catch { /* non-fatal */ }
}

export async function GET() {
  const cached = readCache()
  if (cached) return NextResponse.json({ trends: cached.trends, cached: true })

  try {
    const trends = await fetchTrends()
    writeCache(trends)
    return NextResponse.json({ trends, cached: false })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
