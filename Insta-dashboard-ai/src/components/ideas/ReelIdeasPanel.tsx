'use client'
import { useState, useEffect } from 'react'
import { X, ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, Loader2, Lock, AlertCircle, Bookmark, Clapperboard } from 'lucide-react'
import clsx from 'clsx'
import type { Reel } from '@/lib/types'
import type { CompetitorGapIdea, Language, LockedContent } from '@/lib/ideas-types'

type View = 'ideas' | 'hook' | 'script'
type HookAnimation = 'idle' | 'locking' | 'locked'

const LANGS: { key: Language; label: string; flag: string }[] = [
  { key: 'en', label: 'English', flag: '🇬🇧' },
  { key: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { key: 'hinglish', label: 'Hinglish', flag: '🌐' },
]
const LANG_LABELS: Record<Language, string> = { en: 'English', hi: 'हिंदी', hinglish: 'Hinglish' }

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[#262626] bg-[#111]/50 overflow-hidden animate-pulse">
      <div className="h-[3px] bg-[#222]" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2"><div className="h-5 w-28 rounded-full bg-[#1c1c1c]" /><div className="h-5 w-16 rounded-full bg-[#1c1c1c]" /></div>
        <div className="h-4 w-3/4 rounded bg-[#1c1c1c]" />
        <div className="h-3 w-full rounded bg-[#1c1c1c]" />
        <div className="h-14 w-full rounded-xl bg-[#1c1c1c]" />
        <div className="h-8 w-full rounded-xl bg-[#1c1c1c] mt-2" />
        <div className="h-7 w-full rounded-xl bg-[#1c1c1c]" />
      </div>
    </div>
  )
}

interface Props {
  myReels: Reel[]
  onClose: () => void
  onLock?: (content: LockedContent) => void
}

export default function ReelIdeasPanel({ myReels, onClose, onLock }: Props) {
  const [view, setView] = useState<View>('ideas')
  const [ideasLoading, setIdeasLoading] = useState(true)
  const [ideasError, setIdeasError] = useState<string | null>(null)
  const [ideas, setIdeas] = useState<CompetitorGapIdea[]>([])
  const [displayedIndices, setDisplayedIndices] = useState<[number, number, number]>([0, 1, 2])
  const [refreshingSlots, setRefreshingSlots] = useState<Set<number>>(new Set())

  const [selectedIdea, setSelectedIdea] = useState<CompetitorGapIdea | null>(null)
  const [hookLoading, setHookLoading] = useState(false)
  const [hookError, setHookError] = useState<string | null>(null)
  const [hooks, setHooks] = useState<string[]>([])
  const [hookIdx, setHookIdx] = useState(0)
  const [hookAnimation, setHookAnimation] = useState<HookAnimation>('idle')

  const [selectedHook, setSelectedHook] = useState('')
  const [language, setLanguage] = useState<Language | null>(null)
  const [scriptLoading, setScriptLoading] = useState(false)
  const [scriptError, setScriptError] = useState<string | null>(null)
  const [script, setScript] = useState('')
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    async function fetchIdeas() {
      try {
        const res = await fetch('/api/reel-ideas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ myReels }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Failed to generate ideas')
        setIdeas(json.ideas)
        const count = json.ideas.length
        setDisplayedIndices([0, Math.min(1, count - 1), Math.min(2, count - 1)])
      } catch (e: unknown) {
        setIdeasError(e instanceof Error ? e.message : String(e))
      } finally {
        setIdeasLoading(false)
      }
    }
    fetchIdeas()
  }, [])

  useEffect(() => {
    if (hookAnimation !== 'locking') return
    const t = setTimeout(() => setHookAnimation('locked'), 600)
    return () => clearTimeout(t)
  }, [hookAnimation])

  useEffect(() => {
    if (hookAnimation !== 'locked') return
    const t = setTimeout(() => {
      setSelectedHook(hooks[hookIdx])
      setView('script')
      setHookAnimation('idle')
    }, 700)
    return () => clearTimeout(t)
  }, [hookAnimation, hooks, hookIdx])

  const creatorStyle = (() => {
    const w = myReels.find(r => r.transcript)
    return w?.transcript?.slice(0, 150) ?? 'energetic creator voice'
  })()

  const selectIdea = async (idea: CompetitorGapIdea) => {
    setSelectedIdea(idea)
    setHookIdx(0); setHooks([]); setHookError(null); setHookAnimation('idle')
    setView('hook'); setHookLoading(true)
    try {
      const res = await fetch('/api/generate-hook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, creatorStyle }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to generate hook')
      setHooks(json.hooks)
    } catch (e: unknown) {
      setHookError(e instanceof Error ? e.message : String(e))
    } finally {
      setHookLoading(false)
    }
  }

  const generateScript = async (lang: Language) => {
    setScriptLoading(true); setScriptError(null); setScript('')
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: selectedIdea, hook: selectedHook, language: lang }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to generate script')
      setScript(json.script)
    } catch (e: unknown) {
      setScriptError(e instanceof Error ? e.message : String(e))
    } finally {
      setScriptLoading(false)
    }
  }

  const refreshIdea = async (pos: number) => {
    if (refreshingSlots.has(pos)) return
    setRefreshingSlots(prev => { const s = new Set(prev); s.add(pos); return s })
    const targetIdx = displayedIndices[pos]
    try {
      const res = await fetch('/api/reel-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ myReels, count: 1, excludeTitles: ideas.map(i => i.title) }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      const newIdea: CompetitorGapIdea = json.ideas?.[0]
      if (newIdea) setIdeas(prev => { const u = [...prev]; u[targetIdx] = newIdea; return u })
    } catch { /* keep existing */ }
    finally { setRefreshingSlots(prev => { const s = new Set(prev); s.delete(pos); return s }) }
  }

  const cycle = (v: number, max: number, d: 1 | -1) => (v + d + max) % max
  const isAnimating = hookAnimation === 'locking' || hookAnimation === 'locked'
  const visibleIdeas = displayedIndices.map(i => ideas[i])

  const goBack = () => {
    if (view === 'script') { setView('hook'); setScript(''); setLanguage(null) }
    else if (view === 'hook') { setView('ideas'); setSelectedIdea(null) }
  }

  const headerTitle = view === 'ideas' ? 'Reel Ideas' : view === 'hook' ? 'Craft Your Hook' : 'Generate Script'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-[#0a0a0a] rounded-2xl border border-[#262626] shadow-2xl flex flex-col max-h-[90vh] z-10">

        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] flex-shrink-0">
          <div className="flex items-center gap-3">
            {view !== 'ideas' && (
              <button onClick={goBack} className="w-8 h-8 rounded-lg bg-[#1c1c1c] hover:bg-[#222] flex items-center justify-center transition-colors group">
                <ArrowLeft className="w-4 h-4 text-[#a8a8a8] group-hover:-translate-x-0.5 transition-transform" />
              </button>
            )}
            <div>
              <p className="text-base font-bold text-white">{headerTitle}</p>
              {view === 'ideas' && <p className="text-xs text-[#555] mt-0.5">Ideas built entirely from your proven content patterns</p>}
              {view === 'hook' && selectedIdea && (
                <p className="text-xs text-[#555] mt-0.5 flex items-center gap-1.5">
                  <Clapperboard className="w-3 h-3 text-blue-400" />
                  <span className="text-blue-400 font-medium">{selectedIdea.competitorName}</span>
                  <span>·</span>
                  <span className="line-clamp-1">{selectedIdea.title}</span>
                </p>
              )}
              {view === 'script' && <p className="text-xs text-[#555] mt-0.5">Hook locked · choose language · generate</p>}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#1c1c1c] hover:bg-[#222] flex items-center justify-center transition-colors ml-3 flex-shrink-0">
            <X className="w-4 h-4 text-[#a8a8a8]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">

          {/* IDEAS */}
          {view === 'ideas' && (
            <>
              {ideasError && (
                <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/25 text-rose-300 rounded-xl p-4 text-sm mb-4">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{ideasError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {ideasLoading
                  ? [0, 1, 2].map(i => <SkeletonCard key={i} />)
                  : visibleIdeas.map((idea, pos) => idea && (
                    <div key={`${pos}-${idea.id}`} className="rounded-2xl border border-[#262626] bg-[#111]/50 flex flex-col overflow-hidden hover:border-blue-500/40 hover:bg-[#111]/80 transition-all duration-200">
                      <div className="h-[3px] bg-gradient-to-r from-blue-500 to-cyan-500" />
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-full">
                            {idea.competitorName}
                          </span>
                          <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border',
                            idea.estimatedImpact === 'high'
                              ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                              : 'text-[#a8a8a8] bg-[#222]/40 border-[#333]/30'
                          )}>
                            {idea.estimatedImpact === 'high' ? 'HIGH IMPACT' : 'MEDIUM'}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-white leading-snug mb-3">{idea.title}</p>
                        <div className="mb-2">
                          <p className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-1">Gap in your library</p>
                          <p className="text-xs text-[#a8a8a8] leading-relaxed">{idea.theirWeakness}</p>
                        </div>
                        <div className="rounded-lg bg-emerald-500/8 border border-emerald-500/20 px-3 py-2.5 mb-3">
                          <p className="text-[10px] font-semibold text-white uppercase tracking-wider mb-1">Your angle</p>
                          <p className="text-xs text-white/80 leading-relaxed">{idea.yourAngle}</p>
                        </div>
                        <p className="text-[10px] text-[#555] italic leading-relaxed mb-4 flex-1">Hook direction: {idea.hookDirection}</p>
                        <div className="space-y-2 mt-auto">
                          <button onClick={() => selectIdea(idea)} className="w-full text-xs font-bold ig-gradient-bg hover:opacity-90 text-white py-2.5 rounded-xl transition-colors">
                            Work on This →
                          </button>
                          <button onClick={() => refreshIdea(pos)} disabled={refreshingSlots.has(pos)}
                            className="w-full flex items-center justify-center gap-1.5 text-xs text-[#555] hover:text-[#e0e0e0] bg-[#1c1c1c]/80 hover:bg-[#222] border border-[#262626] py-2 rounded-xl transition-colors disabled:opacity-60">
                            {refreshingSlots.has(pos) ? <><Loader2 className="w-3 h-3 animate-spin" />Generating…</> : <><RotateCcw className="w-3 h-3" />Suggest Different</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </>
          )}

          {/* HOOK */}
          {view === 'hook' && (
            <div className="max-w-lg mx-auto flex flex-col gap-4">
              {hookLoading && <div className="flex flex-col gap-3 animate-pulse"><div className="h-3 w-48 rounded bg-[#1c1c1c]" /><div className="h-24 w-full rounded-xl bg-[#1c1c1c]" /><div className="h-10 w-full rounded-xl bg-[#1c1c1c]" /><div className="h-10 w-full rounded-xl bg-[#1c1c1c]" /></div>}
              {hookError && !hookLoading && <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/25 text-rose-300 rounded-xl p-4 text-sm"><AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{hookError}</div>}
              {!hookLoading && hooks.length > 0 && (
                <>
                  <div className={clsx('relative rounded-xl p-5 transition-all duration-300 bg-[#1c1c1c]/60', isAnimating ? 'border border-green-500/60 shadow-green-500/10 shadow-xl' : 'border border-[#262626]/50')}>
                    {isAnimating && (
                      <div className={clsx('absolute top-3 right-3 transition-all duration-300', hookAnimation === 'locked' ? 'scale-125' : 'scale-100')}>
                        <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center', hookAnimation === 'locked' ? 'bg-green-500 shadow-green-500/50 shadow-lg' : 'bg-green-500/20 animate-pulse')}>
                          <Lock className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-white italic leading-relaxed pr-8">&ldquo;{hooks[hookIdx]}&rdquo;</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setHookIdx(h => cycle(h, hooks.length, -1))} disabled={isAnimating} className="w-9 h-9 rounded-lg bg-[#1c1c1c] hover:bg-[#222] flex items-center justify-center transition-colors disabled:opacity-40 flex-shrink-0"><ChevronLeft className="w-4 h-4 text-[#a8a8a8]" /></button>
                    <button onClick={() => setHookIdx(h => cycle(h, hooks.length, 1))} disabled={isAnimating} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border text-white bg-[#833AB4]/10 hover:bg-[#833AB4]/20 border-[#833AB4]/25 transition-colors disabled:opacity-40"><RotateCcw className="w-3 h-3" />Change Hook</button>
                    <button onClick={() => setHookIdx(h => cycle(h, hooks.length, 1))} disabled={isAnimating} className="w-9 h-9 rounded-lg bg-[#1c1c1c] hover:bg-[#222] flex items-center justify-center transition-colors disabled:opacity-40 flex-shrink-0"><ChevronRight className="w-4 h-4 text-[#a8a8a8]" /></button>
                    <span className="text-[10px] text-[#444] tabular-nums flex-shrink-0">{hookIdx + 1}/{hooks.length}</span>
                  </div>
                  <button onClick={() => setHookAnimation('locking')} disabled={isAnimating} className={clsx('w-full py-3 rounded-xl font-bold text-sm transition-all duration-300', hookAnimation === 'locked' ? 'bg-green-600 text-white' : 'ig-gradient-bg hover:opacity-90 text-white disabled:opacity-60')}>
                    {hookAnimation === 'locked' ? 'Hook Locked ✓' : 'Set This Hook'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* SCRIPT */}
          {view === 'script' && (
            <div className="max-w-lg mx-auto flex flex-col gap-4">
              <div className="rounded-xl border border-green-500/40 bg-green-500/5 p-4 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5"><Lock className="w-3 h-3 text-white" /></div>
                <div><p className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-1">Locked Hook</p><p className="text-xs text-[#e0e0e0] italic leading-relaxed">&ldquo;{selectedHook}&rdquo;</p></div>
              </div>
              {language === null ? (
                <div>
                  <p className="text-sm font-semibold text-white mb-3">Choose script language</p>
                  <div className="grid grid-cols-3 gap-3">
                    {LANGS.map(l => (
                      <button key={l.key} onClick={() => setLanguage(l.key)} className="flex flex-col items-center gap-2 py-4 rounded-2xl ig-hover-btn bg-[#111] border border-[#262626] hover:border-[#833AB4]/50 transition-all duration-200 group">
                        <span className="text-2xl">{l.flag}</span>
                        <span className="text-xs font-semibold text-[#e0e0e0] group-hover:text-white transition-colors">{l.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">{LANG_LABELS[language]}</span>
                    <button onClick={() => { setLanguage(null); setScript('') }} className="text-xs text-[#555] hover:text-[#e0e0e0] transition-colors">Change language</button>
                  </div>
                  {!script && !scriptLoading && !scriptError && (
                    <button onClick={() => generateScript(language)} className="w-full py-3 rounded-xl ig-gradient-bg hover:opacity-90 text-white font-bold text-sm transition-all shadow-lg shadow-[#833AB4]/20">Generate Script</button>
                  )}
                  {scriptLoading && <div className="flex items-center justify-center gap-2 py-10 text-[#555]"><Loader2 className="w-4 h-4 animate-spin text-blue-400" /><span className="text-xs">Writing your script…</span></div>}
                  {scriptError && !scriptLoading && <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/25 text-rose-300 rounded-xl p-4 text-sm"><AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{scriptError}</div>}
                  {script && !scriptLoading && (
                    <>
                      <div className="bg-[#1c1c1c]/60 border border-[#262626]/50 rounded-xl p-4 max-h-[280px] overflow-y-auto">
                        <p className="text-xs text-[#e0e0e0] leading-relaxed whitespace-pre-line">{script}</p>
                      </div>
                      <button onClick={() => generateScript(language)} className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl border text-[#a8a8a8] bg-[#1c1c1c] hover:bg-[#262626] hover:text-white border-[#262626] transition-colors">
                        <RotateCcw className="w-3 h-3" />Try Different Script
                      </button>
                      {onLock && (
                        <button onClick={() => { if (!selectedIdea) return; setLocked(true); onLock({ idea: selectedIdea, hook: selectedHook, script, language, lockedAt: new Date().toISOString() }) }}
                          disabled={locked}
                          className={clsx('w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200', locked ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 cursor-default' : 'ig-gradient-bg hover:opacity-90 text-white')}>
                          <Bookmark className="w-4 h-4" />{locked ? 'Saved to Taskbar ✓' : 'Lock & Save to Taskbar'}
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
    </div>
  )
}
