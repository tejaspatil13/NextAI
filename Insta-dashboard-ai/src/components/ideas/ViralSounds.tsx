'use client'
import { useState } from 'react'
import { Music2, RefreshCw } from 'lucide-react'
import EmptyState from './EmptyState'
import { DUMMY_SOUNDS } from '@/lib/ideas-dummy'
import type { ViralSound } from '@/lib/ideas-types'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export default function ViralSounds() {
  const [data, setData] = useState<ViralSound[] | null>(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    await sleep(800 + Math.random() * 300)
    setData(DUMMY_SOUNDS)
    setLoading(false)
  }

  return (
    <div className="rounded-2xl bg-[#111] border border-[#262626]">
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-fuchsia-500/15 flex items-center justify-center flex-shrink-0">
            <Music2 className="w-4 h-4 text-fuchsia-400" />
          </div>
          <div className="pt-0.5">
            <p className="text-sm font-semibold text-white">Viral Sounds</p>
            <p className="text-xs text-[#555]">Trending audio + how to use it</p>
          </div>
        </div>
        {data && (
          <button onClick={generate} disabled={loading} className="flex items-center gap-1 text-xs text-[#444] hover:text-[#a8a8a8] mt-1 transition-colors">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        )}
      </div>

      <div className="h-px bg-[#1c1c1c] mx-4" />

      <div className="p-4">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 bg-[#1c1c1c] rounded animate-pulse w-1/2" />
                <div className="h-3 bg-[#1c1c1c] rounded animate-pulse w-full" />
              </div>
            ))}
          </div>
        )}

        {data && !loading && (
          <div className="divide-y divide-slate-800">
            {data.map((sound, i) => (
              <div key={i} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="text-xs font-semibold text-white">{sound.name}</p>
                    <p className="text-xs text-[#555]">{sound.useCase}</p>
                  </div>
                  <span className="text-xs text-fuchsia-400 flex-shrink-0">{sound.usageCount}</span>
                </div>
                <p className="text-xs text-[#555] border-l-2 border-[#262626] pl-2 leading-relaxed">{sound.howToUse}</p>
              </div>
            ))}
          </div>
        )}

        {!data && !loading && (
          <EmptyState
            icon={<Music2 className="w-5 h-5 text-fuchsia-400" />}
            color="fuchsia"
            label="Viral Sounds"
            description="Trending audio picks and exactly how to use each one for your niche."
            previews={[
              '4 trending sounds with total usage counts',
              'Best content format to pair with each sound',
              'Specific how-to-use tip per sound',
            ]}
            onGenerate={generate}
          />
        )}
      </div>
    </div>
  )
}
