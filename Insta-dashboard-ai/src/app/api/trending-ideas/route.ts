import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import type { Reel } from '@/lib/types'
import type { CompetitorGapIdea } from '@/lib/ideas-types'
import type { ScrapedTrend } from '../scrape-trends/route'

function getAIProvider() {
  if (process.env.GEMINI_API_KEY) return 'gemini'
  if (process.env.GROQ_API_KEY) return 'groq'
  if (process.env.XAI_API_KEY) return 'xai'
  if (process.env.OPENAI_API_KEY) return 'openai'
  return null
}

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1200, temperature: 0.85 },
      }),
      signal: AbortSignal.timeout(60_000),
    }
  )
  if (!res.ok) throw new Error(`Gemini error: ${await res.text()}`)
  const data = await res.json()
  return data.candidates[0].content.parts[0].text as string
}

async function callGroq(prompt: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an expert Instagram content strategist. Respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1200,
      temperature: 0.85,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(60_000),
  })
  if (!res.ok) throw new Error(`Groq error: ${await res.text()}`)
  const data = await res.json()
  return data.choices[0].message.content as string
}

async function callOpenAI(prompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert Instagram content strategist. Respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1200,
      temperature: 0.85,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(60_000),
  })
  if (!res.ok) throw new Error(`OpenAI error: ${await res.text()}`)
  const data = await res.json()
  return data.choices[0].message.content as string
}
async function callXAI(prompt: string, systemMsg?: string): Promise<string> {
  const messages = systemMsg
    ? [{ role: 'system', content: systemMsg }, { role: 'user', content: prompt }]
    : [{ role: 'user', content: prompt }]
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.XAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages,
      max_tokens: 1200,
      temperature: 0.85,
    }),
    signal: AbortSignal.timeout(60_000),
  })
  if (!res.ok) throw new Error(`xAI error: ${await res.text()}`)
  const data = await res.json()
  return data.choices[0].message.content as string
}


function buildPrompt(myReels: Reel[], trends: ScrapedTrend[], count: number, excludeTitles: string[]): string {
  const sorted = [...myReels].sort((a, b) => b.views - a.views)
  const avgViews = Math.round(myReels.reduce((s, r) => s + r.views, 0) / (myReels.length || 1))

  const creatorProfile = sorted.slice(0, 5).map((r, i) => {
    const hook = r.caption.slice(0, 100)
    const transcript = r.transcript ? ` | Voice: "${r.transcript.slice(0, 150)}"` : ''
    return `[${i + 1}] ${r.views.toLocaleString()} views | Hook: "${hook}"${transcript}`
  }).join('\n')

  const trendsList = trends.slice(0, 15).map(t =>
    `- "${t.title}" [${t.category}] ${t.traffic ? `(${t.traffic} searches)` : ''}`
  ).join('\n')

  const excludeBlock = excludeTitles.length > 0
    ? `\nDO NOT repeat ideas similar to these already-shown titles:\n${excludeTitles.map(t => `- "${t}"`).join('\n')}\n`
    : ''

  return `You are an Instagram Reels strategist specialising in the Indian creator market. You know exactly how to ride trending topics without looking desperate or off-brand.

CREATOR PROFILE (understand their voice and proven content style):
${creatorProfile}
Average views: ${avgViews.toLocaleString()}

TRENDING IN INDIA RIGHT NOW:
${trendsList}
${excludeBlock}
MISSION: Find ${count} idea${count === 1 ? '' : 's'} that bridge a trending topic with the creator's proven content style. Each idea must:
1. Connect naturally to the creator's niche — not a forced trend-jack
2. Be timely but have a shelf life of at least 5–7 days (avoid hyper-news moments)
3. Use the creator's voice and energy from their transcripts
4. Optimised for shares + saves (trending content spreads when it teaches or resonates)

For "competitorName" use the trending topic name (e.g. "#IPL2025" or "Bollywood Drama").
"theirWeakness" = what most creators miss when covering this trend.
"yourAngle" = how THIS creator covers it uniquely based on their style.
"whyItWins" = the emotional trigger that makes viewers share this.
"hookDirection" = direction hint for hook angle. NOT the hook itself.

Return ONLY valid JSON, no markdown:
{"ideas":[{"id":"t1","title":"Max 8 words","competitorName":"#TrendName or Topic","theirWeakness":"What most creators miss","yourAngle":"Your unique approach","whyItWins":"Emotional trigger","hookDirection":"Direction hint","estimatedImpact":"high"}]}`
}

export async function POST(req: NextRequest) {
  const provider = getAIProvider()
  if (!provider) return NextResponse.json({ error: 'No AI key set' }, { status: 500 })
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? '127.0.0.1'
  const rateCheck = checkRateLimit(ip)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Daily AI limit reached (${rateCheck.limit} calls/day). Resets at midnight UTC.`, rateLimited: true },
      { status: 429 }
    )
  }


  const { myReels, trends, count, excludeTitles }: {
    myReels: Reel[]
    trends: ScrapedTrend[]
    count?: number
    excludeTitles?: string[]
  } = await req.json()

  if (!myReels?.length) return NextResponse.json({ error: 'No reel data provided' }, { status: 400 })
  if (!trends?.length) return NextResponse.json({ error: 'No trending topics provided' }, { status: 400 })

  const prompt = buildPrompt(myReels, trends, count ?? 4, excludeTitles ?? [])

  try {
    let raw: string
    if (provider === 'gemini') raw = await callGemini(prompt)
    else if (provider === 'groq') raw = await callGroq(prompt)
    else if (provider === 'xai') raw = await callXAI(prompt)
    else raw = await callOpenAI(prompt)

    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const parsed = JSON.parse(cleaned) as { ideas: CompetitorGapIdea[] }
    if (!Array.isArray(parsed.ideas)) throw new Error('Invalid response shape')
    return NextResponse.json({ ideas: parsed.ideas })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
