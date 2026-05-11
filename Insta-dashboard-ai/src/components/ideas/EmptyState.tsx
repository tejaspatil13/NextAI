'use client'

type ColorVariant = 'amber' | 'violet' | 'emerald' | 'rose' | 'sky' | 'fuchsia' | 'indigo' | 'teal' | 'blue'

const config: Record<ColorVariant, { iconBg: string; iconBgHover: string; text: string; dot: string; btn: string }> = {
  amber:   { iconBg: "bg-[#222]/80",   iconBgHover: "group-hover:bg-slate-600/80",   text: "text-white",   dot: "bg-white",   btn: "ig-gradient-bg hover:opacity-90 text-white" },
  violet:  { iconBg: 'bg-violet-500/15',  iconBgHover: 'group-hover:bg-violet-500/25',  text: 'text-white',  dot: 'bg-violet-500',  btn: 'ig-gradient-bg hover:opacity-90 text-white' },
  emerald: { iconBg: 'bg-emerald-500/15', iconBgHover: 'group-hover:bg-emerald-500/25', text: 'text-emerald-400', dot: 'bg-emerald-500', btn: 'ig-gradient-bg hover:opacity-90 text-white' },
  rose:    { iconBg: 'bg-rose-500/15',    iconBgHover: 'group-hover:bg-rose-500/25',    text: 'text-rose-400',    dot: 'bg-rose-500',    btn: 'bg-rose-600 hover:bg-rose-500 text-white' },
  sky:     { iconBg: 'bg-sky-500/15',     iconBgHover: 'group-hover:bg-sky-500/25',     text: 'text-sky-400',     dot: 'bg-sky-500',     btn: 'bg-sky-600 hover:bg-sky-500 text-white' },
  fuchsia: { iconBg: 'bg-fuchsia-500/15', iconBgHover: 'group-hover:bg-fuchsia-500/25', text: 'text-fuchsia-400', dot: 'bg-fuchsia-500', btn: 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white' },
  indigo:  { iconBg: 'bg-indigo-500/15',  iconBgHover: 'group-hover:bg-indigo-500/25',  text: 'text-white',  dot: 'bg-indigo-500',  btn: 'bg-indigo-600 hover:bg-indigo-500 text-white' },
  teal:    { iconBg: 'bg-teal-500/15',    iconBgHover: 'group-hover:bg-teal-500/25',    text: 'text-teal-400',    dot: 'bg-teal-500',    btn: 'bg-teal-600 hover:bg-teal-500 text-white' },
  blue:    { iconBg: 'bg-blue-500/15',    iconBgHover: 'group-hover:bg-blue-500/25',    text: 'text-blue-400',    dot: 'bg-blue-500',    btn: 'ig-gradient-bg hover:opacity-90 text-white' },
}

interface EmptyStateProps {
  icon: React.ReactNode
  color: ColorVariant
  label: string
  description: string
  previews: string[]
  onGenerate: () => void
  compact?: boolean
}

export default function EmptyState({ icon, color, label, description, previews, onGenerate, compact }: EmptyStateProps) {
  const c = config[color]

  if (compact) {
    return (
      <button onClick={onGenerate} className="w-full flex flex-col items-center justify-center gap-3 py-6 group">
        <div className={`w-10 h-10 rounded-xl ${c.iconBg} ${c.iconBgHover} flex items-center justify-center transition-colors`}>
          {icon}
        </div>
        <span className={`text-xs font-semibold ${c.text}`}>{label}</span>
        <span className={`text-xs font-semibold px-4 py-1.5 rounded-lg ${c.btn} transition-colors`}>
          Generate
        </span>
      </button>
    )
  }

  return (
    <button onClick={onGenerate} className="w-full text-left group py-1">
      <div className="flex gap-4">
        {/* Left sidebar — icon + connector line */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className={`w-10 h-10 rounded-xl ${c.iconBg} ${c.iconBgHover} flex items-center justify-center transition-colors`}>
            {icon}
          </div>
          <div className="flex-1 w-px bg-[#1c1c1c]" />
          <div className={`w-1.5 h-1.5 rounded-full ${c.dot} opacity-40`} />
        </div>

        {/* Right — content */}
        <div className="flex-1 pb-3 min-w-0">
          <p className={`text-sm font-semibold ${c.text} mb-1`}>{label}</p>
          <p className="text-xs text-[#555] leading-relaxed mb-3">{description}</p>

          <ul className="space-y-2 mb-4">
            {previews.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={`w-1 h-1 rounded-full ${c.dot} mt-1.5 flex-shrink-0 opacity-60`} />
                <span className="text-xs text-[#555] leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>

          <span className={`inline-flex items-center text-xs font-semibold px-4 py-1.5 rounded-lg ${c.btn} transition-colors`}>
            Generate {label}
          </span>
        </div>
      </div>
    </button>
  )
}
