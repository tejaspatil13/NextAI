'use client'
import { useState, useEffect } from 'react'
import {
  Sparkles, RotateCcw, Loader2, Lock, AlertCircle,
  ChevronLeft, ChevronRight, ArrowLeft, Bookmark,
} from 'lucide-react'
import clsx from 'clsx'
import type { Reel } from '@/lib/types'
import type { CompetitorGapIdea, Language, LockedContent } from '@/lib/ideas-types'
import type { AccountMetrics, ContentGap } from './analytics'
import { computeGaps, getHookRows, getDaySlots, DAYS } from './analytics'

type Step = 'ideas' | 'hook' | 'script'
type LockAnim = 'idle' | 'locking' | 'locked'

const LANGS: { key: Language; label: string; flag: string }[] = [
  { key: 'en',       label: 'English',  flag: '🇬🇧' },
  { key: 'hi',       label: 'हिंदी',    flag: '🇮🇳' },
  { key: 'hinglish', label: 'Hinglish', flag: '🌐' },
]
const LANG_LABELS: Record<Language, string> = { en: 'English', hi: 'हिंदी', hinglish: 'Hinglish' }

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[#1c1c1c] bg-[#0d0d0d] overflow-hidden animate-pulse">
      <div className="h-[3px] ig-gradient-bg opacity-20" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-24 rounded-full bg-white/5" />
          <div className="h-5 w-16 rounded-full bg-white/5" />
        </div>
        <div className="h-4 w-3/4 rounded bg-white/5" />
        <div className="h-3 w-full rounded bg-white/5" />
        <div className="h-3 w-5/6 rounded bg-white/5" />
        <div className="h-14 w-full rounded-xl bg-white/5" />
        <div className="h-8 w-full rounded-xl bg-white/5 mt-2" />
        <div className="h-7 w-full rounded-xl bg-white/5" />
      </div>
    </div>
  )
}

interface Props {
  accounts: AccountMetrics[]
  myReels: Reel[]
  competitorReels: Record<string, Reel[]>
  onLock?: (c: LockedContent) => void
}

