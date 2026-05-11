'use client'
import { Target, ArrowUpRight, Lightbulb } from 'lucide-react'
import type { AccountMetrics, ContentGap } from './analytics'
import { computeGaps } from './analytics'
import clsx from 'clsx'

interface Props { accounts: AccountMetrics[] }

const PRIORITY_STYLES = {
  high:   { label: 'HIGH',   badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',    card: 'border-rose-500/20 hover:border-rose-500/40',    icon: 'text-rose-400' },
  medium: { label: 'MEDIUM', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30', card: 'border-amber-500/15 hover:border-amber-500/35',   icon: 'text-amber-400' },
  low:    { label: 'LOW',    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',     card: 'border-[#1c1c1c] hover:border-white/15',          icon: 'text-blue-400' },
}

export default function ContentGapAnalysis({ accounts }: Props) {
  const me = accounts.find(a => a.isMe)
  const competitors = accounts.filter(a => !a.isMe)

  if (!me || competitors.length === 0) return null

  const gaps = computeGaps(me, competitors)
  const highPriority = gaps.filter(g => g.priority === 'high')
  const medPriority = gaps.filter(g => g.priority === 'medium')
  const lowPriority = gaps.filter(g => g.priority === 'low')

  const totalOpportunity = Math.round(
    (gaps.reduce((s, g) => s + Math.max(0, g.competitorStrength - g.yourStrength), 0) / Math.max(1, gaps.length)) * 10
  )

  return (
    <section id="gaps">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl ig-gradient-bg flex items-center justify-center shadow-lg shadow-[#833AB4]/30 flex-shrink-0">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">Content Gap Analysis</h2>
          <p className="text-xs text-white/40">Themes competitors dominate that you&apos;re missing out on</p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'High Priority Gaps', count: highPriority.length, color: 'text-rose-400', bg: 'border-rose-500/20 bg-rose-500/6' },
          { label: 'Medium Opportunities', count: medPriority.length, color: 'text-amber-400', bg: 'border-amber-500/20 bg-amber-500/6' },
          { label: 'Already Leading', count: gaps.filter(g => g.yourStrength >= g.competitorStrength).length, color: 'text-emerald-400', bg: 'border-emerald-500/20 bg-emerald-500/6' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border ${s.bg} px-4 py-3 text-center`}>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.count}</p>
            <p className="text-[11px] text-white/40 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Gap cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {gaps.map(gap => {
          const styles = PRIORITY_STYLES[gap.priority]
          const delta = gap.competitorStrength - gap.yourStrength
          const isLeading = gap.yourStrength >= gap.competitorStrength
          return (
            <div
              key={gap.theme}
              className={clsx('rounded-2xl border bg-[#0a0a0a] p-5 transition-all', styles.card)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-extrabold text-white leading-tight">{gap.theme}</h3>
                <span className={clsx('text-[9px] font-extrabold px-2 py-0.5 rounded-full border flex-shrink-0 ml-2', styles.badge)}>
                  {styles.label}
                </span>
              </div>

              {/* Strength comparison */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <p className="text-[10px] text-white/30 mb-1">You</p>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500/60 rounded-full" style={{ width: `${Math.min(100, (gap.yourStrength / Math.max(gap.competitorStrength, 1)) * 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-amber-400 mt-0.5 font-bold">{gap.yourStrength} posts</p>
                </div>
                <ArrowUpRight className={clsx('w-4 h-4 flex-shrink-0', styles.icon)} />
                <div className="flex-1">
                  <p className="text-[10px] text-white/30 mb-1">Competitors</p>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '100%', background: isLeading ? '#10b981' : '#f43f5e', opacity: 0.6 }} />
                  </div>
                  <p className={clsx('text-[10px] mt-0.5 font-bold', isLeading ? 'text-emerald-400' : 'text-rose-400')}>{gap.competitorStrength} posts</p>
                </div>
              </div>

              {/* Opportunity */}
              <p className="text-[11px] text-white/50 leading-relaxed">{gap.opportunity}</p>

              {!isLeading && delta > 0 && (
                <div className="mt-3 px-2.5 py-1.5 rounded-lg bg-white/3 text-[10px] text-white/40">
                  📈 Close the <span className="text-white/70 font-semibold">{delta}-post gap</span> in 2–3 weeks
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Insight */}
      <div className="mt-6 rounded-xl border border-[#833AB4]/20 bg-[#833AB4]/6 px-4 py-3 flex items-start gap-3">
        <Lightbulb className="w-4 h-4 text-[#833AB4] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-white/60 leading-relaxed">
          Focus on <span className="text-white font-semibold">{highPriority[0]?.theme ?? gaps[0]?.theme}</span> first — this is your biggest gap and highest-leverage opportunity.
          {' '}Even 2–3 posts per week in this theme will compound your reach significantly over 30 days.
        </p>
      </div>
    </section>
  )
}
