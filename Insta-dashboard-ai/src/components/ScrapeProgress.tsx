'use client'

import { Loader2 } from 'lucide-react'

interface Props { message: string; subtext?: string }

export default function ScrapeProgress({ message, subtext }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl ig-gradient-bg flex items-center justify-center shadow-2xl shadow-[#833AB4]/30">
          <Loader2 className="w-7 h-7 text-white animate-spin" />
        </div>
        <div className="absolute -inset-1 rounded-3xl ig-gradient-bg opacity-20 animate-pulse blur-sm" />
      </div>
      <p className="text-white font-bold text-base tracking-tight">{message}</p>
      {subtext && <p className="text-[#555] text-sm mt-2 max-w-xs">{subtext}</p>}
    </div>
  )
}
