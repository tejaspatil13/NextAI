'use client'
import { useState } from 'react'
import { Clapperboard, CheckCircle2, Sparkles } from 'lucide-react'
import type { Reel } from '@/lib/types'
import type { LockedContent } from '@/lib/ideas-types'
import ReelIdeasPanel from './ReelIdeasPanel'

interface Props { myReels: Reel[]; onLock?: (content: LockedContent) => void }

export default function ReelIdeas({ myReels, onLock }: Props) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const hasData = myReels.length > 0

  const handleOpen = () => { setPanelOpen(true); setHasGenerated(true) }

  return (
    <>
      {panelOpen && <ReelIdeasPanel myReels={myReels} onClose={() => setPanelOpen(false)} onLock={onLock} />}

      <div className="relative rounded-2xl overflow-hidden border border-[#FCAF45]/25 hover:border-[#FCAF45]/50 transition-all duration-300 group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a1a05] via-[#1a1005] to-[#0a0a0a]" />
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#FCAF45]/15 blur-3xl pointer-events-none group-hover:bg-[#FCAF45]/25 transition-all" />
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#FCAF45] to-transparent" />

        <div className="relative p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#FCAF45]/20 border border-[#FCAF45]/30 flex items-center justify-center flex-shrink-0">
              <Clapperboard className="w-5 h-5 text-[#FCAF45]" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white tracking-tight">Reel Ideas</p>
              <p className="text-[11px] text-[#FCAF45]/80">From your proven patterns</p>
            </div>
          </div>

          {hasGenerated ? (
            <div className="flex items-center justify-between bg-[#FCAF45]/10 border border-[#FCAF45]/20 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FCAF45]" />
                <span className="text-xs font-semibold">Ideas ready</span>
              </div>
              <button onClick={() => setPanelOpen(true)} className="flex items-center gap-1.5 text-xs font-bold bg-[#FCAF45] hover:bg-[#ffc060] text-black px-3 py-1.5 rounded-lg transition-all hover:scale-105">
                <Sparkles className="w-3 h-3" /> Open
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {!hasData && <p className="text-[11px] text-white/30 text-center pb-1">Fetch your reels first.</p>}
              <button onClick={handleOpen} disabled={!hasData}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#FCAF45] hover:bg-[#ffc060] text-black font-bold text-xs transition-all hover:scale-[1.02] shadow-lg shadow-[#FCAF45]/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100">
                <Clapperboard className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Generate Reel Ideas</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
