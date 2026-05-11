# CLAUDE.md

**NextAI** — Instagram Intelligence Platform  
Built by Tejas Patil · tejaspatil92842@gmail.com

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Pricing Model

| Plan | Price | Notes |
|------|-------|-------|
| Monthly subscription | ₹500 / month | Target: individual creators |
| One-time license | ₹39,999 | Self-hosted, full source access, 1-yr support |

### Cost Analysis (₹500/month viability)

| Cost item | Per-user/month | Notes |
|-----------|---------------|-------|
| Apify scraping | ₹33–83 | ~5–10 actor runs × $0.04–0.10 |
| AI APIs (Groq free tier) | ₹0 | Free up to 14,400 req/day |
| Vercel hosting | ₹8–17 | Serverless — scales with usage |
| Domain / misc | ₹5 | Fixed, amortised |
| **Total** | **₹46–105** | Worst case |
| **Revenue** | **₹500** | |
| **Gross profit** | **₹395–454** | **~85% gross margin** |

Break-even: 3 users. Profitable from day 1.  
At 100 users: ₹39,500/month profit. At 1,000 users: ₹3,95,000/month.

---

## Deployment (Vercel)

1. Push to GitHub (see Git section below)
2. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
3. Set all `.env.local` keys as Environment Variables in Vercel dashboard:
   - `APIFY_TOKEN`
   - `GEMINI_API_KEY` (optional)
   - `GROQ_API_KEY`
   - `XAI_API_KEY` (optional)
   - `OPENAI_API_KEY` (optional)
   - `DAILY_AI_CALLS_LIMIT=10000`
4. Deploy — Vercel auto-detects Next.js and configures build

**Important:** `data/` directory (JSON cache) is gitignored. On Vercel this is ephemeral — cache resets on each deployment. For persistent cache, replace file-based cache with a database (e.g., Vercel KV, Upstash Redis).

## Git Setup (new repo)

```bash
# Remove old remote (currently points to wrong project)
git remote remove origin

# Create new GitHub repo at github.com/new, then:
git remote add origin https://github.com/tejaspatil13/NextAI.git
git branch -M main
git push -u origin main
```

---

## Commands

```bash
npm run dev      # start dev server (auto-selects port from 3000 upward)
npm run build    # production build + type check
npm run start    # serve production build
npx tsc --noEmit # type check only
```

No test suite or lint script is configured.

## Environment

`.env.local` keys:

```
APIFY_TOKEN=       # https://console.apify.com/account/integrations
GEMINI_API_KEY=    # https://aistudio.google.com/app/apikey   (priority 1)
GROQ_API_KEY=      # https://console.groq.com/keys             (priority 2 — free, no card)
XAI_API_KEY=       # https://console.x.ai                      (priority 3 — needs credits)
OPENAI_API_KEY=    # https://platform.openai.com/api-keys      (priority 4)
```

**Current active provider: Groq** (`GROQ_API_KEY=gsk_...`). Gemini key is present but commented out (free-tier quota exhausted). xAI key is present but account has no credits.

AI provider selection is automatic — `getAIProvider()` in each route returns the first key that is set: `GEMINI_API_KEY → GROQ_API_KEY → XAI_API_KEY → OPENAI_API_KEY`.

Every AI route (`competitor-ideas`, `generate-hook`, `generate-script`, `refine-script`, `idea-chat`, `trending-ideas`, `reel-ideas`, `headline-insight`, `content-ideas`) has `callGemini`, `callGroq`, `callXAI`, and `callOpenAI` helpers. `callXAI` uses model `grok-beta`, endpoint `https://api.x.ai/v1/chat/completions`.

`/api/transcribe` only supports Gemini Files API, Groq Whisper, and OpenAI Whisper — no xAI (no audio support).

---

## Architecture

Single-page Next.js 14 app (App Router). All state lives in `src/app/page.tsx` — no global store or context. Four tabs: **My Reels**, **Competitors**, **Compare**, **Content Intelligence**.

### Data flow — scraping

```
User action → page.tsx (startAndWait) → POST /api/start-scrape
                                       → polls GET /api/scrape-status (6 s interval, max 50×)
                                       → GET /api/scrape-results → returns tagged Reel[]
                                       → POST /api/cache (persists to data/*.json)
```

On mount the page reads `data/my_reels.json` and `data/competitors.json` via `GET /api/cache`.

### Key API files

