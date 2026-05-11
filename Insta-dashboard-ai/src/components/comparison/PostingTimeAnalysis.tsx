'use client'
import { Clock, Lightbulb } from 'lucide-react'
import type { AccountMetrics } from './analytics'
import { getDaySlots, getTimeSlots, fmt } from './analytics'
import clsx from 'clsx'

interface Props { accounts: AccountMetrics[] }

function heatIntensity(val: number, max: number): string {
  const p = max > 0 ? val / max : 0
  if (p === 0) return 'bg-white/3'
  if (p < 0.2) return 'bg-violet-500/10'
  if (p < 0.4) return 'bg-violet-500/25'
  if (p < 0.6) return 'bg-violet-500/45'
  if (p < 0.8) return 'bg-violet-500/65'
  return 'bg-violet-500/85'
}

export default function PostingTimeAnalysis({ accounts }: Props) {
  const allReels = accounts.filter(a => !a.isMe).flatMap(a => a.reels)
  const myReels = accounts.find(a => a.isMe)?.reels ?? []

  const compSlots = getTimeSlots(allReels)
  const mySlots = getTimeSlots(myReels)
  const daySlots = getDaySlots(allReels)

  const compMaxViews = Math.max(...compSlots.map(s => s.avgViews), 1)
  const myMaxViews = Math.max(...mySlots.map(s => s.avgViews), 1)
  const dayMax = Math.max(...daySlots.map(d => d.avgViews), 1)

  const bestCompHour = compSlots.reduce((b, s) => s.avgViews > b.avgViews ? s : b, compSlots[0])
  const bestMyHour = mySlots.reduce((b, s) => s.avgViews > b.avgViews ? s : b, mySlots[0])
  const bestDay = daySlots.reduce((b, d) => d.avgViews > b.avgViews ? d : b, daySlots[0])

  const formatHour = (h: number) => {
    if (h === 0) return '12AM'
    if (h < 12) return `${h}AM`
    if (h === 12) return '12PM'
    return `${h - 12}PM`
  }

  const hourLabels = [0, 3, 6, 9, 12, 15, 18, 21]

  return (
    <section id="timing">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl ig-gradient-bg flex items-center justify-center shadow-lg shadow-[#833AB4]/30 flex-shrink-0">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">Posting Time Analysis</h2>
          <p className="text-xs text-white/40">When top creators post vs when you post</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Hourly heatmap — competitors */}
        <div className="rounded-2xl border border-[#1c1c1c] bg-[#0a0a0a] p-5">
          <p className="text-sm font-semibold text-white/70 mb-1">Competitors — Best Hours</p>
          <p className="text-[11px] text-white/30 mb-4">Avg views by hour (darker = higher)</p>
          <div className="grid grid-cols-12 gap-1 mb-2">
            {compSlots.map(s => (
              <div key={s.hour} className={clsx('h-8 rounded transition-all', heatIntensity(s.avgViews, compMaxViews))} title={`${formatHour(s.hour)}: ${fmt(s.avgViews)} avg views`} />
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-white/30 mt-1">
            {Array.from({ length: 6 }, (_, i) => <span key={i}>{formatHour(i * 4)}</span>)}
            <span>11PM</span>
          </div>
          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-white/60">Best hour: <span className="text-emerald-400 font-bold">{formatHour(bestCompHour.hour)}</span></span>
            <span className="ml-auto text-xs text-white/40">{fmt(bestCompHour.avgViews)} avg</span>
          </div>
        </div>

        {/* Hourly heatmap — you */}
        <div className="rounded-2xl border border-[#1c1c1c] bg-[#0a0a0a] p-5">
          <p className="text-sm font-semibold text-white/70 mb-1">Your Posting Hours</p>
          <p className="text-[11px] text-white/30 mb-4">Avg views when you post</p>
          <div className="grid grid-cols-12 gap-1 mb-2">
            {mySlots.map(s => (
              <div key={s.hour} className={clsx('h-8 rounded transition-all', heatIntensity(s.avgViews, myMaxViews))} title={`${formatHour(s.hour)}: ${fmt(s.avgViews)} avg views`} />
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-white/30 mt-1">
            {Array.from({ length: 6 }, (_, i) => <span key={i}>{formatHour(i * 4)}</span>)}
            <span>11PM</span>
          </div>
          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-xs text-white/60">Your best hour: <span className="text-amber-400 font-bold">{formatHour(bestMyHour.hour)}</span></span>
            <span className="ml-auto text-xs text-white/40">{fmt(bestMyHour.avgViews)} avg</span>
          </div>
        </div>
      </div>

      {/* Day of week */}
      <div className="rounded-2xl border border-[#1c1c1c] bg-[#0a0a0a] p-5 mb-4">
        <p className="text-sm font-semibold text-white/70 mb-4">Best Days to Post (Competitors)</p>
        <div className="grid grid-cols-7 gap-2">
          {daySlots.map(d => {
            const isBest = d.day === bestDay.day
            const pct = dayMax > 0 ? d.avgViews / dayMax : 0
            return (
              <div key={d.day} className={clsx('rounded-xl p-3 text-center border transition-all', isBest ? 'border-violet-500/50 bg-violet-500/15' : 'border-[#1c1c1c] bg-white/3')}>
                <p className={clsx('text-xs font-extrabold mb-2', isBest ? 'text-violet-400' : 'text-white/40')}>{d.label}</p>
                <div className="h-14 flex items-end justify-center">
                  <div
                    className="w-full rounded-t-md transition-all duration-700"
                    style={{ height: `${Math.max(4, pct * 100)}%`, background: isBest ? '#8b5cf6' : 'rgba(255,255,255,0.08)' }}
                  />
                </div>
                <p className="text-[9px] text-white/30 mt-1.5">{fmt(d.avgViews)}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Insight */}
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/6 px-4 py-3 flex items-start gap-3">
        <Lightbulb className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-white/60 leading-relaxed">
          Top creators perform best on <span className="text-violet-400 font-semibold">{bestDay.label}</span> around{' '}
          <span className="text-violet-400 font-semibold">{formatHour(bestCompHour.hour)}</span>.
          {bestCompHour.hour !== bestMyHour.hour
            ? ` You currently peak at ${formatHour(bestMyHour.hour)} — shifting by ${Math.abs(bestCompHour.hour - bestMyHour.hour)}h could increase views by 15–25%.`
            : ` You're already posting at the optimal time — great alignment.`}
        </p>
      </div>
    </section>
  )
}
