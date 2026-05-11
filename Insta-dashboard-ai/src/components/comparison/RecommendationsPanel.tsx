'use client'
import { Lightbulb, AlertTriangle, ChevronRight, CheckCircle } from 'lucide-react'
import type { AccountMetrics, Recommendation } from './analytics'
import { computeGaps, computeRecommendations } from './analytics'
import clsx from 'clsx'

interface Props { accounts: AccountMetrics[] }

const PRIORITY_CONFIG = {
  high:   { label: 'High Priority',   bg: 'bg-rose-500/8',   border: 'border-rose-500/20',   dot: 'bg-rose-400',   tag: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  medium: { label: 'Medium Priority', bg: 'bg-amber-500/6',  border: 'border-amber-500/15',  dot: 'bg-amber-400',  tag: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  low:    { label: 'Low Priority',    bg: 'bg-blue-500/5',   border: 'border-blue-500/15',   dot: 'bg-blue-400',   tag: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
}

function RecCard({ rec }: { rec: Recommendation }) {
  const cfg = PRIORITY_CONFIG[rec.priority]
  return (
    <div className={clsx('rounded-xl border p-4 transition-all hover:brightness-110', cfg.bg, cfg.border)}>
      <div className="flex items-start gap-3">
        <div className={clsx('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', cfg.dot)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-bold text-white leading-snug">{rec.title}</p>
            <span className={clsx('text-[9px] font-extrabold px-2 py-0.5 rounded-full border flex-shrink-0', cfg.tag)}>
              {rec.priority.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed mb-2">{rec.description}</p>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span className="text-[11px] text-emerald-400 font-semibold">{rec.impact}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RecommendationsPanel({ accounts }: Props) {
  const me = accounts.find(a => a.isMe)
  const competitors = accounts.filter(a => !a.isMe)
  if (!me || competitors.length === 0) return null

  const gaps = computeGaps(me, competitors)
  const recs = computeRecommendations(me, competitors, gaps)

  const high = recs.filter(r => r.priority === 'high')
  const medium = recs.filter(r => r.priority === 'medium')
  const low = recs.filter(r => r.priority === 'low')

  return (
    <section id="recommendations">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl ig-gradient-bg flex items-center justify-center shadow-lg shadow-[#833AB4]/30 flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">Actionable Recommendations</h2>
          <p className="text-xs text-white/40">Prioritised actions to close the gap and accelerate growth</p>
        </div>
      </div>

      {/* Alert banner */}
      {high.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/8 px-4 py-3 mb-6">
          <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-rose-300/80 leading-relaxed">
            <span className="font-bold text-rose-300">{high.length} high-priority actions</span> identified. Fixing these first will have the biggest impact on your growth.
          </p>
        </div>
      )}

      <div className="space-y-8">
        {[
          { recs: high,   label: '🔴 High Priority', desc: 'Act on these this week' },
          { recs: medium, label: '🟡 Medium Priority', desc: 'Implement in the next 2–4 weeks' },
          { recs: low,    label: '🔵 Low Priority', desc: 'Nice-to-have improvements' },
        ].map(group => group.recs.length > 0 && (
          <div key={group.label}>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm font-extrabold text-white">{group.label}</p>
              <span className="text-[10px] text-white/30">— {group.desc}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.recs.map((r, i) => <RecCard key={i} rec={r} />)}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