export default function CompareIdeasSection({ accounts, myReels, competitorReels, onLock }: Props) {
  const me = accounts.find(a => a.isMe)
  const comps = accounts.filter(a => !a.isMe)

  const [step, setStep] = useState<Step>('ideas')
  const [ideasLoading, setIdeasLoading] = useState(false)
  const [ideasError, setIdeasError] = useState<string | null>(null)
  const [ideas, setIdeas] = useState<CompetitorGapIdea[]>([])
  const [displayedIdx, setDisplayedIdx] = useState<[number, number, number]>([0, 1, 2])
  const [refreshingSlots, setRefreshingSlots] = useState<Set<number>>(new Set())
  const [fetched, setFetched] = useState(false)

  const [selectedIdea, setSelectedIdea] = useState<CompetitorGapIdea | null>(null)
  const [hookLoading, setHookLoading] = useState(false)
  const [hookError, setHookError] = useState<string | null>(null)
  const [hookPool, setHookPool] = useState<string[]>([])
  const [poolIdx, setPoolIdx] = useState(0)
  const [hookFetching, setHookFetching] = useState(false)
  const [lockAnim, setLockAnim] = useState<LockAnim>('idle')
  const [selectedHook, setSelectedHook] = useState('')

  const [language, setLanguage] = useState<Language | null>(null)
  const [scriptLoading, setScriptLoading] = useState(false)
  const [scriptError, setScriptError] = useState<string | null>(null)
  const [script, setScript] = useState('')
  const [saved, setSaved] = useState(false)

  // Lock animation chain
  useEffect(() => {
    if (lockAnim !== 'locking') return
    const t = setTimeout(() => setLockAnim('locked'), 600)
    return () => clearTimeout(t)
  }, [lockAnim])
  useEffect(() => {
    if (lockAnim !== 'locked') return
    const t = setTimeout(() => {
      setSelectedHook(hookPool[poolIdx] ?? '')
      setStep('script')
      setLockAnim('idle')
    }, 700)
    return () => clearTimeout(t)
  }, [lockAnim, hookPool, poolIdx])

  if (!me || comps.length === 0) return null

  // Build request payload from analytics
  function buildPayload(count: number, excludeTitles: string[]) {
    const gaps = computeGaps(me!, comps)
    const allHooks = getHookRows(comps.flatMap(c => c.reels))
    const winningHooks = [...allHooks].sort((a, b) => b.avgViews - a.avgViews).slice(0, 3).map(h => h.type)
    const daySlots = getDaySlots(comps.flatMap(c => c.reels))
    const bestDay = DAYS[daySlots.reduce((b, d) => d.avgViews > b.avgViews ? d : b, daySlots[0])?.day ?? 0]

    return {
      myProfile: {
        username: me!.username,
        avgViews: me!.avgViews,
        engagementRate: me!.engagementRate,
        postsPerWeek: me!.postsPerWeek,
        growthScore: me!.growthScore,
        topTheme: me!.topTheme,
        topHookType: me!.topHookType,
        bestHour: me!.bestHour,
        bestDay,
      },
      competitors: comps.map(c => ({
        username: c.username,
        avgViews: c.avgViews,
        growthScore: c.growthScore,
        topTheme: c.topTheme,
        topHookType: c.topHookType,
        bestHour: c.bestHour,
      })),
      gaps: gaps.map(g => ({ theme: g.theme, yourStrength: g.yourStrength, competitorStrength: g.competitorStrength, priority: g.priority })),
      winningThemes: [comps[0]?.topTheme, comps[1]?.topTheme].filter(Boolean) as string[],
      winningHooks,
      recommendations: [
        `Post more ${gaps[0]?.theme ?? 'Educational'} content`,
        `Use ${winningHooks[0] ?? 'Question'} hooks`,
        `Post on ${bestDay} for highest reach`,
      ],
      count,
      excludeTitles,
    }
  }

  const fetchIdeas = async () => {
    setIdeasLoading(true)
    setIdeasError(null)
    setFetched(true)
    try {
      const res = await fetch('/api/compare-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(3, [])),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      setIdeas(json.ideas)
      const n = json.ideas.length
      setDisplayedIdx([0, Math.min(1, n - 1), Math.min(2, n - 1)])
    } catch (e: unknown) {
      setIdeasError(e instanceof Error ? e.message : String(e))
    } finally {
      setIdeasLoading(false)
    }
  }

  const refreshSlot = async (pos: number) => {
    if (refreshingSlots.has(pos)) return
    setRefreshingSlots(prev => { const s = new Set(prev); s.add(pos); return s })
    try {
      const seenTitles = ideas.map(i => i.title)
      const res = await fetch('/api/compare-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(1, seenTitles)),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      const newIdea: CompetitorGapIdea = json.ideas?.[0]
      if (newIdea) {
        setIdeas(prev => {
          const updated = [...prev]
          updated[displayedIdx[pos]] = newIdea
          return updated
        })
      }
    } catch { /* keep existing */ }
    finally {
      setRefreshingSlots(prev => { const s = new Set(prev); s.delete(pos); return s })
    }
  }

  const creatorStyle = myReels.find(r => r.transcript)?.transcript?.slice(0, 150) ?? 'energetic creator voice'

  const selectIdea = async (idea: CompetitorGapIdea) => {
    setSelectedIdea(idea)
    setHookPool([])
    setPoolIdx(0)
    setHookError(null)
    setLockAnim('idle')
    setStep('hook')
    setHookLoading(true)
    try {
      const res = await fetch('/api/generate-hook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, creatorStyle }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      setHookPool(json.hooks ?? [])
      setPoolIdx(0)
    } catch (e: unknown) {
      setHookError(e instanceof Error ? e.message : String(e))
    } finally {
      setHookLoading(false)
    }
  }

  const fetchNextHooks = async (idea: CompetitorGapIdea) => {
    setHookFetching(true)
    try {
      const res = await fetch('/api/generate-hook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, creatorStyle }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      const newHooks: string[] = json.hooks ?? []
      if (newHooks.length > 0) {
        setHookPool(prev => {
          const updated = [...prev, ...newHooks]
          setPoolIdx(updated.length - newHooks.length)
          return updated
        })
      }
    } catch { /* keep current */ }
    finally { setHookFetching(false) }
  }

  const goNextHook = () => {
    if (!selectedIdea) return
    if (poolIdx < hookPool.length - 1) setPoolIdx(p => p + 1)
    else fetchNextHooks(selectedIdea)
  }

  const goPrevHook = () => { if (poolIdx > 0) setPoolIdx(p => p - 1) }

  const generateScript = async (lang: Language) => {
    setScriptLoading(true)
    setScriptError(null)
    setScript('')
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: selectedIdea, hook: selectedHook, language: lang }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      setScript(json.script)
    } catch (e: unknown) {
      setScriptError(e instanceof Error ? e.message : String(e))
    } finally {
      setScriptLoading(false)
    }
  }

  const goBack = () => {
    if (step === 'script') { setStep('hook'); setScript(''); setLanguage(null) }
    else if (step === 'hook') { setStep('ideas'); setSelectedIdea(null) }
  }

  const isLocking = lockAnim === 'locking' || lockAnim === 'locked'

  const stepLabels = { ideas: 'Ideas', hook: 'Craft Hook', script: 'Script' }
  const visibleIdeas = displayedIdx.map(i => ideas[i]).filter(Boolean)

  return (
    <section id="compare-ideas">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl ig-gradient-bg flex items-center justify-center shadow-lg shadow-[#833AB4]/30 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">AI-Powered Content Ideas</h2>
            <p className="text-xs text-white/40">Generated from your full competitor comparison — gap-first, data-driven</p>
          </div>
        </div>

        {/* Step indicator */}
        {fetched && (
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-xl px-3 py-1.5">
            {(['ideas', 'hook', 'script'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={clsx('w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold', step === s ? 'ig-gradient-bg text-white' : step > s ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/25')}>
                  {i + 1}
                </div>
                <span className={clsx('text-[10px] font-semibold', step === s ? 'text-white' : 'text-white/30')}>{stepLabels[s]}</span>
                {i < 2 && <span className="text-white/15 text-xs">›</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0a1f] via-[#0a0a18] to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#FD1D1D]/3 to-[#FCAF45]/5" />
        <div className="absolute top-0 left-0 right-0 h-[1.5px] ig-gradient-bg" />
        <div className="absolute -top-12 -left-12 w-56 h-56 rounded-full bg-[#833AB4]/12 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-[#FCAF45]/8 blur-3xl pointer-events-none" />

        <div className="relative p-6">

          {/* ── Pre-fetch state ── */}
          {!fetched && (
            <div className="flex flex-col items-center gap-5 py-10 text-center">
              <div className="w-14 h-14 rounded-2xl ig-gradient-bg flex items-center justify-center shadow-xl shadow-[#833AB4]/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-base font-extrabold text-white mb-1.5 tracking-tight">Competitor-Powered Idea Engine</p>
                <p className="text-xs text-white/40 max-w-sm leading-relaxed">
                  Analyses your comparison data — gaps, hook performance, viral patterns — and generates ideas you can act on immediately.
                </p>
              </div>
              <button
                onClick={fetchIdeas}
                className="ig-gradient-bg text-white font-extrabold text-sm px-6 py-3 rounded-xl shadow-lg shadow-[#833AB4]/30 hover:opacity-90 transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Ideas from Comparison
              </button>
            </div>
          )}

          {/* ── Step 1: Ideas ── */}
          {fetched && step === 'ideas' && (
            <>
              {ideasError && (
                <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/25 text-rose-300 rounded-xl p-4 text-sm mb-4">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {ideasError}
                  <button onClick={fetchIdeas} className="ml-auto text-rose-400 hover:text-white font-semibold text-xs">Retry</button>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {ideasLoading
                  ? [0, 1, 2].map(i => <SkeletonCard key={i} />)
                  : visibleIdeas.map((idea, pos) => (
                    <div
                      key={`${pos}-${idea.id}`}
                      className="rounded-2xl border border-[#1c1c1c] bg-[#0d0d0d] flex flex-col overflow-hidden hover:border-violet-500/40 transition-all duration-200 group"
                    >
                      <div className="h-[3px] ig-gradient-bg" />
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-400/10 border border-rose-400/20 px-2 py-0.5 rounded-full truncate max-w-[100px]">
                            {idea.competitorName}
                          </span>
                          <span className={clsx(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                            idea.estimatedImpact === 'high'
                              ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                              : 'text-white/40 bg-white/5 border-white/10'
                          )}>
                            {idea.estimatedImpact === 'high' ? 'HIGH IMPACT' : 'MED IMPACT'}
                          </span>
                        </div>

                        <p className="text-sm font-bold text-white leading-snug mb-3">{idea.title}</p>

                        <div className="mb-2">
                          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider mb-1">Gap / Weakness</p>
                          <p className="text-xs text-white/55 leading-relaxed">{idea.theirWeakness}</p>
                        </div>

                        <div className="rounded-lg bg-emerald-500/8 border border-emerald-500/20 px-3 py-2.5 mb-3">
                          <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">Your Angle</p>
                          <p className="text-xs text-white/80 leading-relaxed">{idea.yourAngle}</p>
                        </div>

                        <p className="text-[10px] text-white/30 italic leading-relaxed mb-4 flex-1">
                          Hook direction: {idea.hookDirection}
                        </p>

                        <div className="space-y-2 mt-auto">
                          <button
                            onClick={() => selectIdea(idea)}
                            className="w-full text-xs font-bold ig-gradient-bg hover:opacity-90 text-white py-2.5 rounded-xl transition-all"
                          >
                            Work on This →
                          </button>
                          <button
                            onClick={() => refreshSlot(pos)}
                            disabled={refreshingSlots.has(pos)}
                            className="w-full flex items-center justify-center gap-1.5 text-xs text-white/30 hover:text-white bg-white/3 hover:bg-white/6 border border-white/6 py-2 rounded-xl transition-colors disabled:opacity-50"
                          >
                            {refreshingSlots.has(pos)
                              ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating…</>
                              : <><RotateCcw className="w-3 h-3" /> Suggest Different ↻</>
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </>
          )}

          {/* ── Step 2: Hook ── */}
          {fetched && step === 'hook' && (
            <div className="max-w-lg mx-auto">
              {/* Back + idea title */}
              <div className="flex items-center gap-3 mb-5">
                <button onClick={goBack} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/8 flex items-center justify-center transition-colors">
                  <ArrowLeft className="w-4 h-4 text-white/50" />
                </button>
                {selectedIdea && (
                  <div>
                    <p className="text-xs text-white/40">Hook for:</p>
                    <p className="text-sm font-bold text-white leading-tight">{selectedIdea.title}</p>
                  </div>
                )}
              </div>

              {hookLoading && (
                <div className="space-y-3 animate-pulse">
                  <div className="h-3 w-32 rounded bg-white/5" />
                  <div className="h-24 w-full rounded-xl bg-white/5" />
                  <div className="h-10 w-full rounded-xl bg-white/5" />
                </div>
              )}

              {hookError && !hookLoading && (
                <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/25 text-rose-300 rounded-xl p-4 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{hookError}
                </div>
              )}

              {!hookLoading && hookPool.length > 0 && (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Choose your hook</p>

                  {/* Hook display */}
                  <div className={clsx(
                    'relative rounded-xl p-5 transition-all duration-300',
                    isLocking
                      ? 'border border-green-500/60 bg-green-500/5 shadow-xl shadow-green-500/10'
                      : 'border border-white/8 bg-white/3'
                  )}>
                    {isLocking && (
                      <div className={clsx('absolute top-3 right-3 transition-all', lockAnim === 'locked' ? 'scale-125' : 'scale-100')}>
                        <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center', lockAnim === 'locked' ? 'bg-green-500 shadow-green-500/50 shadow-lg' : 'bg-green-500/20 animate-pulse')}>
                          <Lock className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-white italic leading-relaxed pr-8">&ldquo;{hookPool[poolIdx]}&rdquo;</p>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center gap-2">
                    <button onClick={goPrevHook} disabled={isLocking || poolIdx === 0}
                      className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/8 flex items-center justify-center transition-colors disabled:opacity-30 flex-shrink-0">
                      <ChevronLeft className="w-4 h-4 text-white/50" />
                    </button>
                    <button onClick={goNextHook} disabled={isLocking || hookFetching}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border text-white/70 bg-[#833AB4]/10 hover:bg-[#833AB4]/20 border-[#833AB4]/25 transition-colors disabled:opacity-50">
                      {hookFetching
                        ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating…</>
                        : <><RotateCcw className="w-3 h-3" /> New Hook</>
                      }
                    </button>
                    <button onClick={goNextHook} disabled={isLocking || hookFetching}
                      className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/8 flex items-center justify-center transition-colors disabled:opacity-30 flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-white/50" />
                    </button>
                    <span className="text-[10px] text-white/25 tabular-nums flex-shrink-0">{poolIdx + 1}/{hookPool.length}</span>
                  </div>

                  <button
                    onClick={() => setLockAnim('locking')}
                    disabled={isLocking || hookFetching}
                    className={clsx(
                      'w-full py-3 rounded-xl font-extrabold text-sm transition-all duration-300',
                      lockAnim === 'locked' ? 'bg-green-600 text-white' : 'ig-gradient-bg hover:opacity-90 text-white disabled:opacity-60'
                    )}
                  >
                    {lockAnim === 'locked' ? 'Hook Locked ✓' : 'Set This Hook'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Script ── */}
          {fetched && step === 'script' && (
            <div className="max-w-lg mx-auto">
              <div className="flex items-center gap-3 mb-5">
                <button onClick={goBack} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/8 flex items-center justify-center transition-colors">
                  <ArrowLeft className="w-4 h-4 text-white/50" />
                </button>
                <p className="text-xs text-white/40">Hook locked · choose language · generate</p>
              </div>

              {/* Locked hook */}
              <div className="rounded-xl border border-green-500/40 bg-green-500/5 p-4 flex items-start gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lock className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-1">Locked Hook</p>
                  <p className="text-xs text-white/80 italic leading-relaxed">&ldquo;{selectedHook}&rdquo;</p>
                </div>
              </div>

              {language === null ? (
                <div>
                  <p className="text-sm font-semibold text-white mb-3">Choose script language</p>
                  <div className="grid grid-cols-3 gap-3">
                    {LANGS.map(l => (
                      <button key={l.key} onClick={() => { setLanguage(l.key); }}
                        className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-white/3 border border-white/8 hover:border-[#833AB4]/50 hover:bg-[#833AB4]/8 transition-all group">
                        <span className="text-2xl">{l.flag}</span>
                        <span className="text-xs font-semibold text-white/60 group-hover:text-white transition-colors">{l.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {LANG_LABELS[language]}
                    </span>
                    <button onClick={() => { setLanguage(null); setScript('') }}
                      className="text-xs text-white/30 hover:text-white/60 transition-colors">
                      Change language
                    </button>
                  </div>

                  {!script && !scriptLoading && !scriptError && (
                    <button onClick={() => generateScript(language)}
                      className="w-full py-3 rounded-xl ig-gradient-bg hover:opacity-90 text-white font-extrabold text-sm transition-all shadow-lg shadow-[#833AB4]/20">
                      Generate Script
                    </button>
                  )}

                  {scriptLoading && (
                    <div className="flex items-center justify-center gap-2 py-10 text-white/30">
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span className="text-xs">Writing your script…</span>
                    </div>
                  )}

                  {scriptError && !scriptLoading && (
                    <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/25 text-rose-300 rounded-xl p-4 text-sm">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{scriptError}
                    </div>
                  )}

                  {script && !scriptLoading && (
                    <>
                      <div className="bg-white/3 border border-white/8 rounded-xl p-4 max-h-[280px] overflow-y-auto">
                        <p className="text-xs text-white/80 leading-relaxed whitespace-pre-line">{script}</p>
                      </div>
                      <button onClick={() => generateScript(language)}
                        className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl border text-white/40 bg-white/3 hover:bg-white/6 hover:text-white border-white/8 transition-colors">
                        <RotateCcw className="w-3 h-3" /> Try Different Script
                      </button>
                      {onLock && selectedIdea && (
                        <button
                          onClick={() => { setSaved(true); onLock({ idea: selectedIdea, hook: selectedHook, script, language, lockedAt: new Date().toISOString() }) }}
                          disabled={saved}
                          className={clsx(
                            'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-sm transition-all',
                            saved ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 cursor-default' : 'ig-gradient-bg hover:opacity-90 text-white'
                          )}
                        >
                          <Bookmark className="w-4 h-4" />
                          {saved ? 'Saved to Taskbar ✓' : 'Lock & Save to Taskbar'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </section>
  )
}
