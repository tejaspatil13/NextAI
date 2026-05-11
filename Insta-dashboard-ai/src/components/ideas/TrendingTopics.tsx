'use client'
import { useState } from 'react'
import { TrendingUp, CheckCircle2, Sparkles } from 'lucide-react'
import type { Reel } from '@/lib/types'
import type { LockedContent } from '@/lib/ideas-types'
import TrendingTopicsPanel from './TrendingTopicsPanel'

interface Props { myReels: Reel[]; onLock?: (content: LockedContent) => void }

export default function TrendingTopics({ myReels, onLock }: Props) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const hasData = myReels.length > 0

  const handleOpen = () => { setPanelOpen(true); setHasGenerated(true) }

  return (
    <>
      {panelOpen && <TrendingTopicsPanel myReels={myReels} onClose={() => setPanelOpen(false)} onLock={onLock} />}

      <div className="relative rounded-2xl overflow-hidden border border-[#833AB4]/25 hover:border-[#833AB4]/50 transition-all duration-300 group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1f0d2e] via-[#140a1f] to-[#0a0a0a]" />
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#833AB4]/20 blur-3xl pointer-events-none group-hover:bg-[#833AB4]/30 transition-all" />
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#833AB4] to-transparent" />

        <div className="relative p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#833AB4]/20 border border-[#833AB4]/30 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-[#c77dff]" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white tracking-tight">Trending Topics</p>
              <p className="text-[11px] text-[#833AB4]/80">Live India trends → your angle</p>
            </div>
          </div>

          {hasGenerated ? (
            <div className="flex items-center justify-between bg-[#833AB4]/10 border border-[#833AB4]/20 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#c77dff]" />
                <span className="text-xs font-semibold">Ideas ready</span>
              </div>
              <button onClick={() => setPanelOpen(true)} className="flex items-center gap-1.5 text-xs font-bold bg-[#833AB4] hover:bg-[#9b45c5] text-white px-3 py-1.5 rounded-lg transition-all hover:scale-105">
                <Sparkles className="w-3 h-3" /> Open
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {!hasData && <p className="text-[11px] text-white/30 text-center pb-1">Fetch your reels first.</p>}
              <button onClick={handleOpen} disabled={!hasData}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#833AB4] hover:bg-[#9b45c5] text-white font-bold text-xs transition-all hover:scale-[1.02] shadow-lg shadow-[#833AB4]/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100">
                <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Generate Trend Ideas</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
