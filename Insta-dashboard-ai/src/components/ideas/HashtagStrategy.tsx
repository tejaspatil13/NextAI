'use client'
import { useState } from 'react'
import { Hash, RefreshCw, Copy, Check } from 'lucide-react'
import EmptyState from './EmptyState'
import { DUMMY_HASHTAGS } from '@/lib/ideas-dummy'
import type { HashtagCluster, TagSize } from '@/lib/ideas-types'
import clsx from 'clsx'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

const sizeColor: Record<TagSize, string> = {
  large: 'text-rose-400 bg-rose-500/10',
  medium: 'text-amber-400 bg-amber-500/10',
  niche: 'text-emerald-400 bg-emerald-500/10',
}

export default function HashtagStrategy() {
  const [data, setData] = useState<HashtagCluster[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const generate = async () => {
    setLoading(true)
    await sleep(700 + Math.random() * 300)
    setData(DUMMY_HASHTAGS)
    setLoading(false)
  }

  const copy = async (label: string, tags: string[]) => {
    await navigator.clipboard.writeText(tags.join(' '))
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="rounded-2xl bg-[#111] border border-[#262626]">
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/15 flex items-center justify-center flex-shrink-0">
            <Hash className="w-4 h-4 text-teal-400" />
          </div>
          <div className="pt-0.5">
            <p className="text-sm font-semibold text-white">Hashtag Strategy</p>
            <p className="text-xs text-[#555]">Curated clusters — click to copy</p>
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
                <div className="h-3 bg-[#1c1c1c] rounded animate-pulse w-1/3" />
                <div className="h-6 bg-[#1c1c1c] rounded animate-pulse w-full" />
              </div>
            ))}
          </div>
        )}

        {data && !loading && (
          <div className="divide-y divide-slate-800">
            {data.map((cluster) => (
              <div key={cluster.label} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-white">{cluster.label}</p>
                    <span className={clsx('text-xs px-1.5 py-0.5 rounded-full', sizeColor[cluster.size])}>
                      {cluster.size}
                    </span>
                  </div>
                  <button onClick={() => copy(cluster.label, cluster.tags)} className="flex items-center gap-1 text-xs text-[#555] hover:text-teal-400 transition-colors">
                    {copied === cluster.label ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
                    {copied === cluster.label ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cluster.tags.map((tag) => (
                    <span key={tag} className="text-xs text-[#a8a8a8] bg-[#1c1c1c] px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!data && !loading && (
          <EmptyState
            icon={<Hash className="w-5 h-5 text-teal-400" />}
            color="teal"
            label="Hashtag Strategy"
            description="Curated tag clusters organised by reach size — copy any group with one click."
            previews={[
              '4 clusters: broad discovery, niche authority, community, trending',
              'Volume size label per cluster (high / medium / niche)',
              'One-click copy for any cluster',
            ]}
            onGenerate={generate}
          />
        )}
      </div>
    </div>
  )
}
