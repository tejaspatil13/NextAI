'use client'
import { Hash, TrendingUp, Lightbulb, Plus } from 'lucide-react'
import type { AccountMetrics, TagRow } from './analytics'
import { getHashtagRows, fmt } from './analytics'

interface Props { accounts: AccountMetrics[] }

export default function HashtagComparison({ accounts }: Props) {
  const me = accounts.find(a => a.isMe)
  const competitors = accounts.filter(a => !a.isMe)

  const myTags = new Set((me ? getHashtagRows(me.reels) : []).map(t => t.tag))
  const compTagRows = competitors.length > 0 ? getHashtagRows(competitors.flatMap(c => c.reels)) : []
  const myTagRows = me ? getHashtagRows(me.reels) : []

  const missingTags = compTagRows.filter(t => !myTags.has(t.tag)).slice(0, 8)

  return (
    <section id="hashtags">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl ig-gradient-bg flex items-center justify-center shadow-lg shadow-[#833AB4]/30 flex-shrink-0">
          <Hash className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">Hashtag Comparison</h2>
          <p className="text-xs text-white/40">Top hashtags and what competitors use that you don&apos;t</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Your top hashtags */}
        <div className="rounded-2xl border border-[#1c1c1c] bg-[#0a0a0a] p-5">
          <p className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Your Most Used
          </p>
          <div className="space-y-2.5">
            {myTagRows.slice(0, 8).map((t, i) => (
              <div key={t.tag} className="flex items-center gap-2.5">
                <span className="text-[10px] text-white/20 w-4 font-bold">{i + 1}</span>
                <span className="text-xs text-amber-300 font-semibold flex-1 truncate">{t.tag}</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-1 rounded-full bg-amber-500/30 w-12">
                    <div className="h-full rounded-full bg-amber-500/60" style={{ width: `${Math.min(100, (t.count / (myTagRows[0]?.count ?? 1)) * 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-white/30 w-4 text-right">{t.count}</span>
                </div>
              </div>
            ))}
            {myTagRows.length === 0 && <p className="text-xs text-white/25">No hashtags found.</p>}
          </div>
        </div>

        {/* Competitor top performing */}
        <div className="rounded-2xl border border-[#1c1c1c] bg-[#0a0a0a] p-5">
          <p className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
            Competitor High-Performers
          </p>
          <div className="space-y-2.5">
            {[...compTagRows].sort((a, b) => b.avgViews - a.avgViews).slice(0, 8).map((t, i) => (
              <div key={t.tag} className="flex items-center gap-2.5">
                <span className="text-[10px] text-white/20 w-4 font-bold">{i + 1}</span>
                <span className="text-xs text-violet-300 font-semibold flex-1 truncate">{t.tag}</span>
                <span className="text-[10px] text-white/40 flex-shrink-0">{fmt(t.avgViews)}</span>
              </div>
            ))}
            {compTagRows.length === 0 && <p className="text-xs text-white/25">No competitor hashtags found.</p>}
          </div>
        </div>

        {/* Missing hashtags */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
          <p className="text-sm font-semibold text-rose-400 mb-1 flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" />
            Missing From Your Posts
          </p>
          <p className="text-[11px] text-white/30 mb-4">Competitors use these — you don&apos;t</p>
          {missingTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {missingTags.map(t => (
                <span
                  key={t.tag}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] font-semibold"
                >
                  {t.tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/30">Great — you&apos;re using all top competitor tags.</p>
          )}
        </div>
      </div>

      {/* Insight */}
      <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/6 px-4 py-3 flex items-start gap-3">
        <Lightbulb className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-white/60 leading-relaxed">
          Mix <span className="text-cyan-400 font-semibold">niche tags (&lt;50K posts)</span> with{' '}
          <span className="text-cyan-400 font-semibold">mid-tier (50K–500K)</span> for the best discovery reach.
          {missingTags.length > 0 && ` Adding ${missingTags.slice(0, 3).map(t => t.tag).join(', ')} could expand your discoverability.`}
        </p>
      </div>
    </section>
  )
}
