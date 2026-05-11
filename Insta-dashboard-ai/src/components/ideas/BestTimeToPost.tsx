'use client'
import { useState } from 'react'
import { Clock, RefreshCw, Zap } from 'lucide-react'
import { DUMMY_POSTING_TIMES } from '@/lib/ideas-dummy'
import type { PostingSlot, Confidence } from '@/lib/ideas-types'
import clsx from 'clsx'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

const dot: Record<Confidence, string> = {
  high: 'bg-emerald-400',
  medium: 'bg-[#FCAF45]',
  low: 'bg-white/20',
}

const timeBadge: Record<Confidence, string> = {
  high: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  medium: 'text-[#FCAF45] bg-[#FCAF45]/10 border-[#FCAF45]/20',
  low: 'text-white/30 bg-white/5 border-white/8',
}

export default function BestTimeToPost() {
  const [data, setData] = useState<PostingSlot[] | null>(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    await sleep(900 + Math.random() * 400)
    setData(DUMMY_POSTING_TIMES)
    setLoading(false)
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-sky-500/20 hover:border-sky-500/40 transition-all duration-300 group">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0d1f] via-[#0a0a14] to-[#0a0a0a]" />
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-sky-500/15 blur-3xl pointer-events-none group-hover:bg-sky-500/25 transition-all" />
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-sky-500 to-transparent" />

      <div className="relative p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white tracking-tight">Best Time to Post</p>
              <p className="text-[11px] text-sky-500/70">Optimal windows from your data</p>
            </div>
          </div>
          {data && <button onClick={generate} disabled={loading} className="text-white/25 hover:text-white/60 transition-colors"><RefreshCw className="w-3.5 h-3.5" /></button>}
        </div>

        {loading && <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 rounded-xl bg-white/5 animate-pulse" />)}</div>}

        {data && !loading && (
          <div className="space-y-2">
            {data.map((slot, i) => (
              <div key={i} className="flex items-center justify-between bg-sky-500/6 border border-sky-500/15 rounded-xl px-3 py-2.5 gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', dot[slot.confidence])} />
                  <span className="text-xs font-bold text-white truncate">{slot.day}</span>
                </div>
                <span className={clsx('text-[11px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0', timeBadge[slot.confidence])}>
                  {slot.timeSlot}
                </span>
              </div>
            ))}
          </div>
        )}

        {!data && !loading && (
          <div className="flex flex-col items-center gap-4 py-3">
            <p className="text-xs text-white/30 text-center leading-relaxed">Find the exact days and times when your audience is most active.</p>
            <button onClick={generate}
              className="flex items-center gap-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-sky-500/25 hover:scale-105">
              <Zap className="w-3.5 h-3.5" /> Analyse
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
