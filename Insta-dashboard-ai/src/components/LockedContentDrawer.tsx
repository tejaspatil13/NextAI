'use client'
import { useState, useRef, useEffect } from 'react'
import { X, Lock, RotateCcw, Send, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'
import type { LockedContent } from '@/lib/ideas-types'

interface RefineMessage {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_ACTIONS = [
  { key: 'shorten', label: 'Shorten', color: 'text-sky-400 bg-sky-500/10 border-sky-500/25 hover:bg-sky-500/20' },
  { key: 'lengthen', label: 'Extend', color: 'text-white bg-violet-500/10 border-violet-500/25 hover:bg-violet-500/20' },
  { key: 'humor', label: 'Add Humor', color: 'text-amber-400 bg-amber-500/10 border-amber-500/25 hover:bg-amber-500/20' },
] as const

const LANG_LABELS: Record<string, string> = { en: 'English', hi: 'हिंदी', hinglish: 'Hinglish' }

interface Props {
  items: LockedContent[]
  onClose: () => void
}

export default function LockedContentDrawer({ items, onClose }: Props) {
  const [activeIdx, setActiveIdx] = useState(items.length - 1)
  const [scripts, setScripts] = useState<string[]>(() => items.map(i => i.script))
  const [chatHistories, setChatHistories] = useState<RefineMessage[][]>(() => items.map(() => []))
  const [inputs, setInputs] = useState<string[]>(() => items.map(() => ''))
  const [refining, setRefining] = useState(false)
  const [scriptExpanded, setScriptExpanded] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // When new items are added, extend the parallel arrays
  useEffect(() => {
    setScripts(prev => {
      if (prev.length >= items.length) return prev
      return [...prev, ...items.slice(prev.length).map(i => i.script)]
    })
    setChatHistories(prev => {
      if (prev.length >= items.length) return prev
      return [...prev, ...items.slice(prev.length).map(() => [])]
    })
    setInputs(prev => {
      if (prev.length >= items.length) return prev
      return [...prev, ...items.slice(prev.length).map(() => '')]
    })
    setActiveIdx(items.length - 1)
  }, [items.length])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistories, activeIdx])

  const active = items[activeIdx]
  const activeScript = scripts[activeIdx] ?? ''
  const activeChat = chatHistories[activeIdx] ?? []
  const activeInput = inputs[activeIdx] ?? ''

  const setInput = (val: string) =>
    setInputs(prev => prev.map((v, i) => (i === activeIdx ? val : v)))

  const pushMessage = (msg: RefineMessage) =>
    setChatHistories(prev => prev.map((h, i) => (i === activeIdx ? [...h, msg] : h)))

  const setActiveScript = (val: string) =>
    setScripts(prev => prev.map((s, i) => (i === activeIdx ? val : s)))

  const refine = async (instruction: string) => {
    if (refining || !active) return
    const label = QUICK_ACTIONS.find(a => a.key === instruction)?.label ?? instruction
    pushMessage({ role: 'user', content: label })
    setRefining(true)
    try {
      const res = await fetch('/api/refine-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: activeScript,
          hook: active.hook,
          idea: active.idea,
          instruction,
          language: active.language,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Refinement failed')
      setActiveScript(json.script)
      pushMessage({ role: 'assistant', content: 'Script updated ✓' })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      pushMessage({ role: 'assistant', content: `Error: ${msg}` })
    } finally {
      setRefining(false)
    }
  }

  const sendChat = () => {
    const trimmed = activeInput.trim()
    if (!trimmed || refining) return
    setInput('')
    refine(trimmed)
  }

  if (!active) return null

  return (
    <div className="fixed right-0 top-0 h-full w-[380px] bg-[#0a0a0a] border-l border-[#262626] z-40 flex flex-col shadow-2xl">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#262626] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Lock className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Locked Ideas</p>
            <p className="text-[11px] text-[#555]">{items.length} saved · Refine · Chat</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-[#1c1c1c] hover:bg-[#222] flex items-center justify-center transition-colors"
        >
          <X className="w-3.5 h-3.5 text-[#a8a8a8]" />
        </button>
      </div>

      {/* Idea tabs */}
      {items.length > 1 && (
        <div className="flex gap-1.5 px-4 py-2.5 border-b border-[#262626] overflow-x-auto flex-shrink-0">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => { setActiveIdx(i); setScriptExpanded(false) }}
              className={clsx(
                'flex-shrink-0 text-[10px] font-semibold px-3 py-1.5 rounded-lg border transition-colors max-w-[110px] truncate',
                activeIdx === i
                  ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-[#1c1c1c]/60 border-[#262626]/50 text-[#555] hover:text-[#e0e0e0] hover:border-[#333]'
              )}
              title={item.idea.title}
            >
              #{i + 1} {item.idea.title}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">

        {/* Idea summary */}
        <div className="px-5 pt-4 pb-3 border-b border-[#262626]">
          <p className="text-sm font-bold text-white leading-snug mb-1.5">{active.idea.title}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-rose-400 bg-rose-400/10 border border-rose-400/20 px-2 py-0.5 rounded-full">
              {active.idea.competitorName}
            </span>
            <span className="text-[10px] font-bold text-[#555] bg-[#222]/40 border border-[#333]/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {LANG_LABELS[active.language]}
            </span>
          </div>
        </div>

        {/* Hook */}
        <div className="px-5 py-3 border-b border-[#262626]">
          <p className="text-[10px] font-bold text-white uppercase tracking-wider mb-2">Locked Hook</p>
          <div className="rounded-xl border border-green-500/30 bg-green-500/5 px-3.5 py-2.5">
            <p className="text-xs text-[#e0e0e0] italic leading-relaxed">&ldquo;{active.hook}&rdquo;</p>
          </div>
        </div>

        {/* Script */}
        <div className="px-5 py-3 border-b border-[#262626]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Script</p>
            <button
              onClick={() => setScriptExpanded(v => !v)}
              className="flex items-center gap-1 text-[10px] text-[#555] hover:text-[#e0e0e0] transition-colors"
            >
              {scriptExpanded ? <><ChevronUp className="w-3 h-3" />Collapse</> : <><ChevronDown className="w-3 h-3" />Expand</>}
            </button>
          </div>
          <div className={clsx(
            'bg-[#1c1c1c]/60 border border-[#262626]/50 rounded-xl p-3.5 overflow-y-auto transition-all duration-300',
            scriptExpanded ? 'max-h-[400px]' : 'max-h-[120px]'
          )}>
            <p className="text-xs text-[#e0e0e0] leading-relaxed whitespace-pre-line">{activeScript}</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-5 py-3 border-b border-[#262626]">
          <p className="text-[10px] font-bold text-[#555] uppercase tracking-wider mb-2.5">Quick Edits</p>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_ACTIONS.map(action => (
              <button
                key={action.key}
                onClick={() => refine(action.key)}
                disabled={refining}
                className={clsx(
                  'flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl border transition-colors disabled:opacity-40',
                  action.color
                )}
              >
                {refining ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat history */}
        {activeChat.length > 0 && (
          <div className="px-5 py-3 flex flex-col gap-2">
            {activeChat.map((msg, i) => (
              <div
                key={i}
                className={clsx(
                  'text-xs rounded-xl px-3.5 py-2.5 max-w-[90%] leading-relaxed',
                  msg.role === 'user'
                    ? 'self-end bg-violet-600 text-white'
                    : msg.content.startsWith('Error')
                    ? 'self-start bg-rose-500/10 border border-rose-500/25 text-rose-300'
                    : 'self-start bg-[#1c1c1c] text-emerald-400 font-semibold'
                )}
              >
                {msg.content}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Chat input */}
      <div className="px-5 py-4 border-t border-[#262626] flex-shrink-0">
        <p className="text-[10px] text-[#555] mb-2">Describe a specific change…</p>
        <div className="flex items-end gap-2">
          <textarea
            value={activeInput}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat() } }}
            placeholder="e.g. make it more personal, add a shocking stat, change the CTA..."
            rows={2}
            className="flex-1 bg-[#1c1c1c] border border-[#262626] text-white text-xs rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-violet-500 placeholder:text-[#444] leading-relaxed"
          />
          <button
            onClick={sendChat}
            disabled={!activeInput.trim() || refining}
            className="w-9 h-9 rounded-xl ig-gradient-bg hover:opacity-90 flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {refining ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>
    </div>
  )
}
