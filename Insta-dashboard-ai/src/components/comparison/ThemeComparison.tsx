'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { BookOpen, Lightbulb } from 'lucide-react'
import type { AccountMetrics, ThemeRow } from './analytics'
import { getThemeRows, CONTENT_THEMES, fmt } from './analytics'
import clsx from 'clsx'

interface Props { accounts: AccountMetrics[] }

function heatColor(val: number, max: number): string {
  const pct = max > 0 ? val / max : 0
  if (pct === 0) return 'bg-white/3 text-white/20'
  if (pct < 0.25) return 'bg-violet-500/10 text-violet-400/70'
  if (pct < 0.5) return 'bg-violet-500/25 text-violet-300'
  if (pct < 0.75) return 'bg-violet-500/45 text-violet-200'
  return 'bg-violet-500/70 text-white font-bold'
}

export default function ThemeComparison({ accounts }: Props) {
  const themeDataByAccount = accounts.map(a => ({ ...a, themes: getThemeRows(a.reels) }))

  const maxPosts = Math.max(...themeDataByAccount.flatMap(a => a.themes.map(t => t.posts)), 1)
  const maxViews = Math.max(...themeDataByAccount.flatMap(a => a.themes.map(t => t.avgViews)), 1)

  const barData = CONTENT_THEMES.map(theme => {
    const row: Record<string, string | number> = { theme: theme.split(' ')[0] }
    for (const a of themeDataByAccount) {
      const t = a.themes.find(t => t.theme === theme)
      row[a.username] = Math.round(t?.avgViews ?? 0)
    }
    return row
  })

  const topThemeByViews = (() => {
    const allThemes = themeDataByAccount.flatMap(a => a.themes)
    return allThemes.sort((a, b) => b.avgViews - a.avgViews)[0]?.theme ?? 'Tips & Tricks'
  })()

  return (
    <section id="themes">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl ig-gradient-bg flex items-center justify-center shadow-lg shadow-[#833AB4]/30 flex-shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">Content Theme Comparison</h2>
          <p className="text-xs text-white/40">What topics each creator covers and which perform best</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Heatmap table */}
        <div className="rounded-2xl border border-[#1c1c1c] bg-[#0a0a0a] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1c1c1c]">
            <p className="text-sm font-semibold text-white/70">Post Count Heatmap</p>
            <p className="text-[11px] text-white/30 mt-0.5">Darker = more posts in this theme</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#111111]">
                  <th className="px-4 py-2.5 text-left text-[10px] text-white/30 font-semibold uppercase tracking-wider w-36">Theme</th>
                  {themeDataByAccount.map(a => (
                    <th key={a.username} className="px-3 py-2.5 text-center text-[10px] font-semibold" style={{ color: a.color }}>
                      @{a.username.slice(0, 8)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0f0f0f]">
                {CONTENT_THEMES.map(theme => (
                  <tr key={theme} className="hover:bg-white/[0.015]">
                    <td className="px-4 py-2.5 text-[11px] text-white/60 truncate max-w-[140px]">{theme}</td>
                    {themeDataByAccount.map(a => {
                      const t = a.themes.find(t => t.theme === theme)
                      const posts = t?.posts ?? 0
                      return (
                        <td key={a.username} className="px-3 py-2.5 text-center">
                          <span className={clsx('inline-block px-2 py-0.5 rounded text-[10px]', heatColor(posts, maxPosts))}>
                            {posts}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stacked bar chart */}
        <div className="rounded-2xl border border-[#1c1c1c] bg-[#0a0a0a] p-5">
          <p className="text-sm font-semibold text-white/70 mb-1">Avg Views by Theme</p>
          <p className="text-[11px] text-white/30 mb-4">Which themes drive the most views per account</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} layout="vertical" barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
              <XAxis type="number" tickFormatter={fmt} tick={{ fontSize: 9, fill: '#444' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="theme" tick={{ fontSize: 9, fill: '#555' }} axisLine={false} tickLine={false} width={70} />
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: '#0a0a0a', border: '1px solid #1c1c1c', borderRadius: 8, fontSize: 10 }} />
              {themeDataByAccount.map(a => (
                <Bar key={a.username} dataKey={a.username} radius={[0, 3, 3, 0]} maxBarSize={14} fill={a.color} />
              ))}
              <Legend formatter={v => <span className="text-[10px] text-white/40">@{v}</span>} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight */}
      <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/6 px-4 py-3 flex items-start gap-3">
        <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-white/60 leading-relaxed">
          <span className="text-amber-400 font-semibold">{topThemeByViews}</span> content drives the highest average views across all accounts.
          {' '}Double down on this theme to maximise reach per post.
        </p>
      </div>
    </section>
  )
}
