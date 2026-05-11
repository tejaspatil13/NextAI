# NextAI — Complete Technical & Business Documentation

> Instagram Intelligence Platform — competitor analysis, AI content strategy, hook & script builder  
> Built by Tejas Patil · tejaspatil92842@gmail.com

---

## Table of Contents
1. [What is NextAI?](#1-what-is-nextai)
2. [How It Works — User Flow](#2-how-it-works--user-flow)
3. [Tech Stack](#3-tech-stack)
4. [Instagram Data — Scraping Methods](#4-instagram-data--scraping-methods)
5. [AI Engine — All 9 Routes](#5-ai-engine--all-9-routes)
6. [Pricing Model](#6-pricing-model)
7. [Cost Analysis — Is ₹500/month Profitable?](#7-cost-analysis--is-₹500month-profitable)
8. [Selling to Agencies](#8-selling-to-agencies)
9. [Deployment Guide (Vercel)](#9-deployment-guide-vercel)
10. [Environment Variables Reference](#10-environment-variables-reference)
11. [GitHub Branches](#11-github-branches)
12. [Future Roadmap](#12-future-roadmap)

---

## 1. What is NextAI?

NextAI is a **SaaS Instagram intelligence platform** that helps content creators and agencies make data-driven decisions about what to post.

**Four core capabilities:**
| Tab | What It Does |
|-----|-------------|
| **My Reels** | Scrape your own reels, see performance tags (top/mid/low), charts, transcripts |
| **Competitors** | Scrape any public competitor's reels, compare their strategy |
| **Compare** | 14-section head-to-head dashboard — themes, hooks, timing, hashtags, viral posts, gaps |
| **Content Intelligence** | AI-generated ideas, hooks, scripts, trending topics, pitch-your-idea chat |

---

## 2. How It Works — User Flow

```
1. User enters their Instagram URL
        ↓
2. App scrapes their reels via Apify (production) or Instagram session (local)
        ↓
3. Reels stored in cache (data/ locally, /tmp on Vercel)
        ↓
4. User adds competitors → scraped the same way
        ↓
5. Compare tab → 14-section analytics dashboard computed from the data
        ↓
6. Content Intelligence tab → AI analyzes reels + competitors → generates:
   - Headline insights
   - Trending topic ideas
   - Competitor gap ideas
   - Reel ideas from own patterns
   - Hooks (3 per idea, infinite refresh)
   - Full timestamped scripts (EN / हिंदी / Hinglish)
        ↓
7. User locks idea + hook + script → saved to taskbar
        ↓
8. User refines script via chat (shorten / extend / humor / custom instruction)
```

---

## 3. Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 14.2.35 | App Router, SSR, API routes |
| **React** | 18 | UI rendering, state management |
| **TypeScript** | 5.x | Type safety across entire codebase |
| **Tailwind CSS** | 3.4.1 | Utility-first styling, dark theme |
| **Recharts** | 2.12.7 | Bar, radar, area, pie charts |
| **Lucide React** | 0.400.0 | Icons |
| **clsx** | 2.1.1 | Conditional classnames |

### Backend (Next.js API Routes — Serverless)
| Technology | Purpose |
|-----------|---------|
| **Next.js API Routes** | 20 serverless endpoints, each independently deployed |
| **Apify SDK** (HTTP) | Instagram reel scraping in production |
| **Instagram Private API** (HTTP) | Direct scraping for local development |
| **Node.js `fs` module** | File-based JSON cache (local: `data/`, Vercel: `/tmp/`) |

### AI Providers (auto-fallback chain)
```
GEMINI_API_KEY → GROQ_API_KEY → XAI_API_KEY → OPENAI_API_KEY
```
| Provider | Model | Free Tier | Notes |
|---------|-------|-----------|-------|
| **Google Gemini** | gemini-2.0-flash | Yes (quota limited) | Priority 1 |
| **Groq** | llama-3.3-70b-versatile | 14,400 req/day | Priority 2 — current active |
| **xAI Grok** | grok-beta | No free tier | Priority 3 |
| **OpenAI** | gpt-4o-mini | No free tier | Priority 4 fallback |

### Infrastructure
| Service | Purpose | Cost |
|---------|---------|------|
| **Vercel** | Hosting, serverless functions, CDN | Free tier (Hobby) |
| **GitHub** | Source control, CI/CD trigger | Free |
| **Apify** | Instagram scraping in production | $5/month free credits |

### Architecture Diagram
```
Browser (React)
    │
    ├── GET /api/cache           ← Load saved reels on mount
    ├── POST /api/start-scrape   ← Start Apify actor run
    ├── GET /api/scrape-status   ← Poll every 6s (max 50×)
    ├── GET /api/scrape-results  ← Fetch scraped reels
    ├── POST /api/cache          ← Save to JSON cache
    │
    ├── POST /api/idea-chat      ← Intent-aware AI chat
    ├── POST /api/competitor-ideas  ← Gap-based ideas
    ├── POST /api/generate-hook  ← 3 hook variations
    ├── POST /api/generate-script → Timestamped script
    ├── POST /api/refine-script  ← Edit with instructions
    ├── POST /api/compare-ideas  ← Comparison-powered ideas
    │
    ├── GET /api/scrape-trends   ← Google Trends RSS India
    ├── POST /api/trending-ideas ← Trends + creator style
    ├── POST /api/reel-ideas     ← Ideas from own patterns
    ├── POST /api/headline-insight → What to post next
    └── POST /api/transcribe     ← Audio → text (Whisper)
```

---

## 4. Instagram Data — Scraping Methods

### Method A: Apify (Production — Vercel)

**What is Apify?**  
Apify is an enterprise web scraping platform. It uses rotating residential proxies and handles Instagram's anti-bot measures. The actor used is `shu8hvrXbJbY3Eb9W` (Instagram Reel Scraper).

**Flow:**
```
POST /api/start-scrape
  → Apify creates actor run, returns runId + datasetId
  → Frontend polls GET /api/scrape-status every 6 seconds
  → Status: RUNNING → SUCCEEDED
  → GET /api/scrape-results → returns Reel[] array
```

**Why Apify works on Vercel:**
- Apify's servers use residential/mobile IPs
- Instagram does NOT block residential IPs
- Vercel's datacenter IPs ARE blocked by Instagram

**Cost:**
- Free plan: **$5 free credits/month** (no credit card required)
- Instagram scraping: ~$0.001–0.01 per reel result
- 500 reels/month ≈ $0.50 → well within free tier
- Get token: https://console.apify.com/account/integrations

**Data returned per reel:**
```typescript
{
  id, url, timestamp, likes, views, comments,
  caption, videoUrl, audioUrl, thumbnailUrl,
  duration, ownerUsername
}
```

---

### Method B: Instagram Session ID (Local Development)

**What is a Session ID?**  
When you log into Instagram in your browser, it creates a `sessionid` cookie. This cookie proves you are logged in. We use it to call Instagram's private mobile API directly.

**How to get your Session ID:**
```
1. Open Chrome → go to instagram.com (while logged in)
2. Press F12 → Application tab → Cookies → https://www.instagram.com
3. Find "sessionid" → copy the value
4. Add to .env.local: INSTAGRAM_SESSION_ID=your_value_here
```

**Why it works locally but NOT on Vercel:**
- Your home internet = residential IP → Instagram allows it
- Vercel servers = AWS datacenter IP → Instagram blocks it (429 Too Many Requests)
- This is Instagram's WAF (Web Application Firewall) blocking datacenter IPs

**API endpoints used:**
```
GET  https://www.instagram.com/api/v1/users/web_profile_info/?username=USERNAME
POST https://www.instagram.com/api/v1/clips/user/
```

**Headers sent (mimics Chrome browser):**
```
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/121.0.0.0
x-ig-app-id: 936619743392459
Cookie: sessionid=YOUR_SESSION; csrftoken=TOKEN
sec-fetch-dest: empty
sec-fetch-mode: cors
```

**Session expiry:** Sessions expire every 30–90 days. When scraping stops working locally, get a fresh session ID from your browser.

---

## 5. AI Engine — All 9 Routes

Each AI route has 4 provider implementations (Gemini / Groq / xAI / OpenAI) with auto-fallback.

| Route | Input | Output | Max Tokens |
|-------|-------|--------|-----------|
| `/api/idea-chat` | User message + chat history + reels | Intent-classified reply + 3-4 idea cards | 800 |
| `/api/competitor-ideas` | myReels + competitorReels + count + excludeTitles | CompetitorGapIdea[] | 1200 |
| `/api/compare-ideas` | Full comparison analytics summary | CompetitorGapIdea[] (comparison-powered) | 1400 |
| `/api/reel-ideas` | myReels only | CompetitorGapIdea[] from own patterns | 1200 |
| `/api/trending-ideas` | myReels + scraped Google Trends | CompetitorGapIdea[] bridging trend + niche | 1200 |
| `/api/generate-hook` | CompetitorGapIdea + creatorStyle | 3 hook variations (Curiosity/Interrupt/Specific) | 500 |
| `/api/generate-script` | idea + locked hook + language | Full timestamped script | 800 |
| `/api/refine-script` | script + hook + instruction + language | Refined script | 900 |
| `/api/headline-insight` | All myReels + competitors | { headline, supporting, action } | 600 |

**Rate limiting:** 10,000 AI calls/day per IP (`DAILY_AI_CALLS_LIMIT` env var). Tracked in-memory, resets at midnight UTC.

**Intent classification (`/api/idea-chat`):**
- `"general"` → greetings, strategy questions → conversational reply only
- `"ideas"` → any topic/niche/event/concept → generates 3-4 idea cards inline

---

## 6. Pricing Model

### Plan 1 — Monthly Subscription: ₹500/month

**Target:** Individual creators, coaches, small agencies  
**Includes:**
- Full platform access
- Scrape your reels + up to 5 competitors
- All AI features (ideas, hooks, scripts, trends)
- 14-section competitor comparison
- Trending topics (Google Trends India)
- Multi-language scripts (EN / Hindi / Hinglish)
- Content Intelligence tab
- Locked content taskbar

### Plan 2 — One-Time License: ₹39,999

**Target:** Agencies, white-label buyers, developers  
**Includes everything in Monthly, plus:**
- Full source code
- Self-hosted / custom domain deployment
- White-label branding option
- API key self-management
- Unlimited competitor accounts
- 1 year technical support
- Future updates for 1 year

**ROI for agencies:** At ₹500/client/month, the license pays back in 80 clients = ~6.7 years. But agencies use it for ALL their clients, making the one-time cost easily justified.

---

## 7. Cost Analysis — Is ₹500/month Profitable?

### Per-User Monthly Costs

| Cost Item | Per User/Month | Notes |
|-----------|---------------|-------|
| Apify scraping | ₹33–83 | ~5–10 scrapes × $0.04–0.10 |
| AI APIs (Groq) | ₹0 | Free tier: 14,400 req/day |
| AI APIs (if paid) | ₹25–50 | $0.59/M tokens, ~500K tokens/user |
| Vercel hosting | ₹8–17 | Serverless, scales with usage |
| Domain | ₹5 | ₹700/year amortised |
| **Total** | **₹46–155** | Worst case with paid AI |
| **Revenue** | **₹500** | |
| **Gross Profit** | **₹345–454** | **69–91% gross margin** |

### Scale Projections

| Users | Revenue/Month | Cost/Month | Profit/Month |
|-------|--------------|-----------|-------------|
| 10 | ₹5,000 | ₹1,550 | **₹3,450** |
| 50 | ₹25,000 | ₹7,750 | **₹17,250** |
| 100 | ₹50,000 | ₹15,500 | **₹34,500** |
| 500 | ₹2,50,000 | ₹77,500 | **₹1,72,500** |
| 1000 | ₹5,00,000 | ₹1,55,000 | **₹3,45,000** |

**Break-even:** 3–4 users.  
**Verdict:** ₹500/month is extremely profitable at any scale.

### Apify Free Tier for Multi-User

**Option A — Developer pays one Apify account:**
- Apify Starter plan: $49/month (~₹4,000)
- Covers ~500,000 scrape results → enough for 500+ users at normal usage
- Even at 100 users: ₹50,000 revenue - ₹4,000 Apify = ₹46,000 profit

**Option B — Each user uses their own free Apify account:**
- Each user signs up at apify.com (free, no card)
- Gets $5/month free credits (~500 scrapes — more than enough)
- Developer pays: ₹0
- Best model for self-hosted (₹39,999 license)

---

## 8. Selling to Agencies

### What Agencies Get
Instagram agencies manage **multiple creator accounts** — NextAI gives them:
1. **Client reporting** — run competitor analysis for each client, generate PDF-ready comparisons
2. **Content calendar generation** — 30-day content plan per client
3. **Hook & script production** — generate scripts for client reels in minutes
4. **Competitive intelligence** — track what competitors of their clients are doing

### Agency Pitch Points
- Saves 5–8 hours/week of manual competitor research per client
- AI generates hooks and scripts → junior team can produce more content
- Data-backed strategy → clients see measurable results
- White-label ready (₹39,999 license) → rebrand as their own tool

### Pricing for Agencies
| Model | Price | Best For |
|-------|-------|---------|
| Monthly subscription | ₹500/month | Small agencies (1-5 clients) |
| One-time license | ₹39,999 | Agencies with 6+ clients |
| White-label license | ₹75,000–₹1,50,000 | Agencies wanting their own branded tool |

**Agency ROI example:**
- Agency charges client ₹15,000/month for content strategy
- NextAI costs them ₹500/month
- Net additional margin per client: **₹14,500/month**
- 5 clients → ₹72,500/month additional profit from one ₹500/month tool

---

## 9. Deployment Guide (Vercel)

### Step 1: Push to GitHub
```bash
git remote add origin https://github.com/tejaspatil13/NextAI.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to vercel.com → New Project → Import `NextAI` repo
2. Set **Root Directory** to `Insta-dashboard-ai`
3. Click Deploy

### Step 3: Add Environment Variables
Go to Vercel → Project → Settings → Environment Variables:

| Variable | Value | Required |
|----------|-------|---------|
| `APIFY_TOKEN` | `apify_api_xxx` | **Yes** — get free at apify.com |
| `GROQ_API_KEY` | `gsk_xxx` | **Yes** — get free at console.groq.com |
| `DAILY_AI_CALLS_LIMIT` | `10000` | Yes |
| `GEMINI_API_KEY` | `AIza_xxx` | Optional — backup AI |
| `XAI_API_KEY` | `xai-xxx` | Optional — backup AI |
| `OPENAI_API_KEY` | `sk-xxx` | Optional — backup AI |
| `INSTAGRAM_SESSION_ID` | `xxxxx` | Local only — not needed on Vercel |

### Step 4: Redeploy after adding env vars

---

## 10. Environment Variables Reference

```bash
# .env.local (local development)

# Instagram session for local scraping
# Get: Chrome F12 → Application → Cookies → instagram.com → sessionid
INSTAGRAM_SESSION_ID=your_session_id_here

# Apify (production scraping — free tier)
# Get: https://console.apify.com/account/integrations
APIFY_TOKEN=apify_api_xxxxx

# AI Providers (first one set = used, others = fallback)
GEMINI_API_KEY=AIza_xxxxx    # https://aistudio.google.com
GROQ_API_KEY=gsk_xxxxx       # https://console.groq.com (FREE, recommended)
XAI_API_KEY=xai-xxxxx        # https://console.x.ai
OPENAI_API_KEY=sk-xxxxx      # https://platform.openai.com

# Rate limiting
DAILY_AI_CALLS_LIMIT=10000   # Max AI calls per IP per day
```

---

## 11. GitHub Branches

| Branch | Purpose | Scraping Method |
|--------|---------|----------------|
| `main` | Production — Vercel deployment | **Apify** |
| `apify` | Same as main, explicit Apify | **Apify** |
| `session-id` | Local development only | **Instagram Session ID** |

**Vercel should always deploy from `main` or `apify` branch.**

---

## 12. Future Roadmap

| Timeline | Feature | Why |
|----------|---------|-----|
| Q3 2025 | TikTok competitor analysis | 2nd largest platform for creators |
| Q3 2025 | YouTube Shorts integration | Cross-platform comparison |
| Q4 2025 | Auto-posting scheduler | Close the loop — create AND publish |
| Q4 2025 | AI thumbnail generator | Next bottleneck after script |
| Q1 2026 | React Native mobile app | Creators work on phones |
| Q1 2026 | Voice-to-script input | Faster idea capture |
| Q2 2026 | Agency dashboard | Multi-client management |
| Q2 2026 | White-label builder | Sell branded versions |
| Q3 2026 | API access | Developers build on top |
| Q4 2026 | Custom AI fine-tuning | Learn from creator's own style |

---

*NextAI — Built with Next.js 14, React 18, Groq AI, Apify · Deployed on Vercel*  
*Contact: tejaspatil92842@gmail.com*
