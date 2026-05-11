'use client'

import { useState } from 'react'
import type { Reel } from '@/lib/types'
import { Eye, Heart, MessageCircle, Play, Loader2, FileText, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  reel: Reel
  index?: number
  onTranscribe?: (reel: Reel) => void
  transcribing?: boolean
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

const PERF_BADGE = {
  top: { label: 'Top', icon: TrendingUp, cls: 'bg-[#833AB4]/20 text-white border-[#833AB4]/30' },
  mid: { label: 'Avg', icon: Minus, cls: 'bg-white/8 text-[#a8a8a8] border-white/10' },
  low: { label: 'Low', icon: TrendingDown, cls: 'bg-rose-500/15 text-rose-400 border-rose-500/25' },
}

export default function ReelCard({ reel, index = 0, onTranscribe, transcribing }: Props) {
  const [showTranscript, setShowTranscript] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const perf = reel.performance ?? 'mid'
  const badge = PERF_BADGE[perf]
  const BadgeIcon = badge.icon
  const engRate = reel.views > 0 ? (((reel.likes + reel.comments) / reel.views) * 100).toFixed(1) : '0.0'
  const postedDate = reel.timestamp
    ? new Date(reel.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '—'

  return (
    <div
      className={clsx(
        'animate-fade-slide-up flex flex-col rounded-2xl overflow-hidden bg-[#1c1c1c] border transition-all duration-250',
        perf === 'top' ? 'reel-ring-top' : 'border-[#262626]',
        'hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60 cursor-pointer group'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[9/16] max-h-56 overflow-hidden bg-[#0a0a0a] flex-shrink-0">
        {reel.thumbnailUrl && !imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/proxy-image?url=${encodeURIComponent(reel.thumbnailUrl)}`}
            alt="reel"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 bg-[#111]">
            <Play className="w-8 h-8 text-[#333]" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Performance badge */}
        <div className="absolute top-2 left-2">
          <span className={clsx('flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border', badge.cls)}>
            <BadgeIcon className="w-2.5 h-2.5" />
            {badge.label}
          </span>
        </div>

        {/* External link */}
        <a
          href={reel.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ExternalLink className="w-3 h-3 text-white" />
        </a>

        {/* Date + ER */}
        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
          <span className="text-[11px] text-white/70 font-medium">{postedDate}</span>
          <span className={clsx(
            'text-[11px] font-bold px-1.5 py-0.5 rounded-md',
            parseFloat(engRate) >= 5 ? 'text-emerald-400 bg-emerald-500/15' :
            parseFloat(engRate) >= 2 ? 'text-amber-400 bg-amber-500/15' :
            'text-[#a8a8a8] bg-white/10'
          )}>
            {engRate}%
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#262626]">
        <div className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-sm font-bold text-white">{fmt(reel.views)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart className="w-3 h-3 text-rose-400" />
          <span className="text-xs text-[#a8a8a8]">{fmt(reel.likes)}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3 text-white" />
          <span className="text-xs text-[#a8a8a8]">{fmt(reel.comments)}</span>
        </div>
      </div>

      {/* Caption */}
      <div className="px-3 py-2.5 flex-1">
        <p className="text-[11px] text-[#777] line-clamp-3 leading-relaxed">
          {reel.caption || '(no caption)'}
        </p>
      </div>

      {/* Transcript */}
      {reel.transcript && (
        <div className="mx-3 mb-2">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center gap-1 text-[11px] text-white hover:text-white transition-colors"
          >
            <FileText className="w-3 h-3" />
            {showTranscript ? 'Hide' : 'Transcript'}
          </button>
          {showTranscript && (
            <p className="mt-1.5 text-[11px] text-[#a8a8a8] bg-[#111] rounded-lg p-2.5 leading-relaxed max-h-24 overflow-y-auto border border-[#262626]">
              {reel.transcript}
            </p>
          )}
        </div>
      )}

      {/* Transcribe button */}
      {!reel.transcript && reel.audioUrl && onTranscribe && (
        <div className="px-3 pb-3">
          <button
            onClick={() => onTranscribe(reel)}
            disabled={transcribing}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-xl ig-gradient-bg hover:opacity-90 text-white tracking-wide shadow-md shadow-[#833AB4]/20 transition-all disabled:opacity-50"
          >
            {transcribing
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Transcribing…</>
              : <><FileText className="w-3.5 h-3.5" />Transcribe</>
            }
          </button>
        </div>
      )}
    </div>
  )
}
