import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import type { CompetitorGapIdea, Language } from '@/lib/ideas-types'

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
        generationConfig: { maxOutputTokens: 800, temperature: 0.75 },
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
      max_tokens: 800,
      temperature: 0.75,
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
      max_tokens: 800,
      temperature: 0.75,
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
      max_tokens: 800,
      temperature: 0.75,
    }),
    signal: AbortSignal.timeout(60_000),
  })
  if (!res.ok) throw new Error(`xAI error: ${await res.text()}`)
  const data = await res.json()
  return data.choices[0].message.content as string
}


const LANG_INSTRUCTIONS: Record<Language, string> = {
  en: 'LANGUAGE: English. Style: Direct, punchy, conversational American creator voice. Short sentences. Power words. No filler.',
  hi: 'LANGUAGE: Hindi (Devanagari script). Style: Conversational Hindustani, warm and relatable. Use "yaar", "suno" naturally. Match the emotion of the hook.',
  hinglish: 'LANGUAGE: Hinglish (60% Hindi words, 40% English). Style: Young urban Indian creator voice. Mix casually — never forced. Examples: "bhai sun", "yeh scene hai", "seriously kar".',
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


  const { idea, hook, language }: { idea: CompetitorGapIdea; hook: string; language: Language } =
    await req.json()

  if (!idea || !hook || !language) {
    return NextResponse.json({ error: 'idea, hook, and language required' }, { status: 400 })
  }

  const prompt = `You are a viral short-form video scriptwriter using StoryBrand + open loop retention psychology. Your scripts keep 85%+ of viewers watching to the end.

LOCKED HOOK (copy this WORD FOR WORD as the very first line of the script — do not paraphrase or rewrite it):
"${hook}"

RETENTION RULES you MUST follow:
- [0–3s]: MUST open with the exact locked hook above, verbatim. Nothing before it.
- [3–8s]: Open loop — tease the payoff WITHOUT delivering it ("and what I'm about to show you changes everything about...")
- [8–20s]: Build tension — deepen the problem or contrast. Add a new micro-hook every 8 seconds to reset attention.
- [20–35s]: Deliver the insight/value — the payoff for staying
- [35–45s]: Proof + identity CTA ("Save this if you're a creator who [desired identity]")

CONTENT:
Title: ${idea.title}
Your angle: ${idea.yourAngle}
Why it wins: ${idea.whyItWins}

${LANG_INSTRUCTIONS[language]}

Write a complete script for a 45–60 second reel. Format with timestamps [0–3s], [3–8s] etc. Include B-roll cues in (parentheses). No separate headers — just the script with inline timestamps and cues. The [0–3s] line must contain the hook text exactly as given above.`

  try {
    let script: string
    if (provider === 'gemini') script = await callGemini(prompt)
    else if (provider === 'groq') script = await callGroq(prompt)
    else if (provider === 'xai') script = await callXAI(prompt)
    else script = await callOpenAI(prompt)

    return NextResponse.json({ script: script.trim() })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
