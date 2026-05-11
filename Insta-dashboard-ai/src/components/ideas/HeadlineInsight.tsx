'use client'
import { useState } from 'react'
import { Zap, RefreshCw, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import type { Reel } from '@/lib/types'
import type { HeadlineInsightData } from '@/lib/ideas-types'

interface Props {
  myReels: Reel[]
  competitorReels: Record<string, Reel[]>
}

export default function HeadlineInsight({ myReels, competitorReels }: Props) {
  const [data, setData] = useState<HeadlineInsightData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasData = myReels.length > 0

  const generate = async () => {
    if (!hasData) return
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/headline-insight', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ myReels, competitorReels }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      setData({ headline: json.headline, supporting: json.supporting, action: json.action })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally { setLoading(false) }
  }

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Multi-layer gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a20] via-[#0f0a18] to-[#0a0a0a]" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#FD1D1D]/4 to-[#FCAF45]/6" />
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] ig-gradient-bg" />
      {/* Glow orb */}
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#833AB4]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full bg-[#FCAF45]/8 blur-3xl pointer-events-none" />

      <div className="relative p-5 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl ig-gradient-bg flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#833AB4]/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-base font-extrabold text-white tracking-tight">Headline Insight</p>
            <p className="text-xs text-white/40">Biggest observation from your data</p>
          </div>
        </div>
        {data && !loading && (
          <button onClick={generate} disabled={loading} className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        )}
      </div>

      <div className="relative h-px bg-white/5 mx-5" />

      <div className="relative p-5">
        {loading && (
          <div className="flex flex-col gap-3 py-2">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#833AB4]" />
              Analysing your {myReels.length} reels…
            </div>
            <div className="h-4 rounded-lg w-3/4 bg-white/5 animate-pulse" />
            <div className="h-3 rounded-lg w-full bg-white/5 animate-pulse" />
            <div className="h-3 rounded-lg w-5/6 bg-white/5 animate-pulse" />
          </div>
        )}

        {error && !loading && (
          <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/25 text-rose-300 rounded-xl p-3 text-xs">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /><span>{error}</span>
          </div>
        )}

        {data && !loading && !error && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-sm font-bold text-white leading-snug">"{data.headline}"</p>
            <p className="text-xs text-white/50 leading-relaxed">{data.supporting}</p>
            <div className="ig-line">
              <div className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-white/70 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-white/80 leading-relaxed">
                  <span className="font-bold text-white">Action: </span>{data.action}
                </p>
              </div>
            </div>
          </div>
        )}

        {!data && !loading && !error && !hasData && (
          <p className="text-xs text-white/30 py-4 text-center">Fetch your reels first to generate an insight.</p>
        )}

        {!data && !loading && !error && hasData && (
          <div className="flex flex-col items-center gap-5 py-4 text-center">
            <p className="text-xs text-white/40 max-w-sm leading-relaxed">
              One sharp data-backed observation from your {myReels.length} reels — what's driving the gap between your top and bottom performers.
            </p>
            <button onClick={generate}
              className="relative flex items-center gap-2.5 ig-gradient-bg hover:opacity-90 text-white font-bold text-sm px-6 py-3 rounded-2xl transition-all shadow-xl shadow-[#833AB4]/30 hover:scale-105 hover:shadow-[#833AB4]/50">
              <Zap className="w-4 h-4" /> Generate Insight
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
