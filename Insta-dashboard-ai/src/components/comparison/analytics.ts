import type { Reel } from '@/lib/types'

export const ACCOUNT_COLORS = ['#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#f43f5e', '#a78bfa']

export const CONTENT_THEMES = [
  'Educational', 'Motivational', 'Personal Story',
  'Behind the Scenes', 'Product Promotion', 'Case Study', 'Tips & Tricks',
]

export const THEME_KEYWORDS: Record<string, string[]> = {
  'Educational':       ['learn', 'explain', 'understand', 'knowledge', 'concept', 'what is', 'how does'],
  'Motivational':      ['inspire', 'motivate', 'success', 'mindset', 'believe', 'dream', 'achieve', 'hustle', 'grind', 'winning'],
  'Personal Story':    ['my story', 'i was', 'journey', 'personal', 'when i', 'struggled', 'started', 'my life'],
  'Behind the Scenes': ['behind', 'bts', 'day in my', 'a day in', 'routine', 'process', 'setup', 'workspace', 'reality'],
  'Product Promotion': ['buy', 'discount', 'offer', 'deal', 'available', 'shop', 'link in bio', 'promo', 'sale', 'launch'],
  'Case Study':        ['case study', 'how i made', 'how we', 'results', 'revenue', 'grew from', 'from 0 to', 'client'],
  'Tips & Tricks':     ['tips', 'tricks', 'hacks', 'secret', 'strategy', 'method', 'technique', 'formula', 'blueprint'],
}

export const HOOK_TYPES = ['Question', 'Bold Statement', 'How-To', 'Number List', 'Mistake', 'Curiosity Gap']

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export interface AccountMetrics {
  username: string
  isMe: boolean
  color: string
  reelCount: number
  avgViews: number
  avgLikes: number
  avgComments: number
  engagementRate: number
  viralPostCount: number
  postsPerWeek: number
  growthScore: number
  topReel: Reel
  reels: Reel[]
  topTheme: string
  topHookType: string
  bestHour: number
  bestDay: number
}

export interface ThemeRow {
  theme: string
  posts: number
  avgViews: number
  engRate: number
}

export interface HookRow {
  type: string
  count: number
  avgViews: number
  topHook: string
}

export interface TimeSlot {
  hour: number
  count: number
  avgViews: number
}

export interface DaySlot {
  day: number
  label: string
  count: number
  avgViews: number
}

export interface TagRow {
  tag: string
  count: number
  avgViews: number
}

export interface CaptionStyle {
  avgLength: number
  avgEmojis: number
  ctaRate: number
  avgWords: number
}

export interface ContentGap {
  theme: string
  competitorStrength: number
  yourStrength: number
  opportunity: string
  priority: 'high' | 'medium' | 'low'
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
}

export interface ForecastPoint {
  week: string
  current: number
  projected: number
}

export interface PlanDay {
  day: number
  theme: string
  hook: string
  format: string
}

export function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return Math.round(n).toLocaleString()
}

export function fmtPct(n: number): string {
  return n.toFixed(1) + '%'
}

export function filterByDays(reels: Reel[], days: number): Reel[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  const filtered = reels.filter(r => {
    const t = new Date(r.timestamp).getTime()
    return !isNaN(t) && t >= cutoff
  })
  return filtered.length >= 3 ? filtered : reels
}

