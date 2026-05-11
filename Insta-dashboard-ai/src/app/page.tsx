'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Reel } from '@/lib/types'
import ReelCard from '@/components/ReelCard'
import MetricsOverview from '@/components/MetricsOverview'
import PerformanceChart from '@/components/PerformanceChart'
import ScrapeProgress from '@/components/ScrapeProgress'
import CompetitorSection from '@/components/CompetitorSection'
import ComparisonView from '@/components/ComparisonView'
import LockedContentDrawer from '@/components/LockedContentDrawer'
import AIUsageBar from '@/components/AIUsageBar'
import HeadlineInsight from '@/components/ideas/HeadlineInsight'
import TrendingTopics from '@/components/ideas/TrendingTopics'
import WhatsWorking from '@/components/ideas/WhatsWorking'
import WhatToAvoid from '@/components/ideas/WhatToAvoid'
import CompetitorInsights from '@/components/ideas/CompetitorInsights'
import ReelIdeas from '@/components/ideas/ReelIdeas'
import BestTimeToPost from '@/components/ideas/BestTimeToPost'
import ContentSeries from '@/components/ideas/ContentSeries'
import IdeaChatSection from '@/components/ideas/IdeaChatSection'
import type { LockedContent } from '@/lib/ideas-types'
import {
  RefreshCw, LayoutDashboard, Users2, Lightbulb, AlertCircle,
  Loader2, Sparkles, Filter, Plus, X, Clock, GitCompare, Bookmark,
  Medal,
} from 'lucide-react'
import clsx from 'clsx'

type Tab = 'mine' | 'competitors' | 'compare' | 'ideas'
type ScrapeState = 'idle' | 'starting' | 'done' | 'error'
type PerfFilter = 'all' | 'top' | 'mid' | 'low'

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(Math.round(n))
}

function urlToUsername(url: string) {
  return url.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '')
}

function inputToUrl(raw: string) {
  const trimmed = raw.trim()
  if (trimmed.startsWith('http')) return trimmed.endsWith('/') ? trimmed : trimmed + '/'
  const username = trimmed.replace('@', '').toLowerCase()
  return `https://www.instagram.com/${username}/`
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function startAndWait(
  instagramUrl: string,
  limit: number,
  onStatus: (s: ScrapeState) => void,
): Promise<Reel[]> {
  onStatus('starting')

  const startRes = await fetch('/api/start-scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instagramUrl, limit }),
  })
  if (!startRes.ok) {
    const err = await startRes.json()
    throw new Error(err.error ?? 'Failed to start scrape')
  }
  const job = await startRes.json() as { runId: string; datasetId: string }

  // Poll every 6 s, up to 5 minutes
  for (let i = 0; i < 50; i++) {
    await new Promise(r => setTimeout(r, 6000))
    const statusRes = await fetch(`/api/scrape-status?runId=${job.runId}`)
    if (!statusRes.ok) continue
    const { status } = await statusRes.json() as { status: string }
    if (status === 'SUCCEEDED') break
    if (status === 'FAILED' || status === 'ABORTED') throw new Error(`Scrape job ${status.toLowerCase()}`)
  }

  const resultsRes = await fetch(`/api/scrape-results?datasetId=${job.datasetId}&limit=${limit}`)
  if (!resultsRes.ok) {
    const err = await resultsRes.json()
    throw new Error(err.error ?? 'Failed to fetch results')
  }
  const { reels } = await resultsRes.json()
  return reels as Reel[]
}

async function saveCache(key: string, data: unknown) {
  await fetch('/api/cache', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, data }),
  })
}

