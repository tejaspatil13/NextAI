import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// On Vercel, process.cwd() is read-only — use /tmp instead
const DATA_DIR = process.env.VERCEL
  ? '/tmp/nextai_cache'
  : path.join(process.cwd(), 'data')

function ensureDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  } catch { /* read-only fs — cache disabled */ }
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })
  ensureDir()
  const file = path.join(DATA_DIR, `${key}.json`)
  try {
    if (!fs.existsSync(file)) return NextResponse.json({ data: null })
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: null })
  }
}

export async function POST(req: NextRequest) {
  const { key, data } = await req.json()
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })
  ensureDir()
  const file = path.join(DATA_DIR, `${key}.json`)
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
  } catch { /* fail silently — scrape result already returned to client */ }
  return NextResponse.json({ ok: true })
}
