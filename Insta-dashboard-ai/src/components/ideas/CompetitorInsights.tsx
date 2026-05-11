'use client'
import { useState } from 'react'
import { Target, CheckCircle2, Sparkles } from 'lucide-react'
import type { Reel } from '@/lib/types'
import type { LockedContent } from '@/lib/ideas-types'
import CompetitorGapsPanel from './CompetitorGapsPanel'

interface Props {
  myReels: Reel[]
  competitorReels: Record<string, Reel[]>
  onLock?: (content: LockedContent) => void
}

export default function CompetitorInsights({ myReels, competitorReels, onLock }: Props) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const hasData = myReels.length > 0 && Object.keys(competitorReels).length > 0

  const handleOpen = () => { setPanelOpen(true); setHasGenerated(true) }

  return (
    <>
      {panelOpen && (
        <CompetitorGapsPanel myReels={myReels} competitorReels={competitorReels}
          onClose={() => setPanelOpen(false)} onLock={onLock} />
      )}

      <div className="relative rounded-2xl overflow-hidden border border-[#FD1D1D]/25 hover:border-[#FD1D1D]/50 transition-all duration-300 group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2e0d0d] via-[#1f0a0a] to-[#0a0a0a]" />
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#FD1D1D]/15 blur-3xl pointer-events-none group-hover:bg-[#FD1D1D]/25 transition-all" />
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#FD1D1D] to-transparent" />

        <div className="relative p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#FD1D1D]/20 border border-[#FD1D1D]/30 flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white tracking-tight">Competitor Gaps</p>
              <p className="text-[11px] text-[#FD1D1D]/80">What they miss — own it</p>
            </div>
          </div>

          {hasGenerated ? (
            <div className="flex items-center justify-between bg-[#FD1D1D]/10 border border-[#FD1D1D]/20 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-xs font-semibold">4 gap ideas ready</span>
              </div>
              <button onClick={() => setPanelOpen(true)} className="flex items-center gap-1.5 text-xs font-bold bg-[#FD1D1D] hover:bg-[#ff3d3d] text-white px-3 py-1.5 rounded-lg transition-all hover:scale-105">
                <Sparkles className="w-3 h-3" /> Open
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {!hasData && <p className="text-[11px] text-white/30 text-center pb-1">Add competitors to unlock.</p>}
              <button onClick={handleOpen} disabled={!hasData}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#FD1D1D] hover:bg-[#ff3d3d] text-white font-bold text-xs transition-all hover:scale-[1.02] shadow-lg shadow-[#FD1D1D]/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100">
                <Target className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Generate Gap Ideas</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