async function loadCache<T>(key: string): Promise<T | null> {
  const res = await fetch(`/api/cache?key=${key}`)
  const { data } = await res.json()
  return data as T | null
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const SCRAPE_MSG: Record<ScrapeState, string> = {
  idle: '', starting: 'Fetching Instagram reels…', done: '', error: '',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>('mine')

  // My reels
  const [cacheLoading, setCacheLoading] = useState(true)
  const [myUrl, setMyUrl] = useState('https://www.instagram.com/_desi.dudes_/')
  const [myUrlInput, setMyUrlInput] = useState('')
  const [myReels, setMyReels] = useState<Reel[]>([])
  const [myLastSynced, setMyLastSynced] = useState<string | null>(null)
  const [myScrapeState, setMyScrapeState] = useState<ScrapeState>('idle')
  const [myError, setMyError] = useState('')
  const [perfFilter, setPerfFilter] = useState<PerfFilter>('all')
  const [transcribingId, setTranscribingId] = useState<string | null>(null)

  // Competitors
  const [competitors, setCompetitors] = useState<Record<string, Reel[]>>({})
  const [compLastSynced, setCompLastSynced] = useState<Record<string, string>>({})
  const [scrapingUsernames, setScrapingUsernames] = useState<Set<string>>(new Set())
  const [compErrors, setCompErrors] = useState<Record<string, string>>({})
  const [newUsername, setNewUsername] = useState('')

  // Locked content taskbar
  const [lockedItems, setLockedItems] = useState<LockedContent[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLock = (content: LockedContent) => {
    setLockedItems(prev => [...prev, content])
    setDrawerOpen(true)
  }

  // ─── Load cache on mount ──────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      loadCache<{ reels: Reel[]; fetchedAt?: string; url?: string }>('my_reels'),
      loadCache<{ accounts: Record<string, { reels: Reel[]; fetchedAt: string }> }>('competitors'),
    ]).then(([myCache, compCache]) => {
      if (myCache?.reels?.length) {
        setMyReels(myCache.reels)
        setMyLastSynced(myCache.fetchedAt ?? null)
        if (myCache.url) setMyUrl(myCache.url)
        setMyScrapeState('done')
      }
      if (compCache?.accounts) {
        const reels: Record<string, Reel[]> = {}
        const synced: Record<string, string> = {}
        for (const [u, v] of Object.entries(compCache.accounts)) {
          reels[u] = v.reels
          synced[u] = v.fetchedAt
        }
        setCompetitors(reels)
        setCompLastSynced(synced)
      }
      setCacheLoading(false)
    })
  }, [])

  // ─── Fetch my reels ───────────────────────────────────────────────────────
  const applyMyUrl = useCallback(() => {
    const raw = myUrlInput.trim()
    if (!raw) return
    const url = inputToUrl(raw)
    setMyUrl(url)
    setMyUrlInput('')
    setMyReels([])
    setMyScrapeState('idle')
    setMyLastSynced(null)
  }, [myUrlInput])

  const fetchMyReels = useCallback(async () => {
    setMyError('')
    try {
      const reels = await startAndWait(myUrl, 30, setMyScrapeState)
      const now = new Date().toISOString()
      setMyReels(reels)
      setMyLastSynced(now)
      setMyScrapeState('done')
      await saveCache('my_reels', { reels, fetchedAt: now, url: myUrl })
    } catch (e: unknown) {
      setMyError(e instanceof Error ? e.message : String(e))
      setMyScrapeState('error')
    }
  }, [myUrl])

  // ─── Fetch a single competitor ────────────────────────────────────────────
  const fetchCompetitor = useCallback(async (username: string) => {
    const url = `https://www.instagram.com/${username}/`
    setScrapingUsernames((prev) => new Set(Array.from(prev).concat(username)))
    setCompErrors((prev) => { const n = { ...prev }; delete n[username]; return n })
    try {
      const reels = await startAndWait(url, 15, () => {})
      const now = new Date().toISOString()
      setCompetitors((prev) => {
        const updated = { ...prev, [username]: reels }
        // save all to cache
        const accounts: Record<string, { reels: Reel[]; fetchedAt: string }> = {}
        for (const [u, r] of Object.entries(updated)) {
          accounts[u] = { reels: r, fetchedAt: compLastSynced[u] ?? now }
        }
        accounts[username] = { reels, fetchedAt: now }
        saveCache('competitors', { accounts })
        return updated
      })
      setCompLastSynced((prev) => ({ ...prev, [username]: now }))
    } catch (e: unknown) {
      setCompErrors((prev) => ({ ...prev, [username]: e instanceof Error ? e.message : String(e) }))
    } finally {
      setScrapingUsernames((prev) => { const n = new Set(Array.from(prev)); n.delete(username); return n })
    }
  }, [compLastSynced])

  const addCompetitor = useCallback(() => {
    const clean = newUsername.replace('@', '').trim().toLowerCase()
    if (!clean) return
    setNewUsername('')
    if (!competitors[clean]) fetchCompetitor(clean)
  }, [newUsername, competitors, fetchCompetitor])

  const removeCompetitor = useCallback((username: string) => {
    setCompetitors((prev) => {
      const updated = { ...prev }
      delete updated[username]
      const accounts: Record<string, { reels: Reel[]; fetchedAt: string }> = {}
      for (const [u, r] of Object.entries(updated)) {
        accounts[u] = { reels: r, fetchedAt: compLastSynced[u] ?? '' }
      }
      saveCache('competitors', { accounts })
      return updated
    })
    setCompLastSynced((prev) => { const n = { ...prev }; delete n[username]; return n })
  }, [compLastSynced])

  // ─── Transcribe ───────────────────────────────────────────────────────────
  const handleTranscribe = useCallback(async (reel: Reel) => {
    if (!reel.audioUrl) return
    setTranscribingId(reel.id)
    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl: reel.audioUrl }),
      })
      const data = await res.json()
      if (data.transcript) {
        setMyReels((prev) => {
          const updated = prev.map((r) => r.id === reel.id ? { ...r, transcript: data.transcript } : r)
          saveCache('my_reels', { reels: updated, fetchedAt: myLastSynced })
          return updated
        })
      }
    } finally {
      setTranscribingId(null)
    }
  }, [myLastSynced])

  const filteredReels = perfFilter === 'all' ? myReels : myReels.filter((r) => r.performance === perfFilter)
  const competitorUsernames = Object.keys(competitors)

  // ─── Tab nav ──────────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: React.ReactNode; activeIcon: React.ReactNode }[] = [
    { id: 'mine',        label: 'My Reels',     icon: <LayoutDashboard className="w-6 h-6" />,  activeIcon: <LayoutDashboard className="w-6 h-6 stroke-[2.5]" /> },
    { id: 'competitors', label: 'Competitors',  icon: <Users2 className="w-6 h-6" />,           activeIcon: <Users2 className="w-6 h-6 stroke-[2.5]" /> },
    { id: 'compare',     label: 'Compare',      icon: <GitCompare className="w-6 h-6" />,       activeIcon: <GitCompare className="w-6 h-6 stroke-[2.5]" /> },
    { id: 'ideas',       label: 'Content Ideas', icon: <Lightbulb className="w-6 h-6" />,       activeIcon: <Lightbulb className="w-6 h-6 stroke-[2.5]" /> },
  ]

  return (
    <main className="flex min-h-screen bg-black">

      {/* ── Left Sidebar (Instagram style) ────────────────────────────────── */}
      <aside className="fixed left-0 top-0 h-full w-[72px] xl:w-[244px] flex flex-col border-r border-[#262626] bg-black z-20 py-5 px-3 transition-all duration-300">

        {/* Logo */}
        <div className="mb-8 px-2 flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 flex-shrink-0 rounded-xl ig-gradient-bg flex items-center justify-center shadow-lg shadow-[#833AB4]/30">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="hidden xl:block overflow-hidden">
            <p className="text-white font-extrabold text-sm tracking-tight leading-none">Content</p>
            <p className="text-[#a8a8a8] text-xs">Dashboard</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 flex-1">
          {tabs.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={clsx(
                  'relative flex items-center gap-4 w-full px-3 py-3 rounded-xl transition-all duration-150 text-left group',
                  active ? 'text-white' : 'text-[#a8a8a8] hover:text-white hover:bg-[#1a1a1a]',
                )}
              >
                {/* gradient pill on active */}
                {active && <span className="absolute inset-0 rounded-xl ig-gradient-bg opacity-15" />}
                <span className={clsx('relative flex-shrink-0 transition-transform duration-150', active ? 'scale-110' : 'group-hover:scale-105')}>
                  {active ? t.activeIcon : t.icon}
                </span>
                <span className={clsx('relative hidden xl:block text-[15px] truncate', active ? 'font-bold' : 'font-normal')}>
                  {t.label}
                </span>
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 ig-gradient-bg rounded-r-full" />}
              </button>
            )
          })}
        </nav>

        {/* Bottom: AI usage bar */}
        <div className="mt-4 flex flex-col gap-3">
          <div className="hidden xl:block">
            <AIUsageBar />
          </div>
          {/* Username */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[#1a1a1a] cursor-default transition-colors overflow-hidden">
            <div className="w-8 h-8 flex-shrink-0 rounded-full ig-gradient-bg flex items-center justify-center text-white text-xs font-bold">
              {urlToUsername(myUrl).slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden xl:block overflow-hidden">
              <p className="text-white text-xs font-semibold truncate">@{urlToUsername(myUrl)}</p>
              <p className="text-[#555] text-[10px]">Your profile</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content area ──────────────────────────────────────────────── */}
      <div className="flex-1 ml-[72px] xl:ml-[244px] min-h-screen">

        {/* Locked content drawer */}
        {drawerOpen && lockedItems.length > 0 && (
          <LockedContentDrawer items={lockedItems} onClose={() => setDrawerOpen(false)} />
        )}

        {/* Floating taskbar button */}
        {lockedItems.length > 0 && !drawerOpen && (
          <button
            onClick={() => setDrawerOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 ig-gradient-bg text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl shadow-[#833AB4]/30 transition-all duration-200 hover:scale-105 hover:opacity-90"
          >
            <Bookmark className="w-4 h-4" />
            <span className="hidden sm:inline">Locked Ideas</span>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">{lockedItems.length}</span>
          </button>
        )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ══ MY REELS ══════════════════════════════════════════════════════════ */}
        {tab === 'mine' && (
          <div>
            <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">
                  <span className="ig-gradient-text">My Reels</span>
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[#555] text-sm">Last 30 days · <span className="text-[#a8a8a8]">@{urlToUsername(myUrl)}</span></p>
                  {myLastSynced && (
                    <span className="flex items-center gap-1 text-xs text-[#444]">
                      <Clock className="w-3 h-3" /> {timeAgo(myLastSynced)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 bg-[#1c1c1c] border border-[#262626] rounded-xl px-3 py-1.5">
                  <span className="text-[#555] text-xs">@</span>
                  <input
                    type="text"
                    value={myUrlInput}
                    onChange={(e) => setMyUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyMyUrl()}
                    placeholder={urlToUsername(myUrl)}
                    className="bg-transparent text-white text-sm w-40 focus:outline-none placeholder:text-[#444]"
                  />
                  <button
                    onClick={applyMyUrl}
                    disabled={!myUrlInput.trim()}
                    className="text-xs text-white hover:text-[#a8a8a8] font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Set
                  </button>
                </div>
                <button
                  onClick={fetchMyReels}
                  disabled={myScrapeState === 'starting'}
                  className="flex items-center gap-2 text-white font-bold text-sm px-5 py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ig-gradient-bg hover:opacity-90 shadow-lg shadow-[#833AB4]/20"
                >
                  <RefreshCw className={clsx('w-4 h-4', myScrapeState === 'starting' && 'animate-spin')} />
                  {myLastSynced ? 'Re-sync' : 'Fetch Reels'}
                </button>
              </div>
            </div>

            {myScrapeState === 'error' && (
              <div className="flex items-start gap-3 bg-rose-500/8 border border-rose-500/20 text-rose-300 rounded-2xl p-4 mb-6 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{myError}</span>
              </div>
            )}

            {myScrapeState === 'starting' && (
              <ScrapeProgress message={SCRAPE_MSG['starting']} subtext="Fetching your Instagram reels…" />
            )}

            {myReels.length > 0 && myScrapeState !== 'starting' && (
              <>
                <MetricsOverview reels={myReels} />
                <PerformanceChart reels={myReels} />
                <div className="flex items-center gap-2 mb-5">
                  <Filter className="w-4 h-4 text-[#555]" />
                  {(['all', 'top', 'mid', 'low'] as PerfFilter[]).map((f) => {
                    const count = f === 'all' ? myReels.length : myReels.filter((r) => r.performance === f).length
                    const active = perfFilter === f
                    return (
                      <button
                        key={f}
                        onClick={() => setPerfFilter(f)}
                        className={clsx(
                          'text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 font-medium',
                          active
                            ? f === 'top' ? 'bg-[#833AB4]/20 border-[#833AB4]/40 text-white'
                              : f === 'low' ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                              : f === 'mid' ? 'bg-white/10 border-white/20 text-white'
                              : 'bg-white/10 border-white/20 text-white'
                            : 'border-[#262626] text-[#555] hover:border-[#333] hover:text-[#a8a8a8]',
                        )}
                      >
                        {f === 'all' ? 'All' : f === 'top' ? '🔥 Top' : f === 'mid' ? 'Average' : 'Low'} ({count})
                      </button>
                    )
                  })}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredReels.map((reel, i) => (
                    <ReelCard key={reel.id} reel={reel} index={i} onTranscribe={handleTranscribe} transcribing={transcribingId === reel.id} />
                  ))}
                </div>
                {filteredReels.length === 0 && (
                  <p className="text-[#555] text-sm text-center py-12">No reels match this filter.</p>
                )}
              </>
            )}

            {myScrapeState === 'idle' && myReels.length === 0 && (
              cacheLoading ? (
                <div className="flex items-center justify-center py-24 gap-3 text-[#555]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading saved data…</span>
                </div>
              ) : (
                <div className="text-center py-24 border border-dashed border-white/8 rounded-2xl glass">
                  <LayoutDashboard className="w-10 h-10 text-[#444] mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">No data yet</h3>
                  <p className="text-[#555] text-sm mb-6 max-w-xs mx-auto">
                    Fetch your last 30 days of reels. Results are cached locally — no re-scrape needed on refresh.
                  </p>
                  <button onClick={fetchMyReels} className="ig-gradient-bg hover:opacity-90 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-[#833AB4]/20">
                    Fetch My Reels
                  </button>
                </div>
              )
            )}
          </div>
        )}

        {/* ══ COMPETITORS ═══════════════════════════════════════════════════════ */}
        {tab === 'competitors' && (
          <div>
            {/* ── Hero card (HeadlineInsight style) ─────────────── */}
            <div className="relative rounded-2xl overflow-hidden mb-6">
              {/* Gradient layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0f0a1f] via-[#0a0a18] to-[#0a0a0a]" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#FD1D1D]/4 to-[#FCAF45]/6" />
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] ig-gradient-bg" />
              {/* Glow orbs */}
              <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#833AB4]/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full bg-[#FCAF45]/8 blur-3xl pointer-events-none" />

              {/* Header row */}
              <div className="relative p-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl ig-gradient-bg flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#833AB4]/30">
                  <Users2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-white tracking-tight">Competitors</p>
                  <p className="text-xs text-white/40">Add any Instagram username to analyse their reels</p>
                </div>
              </div>

              <div className="relative h-px bg-white/5 mx-5" />

              {/* Add competitor input */}
              <div className="relative p-5">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center">
                  <div className="relative w-full sm:max-w-xs">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm font-medium">@</span>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCompetitor()}
                      placeholder="username"
                      className="w-full bg-white/5 border border-white/10 text-white rounded-2xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-[#833AB4]/60 placeholder:text-white/20 transition-colors"
                    />
                  </div>
                  <button
                    onClick={addCompetitor}
                    disabled={!newUsername.trim()}
                    className="relative flex items-center justify-center gap-2.5 ig-gradient-bg hover:opacity-90 text-white font-bold text-sm px-7 py-3 rounded-2xl transition-all shadow-xl shadow-[#833AB4]/30 hover:scale-105 hover:shadow-[#833AB4]/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Plus className="w-4 h-4" /> Add &amp; Scrape
                  </button>
                </div>

                {/* Empty state hint */}
                {competitorUsernames.length === 0 && scrapingUsernames.size === 0 && (
                  <p className="text-center text-xs text-white/20 mt-4">
                    Try <span className="text-white/50 font-medium">nateherk</span> or <span className="text-white/50 font-medium">nick_saraev</span>
                  </p>
                )}
              </div>
            </div>

            {/* In-progress scrapes */}
            {Array.from(scrapingUsernames).map((username) => (
              <div key={username} className="mb-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                  <span className="text-sm text-white font-medium">Scraping @{username}…</span>
                  <span className="text-xs text-[#555]">Apify is fetching their reels (1–3 min)</span>
                </div>
              </div>
            ))}

            {/* Comparison leaderboard (2+ competitors) */}
            {competitorUsernames.length >= 2 && (
              <div className="relative mb-6 rounded-2xl overflow-hidden animate-fade-slide-up border border-white/5">
                {/* Gradient bg */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f0a1f] via-[#0a0a18] to-[#0a0a0a]" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#FD1D1D]/3 to-[#FCAF45]/5" />
                <div className="absolute top-0 left-0 right-0 h-[1.5px] ig-gradient-bg" />
                <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#FCAF45]/8 blur-3xl pointer-events-none" />

                <div className="relative px-5 py-4 border-b border-white/5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl ig-gradient-bg flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#833AB4]/30">
                    <Medal className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white tracking-tight">Competitor Ranking</h3>
                    <p className="text-xs text-white/30 mt-0.5">Sorted by average views per reel</p>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="relative space-y-2">
                    {competitorUsernames
                      .map(username => {
                        const reels = competitors[username] ?? []
                        const avgViews = reels.length > 0 ? reels.reduce((s, r) => s + r.views, 0) / reels.length : 0
                        const avgEng = reels.length > 0
                          ? reels.reduce((s, r) => s + (r.views > 0 ? (r.likes + r.comments) / r.views : 0), 0) / reels.length * 100
                          : 0
                        const topCount = reels.filter(r => r.performance === 'top').length
                        return { username, avgViews, avgEng, topCount }
                      })
                      .sort((a, b) => b.avgViews - a.avgViews)
                      .map((c, rank) => (
                        <div key={c.username} className={clsx(
                          'flex items-center gap-3 rounded-xl border px-4 py-3 transition-all',
                          rank === 0 ? 'border-[#833AB4]/30 bg-[#833AB4]/8' : 'border-white/5 bg-white/3'
                        )}>
                          <div className={clsx(
                            'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0',
                            rank === 0 ? 'ig-gradient-bg text-white shadow-md shadow-[#833AB4]/20' : 'bg-white/5 text-white/30'
                          )}>
                            {rank + 1}
                          </div>
                          <span className={clsx('flex-1 font-bold text-sm truncate', rank === 0 ? 'ig-gradient-text' : 'text-white')}>
                            @{c.username}
                          </span>
                          <div className="flex items-center gap-5 flex-shrink-0">
                            <div className="text-right">
                              <div className="text-sm font-bold text-[#FCAF45]">{fmtNum(c.avgViews)}</div>
                              <div className="text-[10px] text-white/25">avg views</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-emerald-400">{c.avgEng.toFixed(1)}%</div>
                              <div className="text-[10px] text-white/25">eng.</div>
                            </div>
                            <div className="text-right hidden sm:block">
                              <div className="text-sm font-bold text-violet-400">{c.topCount}</div>
                              <div className="text-[10px] text-white/25">top</div>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}

            {/* Competitor sections */}
            {competitorUsernames.length > 0 && (
              <div className="space-y-6">
                {competitorUsernames.map((username) => (
                  <div key={username}>
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {compLastSynced[username] && (
                          <span className="flex items-center gap-1 text-xs text-[#444]">
                            <Clock className="w-3 h-3" /> {timeAgo(compLastSynced[username])}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fetchCompetitor(username)}
                          disabled={scrapingUsernames.has(username)}
                          className="flex items-center gap-1 text-xs text-[#555] hover:text-[#e0e0e0] transition-colors disabled:opacity-40"
                        >
                          <RefreshCw className={clsx('w-3 h-3', scrapingUsernames.has(username) && 'animate-spin')} />
                          Re-sync
                        </button>
                        <button
                          onClick={() => removeCompetitor(username)}
                          className="flex items-center gap-1 text-xs text-[#444] hover:text-rose-400 transition-colors"
                        >
                          <X className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                    {compErrors[username] && (
                      <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg p-3 mb-2 text-xs">
                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        {compErrors[username]}
                      </div>
                    )}
                    <CompetitorSection username={username} reels={competitors[username] ?? []} />
                  </div>
                ))}
              </div>
            )}

            {Object.keys(competitors).length > 0 && myReels.length > 0 && (
              <div className="mt-6">
                <h3 className="text-base font-semibold text-white mb-3">Competitor Gap Analysis</h3>
                <CompetitorInsights myReels={myReels} competitorReels={competitors} onLock={handleLock} />
              </div>
            )}
          </div>
        )}

        {/* ══ COMPARE ═══════════════════════════════════════════════════════════ */}
        {tab === 'compare' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold tracking-tight"><span className="ig-gradient-text">Compare</span></h2>
              <p className="text-[#555] text-sm mt-1">Me vs competitors — what&apos;s working, what&apos;s not, content gaps</p>
            </div>
            <ComparisonView myReels={myReels} competitors={competitors} onLock={handleLock} />
          </div>
        )}

        {/* ══ CONTENT IDEAS ════════════════════════════════════════════════════ */}
        {tab === 'ideas' && (
          <div>
            <div className="mb-5">
              <h2 className="text-2xl font-extrabold tracking-tight"><span className="ig-gradient-text">Content Ideas</span></h2>
              <p className="text-[#555] text-sm mt-1">Click <span className="text-white font-medium">Generate</span> on any section to get AI-powered insights on demand</p>
            </div>

            <div className="flex flex-col gap-5">
              <HeadlineInsight myReels={myReels} competitorReels={competitors} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TrendingTopics myReels={myReels} onLock={handleLock} />
                <CompetitorInsights myReels={myReels} competitorReels={competitors} onLock={handleLock} />
                <ReelIdeas myReels={myReels} onLock={handleLock} />
              </div>
              <IdeaChatSection myReels={myReels} competitorReels={competitors} onLock={handleLock} />
              <ContentSeries />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <WhatsWorking />
                <WhatToAvoid />
                <BestTimeToPost />
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </main>
  )
}
