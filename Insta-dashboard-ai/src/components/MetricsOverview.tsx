'use client'

import { useEffect, useState } from 'react'
import type { Reel } from '@/lib/types'
import { Eye, Heart, TrendingUp, BarChart2, Zap, ThumbsDown } from 'lucide-react'

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return Math.round(n).toLocaleString()
}

function useCountUp(target: number, duration = 1000, delay = 0) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = Date.now()
      const timer = setInterval(() => {
        const elapsed = Date.now() - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(Math.round(target * eased))
        if (progress >= 1) clearInterval(timer)
      }, 16)
      return () => clearInterval(timer)
    }, delay)
    return () => clearTimeout(timeout)
  }, [target, duration, delay])
  return value
}

function StatCard({
  icon, label, rawValue, sub, gradientFrom, delay,
}: {
  icon: React.ReactNode
  label: string
  rawValue: number
  sub: string
  gradientFrom: string
  delay: number
}) {
  const counted = useCountUp(rawValue, 900, delay)

  return (
    <div
      className="stat-card rounded-2xl border border-[#262626] bg-[#0a0a0a] p-4 flex flex-col gap-3 animate-fade-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-9 h-9 rounded-xl ${gradientFrom} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-extrabold text-white tracking-tight leading-none">
          {fmt(counted)}
        </div>
        <div className="text-xs font-semibold text-[#a8a8a8] mt-1.5">{label}</div>
        <div className="text-[11px] text-[#555] mt-0.5">{sub}</div>
      </div>
    </div>
  )
}

export default function MetricsOverview({ reels }: { reels: Reel[] }) {
  if (reels.length === 0) return null

  const totalViews = reels.reduce((s, r) => s + r.views, 0)
  const totalLikes = reels.reduce((s, r) => s + r.likes, 0)
  const avgViews = totalViews / reels.length
  const avgEng = reels.reduce((s, r) => s + (r.views > 0 ? (r.likes + r.comments) / r.views : 0), 0) / reels.length * 100
  const topReel = reels.reduce((a, b) => (b.views > a.views ? b : a), reels[0])
  const topCount = reels.filter((r) => r.performance === 'top').length
  const lowCount = reels.filter((r) => r.performance === 'low').length

  const stats = [
    { icon: <Eye className="w-4 h-4 text-sky-400" />, label: 'Total Views', rawValue: totalViews, sub: `${reels.length} reels`, gradientFrom: 'bg-sky-500/15' },
    { icon: <BarChart2 className="w-4 h-4 text-white" />, label: 'Avg / Reel', rawValue: Math.round(avgViews), sub: 'last 30 days', gradientFrom: 'bg-violet-500/15' },
    { icon: <Heart className="w-4 h-4 text-rose-400" />, label: 'Total Likes', rawValue: totalLikes, sub: `${avgEng.toFixed(1)}% avg eng.`, gradientFrom: 'bg-rose-500/15' },
    { icon: <TrendingUp className="w-4 h-4 text-amber-400" />, label: 'Best Reel', rawValue: topReel.views, sub: new Date(topReel.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), gradientFrom: 'bg-amber-500/15' },
    { icon: <Zap className="w-4 h-4 text-emerald-400" />, label: 'Top Performers', rawValue: topCount, sub: `${Math.round((topCount / reels.length) * 100)}% of reels`, gradientFrom: 'bg-emerald-500/15' },
    { icon: <ThumbsDown className="w-4 h-4 text-red-400" />, label: 'Underperforming', rawValue: lowCount, sub: `${Math.round((lowCount / reels.length) * 100)}% of reels`, gradientFrom: 'bg-red-500/15' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
      {stats.map((s, i) => (
        <StatCard key={s.label} {...s} delay={i * 80} />
      ))}
    </div>
  )
}
