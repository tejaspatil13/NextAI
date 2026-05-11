'use client'
import { useState } from 'react'
import { CheckCircle2, RefreshCw, TrendingUp, Zap } from 'lucide-react'
import { DUMMY_WORKING } from '@/lib/ideas-dummy'
import type { WorkingTheme } from '@/lib/ideas-types'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export default function WhatsWorking() {
  const [data, setData] = useState<WorkingTheme[] | null>(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    await sleep(800 + Math.random() * 400)
    setData(DUMMY_WORKING)
    setLoading(false)
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 group">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f0d] via-[#0a140a] to-[#0a0a0a]" />
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none group-hover:bg-emerald-500/25 transition-all" />
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-emerald-500 to-transparent" />

      <div className="relative p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white tracking-tight">What&apos;s Working</p>
              <p className="text-[11px] text-emerald-500/70">Content beating your avg views</p>
            </div>
          </div>
          {data && <button onClick={generate} disabled={loading} className="text-white/25 hover:text-white/60 transition-colors"><RefreshCw className="w-3.5 h-3.5" /></button>}
        </div>

        {loading && <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 rounded-xl bg-white/5 animate-pulse" />)}</div>}

        {data && !loading && (
          <div className="space-y-2">
            {data.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3 bg-emerald-500/8 border border-emerald-500/15 rounded-xl px-3 py-2.5">
                <p className="text-xs text-white/70 leading-tight flex-1 min-w-0 truncate">{item.theme}</p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">{(item.avgViews / 1000).toFixed(0)}K</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!data && !loading && (
          <div className="flex flex-col items-center gap-4 py-3">
            <p className="text-xs text-white/30 text-center leading-relaxed">Discover which content themes are consistently outperforming your average.</p>
            <button onClick={generate}
              className="flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 hover:scale-105">
              <Zap className="w-3.5 h-3.5" /> Analyse
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