export function computeAccountMetrics(
  username: string,
  reels: Reel[],
  isMe: boolean,
  colorIdx: number,
  globalMaxAvgViews: number,
): AccountMetrics {
  const color = ACCOUNT_COLORS[colorIdx % ACCOUNT_COLORS.length]
  const n = reels.length
  if (n === 0) {
    return {
      username, isMe, color, reelCount: 0, avgViews: 0, avgLikes: 0, avgComments: 0,
      engagementRate: 0, viralPostCount: 0, postsPerWeek: 0, growthScore: 0,
      topReel: {} as Reel, reels: [], topTheme: 'N/A', topHookType: 'N/A', bestHour: 0, bestDay: 0,
    }
  }

  const avgViews = reels.reduce((s, r) => s + r.views, 0) / n
  const avgLikes = reels.reduce((s, r) => s + r.likes, 0) / n
  const avgComments = reels.reduce((s, r) => s + r.comments, 0) / n
  const engRate = reels.reduce((s, r) => s + (r.views > 0 ? (r.likes + r.comments) / r.views : 0), 0) / n * 100
  const viralPostCount = reels.filter(r => r.views > avgViews * 2).length

  const sorted = [...reels].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  let postsPerWeek = 1
  if (sorted.length >= 2) {
    const span = new Date(sorted[n - 1].timestamp).getTime() - new Date(sorted[0].timestamp).getTime()
    const weeks = Math.max(1, span / (7 * 24 * 60 * 60 * 1000))
    postsPerWeek = n / weeks
  }

  const topReel = reels.reduce((b, r) => r.views > b.views ? r : b, reels[0])

  const viewsScore = Math.min(100, (avgViews / Math.max(1, globalMaxAvgViews)) * 70)
  const engScore = Math.min(100, engRate * 8)
  const viralScore = Math.min(100, (viralPostCount / n) * 200)
  const consistencyScore = Math.min(100, postsPerWeek * 25)
  const growthScore = Math.min(100, Math.round(viewsScore * 0.3 + engScore * 0.3 + viralScore * 0.2 + consistencyScore * 0.2))

  const themes = getThemeRows(reels)
  const topThemeRow = themes.sort((a, b) => b.avgViews - a.avgViews)[0]
  const topTheme = topThemeRow?.posts > 0 ? topThemeRow.theme : 'Tips & Tricks'

  const hooks = getHookRows(reels)
  const topHookRow = hooks.sort((a, b) => b.avgViews - a.avgViews)[0]
  const topHookType = topHookRow?.count > 0 ? topHookRow.type : 'Question'

  const byHour = getTimeSlots(reels)
  const bestHour = byHour.reduce((b, t) => t.avgViews > b.avgViews ? t : b, byHour[0])?.hour ?? 18

  const byDay = getDaySlots(reels)
  const bestDay = byDay.reduce((b, d) => d.avgViews > b.avgViews ? d : b, byDay[0])?.day ?? 0

  return {
    username, isMe, color, reelCount: n, avgViews, avgLikes, avgComments,
    engagementRate: engRate, viralPostCount, postsPerWeek, growthScore,
    topReel, reels, topTheme, topHookType, bestHour, bestDay,
  }
}

export function getThemeRows(reels: Reel[]): ThemeRow[] {
  return CONTENT_THEMES.map(theme => {
    const kws = THEME_KEYWORDS[theme] ?? []
    const matching = reels.filter(r => {
      const text = `${r.caption} ${r.transcript ?? ''}`.toLowerCase()
      return kws.some(kw => text.includes(kw))
    })
    const posts = matching.length
    const avgViews = posts > 0 ? matching.reduce((s, r) => s + r.views, 0) / posts : 0
    const engRate = posts > 0 ? matching.reduce((s, r) => s + (r.views > 0 ? (r.likes + r.comments) / r.views : 0), 0) / posts * 100 : 0
    return { theme, posts, avgViews, engRate }
  })
}

