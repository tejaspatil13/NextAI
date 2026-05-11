'use client'
import { useState } from 'react'
import { Layers, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { DUMMY_SERIES } from '@/lib/ideas-dummy'
import type { ContentSeries as ContentSeriesType } from '@/lib/ideas-types'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export default function ContentSeries() {
  const [data, setData] = useState<ContentSeriesType[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const generate = async () => {
    setLoading(true)
    await sleep(900 + Math.random() * 400)
    setData(DUMMY_SERIES)
    setLoading(false)
  }

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Layered gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#150a20] via-[#0f0a14] to-[#0a0a0a]" />
      <div className="absolute inset-0 bg-gradient-to-bl from-[#FCAF45]/5 via-transparent to-transparent" />
      {/* Glow orbs */}
      <div className="absolute -top-14 -left-14 w-52 h-52 rounded-full bg-[#833AB4]/12 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-[#FCAF45]/8 blur-3xl pointer-events-none" />
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] ig-gradient-bg" />

      <div className="relative p-5 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl ig-gradient-bg flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#833AB4]/30">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-base font-extrabold text-white tracking-tight">Content Series</p>
            <p className="text-xs text-white/40">Multi-episode formats that build loyal viewers</p>
          </div>
        </div>
        {data && (
          <button onClick={generate} disabled={loading} className="flex items-center gap-1 text-xs text-white/25 hover:text-white/60 mt-1 transition-colors">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        )}
      </div>

      <div className="relative h-px bg-white/5 mx-5" />

      <div className="relative p-5">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 rounded-lg w-1/2 bg-white/5 animate-pulse" />
                <div className="h-3 rounded-lg w-full bg-white/5 animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {data && !loading && (
          <div className="divide-y divide-white/5">
            {data.map((series) => (
              <div key={series.id} className="first:pt-0 last:pb-0">
                <button
                  className="w-full py-3.5 flex items-start justify-between gap-3 text-left group"
                  onClick={() => setExpanded(expanded === series.id ? null : series.id)}
                >
                  <div>
                    <p className="text-xs font-bold text-white mb-0.5 group-hover:ig-gradient-text transition-all">{series.title}</p>
                    <p className="text-xs text-white/30 line-clamp-1">{series.concept}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-semibold text-white/70 bg-white/8 border border-white/10 px-2 py-0.5 rounded-full">{series.frequency}</span>
                    {expanded === series.id
                      ? <ChevronUp className="w-3.5 h-3.5 text-white/30" />
                      : <ChevronDown className="w-3.5 h-3.5 text-white/30" />}
                  </div>
                </button>

                {expanded === series.id && (
                  <div className="pb-4 space-y-3 animate-fade-in">
                    <ol className="space-y-2">
                      {series.episodes.map((ep, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-white/50">
                          <span className="ig-gradient-text font-extrabold flex-shrink-0">#{i + 1}</span>
                          {ep}
                        </li>
                      ))}
                    </ol>
                    <div className="ig-line">
                      <p className="text-xs text-white/35 leading-relaxed">{series.whyItWorks}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!data && !loading && (
          <div className="flex flex-col gap-5 py-2">
            <p className="text-xs text-white/35 leading-relaxed">Multi-episode reel formats that turn one-time viewers into loyal followers.</p>
            <ul className="space-y-2">
              {[
                '3 series concepts tailored to your content style',
                'Full episode breakdown for each series',
                'Posting frequency and why it builds habit',
              ].map((p, i) => (
                <li key={i} className="flex items-center gap-2.5 text-xs text-white/50">
                  <span className="w-1.5 h-1.5 rounded-full ig-gradient-bg flex-shrink-0" />{p}
                </li>
              ))}
            </ul>
            <div className="flex justify-center">
              <button onClick={generate}
                className="flex items-center gap-2 ig-gradient-bg hover:opacity-90 text-white font-bold text-sm px-6 py-3 rounded-2xl transition-all shadow-xl shadow-[#833AB4]/30 hover:scale-105 hover:shadow-[#833AB4]/50">
                <Layers className="w-4 h-4" /> Generate Content Series
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
