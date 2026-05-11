'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell,
} from 'recharts'
import { BarChart2, Activity } from 'lucide-react'
import type { AccountMetrics } from './analytics'
import { fmt, fmtPct } from './analytics'

interface Props {
  accounts: AccountMetrics[]
}

const METRICS = [
  { key: 'avgViews',       label: 'Avg Views',    formatter: fmt },
  { key: 'avgLikes',       label: 'Avg Likes',    formatter: fmt },
  { key: 'avgComments',    label: 'Avg Comments', formatter: fmt },
  { key: 'engagementRate', label: 'Eng. Rate %',  formatter: (v: number) => fmtPct(v) },
  { key: 'postsPerWeek',   label: 'Posts/Wk',     formatter: (v: number) => v.toFixed(1) },
  { key: 'viralPostCount', label: 'Viral Posts',  formatter: (v: number) => String(Math.round(v)) },
]

function SectionHeader() {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-2xl ig-gradient-bg flex items-center justify-center shadow-lg shadow-[#833AB4]/30 flex-shrink-0">
        <BarChart2 className="w-5 h-5 text-white" />
      </div>
      <div>
        <h2 className="text-lg font-extrabold text-white tracking-tight">Overall Performance</h2>
        <p className="text-xs text-white/40">Head-to-head metric comparison across all accounts</p>
      </div>
    </div>
  )
}

export default function PerformanceComparison({ accounts }: Props) {
  const barData = METRICS.map(m => {
    const row: Record<string, string | number> = { metric: m.label }
    for (const a of accounts) {
      const val = (a as any)[m.key] as number
      row[a.username] = Math.round(val * 10) / 10
    }
    return row
  })

  const maxByMetric: Record<string, number> = {}
  for (const m of METRICS) {
    maxByMetric[m.key] = Math.max(1, ...accounts.map(a => (a as any)[m.key] as number))
  }

  const radarData = METRICS.map(m => {
    const row: Record<string, string | number> = { metric: m.label }
    for (const a of accounts) {
      const val = (a as any)[m.key] as number
      row[a.username] = Math.round((val / maxByMetric[m.key]) * 100)
    }
    return row
  })

  const me = accounts.find(a => a.isMe)
  const best = accounts.filter(a => !a.isMe).reduce((b, a) => a.avgViews > b.avgViews ? a : b, accounts.find(a => !a.isMe)!)

  return (
    <section id="performance">
      <SectionHeader />

      {/* Comparison stat rows */}
      <div className="rounded-2xl border border-[#1c1c1c] bg-[#0a0a0a] overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-[#1c1c1c] flex items-center justify-between">
          <p className="text-sm font-semibold text-white/70">Metrics Breakdown</p>
          <div className="flex items-center gap-4">
            {accounts.map(a => (
              <div key={a.username} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                <span className="text-xs text-white/50">@{a.username}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="divide-y divide-[#111111]">
          {METRICS.map((m, mi) => {
            const values = accounts.map(a => (a as any)[m.key] as number)
            const max = Math.max(...values)
            return (
              <div key={m.key} className="px-5 py-3.5 flex items-center gap-4">
                <span className="text-xs text-white/40 w-28 flex-shrink-0">{m.label}</span>
                <div className="flex-1 flex items-center gap-6">
                  {accounts.map((a, ai) => {
                    const val = values[ai]
                    const pct = max > 0 ? (val / max) * 100 : 0
                    const isTop = val === max
                    return (
                      <div key={a.username} className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${isTop ? 'text-white' : 'text-white/50'}`}>
                            {m.formatter(val)}
                          </span>
                          {isTop && <span className="text-[9px] text-emerald-400 font-semibold">TOP</span>}
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: a.color, opacity: isTop ? 1 : 0.5 }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="rounded-2xl border border-[#1c1c1c] bg-[#0a0a0a] p-5">
          <p className="text-sm font-semibold text-white/70 mb-1">Avg Views Comparison</p>
          <p className="text-xs text-white/30 mb-4">Views per reel across all accounts</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[{ metric: 'Avg Views', ...Object.fromEntries(accounts.map(a => [a.username, Math.round(a.avgViews)])) }]} layout="vertical" barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
              <XAxis type="number" tickFormatter={fmt} tick={{ fontSize: 10, fill: '#555' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="metric" tick={{ fontSize: 10, fill: '#555' }} axisLine={false} tickLine={false} width={70} />
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: '#0a0a0a', border: '1px solid #1c1c1c', borderRadius: 8, fontSize: 11 }} />
              {accounts.map(a => (
                <Bar key={a.username} dataKey={a.username} radius={[0, 4, 4, 0]} maxBarSize={22} fill={a.color} />
              ))}
              <Legend formatter={(v) => <span className="text-xs text-white/50">@{v}</span>} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart */}
        <div className="rounded-2xl border border-[#1c1c1c] bg-[#0a0a0a] p-5">
          <p className="text-sm font-semibold text-white/70 mb-1">Performance Radar</p>
          <p className="text-xs text-white/30 mb-4">Normalised 0–100 across all metrics</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1a1a1a" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: '#555' }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              {accounts.map(a => (
                <Radar
                  key={a.username}
                  name={`@${a.username}`}
                  dataKey={a.username}
                  stroke={a.color}
                  fill={a.color}
                  fillOpacity={0.12}
                />
              ))}
              <Legend formatter={(v) => <span className="text-xs text-white/50">{v}</span>} />
              <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #1c1c1c', borderRadius: 8, fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI insight */}
      {me && best && (
        <div className="mt-4 rounded-xl border border-[#833AB4]/20 bg-[#833AB4]/6 px-4 py-3 flex items-start gap-3">
          <Activity className="w-4 h-4 text-[#833AB4] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-white/60 leading-relaxed">
            <span className="text-white font-semibold">@{best.username}</span> averages{' '}
            <span className="text-amber-400 font-semibold">{fmt(best.avgViews)}</span> views/reel compared to your{' '}
            <span className="text-white/80 font-semibold">{fmt(me.avgViews)}</span>.
            {best.avgViews > me.avgViews
              ? ` Close the ${Math.round(((best.avgViews - me.avgViews) / me.avgViews) * 100)}% gap by replicating their ${best.topTheme} content strategy.`
              : ` You're outperforming. Maintain your ${me.topTheme} strategy.`}
          </p>
        </div>
      )}
    </section>
  )
}
