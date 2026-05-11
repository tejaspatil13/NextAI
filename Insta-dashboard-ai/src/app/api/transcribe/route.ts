import { NextRequest, NextResponse } from 'next/server'

function getAIProvider() {
  if (process.env.GEMINI_API_KEY) return 'gemini'
  if (process.env.GROQ_API_KEY) return 'groq'
  if (process.env.OPENAI_API_KEY) return 'openai'
  return null
}

async function transcribeWithGemini(audioBuffer: ArrayBuffer): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY!
  const bytes = new Uint8Array(audioBuffer)

  // Upload audio to Gemini Files API
  const uploadRes = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'X-Goog-Upload-Command': 'start, upload, finalize',
        'X-Goog-Upload-Header-Content-Type': 'audio/mp4',
        'X-Goog-Upload-Header-Content-Length': String(bytes.byteLength),
        'Content-Type': 'audio/mp4',
      },
      body: bytes,
      signal: AbortSignal.timeout(60_000),
    }
  )
  if (!uploadRes.ok) throw new Error(`Gemini file upload failed: ${await uploadRes.text()}`)
  const uploadData = await uploadRes.json()
  const fileUri: string = uploadData.file.uri

  // Transcribe using the uploaded file
  const genRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { fileData: { mimeType: 'audio/mp4', fileUri } },
              { text: 'Transcribe this audio exactly as spoken. Output only the transcript, no commentary.' },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(60_000),
    }
  )
  if (!genRes.ok) throw new Error(`Gemini transcription failed: ${await genRes.text()}`)
  const genData = await genRes.json()
  return genData.candidates[0].content.parts[0].text as string
}

async function transcribeWithGroq(audioBuffer: ArrayBuffer): Promise<string> {
  const audioBlob = new Blob([audioBuffer], { type: 'audio/mp4' })
  const form = new FormData()
  form.append('file', audioBlob, 'audio.mp4')
  form.append('model', 'whisper-large-v3')
  form.append('response_format', 'text')

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: form,
    signal: AbortSignal.timeout(60_000),
  })
  if (!res.ok) throw new Error(`Groq Whisper error: ${await res.text()}`)
  return await res.text()
}

async function transcribeWithOpenAI(audioBuffer: ArrayBuffer): Promise<string> {
  const audioBlob = new Blob([audioBuffer], { type: 'audio/mp4' })
  const form = new FormData()
  form.append('file', audioBlob, 'audio.mp4')
  form.append('model', 'whisper-1')
  form.append('response_format', 'text')

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: form,
    signal: AbortSignal.timeout(60_000),
  })
  if (!res.ok) throw new Error(`Whisper API error: ${await res.text()}`)
  return await res.text()
}

export async function POST(req: NextRequest) {
  const { audioUrl } = await req.json()
  if (!audioUrl) return NextResponse.json({ error: 'audioUrl required' }, { status: 400 })

  const provider = getAIProvider()
  if (!provider) {
    return NextResponse.json({ error: 'No AI API key set (GEMINI_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY)' }, { status: 500 })
  }

  try {
    const audioRes = await fetch(audioUrl, { signal: AbortSignal.timeout(30_000) })
    if (!audioRes.ok) throw new Error(`Audio download failed: ${audioRes.status}`)
    const audioBuffer = await audioRes.arrayBuffer()

    const transcript =
      provider === 'gemini' ? await transcribeWithGemini(audioBuffer) :
      provider === 'groq'   ? await transcribeWithGroq(audioBuffer) :
                              await transcribeWithOpenAI(audioBuffer)

    return NextResponse.json({ transcript: transcript.trim() })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
