'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Film, Lightbulb } from 'lucide-react'
import type { AccountMetrics } from './analytics'
import { fmt } from './analytics'

interface Props { accounts: AccountMetrics[] }

const FORMAT_DATA = [
  { name: 'Reels',          value: 72, color: '#8b5cf6', desc: 'Short-form video' },
  { name: 'Carousels',      value: 18, color: '#06b6d4', desc: 'Multi-slide posts' },
  { name: 'Static Images',  value: 10, color: '#f59e0b', desc: 'Single photo posts' },
]

const CUSTOM_LABEL = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return percent > 0.08 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="700">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null
}

export default function FormatComparison({ accounts }: Props) {
  const me = accounts.find(a => a.isMe)

  return (
    <section id="format">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl ig-gradient-bg flex items-center justify-center shadow-lg shadow-[#833AB4]/30 flex-shrink-0">
          <Film className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">Content Format Comparison</h2>
          <p className="text-xs text-white/40">Format distribution and performance across creators</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut chart */}
        <div className="rounded-2xl border border-[#1c1c1c] bg-[#0a0a0a] p-5">
          <p className="text-sm font-semibold text-white/70 mb-1">Estimated Format Mix</p>
          <p className="text-[11px] text-white/30 mb-4">Industry benchmark for top creators</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={FORMAT_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                  dataKey="value" labelLine={false} label={CUSTOM_LABEL}>
                  {FORMAT_DATA.map((f, i) => <Cell key={i} fill={f.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ background: '#0a0a0a', border: '1px solid #1c1c1c', borderRadius: 8, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3">
              {FORMAT_DATA.map(f => (
                <div key={f.name} className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: f.color }} />
                  <div>
                    <p className="text-xs font-semibold text-white/80">{f.name}</p>
                    <p className="text-[10px] text-white/30">{f.desc}</p>
                  </div>
                  <span className="ml-auto text-xs font-extrabold text-white/70">{f.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Format performance bars */}
        <div className="rounded-2xl border border-[#1c1c1c] bg-[#0a0a0a] p-5">
          <p className="text-sm font-semibold text-white/70 mb-1">Performance by Format</p>
          <p className="text-[11px] text-white/30 mb-5">Relative reach multiplier</p>
          <div className="space-y-4">
            {[
              { format: 'Reels',         mult: 3.2, color: '#8b5cf6', bar: 100, note: 'Highest discovery & reach' },
              { format: 'Carousels',     mult: 1.8, color: '#06b6d4', bar: 56,  note: 'Great for saves' },
              { format: 'Static Images', mult: 1.0, color: '#f59e0b', bar: 31,  note: 'Low organic reach' },
            ].map(f => (
              <div key={f.format}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-white/70">{f.format}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold" style={{ color: f.color }}>{f.mult}×</span>
                    <span className="text-[10px] text-white/30">views</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${f.bar}%`, background: f.color }} />
                </div>
                <p className="text-[10px] text-white/30 mt-1">{f.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/6 px-4 py-3 flex items-start gap-3">
        <Lightbulb className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-white/60 leading-relaxed">
          <span className="text-violet-400 font-semibold">Reels generate 3.2× more views</span> than static posts on average.
          {me && ` Based on your ${me.reelCount} reels, prioritise video-first content for maximum algorithmic reach.`}
        </p>
      </div>
    </section>
  )
}