| File | Role |
|------|------|
| `src/lib/apify.ts` | All Apify calls. `cleanUrl()` strips query params. Actor: `shu8hvrXbJbY3Eb9W`. `tagPerformance()` labels top/mid/low at ±40% of average views. |
| `src/lib/types.ts` | `Reel` and `ScrapeJob` interfaces. |
| `src/app/api/cache/route.ts` | File-based cache in `./data/` — JSON files keyed by string. |
| `src/app/api/proxy-image/route.ts` | Proxies Instagram CDN images to avoid CORS. |
| `src/app/api/transcribe/route.ts` | Downloads audio → Gemini Files API or Groq/OpenAI Whisper. |
| `src/app/api/headline-insight/route.ts` | All myReels + competitors → `{ headline, supporting, action }`. Max 600 tokens out. |
| `src/app/api/content-ideas/route.ts` | Full strategy report. **Dead route** — no component calls it. Max 1500 tokens out. |
| `src/app/api/competitor-ideas/route.ts` | top 5 myReels (with transcripts) + competitor top 3 → `CompetitorGapIdea[]`. Accepts `count` + `excludeTitles` for "Suggest Different". Max 1200 tokens out. |
| `src/app/api/generate-hook/route.ts` | `CompetitorGapIdea` + `creatorStyle` → 3 hook variations (Curiosity Gap / Pattern Interrupt / Specificity). Max 500 tokens out. |
| `src/app/api/generate-script/route.ts` | `CompetitorGapIdea` + locked hook + language → 1 timestamped script. Hook MUST appear verbatim at `[0–3s]`. Max 800 tokens out. |
| `src/app/api/refine-script/route.ts` | `script + hook + idea + instruction + language` → refined script. Presets: `shorten` / `lengthen` / `humor`; any string = custom. Max 900 tokens out. |
| `src/app/api/idea-chat/route.ts` | Multi-turn chat: `userMessage + chatHistory + myReels + competitorReels` → `{ reply, ready, reachEstimate?, idea? }`. Max 800 tokens out. |
| `src/app/api/trending-ideas/route.ts` | myReels + scraped trends → `CompetitorGapIdea[]` bridging trend + creator style. Max 1200 tokens out. |
| `src/app/api/reel-ideas/route.ts` | myReels ONLY → `CompetitorGapIdea[]` from creator's own proven patterns. Max 1200 tokens out. |
| `src/app/api/scrape-trends/route.ts` | Fetches `https://trends.google.com/trending/rss?geo=IN` (RSS), parses titles + traffic, caches to `data/trends.json` for 6 hours. |

### My Reels — dynamic profile URL

Stored in `myUrl` state in `page.tsx`, defaulting to `_desi.dudes_`. User can change it via the inline input in the My Reels header. Saved in the `my_reels` cache.

Helper functions in `page.tsx`:
- `urlToUsername(url)` — strips the Instagram domain to bare username
- `inputToUrl(raw)` — converts any format to a full Instagram URL
- `fmtNum(n)` — formats large numbers to K/M strings (used in the competitor leaderboard)

### Styling

Tailwind + `src/app/globals.css`. Custom classes: `.glass` (backdrop-blur card), `.card-hover` (lift + glow), `.stat-card` (shimmer via `::after`). Dark theme anchored to `#000000`. Card backgrounds use `#0a0a0a` and `#1c1c1c`; borders use `#262626`.

#### Gradient card pattern (HeadlineInsight style)

Used consistently across `HeadlineInsight`, the Competitors hero card, the Competitor Ranking leaderboard, and `CompetitorSection` profile headers. Pattern:

```tsx
<div className="relative rounded-2xl overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-[#0f0a1f] via-[#0a0a18] to-[#0a0a0a]" />
  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#FD1D1D]/4 to-[#FCAF45]/6" />
  <div className="absolute top-0 left-0 right-0 h-[1.5px] ig-gradient-bg" />          {/* top accent line */}
  <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#833AB4]/15 blur-3xl pointer-events-none" />  {/* purple glow orb */}
  <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full bg-[#FCAF45]/8 blur-3xl pointer-events-none" /> {/* amber glow orb */}
  <div className="relative ...">  {/* all content must be relative */}
    ...
  </div>
</div>
```

Section icon badges use `w-10 h-10 rounded-2xl ig-gradient-bg shadow-lg shadow-[#833AB4]/30`.

---

## Content Intelligence tab

```
Left sidebar (w-64, sticky)          Right main column (flex-1)
─────────────────────────────        ──────────────────────────────────────
What's Working  (sidebar card)       Headline Insight        (full width)
What to Avoid   (sidebar card)       Trending Topics  ┐
Best Time Post  (sidebar card)       Competitor Gaps  ├── 3-col grid
                                     Reel Ideas       ┘
                                     Pitch Your Idea         (full width)
                                     Content Series          (full width)
```

### Section status

