import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import type { Reel } from '@/lib/types'

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
        generationConfig: { maxOutputTokens: 1500, temperature: 0.7 },
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
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
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
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
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
      max_tokens: 1500,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(60_000),
  })
  if (!res.ok) throw new Error(`xAI error: ${await res.text()}`)
  const data = await res.json()
  return data.choices[0].message.content as string
}


export async function POST(req: NextRequest) {
  const provider = getAIProvider()
  if (!provider) {
    return NextResponse.json({ error: 'No AI API key set (GEMINI_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY)' }, { status: 500 })
  }
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


  const { myReels, competitorReels }: { myReels: Reel[]; competitorReels: Record<string, Reel[]> } =
    await req.json()

  const myTopReels = [...(myReels ?? [])]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map((r) => `- ${r.views.toLocaleString()} views | Caption: ${r.caption.slice(0, 200)}`)
    .join('\n')

  const myLowReels = [...(myReels ?? [])]
    .sort((a, b) => a.views - b.views)
    .slice(0, 3)
    .map((r) => `- ${r.views.toLocaleString()} views | Caption: ${r.caption.slice(0, 150)}`)
    .join('\n')

  const competitorContext = Object.entries(competitorReels ?? {})
    .map(([username, reels]) => {
      const topReels = [...reels]
        .sort((a, b) => b.views - a.views)
        .slice(0, 3)
        .map((r) => `  - ${r.views.toLocaleString()} views | ${r.caption.slice(0, 200)}`)
        .join('\n')
      return `@${username} top reels:\n${topReels}`
    })
    .join('\n\n')

  const prompt = `You are a world-class Instagram content strategist.

MY ACCOUNT: @manthanjethwani
TOP PERFORMING REELS (by views):
${myTopReels || '(no data yet)'}

UNDERPERFORMING REELS:
${myLowReels || '(no data yet)'}

COMPETITOR DATA:
${competitorContext || '(no competitor data yet)'}

Based on this data, provide:

1. **3 content themes that are clearly working** (from my top reels and competitors' top reels)
2. **3 content themes I should STOP making** (from underperforming reels)
3. **5 specific reel ideas I should make this week** — each with:
   - Hook (first 3 seconds)
   - Core content angle
   - Why it will work (based on data)
4. **Best time/day to post** (based on timestamps if available)
5. **1 headline insight** — the single biggest observation from the data

Keep it sharp, specific, and actionable. No fluff. Reference specific view counts where relevant.`

  try {
    const ideas =
      provider === 'gemini' ? await callGemini(prompt) :
      provider === 'groq'   ? await callGroq(prompt) :
                              await callOpenAI(prompt)
    return NextResponse.json({ ideas })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
