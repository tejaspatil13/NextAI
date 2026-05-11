'use client'

import { useState } from 'react'
import type { Reel } from '@/lib/types'
import ReelCard from '@/components/ReelCard'
import PerformanceChart from '@/components/PerformanceChart'
import { Filter, BarChart2, TrendingUp, Eye, Heart, Zap, ChevronUp, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

type PerfFilter = 'all' | 'top' | 'mid' | 'low'

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

interface Props { username: string; reels: Reel[] }

export default function CompetitorSection({ username, reels }: Props) {
  const [perfFilter, setPerfFilter] = useState<PerfFilter>('all')
  const [showChart, setShowChart] = useState(false)

  const totalViews = reels.reduce((s, r) => s + r.views, 0)
  const avgViews = reels.length > 0 ? totalViews / reels.length : 0
  const avgEng = reels.length > 0
    ? reels.reduce((s, r) => s + (r.views > 0 ? (r.likes + r.comments) / r.views : 0), 0) / reels.length * 100
    : 0
  const topCount = reels.filter(r => r.performance === 'top').length
  const topReel = reels.length > 0 ? reels.reduce((a, b) => b.views > a.views ? b : a, reels[0]) : null

  const filteredReels = perfFilter === 'all' ? reels : reels.filter(r => r.performance === perfFilter)
  const initial = username.slice(0, 1).toUpperCase()

  const stats = [
    {
      icon: <Eye className="w-4 h-4 text-sky-400" />,
      label: 'Total Views',
      value: fmt(totalViews),
      color: 'text-white',
      bg: 'bg-sky-500/10',
    },
    {
      icon: <BarChart2 className="w-4 h-4 text-[#FCAF45]" />,
      label: 'Avg / Reel',
      value: fmt(avgViews),
      color: 'text-[#FCAF45]',
      bg: 'bg-amber-500/10',
    },
    {
      icon: <Heart className="w-4 h-4 text-rose-400" />,
      label: 'Avg Eng.',
      value: `${avgEng.toFixed(1)}%`,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: <Zap className="w-4 h-4 text-violet-400" />,
      label: 'Top Reels',
      value: String(topCount),
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
  ]

  return (
    <div className="rounded-2xl overflow-hidden animate-fade-slide-up border border-white/5">

      {/* ── Profile header — gradient card (HeadlineInsight style) ── */}
      <div className="relative overflow-hidden">
        {/* Gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0a1f] via-[#0a0a18] to-[#111]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#FD1D1D]/3 to-[#FCAF45]/5" />
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] ig-gradient-bg" />
        {/* Glow orbs */}
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-[#833AB4]/12 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-[#FCAF45]/6 blur-3xl pointer-events-none" />

        <div className="relative px-5 pt-5 pb-4 border-b border-white/5">
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar with IG story ring */}
            <div className="ig-ring rounded-full p-[2px] flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-[#0a0a0a] flex items-center justify-center text-white font-extrabold text-lg select-none">
                {initial}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-base leading-none">
                <span className="ig-gradient-text">@{username}</span>
              </h3>
              <p className="text-xs text-white/30 mt-1">{reels.length} reels analysed</p>
            </div>
            {topReel && (
              <div className="hidden sm:flex flex-col items-end gap-0.5">
                <span className="text-[10px] text-white/25 uppercase tracking-wider">Best Reel</span>
                <span className="text-sm font-bold text-[#FCAF45]">{fmt(topReel.views)}</span>
                <span className="text-[10px] text-white/20">views</span>
              </div>
            )}
          </div>

          {/* Stat cards row */}
          <div className="grid grid-cols-4 gap-2">
            {stats.map(s => (
              <div key={s.label} className={clsx('rounded-xl border border-white/5 p-3 text-center', s.bg)}>
                <div className="flex justify-center mb-1">{s.icon}</div>
                <div className={clsx('text-base font-extrabold leading-none', s.color)}>{s.value}</div>
                <div className="text-[10px] text-white/25 mt-1 uppercase tracking-wide leading-none">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Toolbar: filter + chart toggle ────────────────────── */}
      <div className="px-4 py-3 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-[#555]" />
          {(['all', 'top', 'mid', 'low'] as PerfFilter[]).map((f) => {
            const count = f === 'all' ? reels.length : reels.filter(r => r.performance === f).length
            const active = perfFilter === f
            return (
              <button
                key={f}
                onClick={() => setPerfFilter(f)}
                className={clsx(
                  'text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 font-medium',
                  active
                    ? f === 'top' ? 'bg-[#833AB4]/20 border-[#833AB4]/40 text-white'
                      : f === 'low' ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      : 'bg-white/10 border-white/20 text-white'
                    : 'border-[#262626] text-[#555] hover:border-[#333] hover:text-[#a8a8a8]',
                )}
              >
                {f === 'all' ? 'All' : f === 'top' ? '🔥 Top' : f === 'mid' ? 'Avg' : 'Low'} ({count})
              </button>
            )
          })}
        </div>
        <button
          onClick={() => setShowChart(v => !v)}
          className={clsx(
            'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all font-medium',
            showChart
              ? 'border-[#833AB4]/40 bg-[#833AB4]/15 text-white'
              : 'border-[#262626] text-[#555] hover:border-[#333] hover:text-[#a8a8a8]'
          )}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          {showChart ? 'Hide Chart' : 'View Chart'}
          {showChart ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* ── Chart (collapsible) ─────────────────────────────────── */}
      {showChart && reels.length > 0 && (
        <div className="px-4 pt-4">
          <PerformanceChart reels={reels} />
        </div>
      )}

      {/* ── Reels grid ─────────────────────────────────────────── */}
      <div className="p-4 bg-[#0a0a0a]">
        {reels.length === 0 ? (
          <p className="text-[#444] text-sm text-center py-10">No data yet.</p>
        ) : filteredReels.length === 0 ? (
          <p className="text-[#555] text-sm text-center py-8">No reels match this filter.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredReels.map((reel, i) => (
              <ReelCard key={reel.id} reel={reel} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