| Component | Panel | LLM | Data source |
|-----------|-------|-----|-------------|
| `HeadlineInsight` | none | **LIVE** `/api/headline-insight` | myReels + competitors |
| `TrendingTopics` | `TrendingTopicsPanel` | **LIVE** `/api/scrape-trends` + `/api/trending-ideas` | Google Trends India + myReels |
| `CompetitorInsights` | `CompetitorGapsPanel` | **LIVE** `/api/competitor-ideas` | myReels + competitors |
| `ReelIdeas` | `ReelIdeasPanel` | **LIVE** `/api/reel-ideas` | myReels only |
| `IdeaChatSection` | inline + `CompetitorGapsPanel` | **LIVE** `/api/idea-chat` | user text + myReels + competitors |
| `ContentSeries` | none | static dummy | — |
| `WhatsWorking` | none | static dummy | — |
| `WhatToAvoid` | none | static dummy | — |
| `BestTimeToPost` | none | static dummy | — |

`CompetitorInsights` also appears at the bottom of the **Competitors tab** when both myReels and competitor data are present.

---

## Competitors tab

Layout (top to bottom):

1. **Hero card** (gradient card style) — `Users2` icon badge + title/subtitle + add-competitor input + "Add & Scrape" button (same style as "Generate Insight")
2. **In-progress scrape rows** — shown while Apify is fetching
3. **Competitor Ranking leaderboard** (gradient card, shown when ≥ 2 competitors) — sorted by avg views desc; rank #1 gets `ig-gradient-bg` badge + purple highlight row
4. **`CompetitorSection`** — one per competitor (see below)
5. **`CompetitorInsights`** — AI gap analysis, shown when myReels + ≥1 competitor both have data

### `CompetitorSection` (`src/components/CompetitorSection.tsx`)

Redesigned to match the My Reels page layout:

