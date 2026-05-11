'use client'
import { TrendingUp, Users, Zap, Hash, Target, BarChart2, ChevronUp } from 'lucide-react'
import type { AccountMetrics } from './analytics'
import { fmt, fmtPct } from './analytics'

interface Props {
  me: AccountMetrics
  best: AccountMetrics
  all: AccountMetrics[]
  dateRange: 30 | 60 | 90
  onDateChange: (d: 30 | 60 | 90) => void
  opportunityScore: number
}

export default function HeroSummary({ me, best, all, dateRange, onDateChange, opportunityScore }: Props) {
  const projectedGrowth = Math.round((best.avgViews - me.avgViews) / Math.max(1, me.avgViews) * 100)
  const yourScore = me.growthScore
  const gainPct = best.avgViews > me.avgViews
    ? Math.round(((best.avgViews - me.avgViews) / me.avgViews) * 100)
    : 0

  const kpis = [
    {
      label: 'Your Growth Score',
      value: `${yourScore}/100`,
      sub: yourScore >= 60 ? 'Strong performance' : yourScore >= 40 ? 'Room to grow' : 'Needs attention',
      color: yourScore >= 60 ? 'emerald' : yourScore >= 40 ? 'amber' : 'rose',
      icon: TrendingUp,
    },
    {
      label: 'Best Competitor',
      value: `@${best.username}`,
      sub: `Score: ${best.growthScore}/100`,
      color: 'violet',
      icon: Users,
    },
    {
      label: 'Winning Theme',
      value: best.topTheme,
      sub: `Top theme for @${best.username}`,
      color: 'cyan',
      icon: Zap,
    },
    {
      label: 'Best Hook Type',
      value: best.topHookType,
      sub: `Highest avg views`,
      color: 'amber',
      icon: Hash,
    },
    {
      label: 'Opportunity Score',
      value: `${opportunityScore}/100`,
      sub: opportunityScore >= 60 ? 'High potential' : 'Moderate potential',
      color: 'violet',
      icon: Target,
    },
    {
      label: 'Projected Gain',
      value: gainPct > 0 ? `+${gainPct}%` : 'Leading',
      sub: gainPct > 0 ? 'if you follow top creator' : 'You are the benchmark',
      color: gainPct > 0 ? 'rose' : 'emerald',
      icon: BarChart2,
    },
  ]

  const colorMap: Record<string, { text: string; bg: string; border: string; shadow: string }> = {
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', shadow: 'shadow-emerald-500/20' },
    amber:   { text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   shadow: 'shadow-amber-500/20' },
    rose:    { text: 'text-rose-400',     bg: 'bg-rose-500/10',     border: 'border-rose-500/20',     shadow: 'shadow-rose-500/20' },
    violet:  { text: 'text-violet-400',   bg: 'bg-violet-500/10',   border: 'border-violet-500/20',   shadow: 'shadow-violet-500/20' },
    cyan:    { text: 'text-cyan-400',     bg: 'bg-cyan-500/10',     border: 'border-cyan-500/20',     shadow: 'shadow-cyan-500/20' },
  }

  return (
    <div className="relative rounded-2xl overflow-hidden mb-8">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0a1f] via-[#0a0a18] to-[#0a0a0a]" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#FD1D1D]/4 to-[#FCAF45]/6" />
      <div className="absolute top-0 left-0 right-0 h-[1.5px] ig-gradient-bg" />
      <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-[#833AB4]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -right-8 w-48 h-48 rounded-full bg-[#FCAF45]/8 blur-3xl pointer-events-none" />

      <div className="relative px-6 pt-8 pb-6">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Analytics Dashboard</p>
            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="ig-gradient-text">Competitor</span>
              <span className="text-white"> Comparison</span>
            </h1>
            <p className="text-sm text-white/40 mt-1.5">
              Discover what top creators are doing differently — and exactly how to beat them
            </p>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1 flex-shrink-0">
            {([30, 60, 90] as const).map(d => (
              <button
                key={d}
                onClick={() => onDateChange(d)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  dateRange === d
                    ? 'ig-gradient-bg text-white shadow-lg'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {kpis.map((kpi, i) => {
            const c = colorMap[kpi.color]
            const Icon = kpi.icon
            return (
              <div key={i} className={`relative rounded-xl border ${c.border} ${c.bg} p-4 group`}>
                <div className={`w-7 h-7 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center mb-3`}>
                  <Icon className={`w-3.5 h-3.5 ${c.text}`} />
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{kpi.label}</p>
                <p className={`text-lg font-extrabold ${c.text} leading-tight truncate`}>{kpi.value}</p>
                <p className="text-[10px] text-white/30 mt-0.5 leading-tight">{kpi.sub}</p>
              </div>
            )
          })}
        </div>

        {/* Account summary bar */}
        <div className="mt-6 pt-5 border-t border-white/[0.06] flex flex-wrap items-center gap-4">
          <p className="text-xs text-white/30 font-semibold uppercase tracking-wider">Analysing:</p>
          {all.map((a, i) => (
            <div key={a.username} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />
              <span className={`text-xs font-semibold ${a.isMe ? 'text-amber-400' : 'text-white/70'}`}>
                @{a.username}
                {a.isMe && <span className="ml-1 text-white/30 font-normal">(you)</span>}
              </span>
              {i < all.length - 1 && <span className="text-white/10 text-sm ml-2">·</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
