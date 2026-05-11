'use client'
import { CalendarDays, Lightbulb } from 'lucide-react'
import type { AccountMetrics } from './analytics'
import { computeGaps, computeContentPlan } from './analytics'

interface Props { accounts: AccountMetrics[] }

const FORMAT_COLORS: Record<string, string> = {
  'Reel':      'bg-violet-500/15 text-violet-400 border-violet-500/25',
  'Carousel':  'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  'Static':    'bg-amber-500/15 text-amber-400 border-amber-500/25',
}

const HOOK_COLORS: Record<string, string> = {
  'Question':       'text-violet-300',
  'Bold Statement': 'text-amber-300',
  'How-To':         'text-cyan-300',
  'Number List':    'text-emerald-300',
  'Curiosity Gap':  'text-purple-300',
  'Mistake':        'text-rose-300',
}

export default function ContentPlanPreview({ accounts }: Props) {
  const me = accounts.find(a => a.isMe)
  const competitors = accounts.filter(a => !a.isMe)
  if (!me) return null

  const gaps = computeGaps(me, competitors.length > 0 ? competitors : [me])
  const plan = computeContentPlan(me, gaps)
  const showFirst = plan.slice(0, 30)

  // Group by week
  const weeks = [
    { label: 'Week 1', days: showFirst.slice(0, 7) },
    { label: 'Week 2', days: showFirst.slice(7, 14) },
    { label: 'Week 3', days: showFirst.slice(14, 21) },
    { label: 'Week 4', days: showFirst.slice(21, 30) },
  ]

  return (
    <section id="plan">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl ig-gradient-bg flex items-center justify-center shadow-lg shadow-[#833AB4]/30 flex-shrink-0">
          <CalendarDays className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">30-Day Content Plan</h2>
          <p className="text-xs text-white/40">AI-generated posting schedule based on gap analysis</p>
        </div>
      </div>

      <div className="space-y-6">
        {weeks.map(week => (
          <div key={week.label} className="rounded-2xl border border-[#1c1c1c] bg-[#0a0a0a] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#111111] bg-white/[0.02]">
              <p className="text-xs font-extrabold text-white/60 uppercase tracking-wider">{week.label}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#0f0f0f] text-[10px] text-white/25 uppercase tracking-widest">
                    <th className="px-4 py-2.5 text-left font-semibold w-12">Day</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Theme</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Hook Style</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Format</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0a0a0a]">
                  {week.days.map(d => (
                    <tr key={d.day} className="hover:bg-white/[0.015] transition-colors">
                      <td className="px-4 py-2.5 text-white/30 font-bold">{d.day}</td>
                      <td className="px-4 py-2.5 text-white/70 font-semibold">{d.theme}</td>
                      <td className={`px-4 py-2.5 font-semibold ${HOOK_COLORS[d.hook] ?? 'text-white/50'}`}>{d.hook}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${FORMAT_COLORS[d.format] ?? 'bg-white/5 text-white/40 border-white/10'}`}>
                          {d.format}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Insight */}
      <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/6 px-4 py-3 flex items-start gap-3">
        <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-white/60 leading-relaxed">
          This plan is <span className="text-amber-400 font-semibold">optimised for your content gaps</span> — prioritising themes where competitors outperform you.
          {' '}Follow this schedule for 30 days and review performance to refine further.
        </p>
      </div>
    </section>
  )
}
