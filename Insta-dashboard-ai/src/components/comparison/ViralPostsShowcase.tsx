'use client'
import { Flame, Eye, Heart, MessageCircle, ExternalLink } from 'lucide-react'
import type { AccountMetrics } from './analytics'
import { detectHookType, fmt } from './analytics'

interface Props { accounts: AccountMetrics[] }

const THEME_COLORS: Record<string, string> = {
  'Question':       'text-violet-400 bg-violet-500/10 border-violet-500/20',
  'Bold Statement': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'How-To':         'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'Number List':    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Mistake':        'text-rose-400 bg-rose-500/10 border-rose-500/20',
  'Curiosity Gap':  'text-purple-400 bg-purple-500/10 border-purple-500/20',
}

export default function ViralPostsShowcase({ accounts }: Props) {
  const allReels = accounts.flatMap(a =>
    a.reels.map(r => ({ ...r, accountColor: a.color, accountUsername: a.username, isMe: a.isMe }))
  )
  const topPosts = [...allReels].sort((a, b) => b.views - a.views).slice(0, 10)

  return (
    <section id="viral">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl ig-gradient-bg flex items-center justify-center shadow-lg shadow-[#833AB4]/30 flex-shrink-0">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">Viral Posts Showcase</h2>
          <p className="text-xs text-white/40">Top 10 highest-performing reels across all accounts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {topPosts.map((post, i) => {
          const hookType = detectHookType(post.caption)
          const hookColors = THEME_COLORS[hookType] ?? 'text-white/50 bg-white/5 border-white/10'
          const engRate = post.views > 0 ? ((post.likes + post.comments) / post.views * 100).toFixed(1) : '0.0'
          const firstLine = post.caption.split('\n')[0].slice(0, 100) || '(no caption)'

          return (
            <div key={post.id ?? i} className="rounded-2xl border border-[#1c1c1c] bg-[#0a0a0a] overflow-hidden group hover:border-white/10 transition-all">
              {/* Thumbnail placeholder */}
              <div className="relative h-36 flex items-center justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${post.accountColor}22, #0a0a0a)` }}>
                {post.thumbnailUrl ? (
                  <img src={post.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center px-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-extrabold text-lg" style={{ background: post.accountColor }}>
                      {post.accountUsername[0].toUpperCase()}
                    </div>
                  </div>
                )}
                {/* Rank badge */}
                <div className={`absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold ${i === 0 ? 'ig-gradient-bg text-white' : 'bg-black/60 text-white/70'}`}>
                  #{i + 1}
                </div>
                {/* Account tag */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: post.accountColor }} />
                  <span className="text-[9px] text-white/80 font-semibold">@{post.accountUsername.slice(0, 10)}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Hook type badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${hookColors}`}>
                    {hookType}
                  </span>
                  <span className="text-[9px] text-white/30">HOOK</span>
                </div>

                <p className="text-xs text-white/80 leading-relaxed line-clamp-2 mb-3">
                  {firstLine}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-3 text-[11px] text-white/40">
                  <span className="flex items-center gap-1 text-white font-bold">
                    <Eye className="w-3 h-3" />{fmt(post.views)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400" />{fmt(post.likes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3 text-cyan-400" />{fmt(post.comments)}
                  </span>
                  <span className="ml-auto text-emerald-400 font-semibold">{engRate}%</span>
                </div>

                {post.url && (
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white/60 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on Instagram
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