export function detectHookType(caption: string): string {
  const line = caption.split('\n')[0].toLowerCase().trim()
  if (!line) return 'Bold Statement'
  if (/^\d/.test(line) || /\d+\s*(ways|tips|things|reasons|steps|hacks|secrets|mistakes)/.test(line)) return 'Number List'
  if (/(don't|mistake|stop |never |avoid|wrong way|you're doing)/.test(line)) return 'Mistake'
  if (/(how to |here's how|step-by-step|the only way to)/.test(line)) return 'How-To'
  if (line.includes('?')) return 'Question'
  if (/(secret|nobody|truth|real reason|this is why|you won't believe|insane|shocking|can't believe)/.test(line)) return 'Curiosity Gap'
  return 'Bold Statement'
}

export function getHookRows(reels: Reel[]): HookRow[] {
  const byType: Record<string, Reel[]> = {}
  for (const t of HOOK_TYPES) byType[t] = []
  for (const reel of reels) {
    const t = detectHookType(reel.caption)
    const key = HOOK_TYPES.includes(t) ? t : 'Bold Statement'
    byType[key].push(reel)
  }
  return HOOK_TYPES.map(type => {
    const group = byType[type]
    const count = group.length
    const avgViews = count > 0 ? group.reduce((s, r) => s + r.views, 0) / count : 0
    const topHook = count > 0
      ? [...group].sort((a, b) => b.views - a.views)[0].caption.split('\n')[0].slice(0, 90)
      : ''
    return { type, count, avgViews, topHook }
  })
}

export function getTimeSlots(reels: Reel[]): TimeSlot[] {
  const byHour: Record<number, Reel[]> = {}
  for (let h = 0; h < 24; h++) byHour[h] = []
  for (const r of reels) {
    const h = new Date(r.timestamp).getHours()
    if (!isNaN(h)) byHour[h].push(r)
  }
  return Array.from({ length: 24 }, (_, hour) => {
    const group = byHour[hour]
    return { hour, count: group.length, avgViews: group.length > 0 ? group.reduce((s, r) => s + r.views, 0) / group.length : 0 }
  })
}

export function getDaySlots(reels: Reel[]): DaySlot[] {
  const byDay: Record<number, Reel[]> = {}
  for (let d = 0; d < 7; d++) byDay[d] = []
  for (const r of reels) {
    const d = new Date(r.timestamp).getDay()
    if (!isNaN(d)) byDay[d].push(r)
  }
  return Array.from({ length: 7 }, (_, day) => {
    const group = byDay[day]
    return { day, label: DAYS[day], count: group.length, avgViews: group.length > 0 ? group.reduce((s, r) => s + r.views, 0) / group.length : 0 }
  })
}

export function getHashtagRows(reels: Reel[]): TagRow[] {
  const map: Record<string, Reel[]> = {}
  for (const r of reels) {
    const tags = r.caption.match(/#[\wऀ-ॿ]+/g) ?? []
    for (const tag of tags) {
      const t = tag.toLowerCase()
      if (!map[t]) map[t] = []
      map[t].push(r)
    }
  }
  return Object.entries(map)
    .map(([tag, rs]) => ({ tag, count: rs.length, avgViews: rs.reduce((s, r) => s + r.views, 0) / rs.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
}

export function getCaptionStyle(reels: Reel[]): CaptionStyle {
  if (!reels.length) return { avgLength: 0, avgEmojis: 0, ctaRate: 0, avgWords: 0 }
  const emojiRe = /[\uD83C-􏰀-\uDFFF]+|[☀-➿]/g
  const ctaWords = ['link in bio', 'comment below', 'comment ', 'follow', 'save this', 'share', ' dm ', 'swipe', 'click']
  const avgLength = reels.reduce((s, r) => s + r.caption.length, 0) / reels.length
  const avgEmojis = reels.reduce((s, r) => s + (r.caption.match(emojiRe)?.length ?? 0), 0) / reels.length
  const ctaCount = reels.filter(r => ctaWords.some(w => r.caption.toLowerCase().includes(w))).length
  const ctaRate = ctaCount / reels.length
  const avgWords = reels.reduce((s, r) => s + r.caption.split(/\s+/).filter(Boolean).length, 0) / reels.length
  return { avgLength, avgEmojis, ctaRate, avgWords }
}

export function computeGaps(myMetrics: AccountMetrics, compMetrics: AccountMetrics[]): ContentGap[] {
  const myThemes = getThemeRows(myMetrics.reels)
  const allCompReels = compMetrics.flatMap(c => c.reels)
  const compThemes = getThemeRows(allCompReels)

  return CONTENT_THEMES.map(theme => {
    const mine = myThemes.find(t => t.theme === theme)
    const comp = compThemes.find(t => t.theme === theme)
    const yourStrength = mine?.posts ?? 0
    const competitorStrength = comp?.posts ?? 0
    const gap = competitorStrength - yourStrength
    const priority: 'high' | 'medium' | 'low' = gap > 5 ? 'high' : gap > 2 ? 'medium' : 'low'
    const opportunity = gap > 3
      ? `Competitors post ${gap} more ${theme} reels — high chance to capture that audience`
      : yourStrength > competitorStrength
        ? `You lead here — maintain ${theme} content to stay ahead`
        : `Moderate opportunity in ${theme} content`
    return { theme, yourStrength, competitorStrength, opportunity, priority }
  }).sort((a, b) => (b.competitorStrength - b.yourStrength) - (a.competitorStrength - a.yourStrength))
}

export function computeRecommendations(
  me: AccountMetrics,
  competitors: AccountMetrics[],
  gaps: ContentGap[],
): Recommendation[] {
  const recs: Recommendation[] = []
  const best = competitors.reduce((b, c) => c.growthScore > b.growthScore ? c : b, competitors[0])

  if (me.postsPerWeek < best.postsPerWeek * 0.7) {
    recs.push({ priority: 'high', title: 'Increase posting frequency', description: `You post ~${me.postsPerWeek.toFixed(1)}×/week. ${best.username} posts ~${best.postsPerWeek.toFixed(1)}×/week and dominates the feed.`, impact: `+${Math.round((best.postsPerWeek - me.postsPerWeek) * 10)}% reach` })
  }

  const topGap = gaps.find(g => g.priority === 'high')
  if (topGap) {
    recs.push({ priority: 'high', title: `Create ${topGap.theme} content`, description: `Top competitors use ${topGap.theme} heavily (${topGap.competitorStrength} posts vs your ${topGap.yourStrength}). This is your biggest gap.`, impact: '+20–40% avg views' })
  }

  if (me.engagementRate < best.engagementRate * 0.8) {
    recs.push({ priority: 'high', title: 'Add stronger CTAs', description: `${best.username}'s engagement rate is ${best.engagementRate.toFixed(1)}% vs your ${me.engagementRate.toFixed(1)}%. Try "Comment your answer below" or "Save this for later".`, impact: `+${Math.round(best.engagementRate - me.engagementRate)}% engagement` })
  }

  recs.push({ priority: 'medium', title: `Use ${best.topHookType} hooks more`, description: `Top creator @${best.username} wins with ${best.topHookType} hooks. Try opening with a bold question or number hook.`, impact: '+15% watch time' })

  const bestHour = best.bestHour
  if (Math.abs(me.bestHour - bestHour) > 3) {
    const hLabel = bestHour > 12 ? `${bestHour - 12}PM` : `${bestHour}AM`
    recs.push({ priority: 'medium', title: `Post around ${hLabel}`, description: `Your top competitors get peak views around ${hLabel}. Shift your posting window to align with audience activity.`, impact: '+10–25% views/reel' })
  }

  const medGap = gaps.find(g => g.priority === 'medium')
  if (medGap) {
    recs.push({ priority: 'medium', title: `Explore ${medGap.theme} reels`, description: medGap.opportunity, impact: '+10% reach' })
  }

  recs.push({ priority: 'low', title: 'Optimise hashtag strategy', description: 'Use a mix of niche (<50K posts) and mid-tier hashtags (50K–500K) for discovery without getting buried.', impact: '+5–15% organic reach' })

  recs.push({ priority: 'low', title: 'Write longer captions', description: 'Captions above 100 words signal high value to the algorithm and increase save rates.', impact: '+8% saves' })

  return recs
}

export function computeGrowthForecast(me: AccountMetrics): ForecastPoint[] {
  const baseViews = me.avgViews
  const weeks = 8
  const currentGrowthRate = 1.02
  const projectedGrowthRate = 1.06
  return Array.from({ length: weeks }, (_, i) => ({
    week: `Wk ${i + 1}`,
    current: Math.round(baseViews * Math.pow(currentGrowthRate, i)),
    projected: Math.round(baseViews * Math.pow(projectedGrowthRate, i)),
  }))
}

export function computeContentPlan(me: AccountMetrics, gaps: ContentGap[]): PlanDay[] {
  const hookCycle = ['Question', 'Bold Statement', 'How-To', 'Number List', 'Curiosity Gap', 'Mistake']
  const priorityThemes = [
    ...gaps.filter(g => g.priority === 'high').map(g => g.theme),
    ...gaps.filter(g => g.priority === 'medium').map(g => g.theme),
    me.topTheme,
  ]
  const formats = ['Reel', 'Reel', 'Reel', 'Carousel', 'Reel']
  return Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    theme: priorityThemes[i % priorityThemes.length] ?? 'Tips & Tricks',
    hook: hookCycle[i % hookCycle.length],
    format: formats[i % formats.length],
  }))
}