- **Profile header** — gradient card background (same pattern as HeadlineInsight), IG story-ring avatar, `ig-gradient-text` username, reel count, best-reel views callout
- **4 stat cards** — Total Views / Avg per Reel / Avg Eng. / Top Reels
- **Filter toolbar** — All / 🔥 Top / Avg / Low buttons + "View Chart" toggle
- **`PerformanceChart`** — collapsible via toggle; renders the same bar chart as My Reels
- **Reels grid** — `ReelCard` in 2–4 col grid, identical to My Reels (no `onTranscribe` — competitors don't support transcription)

---

## Shared 3-step panel flow

All three idea panels (`CompetitorGapsPanel`, `TrendingTopicsPanel`, `ReelIdeasPanel`) use the same UX:

**Step 1 — Ideas list:**
- Fetches ideas from its respective API on mount (shows 3 skeleton cards while loading).
- Each card: source badge, impact badge, title, gap/weakness, your angle (emerald box), hook direction.
- "Work on This →" → Step 2. "Suggest Different ↻" → calls API again with `count: 1, excludeTitles: [...seen]`, replaces that card in-place (no index change).

**Step 2 — Hook:**
- Fires `POST /api/generate-hook` immediately on idea select.
- `creatorStyle` = first available transcript (150 chars) or `"energetic creator voice"`.
- Shows 3 hooks with ← Change Hook → navigation.
- "Set This Hook" → lock animation:
  - Effect 1: `'locking'` → `'locked'` after 600 ms
  - Effect 2: `'locked'` → advance to script view after 700 ms (two separate effects — single effect bug: cleanup cancels t2 on re-render)
  - Visual: green border glow + lock icon scales in

**Step 3 — Script:**
- Locked hook shown in sealed green box.
- Language picker first (EN / हिंदी / Hinglish) — no script generated until picked (saves tokens).
- "Generate Script" → `POST /api/generate-script`.
- "Try Different Script" → same route, fresh variation.
- "Lock & Save to Taskbar" → calls `onLock` prop → adds to `lockedItems[]` in page.tsx → opens `LockedContentDrawer`.

---

## Locked Content Taskbar (`LockedContentDrawer`)

`src/components/LockedContentDrawer.tsx` — fixed right panel (`fixed right-0 top-0 h-full w-[380px] z-40`).

- `items: LockedContent[]` prop — supports multiple locked ideas
- Tab row at top (shown when >1 item): `#1 Title`, `#2 Title` — each tab has independent script state, chat history, and input
- Switching tabs resets script collapse state
- New items auto-select as active (always jumps to newest)

**Per-idea sections:** idea summary → locked hook (green box) → script (collapsible, expand/collapse) → Quick Edits row → chat history → chat input

**Quick Edits:** Shorten (sky) / Extend (violet) / Add Humor (amber) — each calls `POST /api/refine-script`

**Chat input:** any custom instruction → calls `/api/refine-script` with that string as `instruction` → script updates in-place, chat shows "Script updated ✓"

**Floating button:** `fixed bottom-6 right-6` — appears when `lockedItems.length > 0` and drawer is closed, shows count badge.

---

## IdeaChatSection (`src/components/ideas/IdeaChatSection.tsx`)

Full-width card in Content Intelligence between the 3-col grid and ContentSeries.

- Multi-turn chat: each message sent to `POST /api/idea-chat` with full history + myReels + competitorReels
- When `ready: true` in response: shows **Reach Estimate card** (range + reason) + "Build Hook & Script →" button
- Button opens `CompetitorGapsPanel` with `initialIdea` pre-set → skips ideas list, starts at hook generation

---

## Competitor Gaps — "Suggest Different" fix

Root cause of old bug: cycling through a pool of 4 pre-generated ideas meant only 1 extra idea was available per slot before wrapping. Fix: each "Suggest Different" click calls `/api/competitor-ideas` with `count: 1` and `excludeTitles: ideas.map(i => i.title)`. The new idea **replaces in-place** at `ideas[displayedIndices[pos]]` — `displayedIndices` unchanged, no stale closure issues.

Same pattern used in `TrendingTopicsPanel` (calls `/api/trending-ideas`) and `ReelIdeasPanel` (calls `/api/reel-ideas`).

---

## Google Trends scraping

Route: `GET /api/scrape-trends`

- Fetches `https://trends.google.com/trending/rss?geo=IN` (the `/trends/trendingsearches/daily/rss` path is deprecated — 404)
- Parses `<title>` tags (handles both CDATA and plain) and `<ht:approx_traffic>` tags
- Category auto-detected via keyword map (cricket/ipl → Sports, bollywood/movie → Entertainment, modi/election → Politics, etc.)
- Caches result to `data/trends.json` for 6 hours (checks age on each request)
- Cached result served immediately; fresh fetch only on cache miss/expiry

---

## Data types — `src/lib/ideas-types.ts`

```ts
CompetitorGapIdea {
  id, title
  competitorName: string   // "@username" | "#TrendName" | "Content Pattern"
  theirWeakness: string
  yourAngle: string
  whyItWins: string
  hookDirection: string    // direction hint, NOT the hook itself
  estimatedImpact: 'high' | 'medium'
}

LockedContent {
  idea: CompetitorGapIdea
  hook: string
  script: string
  language: Language       // 'en' | 'hi' | 'hinglish'
  lockedAt: string         // ISO timestamp
}

ReachEstimate { range: string; reason: string }

ChatMessage {
  role: 'user' | 'assistant'
  content: string
  reachEstimate?: ReachEstimate
  idea?: CompetitorGapIdea
}
```

`WorkflowIdea` (legacy, used only by `IdeaWorkflowPanel` which is no longer used by any live section):
```ts
WorkflowIdea {
  id, title, coreAngle
  hooks: string[]
  scripts: Record<'en'|'hi'|'hinglish', string[]>
  tagSets: string[][]
  music: Array<{ name, vibe, howToUse }>
}
```

## Dummy pools — `src/lib/ideas-dummy.ts`

All exports are now unused — all three idea sections use live LLM. File kept for reference.

---

## Colour system

| Context | Colour |
|---------|--------|
| Primary action buttons | `ig-gradient-bg` (purple→red→gold) |
| Section icon badges | `ig-gradient-bg w-10 h-10 rounded-2xl shadow-lg shadow-[#833AB4]/30` |
| Transcribe button on ReelCard | `ig-gradient-bg` (full width, `font-bold tracking-wide`) |
| Trending topic badge | `text-violet-400 bg-violet-400/10` |
| Competitor badge | `text-rose-400 bg-rose-400/10` |
| Reel pattern badge | `text-blue-400 bg-blue-400/10` |
| High impact badge | `text-amber-400 bg-amber-400/10` |
| Your angle box | `bg-emerald-500/8 border-emerald-500/20` |
| Locked hook box | `border-green-500/40 bg-green-500/5` |
| Lock animation glow | `bg-green-500 shadow-green-500/50` |
| Reel Ideas accent | `bg-blue-600` (buttons), `text-blue-400` (labels) |
| Taskbar quick edits | sky (Shorten) / violet (Extend) / amber (Humor) |
| Stat values in gradient cards | `text-white/X` opacity instead of hard hex greys |
| Competitor avg views stat | `text-[#FCAF45]` |
| Competitor engagement stat | `text-emerald-400` |
| Competitor top-reels stat | `text-violet-400` |
