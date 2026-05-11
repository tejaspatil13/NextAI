'use client'
import { useState } from 'react'
import { XCircle, RefreshCw, ArrowRight, Zap } from 'lucide-react'
import { DUMMY_AVOID } from '@/lib/ideas-dummy'
import type { AvoidTheme } from '@/lib/ideas-types'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export default function WhatToAvoid() {
  const [data, setData] = useState<AvoidTheme[] | null>(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    await sleep(800 + Math.random() * 400)
    setData(DUMMY_AVOID)
    setLoading(false)
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-rose-500/20 hover:border-rose-500/40 transition-all duration-300 group">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1f0a0a] via-[#140a0a] to-[#0a0a0a]" />
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-rose-500/15 blur-3xl pointer-events-none group-hover:bg-rose-500/25 transition-all" />
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-rose-500 to-transparent" />

      <div className="relative p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white tracking-tight">What to Avoid</p>
              <p className="text-[11px] text-rose-500/70">Content dragging your reach down</p>
            </div>
          </div>
          {data && <button onClick={generate} disabled={loading} className="text-white/25 hover:text-white/60 transition-colors"><RefreshCw className="w-3.5 h-3.5" /></button>}
        </div>

        {loading && <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />)}</div>}

        {data && !loading && (
          <div className="space-y-2">
            {data.map((item, i) => (
              <div key={i} className="bg-rose-500/6 border border-rose-500/15 rounded-xl px-3 py-2.5 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-white/40 line-through decoration-rose-500/40 truncate flex-1">{item.theme}</p>
                  <span className="text-xs text-rose-400 flex-shrink-0 font-bold">{(item.avgViews / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex items-start gap-1.5 ig-line">
                  <ArrowRight className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-400/80 leading-tight">{item.alternative}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!data && !loading && (
          <div className="flex flex-col items-center gap-4 py-3">
            <p className="text-xs text-white/30 text-center leading-relaxed">Find which content patterns are hurting your reach and what to replace them with.</p>
            <button onClick={generate}
              className="flex items-center gap-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-rose-500/25 hover:scale-105">
              <Zap className="w-3.5 h-3.5" /> Analyse
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
