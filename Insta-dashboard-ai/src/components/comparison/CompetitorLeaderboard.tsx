'use client'
import { Trophy, Crown, Medal } from 'lucide-react'
import type { AccountMetrics } from './analytics'
import { fmt, fmtPct } from './analytics'
import clsx from 'clsx'

interface Props { accounts: AccountMetrics[] }

export default function CompetitorLeaderboard({ accounts }: Props) {
  const ranked = [...accounts].sort((a, b) => b.growthScore - a.growthScore)
  const max = ranked[0]?.growthScore ?? 1

  const rankIcons = [
    <Crown key="1" className="w-4 h-4 text-amber-400" />,
    <Medal key="2" className="w-4 h-4 text-slate-400" />,
    <Medal key="3" className="w-4 h-4 text-amber-700" />,
  ]

  return (
    <section id="leaderboard">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl ig-gradient-bg flex items-center justify-center shadow-lg shadow-[#833AB4]/30 flex-shrink-0">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">Competitor Leaderboard</h2>
          <p className="text-xs text-white/40">Ranked by composite Growth Score (0–100)</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#1c1c1c] bg-[#0a0a0a] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 px-5 py-3 border-b border-[#1c1c1c] text-[10px] uppercase tracking-widest text-white/30 font-semibold">
          <span className="col-span-1">Rank</span>
          <span className="col-span-3">Account</span>
          <span className="col-span-3">Growth Score</span>
          <span className="col-span-2 text-right">Avg Views</span>
          <span className="col-span-2 text-right">Eng. Rate</span>
          <span className="col-span-1 text-right">Badge</span>
        </div>

        {ranked.map((a, i) => {
          const pct = (a.growthScore / max) * 100
          const isFirst = i === 0
          return (
            <div
              key={a.username}
              className={clsx(
                'grid grid-cols-12 px-5 py-4 items-center border-b border-[#0f0f0f] last:border-0 transition-colors hover:bg-white/[0.02]',
                isFirst && 'bg-[#FCAF45]/4',
                a.isMe && 'bg-amber-500/4'
              )}
            >
              {/* Rank */}
              <div className="col-span-1 flex items-center">
                {i < 3 ? rankIcons[i] : <span className="text-sm text-white/30 font-bold">#{i + 1}</span>}
              </div>

              {/* Account */}
              <div className="col-span-3 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0" style={{ background: a.color }}>
                  {a.username[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className={clsx('text-sm font-semibold truncate', a.isMe ? 'text-amber-400' : 'text-white/90')}>
                    @{a.username}
                  </p>
                  <p className="text-[10px] text-white/30">{a.reelCount} reels</p>
                </div>
              </div>

              {/* Growth score bar */}
              <div className="col-span-3 pr-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: a.color }}
                    />
                  </div>
                  <span className="text-xs font-extrabold text-white w-8 text-right">{a.growthScore}</span>
                </div>
              </div>

              {/* Avg Views */}
              <div className="col-span-2 text-right">
                <span className={clsx('text-sm font-bold', isFirst ? 'text-emerald-400' : 'text-white/70')}>
                  {fmt(a.avgViews)}
                </span>
              </div>

              {/* Eng rate */}
              <div className="col-span-2 text-right">
                <span className="text-sm text-white/60">{fmtPct(a.engagementRate)}</span>
              </div>

              {/* Badge */}
              <div className="col-span-1 flex justify-end">
                {isFirst && (
                  <span className="ig-gradient-bg text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                    LEADER
                  </span>
                )}
                {a.isMe && !isFirst && (
                  <span className="bg-amber-500/20 text-amber-400 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30">
                    YOU
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
