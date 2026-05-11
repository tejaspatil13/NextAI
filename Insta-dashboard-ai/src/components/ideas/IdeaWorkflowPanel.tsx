'use client'
import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, ArrowLeft, RotateCcw } from 'lucide-react'
import type { WorkflowIdea, Language } from '@/lib/ideas-types'
import clsx from 'clsx'

const LANGS: { key: Language; label: string }[] = [
  { key: 'en', label: 'English' },
  { key: 'hi', label: 'Hindi' },
  { key: 'hinglish', label: 'HI-EN' },
]

function cycle(v: number, max: number, d: 1 | -1) { return (v + d + max) % max }

// ─── Arrow pair + "Try Different" button ─────────────────────────────────────
function SectionNav({
  index, total, diffLabel, accentClass, onPrev, onNext,
}: {
  index: number; total: number; diffLabel: string
  accentClass: string; onPrev: () => void; onNext: () => void
}) {
  return (
    <div className="flex items-center gap-2 mt-4">
      <button onClick={onPrev} className="w-8 h-8 rounded-lg bg-[#1c1c1c] hover:bg-[#222] flex items-center justify-center transition-colors flex-shrink-0">
        <ChevronLeft className="w-4 h-4 text-[#a8a8a8]" />
      </button>
      <button
        onClick={onNext}
        className={clsx('flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border transition-colors', accentClass)}
      >
        <RotateCcw className="w-3 h-3" /> {diffLabel}
      </button>
      <button onClick={onNext} className="w-8 h-8 rounded-lg bg-[#1c1c1c] hover:bg-[#222] flex items-center justify-center transition-colors flex-shrink-0">
        <ChevronRight className="w-4 h-4 text-[#a8a8a8]" />
      </button>
      <span className="text-[10px] text-[#444] tabular-nums flex-shrink-0">{index + 1}/{total}</span>
    </div>
  )
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function WorkflowCard({ stripe, label, labelColor, children }: {
  stripe: string; label: string; labelColor: string; children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-[#262626] bg-[#111]/50 overflow-hidden flex flex-col">
      <div className={clsx('h-[3px]', stripe)} />
      <div className="p-5 flex flex-col flex-1">
        <p className={clsx('text-[10px] font-bold uppercase tracking-widest mb-4', labelColor)}>{label}</p>
        {children}
      </div>
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────
interface Props { title: string; ideas: WorkflowIdea[]; onClose: () => void }

export default function IdeaWorkflowPanel({ title, ideas, onClose }: Props) {
  const [ideaIndices, setIdeaIndices] = useState([0, 1, 2])
  const [selected, setSelected] = useState<WorkflowIdea | null>(null)
  const [hookIdx, setHookIdx] = useState(0)
  const [lang, setLang] = useState<Language>('en')
  const [scriptIdx, setScriptIdx] = useState(0)
  const [tagIdx, setTagIdx] = useState(0)
  const [musicIdx, setMusicIdx] = useState(0)

  const visibleIdeas = ideaIndices.map(i => ideas[i % ideas.length])

  const moreIdea = (pos: number) => {
    setIdeaIndices(prev => {
      const used = new Set(prev.filter((_, j) => j !== pos))
      let next = (prev[pos] + 1) % ideas.length
      while (used.has(next) && used.size < ideas.length - 1) next = (next + 1) % ideas.length
      return prev.map((idx, j) => (j === pos ? next : idx))
    })
  }

  const selectIdea = (idea: WorkflowIdea) => {
    setSelected(idea); setHookIdx(0); setLang('en'); setScriptIdx(0); setTagIdx(0); setMusicIdx(0)
  }

  const scripts = selected?.scripts[lang] ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-[#0a0a0a] rounded-2xl border border-[#262626] shadow-2xl flex flex-col max-h-[90vh] z-10">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] flex-shrink-0">
          {selected ? (
            <button onClick={() => setSelected(null)} className="flex items-center gap-2.5 text-[#a8a8a8] hover:text-white transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <div>
                <p className="text-[10px] text-[#555] uppercase tracking-wider">{title}</p>
                <p className="text-sm font-bold text-white leading-tight line-clamp-1">{selected.title}</p>
              </div>
            </button>
          ) : (
            <div>
              <p className="text-base font-bold text-white">{title} — Ideas</p>
              <p className="text-xs text-[#555] mt-0.5">Pick an idea · swap any you don&apos;t like</p>
            </div>
          )}
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#1c1c1c] hover:bg-[#222] flex items-center justify-center transition-colors ml-3 flex-shrink-0">
            <X className="w-4 h-4 text-[#a8a8a8]" />
          </button>
        </div>

        {/* ── IDEAS LIST ─────────────────────────────────────────────────── */}
        {!selected && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {visibleIdeas.map((idea, pos) => (
                <div key={`${pos}-${idea.id}`} className="rounded-2xl border border-[#262626] bg-[#111]/50 flex flex-col overflow-hidden hover:border-violet-500/40 hover:bg-[#111]/80 transition-all duration-200">
                  <div className="h-[3px] bg-gradient-to-r from-violet-500 to-indigo-500" />
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">Idea {pos + 1}</span>
                      <span className="w-6 h-6 rounded-full bg-violet-500/15 text-white text-xs font-bold flex items-center justify-center">{pos + 1}</span>
                    </div>
                    <p className="text-sm font-bold text-white leading-snug mb-2">{idea.title}</p>
                    <p className="text-xs text-[#555] leading-relaxed mb-4">{idea.coreAngle}</p>
                    <div className="rounded-lg bg-[#1c1c1c]/60 border border-[#262626]/50 px-3 py-2.5 mb-5 flex-1">
                      <p className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-1">Hook preview</p>
                      <p className="text-xs text-[#e0e0e0] italic leading-relaxed line-clamp-3">"{idea.hooks[0]}"</p>
                    </div>
                    <div className="space-y-2 mt-auto">
                      <button onClick={() => selectIdea(idea)} className="w-full text-xs font-bold ig-gradient-bg hover:opacity-90 text-white py-2.5 rounded-xl transition-colors">
                        Work on This →
                      </button>
                      <button onClick={() => moreIdea(pos)} className="w-full flex items-center justify-center gap-1.5 text-xs text-[#555] hover:text-[#e0e0e0] bg-[#1c1c1c]/80 hover:bg-[#222] border border-[#262626] py-2 rounded-xl transition-colors">
                        <RotateCcw className="w-3 h-3" /> Suggest Different
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── WORKFLOW ──────────────────────────────────────────────────── */}
        {selected && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* HOOK */}
              <WorkflowCard stripe="bg-gradient-to-r from-indigo-500 to-violet-500" label="Hook · First 3 seconds" labelColor="text-white">
                <div className="flex-1 bg-[#1c1c1c]/60 border border-[#262626]/50 rounded-xl p-4 mb-1 min-h-[80px] flex items-start">
                  <p className="text-sm text-white italic leading-relaxed">"{selected.hooks[hookIdx]}"</p>
                </div>
                <SectionNav
                  index={hookIdx} total={selected.hooks.length}
                  diffLabel="Try Different Hook"
                  accentClass="text-white bg-[#833AB4]/10 hover:bg-[#833AB4]/20 border-[#833AB4]/25"
                  onPrev={() => setHookIdx(h => cycle(h, selected.hooks.length, -1))}
                  onNext={() => setHookIdx(h => cycle(h, selected.hooks.length, 1))}
                />
              </WorkflowCard>

              {/* SCRIPT */}
              <WorkflowCard stripe="bg-gradient-to-r from-blue-500 to-cyan-500" label="Script" labelColor="text-blue-400">
                {/* Language tabs */}
                <div className="flex items-center gap-1 bg-[#1c1c1c] rounded-lg p-1 mb-3 w-full">
                  {LANGS.map(l => (
                    <button
                      key={l.key}
                      onClick={() => { setLang(l.key); setScriptIdx(0) }}
                      className={clsx(
                        'flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors',
                        lang === l.key ? 'bg-blue-600 text-white' : 'text-[#555] hover:text-[#e0e0e0]'
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
                <div className="flex-1 bg-[#1c1c1c]/60 border border-[#262626]/50 rounded-xl p-4 mb-1 min-h-[100px] overflow-y-auto max-h-[160px]">
                  <p className="text-xs text-[#e0e0e0] leading-relaxed whitespace-pre-line">{scripts[scriptIdx]}</p>
                </div>
                <SectionNav
                  index={scriptIdx} total={scripts.length}
                  diffLabel="Try Different Script"
                  accentClass="text-[#a8a8a8] bg-[#1c1c1c] hover:bg-[#262626] hover:text-white border-[#262626]"
                  onPrev={() => setScriptIdx(s => cycle(s, scripts.length, -1))}
                  onNext={() => setScriptIdx(s => cycle(s, scripts.length, 1))}
                />
              </WorkflowCard>

              {/* TAGS */}
              <WorkflowCard stripe="bg-gradient-to-r from-teal-500 to-emerald-500" label="Tags" labelColor="text-teal-400">
                <div className="flex-1 bg-[#1c1c1c]/60 border border-[#262626]/50 rounded-xl p-4 mb-1 min-h-[80px]">
                  <div className="flex flex-wrap gap-2">
                    {selected.tagSets[tagIdx].map(tag => (
                      <span key={tag} className="text-xs text-teal-300 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <SectionNav
                  index={tagIdx} total={selected.tagSets.length}
                  diffLabel="Try Different Tags"
                  accentClass="text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border-teal-500/25"
                  onPrev={() => setTagIdx(t => cycle(t, selected.tagSets.length, -1))}
                  onNext={() => setTagIdx(t => cycle(t, selected.tagSets.length, 1))}
                />
              </WorkflowCard>

              {/* MUSIC */}
              <WorkflowCard stripe="bg-gradient-to-r from-fuchsia-500 to-pink-500" label="Music" labelColor="text-fuchsia-400">
                <div className="flex-1 bg-[#1c1c1c]/60 border border-[#262626]/50 rounded-xl p-4 mb-1 min-h-[80px] space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-white leading-tight">{selected.music[musicIdx].name}</p>
                    <span className="text-[10px] font-semibold text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
                      {selected.music[musicIdx].vibe}
                    </span>
                  </div>
                  <p className="text-xs text-[#a8a8a8] leading-relaxed">{selected.music[musicIdx].howToUse}</p>
                </div>
                <SectionNav
                  index={musicIdx} total={selected.music.length}
                  diffLabel="Try Different Track"
                  accentClass="text-fuchsia-400 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border-fuchsia-500/25"
                  onPrev={() => setMusicIdx(m => cycle(m, selected.music.length, -1))}
                  onNext={() => setMusicIdx(m => cycle(m, selected.music.length, 1))}
                />
              </WorkflowCard>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}
