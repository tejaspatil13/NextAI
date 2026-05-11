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
        generationConfig: { maxOutputTokens: 900, temperature: 0.75 },
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
      max_tokens: 900,
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
      max_tokens: 900,
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
      max_tokens: 900,
      temperature: 0.75,
    }),
    signal: AbortSignal.timeout(60_000),
  })
  if (!res.ok) throw new Error(`xAI error: ${await res.text()}`)
  const data = await res.json()
  return data.choices[0].message.content as string
}


const PRESET_INSTRUCTIONS: Record<string, string> = {
  shorten: 'SHORTEN: Cut to approximately 30 seconds (~150 words). Preserve the hook verbatim as the opening. Keep the core insight and CTA. Remove middle filler and secondary examples.',
  lengthen: 'LENGTHEN: Expand to approximately 75 seconds (~350 words). Add a personal story, second example, or deeper explanation in the build section. Update all timestamps.',
  humor: 'ADD HUMOR: Insert light, self-aware humor at 2–3 natural points. Keep the core message intact — humor should punctuate, never dilute. Add (comedic beat) B-roll cues where appropriate.',
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


  const { script, hook, idea, instruction, language }: {
    script: string
    hook: string
    idea: CompetitorGapIdea
    instruction: string
    language: Language
  } = await req.json()

  if (!script || !hook || !instruction) {
    return NextResponse.json({ error: 'script, hook, and instruction required' }, { status: 400 })
  }

  const refinementInstruction = PRESET_INSTRUCTIONS[instruction] ?? `CUSTOM INSTRUCTION: ${instruction}`

  const langNote = language === 'hi'
    ? 'Write in Hindi (Devanagari script), conversational Hindustani tone.'
    : language === 'hinglish'
    ? 'Write in Hinglish (60% Hindi, 40% English), young urban Indian creator voice.'
    : 'Write in English, direct punchy creator voice.'

  const prompt = `You are a viral short-form video script editor. Refine the script below based on one specific instruction.

LOCKED HOOK — the [0–3s] line must open with this WORD FOR WORD:
"${hook}"

REFINEMENT INSTRUCTION:
${refinementInstruction}

LANGUAGE: ${langNote}

ORIGINAL SCRIPT:
${script}

EDITING RULES:
- [0–3s] must start with the exact locked hook above — do not change a single word
- Maintain timestamp format [Xs–Ys] with B-roll cues in (parentheses)
- Keep StoryBrand structure: hook → open loop → build tension → deliver insight → CTA
- Idea context: "${idea.title}" — angle: ${idea.yourAngle}

Return ONLY the refined script. No explanation, no headers, no preamble.`

  try {
    let refined: string
    if (provider === 'gemini') refined = await callGemini(prompt)
    else if (provider === 'groq') refined = await callGroq(prompt)
    else if (provider === 'xai') refined = await callXAI(prompt)
    else refined = await callOpenAI(prompt)

    return NextResponse.json({ script: refined.trim() })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
