'use client'

import { useState, useEffect, useRef } from 'react'
import { AlertCircle } from 'lucide-react'
import type { Reel } from '@/lib/types'
import { computeAccountMetrics, computeGaps, computeRecommendations, filterByDays, ACCOUNT_COLORS } from '@/components/comparison/analytics'

import HeroSummary from '@/components/comparison/HeroSummary'
import PerformanceComparison from '@/components/comparison/PerformanceComparison'
import CompetitorLeaderboard from '@/components/comparison/CompetitorLeaderboard'
import ThemeComparison from '@/components/comparison/ThemeComparison'
import FormatComparison from '@/components/comparison/FormatComparison'
import HookAnalysis from '@/components/comparison/HookAnalysis'
import PostingTimeAnalysis from '@/components/comparison/PostingTimeAnalysis'
import HashtagComparison from '@/components/comparison/HashtagComparison'
import CaptionStyleComparison from '@/components/comparison/CaptionStyleComparison'
import ViralPostsShowcase from '@/components/comparison/ViralPostsShowcase'
import ContentGapAnalysis from '@/components/comparison/ContentGapAnalysis'
import RecommendationsPanel from '@/components/comparison/RecommendationsPanel'
import GrowthForecast from '@/components/comparison/GrowthForecast'
import ContentPlanPreview from '@/components/comparison/ContentPlanPreview'
import CompareIdeasSection from '@/components/comparison/CompareIdeasSection'

interface Props {
  myReels: Reel[]
  competitors: Record<string, Reel[]>
  myUsername?: string
  onLock?: (content: import('@/lib/ideas-types').LockedContent) => void
}

const NAV_SECTIONS = [
  { id: 'compare-ideas',   label: '✦ Ideas' },
  { id: 'performance',     label: 'Performance' },
  { id: 'leaderboard',     label: 'Rankings' },
  { id: 'themes',          label: 'Themes' },
  { id: 'format',          label: 'Format' },
  { id: 'hooks',           label: 'Hooks' },
  { id: 'timing',          label: 'Timing' },
  { id: 'hashtags',        label: 'Hashtags' },
  { id: 'captions',        label: 'Captions' },
  { id: 'viral',           label: 'Viral Posts' },
  { id: 'gaps',            label: 'Gaps' },
  { id: 'recommendations', label: 'Actions' },
  { id: 'forecast',        label: 'Forecast' },
  { id: 'plan',            label: '30-Day Plan' },
]

export default function ComparisonView({ myReels, competitors, myUsername, onLock }: Props) {
  const [dateRange, setDateRange] = useState<30 | 60 | 90>(30)
  const [activeSection, setActiveSection] = useState('performance')
  const navRef = useRef<HTMLDivElement>(null)

  const resolvedMyUsername = myUsername ?? myReels[0]?.ownerUsername ?? 'you'

  const filteredMyReels = filterByDays(myReels, dateRange)
  const filteredCompetitors = Object.fromEntries(
    Object.entries(competitors).map(([u, r]) => [u, filterByDays(r, dateRange)])
  )

  const allAccounts = [
    { username: resolvedMyUsername, reels: filteredMyReels, isMe: true },
    ...Object.entries(filteredCompetitors).map(([username, reels]) => ({ username, reels, isMe: false })),
  ].filter(a => a.reels.length > 0)

  if (allAccounts.length < 2) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/6 p-8 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="w-8 h-8 text-amber-400" />
        <div>
          <p className="text-base font-extrabold text-white mb-1">Not enough data to compare</p>
          <p className="text-sm text-white/40">Fetch your reels and at least one competitor to unlock the full comparison dashboard.</p>
        </div>
      </div>
    )
  }

  const globalMaxAvgViews = Math.max(
    ...allAccounts.map(a => a.reels.length > 0 ? a.reels.reduce((s, r) => s + r.views, 0) / a.reels.length : 0),
    1
  )

  const accountMetrics = allAccounts.map((a, i) =>
    computeAccountMetrics(a.username, a.reels, a.isMe, i, globalMaxAvgViews)
  )

  const me = accountMetrics.find(a => a.isMe)!
  const comps = accountMetrics.filter(a => !a.isMe)
  const best = comps.length > 0 ? comps.reduce((b, c) => c.growthScore > b.growthScore ? c : b, comps[0]) : me

  const gaps = comps.length > 0 ? computeGaps(me, comps) : []
  const highPriorityGaps = gaps.filter(g => g.priority === 'high').length
  const opportunityScore = Math.min(100, Math.round(highPriorityGaps * 20 + (comps.length > 0 ? 40 : 0)))

  // Intersection observer for sticky nav
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    for (const section of NAV_SECTIONS) {
      const el = document.getElementById(section.id)
      if (!el) continue
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(section.id) },
        { rootMargin: '-20% 0px -70% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    }
    return () => observers.forEach(o => o.disconnect())
  }, [accountMetrics.length])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="relative">
      {/* Hero */}
      <HeroSummary
        me={me}
        best={best}
        all={accountMetrics}
        dateRange={dateRange}
        onDateChange={setDateRange}
        opportunityScore={opportunityScore}
      />

      {/* Sticky section nav */}
      <div className="sticky top-0 z-30 -mx-4 px-4 py-2 mb-8 bg-black/80 backdrop-blur-xl border-b border-white/[0.05]">
        <div ref={navRef} className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-0.5">
          {NAV_SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                activeSection === s.id
                  ? 'ig-gradient-bg text-white shadow-md'
                  : 'text-white/35 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* All sections */}
      <div className="space-y-16">
        <CompareIdeasSection
          accounts={accountMetrics}
          myReels={filteredMyReels}
          competitorReels={filteredCompetitors}
          onLock={onLock}
        />
        <PerformanceComparison accounts={accountMetrics} />
        <CompetitorLeaderboard accounts={accountMetrics} />
        <ThemeComparison accounts={accountMetrics} />
        <FormatComparison accounts={accountMetrics} />
        <HookAnalysis accounts={accountMetrics} />
        <PostingTimeAnalysis accounts={accountMetrics} />
        <HashtagComparison accounts={accountMetrics} />
        <CaptionStyleComparison accounts={accountMetrics} />
        <ViralPostsShowcase accounts={accountMetrics} />
        <ContentGapAnalysis accounts={accountMetrics} />
        <RecommendationsPanel accounts={accountMetrics} />
        <GrowthForecast accounts={accountMetrics} />
        <ContentPlanPreview accounts={accountMetrics} />
      </div>
    </div>
  )
}
