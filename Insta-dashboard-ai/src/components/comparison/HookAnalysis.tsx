'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Zap, Lightbulb } from 'lucide-react'
import type { AccountMetrics, HookRow } from './analytics'
import { getHookRows, fmt } from './analytics'

interface Props { accounts: AccountMetrics[] }

const HOOK_COLORS: Record<string, string> = {
  'Question':       '#8b5cf6',
  'Bold Statement': '#f59e0b',
  'How-To':         '#06b6d4',
  'Number List':    '#10b981',
  'Mistake':        '#f43f5e',
  'Curiosity Gap':  '#a78bfa',
}

export default function HookAnalysis({ accounts }: Props) {
  const me = accounts.find(a => a.isMe)
  const best = accounts.filter(a => !a.isMe).reduce((b, a) => a.avgViews > b.avgViews ? a : b, accounts[0])

  const allReels = accounts.flatMap(a => a.reels)
  const combinedHooks = getHookRows(allReels)
  const topHook = [...combinedHooks].sort((a, b) => b.avgViews - a.avgViews)[0]

  const chartData = combinedHooks.map(h => ({
    name: h.type.split(' ')[0],
    views: Math.round(h.avgViews),
    count: h.count,
    fullName: h.type,
  }))

  return (
    <section id="hooks">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl ig-gradient-bg flex items-center justify-center shadow-lg shadow-[#833AB4]/30 flex-shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">Hook Analysis</h2>
          <p className="text-xs text-white/40">Which opening styles drive the most views</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar chart */}
        <div className="rounded-2xl border border-[#1c1c1c] bg-[#0a0a0a] p-5">
          <p className="text-sm font-semibold text-white/70 mb-1">Avg Views by Hook Type</p>
          <p className="text-[11px] text-white/30 mb-4">Combined across all accounts</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#555' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 9, fill: '#444' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number, _, props) => [fmt(v), props.payload.fullName]}
                contentStyle={{ background: '#0a0a0a', border: '1px solid #1c1c1c', borderRadius: 8, fontSize: 11 }}
              />
              <Bar dataKey="views" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={HOOK_COLORS[d.fullName] ?? '#8b5cf6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hook type cards */}
        <div className="grid grid-cols-2 gap-3">
          {combinedHooks.map(h => {
            const isTop = h.type === topHook?.type
            const color = HOOK_COLORS[h.type] ?? '#8b5cf6'
            return (
              <div
                key={h.type}
                className={`rounded-xl border p-3.5 transition-all ${isTop ? 'border-amber-500/40 bg-amber-500/8' : 'border-[#1c1c1c] bg-[#0a0a0a] hover:border-white/10'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">{h.type}</span>
                  {isTop && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">WINNING</span>}
                </div>
                <p className="text-lg font-extrabold" style={{ color }}>{fmt(h.avgViews)}</p>
                <p className="text-[10px] text-white/30 mt-0.5">avg views · {h.count} posts</p>
                {h.topHook && (
                  <p className="text-[10px] text-white/40 mt-2 leading-tight line-clamp-2 italic">
                    &quot;{h.topHook}&quot;
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Insight */}
      {topHook && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/6 px-4 py-3 flex items-start gap-3">
          <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-white/60 leading-relaxed">
            <span className="text-amber-400 font-semibold">{topHook.type}</span> hooks average{' '}
            <span className="text-white font-semibold">{fmt(topHook.avgViews)} views</span> — the strongest performing opening style.
            {best && ` @${best.username} uses this hook style most effectively.`}
          </p>
        </div>
      )}
    </section>
  )
}
