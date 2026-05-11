import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const LIMIT = parseInt(process.env.DAILY_AI_CALLS_LIMIT ?? '50')
const USAGE_FILE = path.join(process.cwd(), 'data', 'ai-usage.json')

type UsageStore = Record<string, Record<string, number>>

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function hashIp(ip: string): string {
  return crypto.createHash('md5').update(ip).digest('hex').slice(0, 12)
}

function readStore(): UsageStore {
  try {
    if (!fs.existsSync(USAGE_FILE)) return {}
    return JSON.parse(fs.readFileSync(USAGE_FILE, 'utf-8')) as UsageStore
  } catch {
    return {}
  }
}

function writeStore(store: UsageStore) {
  try {
    fs.mkdirSync(path.dirname(USAGE_FILE), { recursive: true })
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 3)
    const cutoffStr = cutoff.toISOString().slice(0, 10)
    const pruned = Object.fromEntries(
      Object.entries(store).filter(([date]) => date >= cutoffStr)
    )
    fs.writeFileSync(USAGE_FILE, JSON.stringify(pruned))
  } catch { /* non-fatal */ }
}

export function checkRateLimit(ip: string): {
  allowed: boolean
  used: number
  limit: number
  remaining: number
} {
  const key = hashIp(ip)
  const date = today()
  const store = readStore()

  if (!store[date]) store[date] = {}
  const used = store[date][key] ?? 0

  if (used >= LIMIT) {
    return { allowed: false, used, limit: LIMIT, remaining: 0 }
  }

  store[date][key] = used + 1
  writeStore(store)
  return { allowed: true, used: used + 1, limit: LIMIT, remaining: LIMIT - used - 1 }
}

export function getUsageStatus(ip: string): {
  used: number
  limit: number
  remaining: number
} {
  const key = hashIp(ip)
  const used = readStore()[today()]?.[key] ?? 0
  return { used, limit: LIMIT, remaining: Math.max(0, LIMIT - used) }
}
