'use client'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { TrendingUp, Lightbulb } from 'lucide-react'
import type { AccountMetrics } from './analytics'
import { computeGrowthForecast, fmt } from './analytics'

interface Props { accounts: AccountMetrics[] }

export default function GrowthForecast({ accounts }: Props) {
  const me = accounts.find(a => a.isMe)
  if (!me) return null

  const data = computeGrowthForecast(me)
  const finalCurrent = data[data.length - 1]?.current ?? 0
  const finalProjected = data[data.length - 1]?.projected ?? 0
  const uplift = finalCurrent > 0 ? Math.round(((finalProjected - finalCurrent) / finalCurrent) * 100) : 0

  return (
    <section id="forecast">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl ig-gradient-bg flex items-center justify-center shadow-lg shadow-[#833AB4]/30 flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">Growth Forecast</h2>
          <p className="text-xs text-white/40">Projected views trajectory over 8 weeks</p>
        </div>
      </div>

      {/* Uplift cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Current Trajectory', value: fmt(finalCurrent), sub: '8-week projection', color: 'text-white/70' },
          { label: 'With Recommendations', value: fmt(finalProjected), sub: 'if you follow the plan', color: 'text-emerald-400' },
          { label: 'Potential Uplift', value: `+${uplift}%`, sub: 'additional avg views/reel', color: 'text-amber-400' },
        ].map(c => (
          <div key={c.label} className="rounded-xl border border-[#1c1c1c] bg-[#0a0a0a] px-4 py-4 text-center">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{c.label}</p>
            <p className={`text-2xl font-extrabold ${c.color}`}>{c.value}</p>
            <p className="text-[10px] text-white/25 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Area chart */}
      <div className="rounded-2xl border border-[#1c1c1c] bg-[#0a0a0a] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-white/70">8-Week View Projection</p>
            <p className="text-[11px] text-white/30">Based on current growth rate vs recommended strategy</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 rounded-full bg-white/30" /><span className="text-[10px] text-white/40">Current</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 rounded-full bg-emerald-400" /><span className="text-[10px] text-white/40">Projected</span></div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="projectedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#444' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: '#444' }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v: number, name: string) => [fmt(v), name === 'current' ? 'Current Path' : 'With Recommendations']}
              contentStyle={{ background: '#0a0a0a', border: '1px solid #1c1c1c', borderRadius: 8, fontSize: 11 }}
            />
            <Area type="monotone" dataKey="current" stroke="rgba(255,255,255,0.25)" strokeWidth={2} fill="url(#currentGrad)" strokeDasharray="5 3" />
            <Area type="monotone" dataKey="projected" stroke="#10b981" strokeWidth={2.5} fill="url(#projectedGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Insight */}
      <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/6 px-4 py-3 flex items-start gap-3">
        <Lightbulb className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-white/60 leading-relaxed">
          Following the recommended posting strategy could yield{' '}
          <span className="text-emerald-400 font-semibold">{uplift}% more views per reel</span> within 8 weeks.
          {' '}Compounding engagement signals train the algorithm to push your content further.
        </p>
      </div>
    </section>
  )
}
