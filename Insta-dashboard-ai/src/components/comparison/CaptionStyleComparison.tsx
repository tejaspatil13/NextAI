'use client'
import { AlignLeft, Lightbulb } from 'lucide-react'
import type { AccountMetrics, CaptionStyle } from './analytics'
import { getCaptionStyle } from './analytics'

interface Props { accounts: AccountMetrics[] }

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export default function CaptionStyleComparison({ accounts }: Props) {
  const styles = accounts.map(a => ({ ...a, style: getCaptionStyle(a.reels) }))

  const maxes = {
    avgLength: Math.max(...styles.map(s => s.style.avgLength), 1),
    avgEmojis: Math.max(...styles.map(s => s.style.avgEmojis), 1),
    ctaRate:   Math.max(...styles.map(s => s.style.ctaRate), 1),
    avgWords:  Math.max(...styles.map(s => s.style.avgWords), 1),
  }

  const metrics = [
    { key: 'avgLength' as const, label: 'Avg Caption Length', unit: 'chars', format: (v: number) => Math.round(v).toLocaleString() },
    { key: 'avgEmojis' as const, label: 'Avg Emojis Used',   unit: 'per post', format: (v: number) => v.toFixed(1) },
    { key: 'ctaRate'   as const, label: 'CTA Inclusion Rate', unit: '%',       format: (v: number) => `${(v * 100).toFixed(0)}%` },
    { key: 'avgWords'  as const, label: 'Avg Word Count',     unit: 'words',   format: (v: number) => Math.round(v).toLocaleString() },
  ]

  const topCTAUser = styles.reduce((b, s) => s.style.ctaRate > b.style.ctaRate ? s : b, styles[0])

  return (
    <section id="captions">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl ig-gradient-bg flex items-center justify-center shadow-lg shadow-[#833AB4]/30 flex-shrink-0">
          <AlignLeft className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">Caption Style Comparison</h2>
          <p className="text-xs text-white/40">Length, emoji usage, CTAs, and readability</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#1c1c1c] bg-[#0a0a0a] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1c1c1c] flex items-center justify-between">
          <p className="text-sm font-semibold text-white/60">Caption Metrics</p>
          <div className="flex items-center gap-4">
            {styles.map(s => (
              <div key={s.username} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                <span className="text-xs text-white/40">@{s.username}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="divide-y divide-[#0f0f0f]">
          {metrics.map(m => {
            const values = styles.map(s => s.style[m.key])
            const maxVal = maxes[m.key]
            const topIdx = values.indexOf(Math.max(...values))
            return (
              <div key={m.key} className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-white/50">{m.label}</p>
                  <span className="text-[10px] text-white/20">{m.unit}</span>
                </div>
                <div className="space-y-2.5">
                  {styles.map((s, i) => {
                    const val = s.style[m.key]
                    const isTop = i === topIdx
                    return (
                      <div key={s.username} className="flex items-center gap-3">
                        <span className="text-[10px] text-white/40 w-20 truncate">@{s.username.slice(0, 8)}</span>
                        <Bar value={val} max={maxVal} color={s.color} />
                        <span className={`text-xs font-bold w-16 text-right ${isTop ? 'text-white' : 'text-white/40'}`}>
                          {m.format(val)}
                        </span>
                        {isTop && <span className="text-[9px] text-emerald-400 font-semibold w-8">TOP</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Insight */}
      <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/6 px-4 py-3 flex items-start gap-3">
        <Lightbulb className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-white/60 leading-relaxed">
          <span className="text-cyan-400 font-semibold">@{topCTAUser.username}</span> leads with a{' '}
          <span className="text-white font-semibold">{(topCTAUser.style.ctaRate * 100).toFixed(0)}% CTA rate</span>.
          {' '}Captions with direct calls-to-action drive 2× more saves and comments — a key engagement signal.
        </p>
      </div>
    </section>
  )
}
