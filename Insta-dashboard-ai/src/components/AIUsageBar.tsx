'use client'
import { useState, useEffect } from 'react'
import { Zap } from 'lucide-react'
import clsx from 'clsx'

interface Usage { used: number; limit: number; remaining: number }

export default function AIUsageBar() {
  const [usage, setUsage] = useState<Usage | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/ai-usage')
        if (res.ok) setUsage(await res.json())
      } catch { /* silent */ }
    }
    load()
    // refresh every 60 seconds
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [])

  if (!usage) return null

  const pct = Math.round((usage.used / usage.limit) * 100)
  const color =
    pct >= 90 ? 'bg-rose-500' :
    pct >= 70 ? 'bg-amber-500' :
    'bg-violet-500'
  const textColor =
    pct >= 90 ? 'text-rose-400' :
    pct >= 70 ? 'text-amber-400' :
    'text-[#a8a8a8]'

  return (
    <div className="flex items-center gap-2.5 bg-white/5 border border-white/8 rounded-xl px-3 py-1.5 flex-shrink-0">
      <Zap className={clsx('w-3.5 h-3.5 flex-shrink-0', textColor)} />
      <div className="flex flex-col gap-1 min-w-[80px]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-[#555] leading-none">AI calls today</span>
          <span className={clsx('text-[10px] font-bold leading-none tabular-nums', textColor)}>
            {usage.used}/{usage.limit}
          </span>
        </div>
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all duration-500', color)}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className={clsx('text-[10px] font-semibold flex-shrink-0', textColor)}>
        {pct}%
      </span>
    </div>
  )
}
