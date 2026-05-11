import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import type { Reel } from '@/lib/types'
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
        generationConfig: { maxOutputTokens: 800, temperature: 0.8 },
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
        {
          role: 'system',
          content: 'You are an expert Instagram content strategist. Always respond with valid JSON only — no markdown, no preamble.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 800,
      temperature: 0.8,
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
        {
          role: 'system',
          content: 'You are an expert Instagram content strategist. Always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 800,
      temperature: 0.8,
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
      max_tokens: 800,
      temperature: 0.8,
    }),
    signal: AbortSignal.timeout(60_000),
  })
  if (!res.ok) throw new Error(`xAI error: ${await res.text()}`)
  const data = await res.json()
  return data.choices[0].message.content as string
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


  const {
    userMessage,
    chatHistory,
    myReels,
    competitorReels,
  }: {
    userMessage: string
    chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>
    myReels: Reel[]
    competitorReels: Record<string, Reel[]>
  } = await req.json()

  const avgViews = myReels.length
    ? Math.round(myReels.reduce((s, r) => s + r.views, 0) / myReels.length)
    : 0

  const topTopics = [...myReels]
    .sort((a, b) => b.views - a.views)
    .slice(0, 3)
    .map(r => `"${r.caption.split('\n')[0].slice(0, 80)}"`)
    .join(', ')

  const compSummary = Object.entries(competitorReels)
    .filter(([, reels]) => reels.length > 0)
    .map(([u, reels]) => {
      const avg = Math.round(reels.reduce((s, r) => s + r.views, 0) / reels.length)
      return `@${u}: avg ${avg.toLocaleString()} views`
    })
    .join(' | ')

  const historyText = chatHistory
    .map(m => `${m.role === 'user' ? 'Creator' : 'Strategist'}: ${m.content}`)
    .join('\n')

  const prompt = `You are an expert Instagram content strategist assistant. Understand what the creator is saying and respond appropriately — like a smart human strategist, not a bot.

CREATOR DATA:
- Average views/reel: ${avgViews.toLocaleString()}
- Top content: ${topTopics || 'no data yet'}
- Competitors: ${compSummary || 'none added yet'}

${historyText ? `CONVERSATION SO FAR:\n${historyText}\n` : ''}
Creator: ${userMessage}

STRICT INTENT CLASSIFICATION:

Set intent = "general" when the message is:
- A greeting or small talk: "hi", "hello", "hey", "thanks", "ok", "sure"
- A vague or off-topic question: "how are you?", "what can you do?", "how does this work?"
- A strategy/growth question NOT asking for specific ideas: "how do I grow?", "tips for engagement"
- Very short inputs with no topic (1-3 words that aren't a niche/subject)

Set intent = "ideas" when the message:
- Names ANY topic, niche, subject, or event (finance, fitness, TVK, cricket, budget, election, etc.)
- Describes a video concept or reel idea, even loosely
- Asks for video ideas or content suggestions on a subject
- Mentions a trend, news event, or theme to make content about
- Uses phrases like "give me", "suggest", "ideas for", "what about X", "make video on X"

FOR "general": Reply warmly in 1-2 sentences. Do NOT generate any ideas.

FOR "ideas":
- Reply with ONE short sentence (e.g. "Here are 4 angles for this:")
- Generate exactly 3-4 SPECIFIC, viral-optimized ideas for their topic
- Every title must be 5-8 words, punchy, scroll-stopping
- Ideas must be genuinely specific to what they mentioned, not generic

Return ONLY valid JSON (no markdown):

For general:
{"reply":"...","intent":"general","ideas":null}

For ideas:
{"reply":"Here are 4 angles for this:","intent":"ideas","ideas":[{"id":"i1","title":"punchy 5-8 word title","competitorName":"Content Gap","theirWeakness":"what most creators miss about this topic","yourAngle":"your specific differentiated approach","whyItWins":"psychological reason this hooks the audience","hookDirection":"specific direction for the opening line","estimatedImpact":"high"}]}`

  try {
    let raw: string
    if (provider === 'gemini') raw = await callGemini(prompt)
    else if (provider === 'groq') raw = await callGroq(prompt)
    else if (provider === 'xai') raw = await callXAI(prompt)
    else raw = await callOpenAI(prompt)

    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const parsed = JSON.parse(cleaned) as {
      reply: string
      intent: 'general' | 'ideas'
      ideas: CompetitorGapIdea[] | null
    }

    return NextResponse.json({
      reply: parsed.reply,
      intent: parsed.intent ?? 'general',
      ideas: Array.isArray(parsed.ideas) ? parsed.ideas : null,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
