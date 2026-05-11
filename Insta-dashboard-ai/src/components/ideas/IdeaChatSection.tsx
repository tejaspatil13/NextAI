'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Sparkles, TrendingUp, MessageCircle, Check, Lock, RotateCcw } from 'lucide-react'
import clsx from 'clsx'
import type { Reel } from '@/lib/types'
import type { ChatMessage, CompetitorGapIdea, Language, LockedContent } from '@/lib/ideas-types'

type ChatPhase = 'chat' | 'hooks' | 'lang' | 'script' | 'refine'

interface RichMessage extends ChatMessage {
  ideaCards?: CompetitorGapIdea[]
  ideaChosen?: number
  hookCards?: string[]
  hookChosen?: number
  langStep?: boolean
  langChosen?: Language
  scriptContent?: string
  scriptLoading?: boolean
}

interface Props {
  myReels: Reel[]
  competitorReels: Record<string, Reel[]>
  onLock?: (content: LockedContent) => void
}

export default function IdeaChatSection({ myReels, competitorReels, onLock }: Props) {
  const [messages, setMessages] = useState<RichMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatPhase, setChatPhase] = useState<ChatPhase>('chat')
  const [currentIdea, setCurrentIdea] = useState<CompetitorGapIdea | null>(null)
  const [hookRefreshing, setHookRefreshing] = useState(false)
  const [chosenHook, setChosenHook] = useState('')
  const [chosenLang, setChosenLang] = useState<Language | null>(null)
  const [currentScript, setCurrentScript] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const hasData = myReels.length > 0

  useEffect(() => {
    // auto-scroll disabled
  }, [])

  const creatorStyle =
    myReels.find(r => r.transcript)?.transcript?.slice(0, 150) ?? 'energetic creator voice'

  const isInputDisabled = loading || chatPhase === 'hooks' || chatPhase === 'lang' || chatPhase === 'script'

  const inputPlaceholder: Record<ChatPhase, string> = {
    chat: messages.length === 0 ? 'Describe your reel idea…' : 'Reply…',
    hooks: 'Select a hook above ↑',
    lang: 'Pick a language above ↑',
    script: 'Generating script…',
    refine: 'Ask for changes…',
  }

  const reset = () => {
    setMessages([])
    setInput('')
    setChatPhase('chat')
    setCurrentIdea(null)
    setChosenHook('')
    setChosenLang(null)
    setCurrentScript('')
  }

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || loading || isInputDisabled) return
    setInput('')

    const userMsg: RichMessage = { role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    // Refinement mode
    if (chatPhase === 'refine' && currentScript && currentIdea) {
      try {
        const res = await fetch('/api/refine-script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            script: currentScript,
            hook: chosenHook,
            idea: currentIdea,
            instruction: trimmed,
            language: chosenLang ?? 'en',
          }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Failed')
        const refined = (json.script ?? '').trim()
        setCurrentScript(refined)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Script updated ✓',
          scriptContent: refined,
        }])
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${msg}` }])
      } finally { setLoading(false) }
      return
    }

    // Idea chat mode
    try {
      const res = await fetch('/api/idea-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: trimmed,
          chatHistory: messages.map(m => ({ role: m.role, content: m.content })),
          myReels,
          competitorReels,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: json.reply,
        ideaCards: json.intent === 'ideas' && Array.isArray(json.ideas) ? json.ideas : undefined,
      }])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${msg}` }])
    }
    setLoading(false)
  }

  const selectIdeaFromChat = (idea: CompetitorGapIdea, msgIdx: number, cardIdx: number) => {
    setMessages(prev => {
      const updated = [...prev]
      if (updated[msgIdx]) updated[msgIdx] = { ...updated[msgIdx], ideaChosen: cardIdx }
      return updated
    })
    setCurrentIdea(idea)
    setChatPhase('hooks')
    generateHooks(idea)
  }

  const generateHooks = async (idea: CompetitorGapIdea) => {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Generating 3 hooks for your idea…',
      hookCards: [],
    }])
    setLoading(true)
    try {
      const res = await fetch('/api/generate-hook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, creatorStyle }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      const hooks: string[] = json.hooks ?? []
      setMessages(prev => {
        const updated = [...prev]
        let idx = -1
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].hookCards !== undefined) { idx = i; break }
        }
        if (idx !== -1) {
          updated[idx] = { role: 'assistant', content: 'Choose a hook for your reel:', hookCards: hooks }
        }
        return updated
      })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setMessages(prev => {
        const updated = [...prev]
        let idx = -1
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].hookCards !== undefined) { idx = i; break }
        }
        if (idx !== -1) updated[idx] = { role: 'assistant', content: `Couldn't generate hooks: ${msg}` }
        return updated
      })
      setChatPhase('chat')
    } finally { setLoading(false) }
  }

  const refreshHooks = async () => {
    if (!currentIdea || hookRefreshing) return
    setHookRefreshing(true)
    // Set the hook message to loading state
    setMessages(prev => {
      const updated = [...prev]
      let idx = -1
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i].hookCards !== undefined) { idx = i; break }
      }
      if (idx !== -1) updated[idx] = { ...updated[idx], hookCards: [], hookChosen: undefined }
      return updated
    })
    try {
      const res = await fetch('/api/generate-hook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: currentIdea, creatorStyle }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      const newHooks: string[] = json.hooks ?? []
      setMessages(prev => {
        const updated = [...prev]
        let idx = -1
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].hookCards !== undefined) { idx = i; break }
        }
        if (idx !== -1) updated[idx] = { ...updated[idx], content: 'Here are 3 different hooks — pick your favourite:', hookCards: newHooks, hookChosen: undefined }
        return updated
      })
    } catch { /* keep loading cleared */ }
    finally { setHookRefreshing(false) }
  }

  const handleHookSelect = (hook: string, cardIdx: number) => {
    setChosenHook(hook)
    setMessages(prev => {
      const updated = [...prev]
      let idx = -1
      for (let i = updated.length - 1; i >= 0; i--) {
        if (Array.isArray(updated[i].hookCards) && (updated[i].hookCards as string[]).length > 0) {
          idx = i; break
        }
      }
      if (idx !== -1) updated[idx] = { ...updated[idx], hookChosen: cardIdx }
      return updated
    })
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Great choice! Now pick a language for your script:',
      langStep: true,
    }])
    setChatPhase('lang')
  }

  const handleLanguageSelect = (lang: Language, hook: string, idea: CompetitorGapIdea) => {
    setChosenLang(lang)
    setMessages(prev => {
      const updated = [...prev]
      let idx = -1
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i].langStep) { idx = i; break }
      }
      if (idx !== -1) updated[idx] = { ...updated[idx], langChosen: lang }
      return updated
    })
    setChatPhase('script')
    generateScript(lang, hook, idea)
  }

  const generateScript = async (lang: Language, hook: string, idea: CompetitorGapIdea) => {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Writing your script…',
      scriptLoading: true,
    }])
    setLoading(true)
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, hook, language: lang }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      const script = (json.script ?? '').trim()
      setCurrentScript(script)
      setMessages(prev => {
        const updated = [...prev]
        let idx = -1
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].scriptLoading) { idx = i; break }
        }
        if (idx !== -1) {
          updated[idx] = {
            role: 'assistant',
            content: "Here's your script! Type any changes below.",
            scriptContent: script,
          }
        }
        return updated
      })
      setChatPhase('refine')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setMessages(prev => {
        const updated = [...prev]
        let idx = -1
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].scriptLoading) { idx = i; break }
        }
        if (idx !== -1) updated[idx] = { role: 'assistant', content: `Couldn't generate script: ${msg}` }
        return updated
      })
      setChatPhase('lang')
    } finally { setLoading(false) }
  }

  const handleLock = () => {
    if (!currentIdea || !chosenHook || !chosenLang || !currentScript || !onLock) return
    onLock({
      idea: currentIdea,
      hook: chosenHook,
      script: currentScript,
      language: chosenLang,
      lockedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="relative rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a20] via-[#100a18] to-[#0a0a0a]" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#FD1D1D]/3 to-[#FCAF45]/5" />
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#833AB4]/12 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-12 w-48 h-48 rounded-full bg-[#FD1D1D]/8 blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[1.5px] ig-gradient-bg" />

      {/* Header */}
      <div className="relative px-5 py-4 border-b border-white/[0.06] flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-full ig-gradient-bg flex items-center justify-center shadow-xl shadow-[#833AB4]/35">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-white tracking-tight">Pitch Your Idea</p>
          <p className="text-xs text-white/40">AI Content Strategist · Always active</p>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 text-white/30 hover:text-white/60 hover:border-white/20 text-[10px] transition-all"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Reset
            </button>
          )}
          <div className="flex items-center gap-1.5 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-semibold">Online</span>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="relative px-5 py-5 flex flex-col gap-3 min-h-[220px] max-h-[520px] overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-5 py-6 text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full ig-gradient-bg flex items-center justify-center shadow-2xl shadow-[#833AB4]/40">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="absolute inset-0 rounded-full ig-gradient-bg opacity-20 blur-xl scale-150" />
            </div>
            <div>
              <p className="text-base font-extrabold text-white mb-2 tracking-tight">What&apos;s your reel idea?</p>
              <p className="text-xs text-white/40 max-w-xs leading-relaxed">
                Say hi, ask anything, or drop a topic/idea. When you mention a subject I&apos;ll generate idea options — pick one to get hooks + script.
              </p>
            </div>
            {!hasData && (
              <p className="text-[11px] text-white/30 bg-white/5 border border-white/8 rounded-xl px-4 py-2">
                Fetch your reels first for a personalised estimate.
              </p>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={clsx('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full ig-gradient-bg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-[#833AB4]/30">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className="flex flex-col gap-2 max-w-[85%]">
              {/* Message bubble */}
              <div className={clsx(
                'text-xs leading-relaxed px-4 py-2.5',
                msg.role === 'user'
                  ? 'ig-gradient-bg text-white rounded-2xl rounded-br-sm shadow-lg shadow-[#833AB4]/25'
                  : 'bg-white/6 border border-white/8 text-white/85 rounded-2xl rounded-bl-sm'
              )}>
                {msg.content}
              </div>

              {/* Idea cards */}
              {msg.ideaCards && msg.ideaCards.length > 0 && (
                <div className="flex flex-col gap-2 w-full mt-1">
                  {msg.ideaCards.map((idea, cardIdx) => {
                    const isChosen = msg.ideaChosen === cardIdx
                    const anyChosen = msg.ideaChosen !== undefined
                    return (
                      <div
                        key={idea.id ?? cardIdx}
                        className={clsx(
                          'rounded-xl border p-3.5 transition-all',
                          isChosen
                            ? 'border-green-500/40 bg-green-500/8'
                            : anyChosen
                              ? 'border-white/5 bg-white/2 opacity-35'
                              : 'border-[#833AB4]/25 bg-[#833AB4]/6 hover:border-[#833AB4]/45 hover:bg-[#833AB4]/10'
                        )}
                      >
                        <p className={clsx('text-xs font-bold leading-snug mb-1', isChosen ? 'text-white' : 'text-white/85')}>
                          {isChosen && <Check className="inline w-3 h-3 mr-1.5 text-green-400 mb-0.5" />}
                          {idea.title}
                        </p>
                        <p className="text-[10px] text-white/40 leading-relaxed mb-2">{idea.yourAngle}</p>
                        {!anyChosen && (
                          <button
                            onClick={() => selectIdeaFromChat(idea, i, cardIdx)}
                            className="text-[10px] font-bold text-[#a78bfa] hover:text-white transition-colors"
                          >
                            Work on This →
                          </button>
                        )}
                        {isChosen && (
                          <span className="text-[10px] text-green-400 font-semibold">Selected — generating hooks…</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Hook cards */}
              {msg.hookCards !== undefined && (
                msg.hookCards.length === 0 ? (
                  <div className="flex items-center gap-2 px-1 py-1 text-xs text-white/40">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {hookRefreshing ? 'Getting fresh hooks…' : 'Generating hooks…'}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 w-full">
                    {msg.hookCards.map((hook, idx) => (
                      <button
                        key={idx}
                        onClick={() => msg.hookChosen === undefined && handleHookSelect(hook, idx)}
                        disabled={msg.hookChosen !== undefined}
                        className={clsx(
                          'text-left px-3.5 py-3 rounded-xl border text-xs leading-relaxed transition-all',
                          msg.hookChosen === idx
                            ? 'border-green-500/50 bg-green-500/10 text-white'
                            : msg.hookChosen !== undefined
                              ? 'border-white/5 bg-white/3 text-white/25 cursor-default'
                              : 'border-[#833AB4]/30 bg-[#833AB4]/8 text-white/80 hover:border-[#833AB4]/60 hover:bg-[#833AB4]/15 cursor-pointer'
                        )}
                      >
                        {msg.hookChosen === idx && (
                          <Check className="inline w-3 h-3 mr-1.5 text-green-400 mb-0.5" />
                        )}
                        {hook}
                      </button>
                    ))}
                    {msg.hookChosen === undefined && (
                      <button
                        onClick={refreshHooks}
                        disabled={hookRefreshing}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 text-white/40 hover:text-white/70 text-xs transition-all disabled:opacity-40"
                      >
                        {hookRefreshing
                          ? <><Loader2 className="w-3 h-3 animate-spin" /> Getting fresh hooks…</>
                          : <><RotateCcw className="w-3 h-3" /> Try Different Hooks</>
                        }
                      </button>
                    )}
                  </div>
                )
              )}

              {/* Language picker */}
              {msg.langStep && (
                <div className="flex gap-2 flex-wrap">
                  {(['en', 'hi', 'hinglish'] as Language[]).map(lang => {
                    const label = lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'Hinglish'
                    const isChosen = msg.langChosen === lang
                    const isDisabled = !!msg.langChosen
                    return (
                      <button
                        key={lang}
                        onClick={() => !isDisabled && currentIdea && handleLanguageSelect(lang, chosenHook, currentIdea)}
                        disabled={isDisabled}
                        className={clsx(
                          'px-4 py-1.5 rounded-full text-xs font-semibold border transition-all',
                          isChosen
                            ? 'ig-gradient-bg text-white border-transparent shadow-lg shadow-[#833AB4]/25'
                            : isDisabled
                              ? 'border-white/5 text-white/25 cursor-default'
                              : 'border-[#833AB4]/40 text-white/60 hover:border-[#833AB4]/70 hover:text-white/90 cursor-pointer'
                        )}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Script */}
              {(msg.scriptLoading || msg.scriptContent !== undefined) && (
                msg.scriptLoading ? (
                  <div className="flex items-center gap-2 px-1 py-1 text-xs text-white/40">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Writing script…
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/12 bg-white/4 p-3.5 text-xs text-white/75 whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
                    {msg.scriptContent}
                  </div>
                )
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator for idea-chat phase only */}
        {loading && (chatPhase === 'chat' || chatPhase === 'refine') && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full ig-gradient-bg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white/6 border border-white/8 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Lock & Save — appears once script is ready */}
      {chatPhase === 'refine' && currentScript && onLock && currentIdea && chosenLang && (
        <div className="relative px-5 pb-3">
          <button
            onClick={handleLock}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-green-500/30 bg-green-500/8 hover:bg-green-500/15 text-green-400 font-semibold text-xs transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            Lock &amp; Save to Taskbar
          </button>
        </div>
      )}

      {/* Input */}
      <div className="relative px-5 pb-5 pt-3 border-t border-white/[0.06]">
        <div className="flex items-end gap-3">
          <div className={clsx(
            'flex-1 bg-white/5 border rounded-2xl px-4 py-3 transition-colors',
            isInputDisabled
              ? 'border-white/5 opacity-50'
              : 'border-white/10 focus-within:border-[#833AB4]/60'
          )}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder={inputPlaceholder[chatPhase]}
              disabled={isInputDisabled}
              rows={1}
              className="w-full bg-transparent text-white text-sm resize-none focus:outline-none placeholder:text-white/25 leading-relaxed disabled:cursor-not-allowed"
              style={{ maxHeight: '80px' }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading || isInputDisabled}
            className="w-11 h-11 rounded-full ig-gradient-bg flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-25 disabled:cursor-not-allowed hover:scale-110 shadow-xl shadow-[#833AB4]/30"
          >
            {loading && (chatPhase === 'chat' || chatPhase === 'refine')
              ? <Loader2 className="w-4 h-4 text-white animate-spin" />
              : <Send className="w-4 h-4 text-white" />
            }
          </button>
        </div>
      </div>
    </div>
  )
}
