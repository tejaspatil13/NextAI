import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import type { CompetitorGapIdea } from '@/lib/ideas-types'

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
        generationConfig: { maxOutputTokens: 1400, temperature: 0.85 },
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
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an elite Instagram growth strategist. Respond with valid JSON only — no markdown, no preamble.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1400,
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
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an elite Instagram growth strategist. Respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1400,
      temperature: 0.85,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(60_000),
  })
  if (!res.ok) throw new Error(`OpenAI error: ${await res.text()}`)
  const data = await res.json()
  return data.choices[0].message.content as string
}

async function callXAI(prompt: string): Promise<string> {
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.XAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [
        { role: 'system', content: 'You are an elite Instagram growth strategist. Respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1400,
      temperature: 0.85,
    }),
    signal: AbortSignal.timeout(60_000),
  })
  if (!res.ok) throw new Error(`xAI error: ${await res.text()}`)
  const data = await res.json()
  return data.choices[0].message.content as string
}

interface CompetitorProfile {
  username: string
  avgViews: number
  growthScore: number
  topTheme: string
  topHookType: string
  bestHour: number
}

interface GapInput {
  theme: string
  yourStrength: number
  competitorStrength: number
  priority: string
}

export async function POST(req: NextRequest) {
  const provider = getAIProvider()
  if (!provider) return NextResponse.json({ error: 'No AI key set' }, { status: 500 })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? '127.0.0.1'
  const rateCheck = checkRateLimit(ip)
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: `Daily limit reached (${rateCheck.limit}/day)`, rateLimited: true }, { status: 429 })
  }

  const {
    myProfile,
    competitors,
    gaps,
    winningThemes,
    winningHooks,
    recommendations,
    count = 3,
    excludeTitles = [],
  }: {
    myProfile: {
      username: string
      avgViews: number
      engagementRate: number
      postsPerWeek: number
      growthScore: number
      topTheme: string
      topHookType: string
      bestHour: number
      bestDay: string
    }
    competitors: CompetitorProfile[]
    gaps: GapInput[]
    winningThemes: string[]
    winningHooks: string[]
    recommendations: string[]
    count: number
    excludeTitles: string[]
  } = await req.json()

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(Math.round(n))
  const formatHour = (h: number) => h === 0 ? '12AM' : h < 12 ? `${h}AM` : h === 12 ? '12PM' : `${h - 12}PM`

  const leaderboard = competitors
    .sort((a, b) => b.growthScore - a.growthScore)
    .map((c, i) => `#${i + 1} @${c.username}: score=${c.growthScore}/100, avg=${fmt(c.avgViews)} views, top theme="${c.topTheme}", best hook="${c.topHookType}"`)
    .join('\n')

  const gapList = gaps
    .filter(g => g.competitorStrength > g.yourStrength)
    .sort((a, b) => (b.competitorStrength - b.yourStrength) - (a.competitorStrength - a.yourStrength))
    .map(g => `- ${g.theme}: competitors=${g.competitorStrength} posts, you=${g.yourStrength} posts [${g.priority} priority]`)
    .join('\n')

  const exclude = excludeTitles.length > 0 ? `\nAVOID these already-seen titles: ${excludeTitles.join(', ')}` : ''

  const prompt = `You are an elite Instagram growth strategist and content ideation expert.

USER PROFILE (@${myProfile.username}):
- Avg views/reel: ${fmt(myProfile.avgViews)}
- Engagement rate: ${myProfile.engagementRate.toFixed(1)}%
- Posts per week: ${myProfile.postsPerWeek.toFixed(1)}
- Growth score: ${myProfile.growthScore}/100
- Top theme: ${myProfile.topTheme}
- Best hook type: ${myProfile.topHookType}
- Best posting time: ${formatHour(myProfile.bestHour)} on ${myProfile.bestDay}

COMPETITOR LEADERBOARD:
${leaderboard || 'No competitor data'}

CONTENT GAP ANALYSIS (themes competitors dominate but you don't):
${gapList || 'No gaps detected'}

WINNING THEMES ACROSS ALL ACCOUNTS: ${winningThemes.join(', ')}
WINNING HOOK TYPES: ${winningHooks.join(', ')}

TOP RECOMMENDATIONS:
${recommendations.slice(0, 4).map((r, i) => `${i + 1}. ${r}`).join('\n')}
${exclude}

YOUR TASK:
Generate exactly ${count} highly specific, viral content ideas for @${myProfile.username}.

Each idea MUST:
1. Target a content gap where competitors outperform you
2. Use the highest-performing hook type from the data
3. Be directly inspired by a specific competitor's winning strategy
4. Include a viral-optimized title (max 10 words)
5. Include a specific, scroll-stopping hook opening line
6. Include a unique creator angle that differentiates from competitors
7. Explain WHY this specific idea will outperform (reference the data)

Return ONLY valid JSON:
{
  "ideas": [
    {
      "id": "cmp1",
      "title": "max 10 words — punchy and specific",
      "competitorName": "@username who inspired this or the theme gap",
      "theirWeakness": "specific gap or mistake in competitor's content approach",
      "yourAngle": "your differentiated approach — be specific, 1-2 sentences",
      "whyItWins": "psychological trigger + data reason why this will outperform",
      "hookDirection": "vivid 1-sentence direction for the opening hook line",
      "estimatedImpact": "high"
    }
  ]
}`

  try {
    let raw: string
    if (provider === 'gemini') raw = await callGemini(prompt)
    else if (provider === 'groq') raw = await callGroq(prompt)
    else if (provider === 'xai') raw = await callXAI(prompt)
    else raw = await callOpenAI(prompt)

    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const parsed = JSON.parse(cleaned) as { ideas: CompetitorGapIdea[] }

    if (!Array.isArray(parsed.ideas) || parsed.ideas.length === 0) {
      throw new Error('Invalid ideas response')
    }

    return NextResponse.json({ ideas: parsed.ideas.slice(0, count) })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
