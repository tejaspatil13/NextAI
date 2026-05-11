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
        generationConfig: { maxOutputTokens: 500, temperature: 0.9 },
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
        { role: 'system', content: 'You are a world-class Instagram hook writer. Respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.9,
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
        { role: 'system', content: 'You are a world-class Instagram hook writer. Respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.9,
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
      max_tokens: 500,
      temperature: 0.9,
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
    return NextResponse.json({ error: 'No AI API key set' }, { status: 500 })
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


  const { idea, creatorStyle }: { idea: CompetitorGapIdea; creatorStyle: string } = await req.json()
  if (!idea) return NextResponse.json({ error: 'idea required' }, { status: 400 })

  const prompt = `You are the world's best Instagram hook writer. You understand that the first 3 seconds decide whether someone watches or scrolls. You use these proven frameworks:

FRAMEWORK A — Curiosity Gap: Creates an information gap so compelling they MUST keep watching. Uses "Here's the one thing..." or "Nobody talks about..." structure.
FRAMEWORK B — Pattern Interrupt + Contrarian: Opens with a bold claim that challenges what they believe. Forces cognitive re-evaluation. "Stop [common thing]. Here's why..."
FRAMEWORK C — Specificity + Social Proof: Uses jarring specific numbers. Specificity signals credibility. "I went from X to Y in Z [time]. Here's the exact [thing]."

IDEA TO HOOK:
Title: ${idea.title}
Competitor weakness: ${idea.theirWeakness}
Your angle: ${idea.yourAngle}
Hook direction: ${idea.hookDirection}

CREATOR STYLE: ${creatorStyle}

Write 3 hooks — one for each framework. Each hook:
- Max 2 sentences (25 words max each)
- Ends with a reason to keep watching (never a complete thought)
- Matches the creator's energy/voice
- Is specific enough to be believable, not generic

Return ONLY valid JSON: {"hooks":["hook A text","hook B text","hook C text"]}`

  try {
    let raw: string
    if (provider === 'gemini') raw = await callGemini(prompt)
    else if (provider === 'groq') raw = await callGroq(prompt)
    else if (provider === 'xai') raw = await callXAI(prompt)
    else raw = await callOpenAI(prompt)

    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const parsed = JSON.parse(cleaned) as { hooks: string[] }

    if (!Array.isArray(parsed.hooks) || parsed.hooks.length < 3) {
      throw new Error('Invalid hooks response')
    }

    return NextResponse.json({ hooks: parsed.hooks.slice(0, 3) })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
