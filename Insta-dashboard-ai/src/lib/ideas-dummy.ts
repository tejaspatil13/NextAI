import type {
  TrendingTopic, WorkingTheme, AvoidTheme, CompetitorOpportunity,
  ReelIdea, PostingSlot, HeadlineInsightData, ViralSound, ContentSeries, HashtagCluster,
  WorkflowIdea,
} from './ideas-types'

export const DUMMY_HEADLINE: HeadlineInsightData = {
  headline: 'Your top 3 reels drive 68% of total views — and all 3 open with a specific number in the first 2 seconds',
  supporting: '"2.1M views", "6 months", "Day 30" — every top reel has a concrete stat in the opening line. The rest of your catalog uses vague openers. The views gap between these two groups is 4.3×.',
  action: 'Before your next post, rewrite the opening line to include one specific number or stat. This single change is responsible for more views than any other variable in your data.',
}

export const DUMMY_TRENDING: TrendingTopic[] = [
  { topic: 'POV storytelling', category: 'global', momentum: 'rising', relevance: 9, reason: 'Drives 3× more saves than standard reels — algorithm prioritises save rate' },
  { topic: 'Day-in-the-life vlogs', category: 'niche', momentum: 'rising', relevance: 8, reason: 'Your niche audience craves behind-the-scenes authenticity right now' },
  { topic: 'Hot takes on industry norms', category: 'niche', momentum: 'rising', relevance: 9, reason: 'Controversial opinions spike comments + shares simultaneously' },
  { topic: 'Micro-tutorials (≤30s)', category: 'global', momentum: 'rising', relevance: 8, reason: 'Short-form within short-form wins on watch-through rate — algo loves it' },
  { topic: 'Side-by-side before/after', category: 'global', momentum: 'stable', relevance: 7, reason: 'Transformation content still pulls massive views — evergreen format' },
  { topic: '"Things I wish I knew" listicles', category: 'global', momentum: 'peaked', relevance: 5, reason: 'Saturated — add a unique twist or avoid entirely' },
]

export const DUMMY_WORKING: WorkingTheme[] = [
  { theme: 'Raw, unfiltered behind-the-scenes', avgViews: 284000, topExample: 'Your "setup tour" reel hit 340K — authenticity beat every polished post', insight: 'Authenticity outperforms production quality 2:1 in your account data' },
  { theme: 'Educational quick tips with a number in the title', avgViews: 197000, topExample: '"3 tricks to go viral" series consistently ranks top 10 by saves', insight: 'Numerical framing lifts performance by 40% vs vague advice titles' },
  { theme: 'Relatable frustration + shared pain', avgViews: 169000, topExample: '"Why nobody watches your reels" rant — 2.1K comments, 18K shares', insight: 'Shared pain creates instant connection and triggers share reflex' },
]

export const DUMMY_AVOID: AvoidTheme[] = [
  { theme: 'Pure product promotion reels', avgViews: 11800, reason: 'Audience tunes out when content feels like an ad — watch time collapses at 3s', alternative: 'Weave product into an educational or storytelling format — show it working, don\'t pitch it' },
  { theme: 'Trending audio with no niche context', avgViews: 17200, reason: 'Jumping on trends without tying to your niche loses loyal followers and attracts wrong audience', alternative: 'Use trending sounds but layer your voiceover on top with niche-specific content' },
  { theme: 'Talking-head rants over 90 seconds', avgViews: 7900, reason: 'Drop-off rate spikes at 60s for pure talking-head — you\'re losing 60% of viewers before the point', alternative: 'Cut to 45s max or add B-roll every 8–10s to reset visual attention' },
]

export const DUMMY_COMPETITOR_POOL: CompetitorOpportunity[] = [
  {
    id: 'c1', competitor: 'nateherk',
    theirApproach: 'Polished case study breakdowns with data overlays — always professional tone',
    gap: 'Zero casual or relatable content — audience can\'t see themselves in his journey',
    yourOpportunity: 'Own the "same results, real person" angle he misses entirely',
    estimatedImpact: 'high',
    tactics: ['React to one of his case studies with your raw, unfiltered take', 'Show the messy process behind a polished outcome he presents as easy', 'Use his data but humanise it with a personal failure story'],
    reelConcepts: [
      { title: '"I tried @nateherk\'s exact strategy for 14 days"', hook: '"Everyone\'s copying this guy. I spent 2 weeks doing exactly what he says. Here\'s the real result."', scriptStarter: ['Hook: State you tested his strategy (0–3s)', 'His promise vs your starting point (3–12s)', 'Daily progress clips with honest commentary (12–30s)', 'Final result: what worked, what didn\'t (30–42s)', 'Your revised version of his framework (42–50s)'] },
      { title: 'The part of the success story he never shows', hook: '"Every creator shows the win. Nobody shows the 47 failed attempts before it. Here\'s mine."', scriptStarter: ['Open with the contrast: his highlight vs your reality (0–4s)', 'Show 3 actual failures with timestamps (4–20s)', 'The turning point moment (20–32s)', 'Result after the pivot (32–42s)', 'CTA: "Save this for when you want to quit" (42–48s)'] },
      { title: 'His framework, my niche application', hook: '"@nateherk\'s strategy is great. But it assumes you\'re already known. Here\'s how to adapt it when you\'re starting from zero."', scriptStarter: ['Acknowledge his framework (0–5s)', 'The assumption he makes that doesn\'t apply to small accounts (5–15s)', 'Your modified version with specific steps (15–38s)', 'Side-by-side results: his method vs your adaptation (38–48s)'] },
    ],
  },
  {
    id: 'c2', competitor: 'nick_saraev',
    theirApproach: 'High-volume posting (2×/day) with short punchy tips — quantity over depth',
    gap: 'No deep-dive content — followers want full breakdowns but only get teasers',
    yourOpportunity: 'Go deep where he goes wide — own the "complete guide" format in this niche',
    estimatedImpact: 'medium',
    tactics: ['Do a full 90s breakdown of his best-performing tip topic', 'Create a "what he didn\'t tell you" follow-up series for his top 5 reels', 'Pin a comprehensive guide that out-ranks his teasers in saves per view'],
    reelConcepts: [
      { title: '"What @nick_saraev didn\'t tell you" series', hook: '"He gave you the tip. I\'m giving you the full playbook behind it."', scriptStarter: ['Reference his tip reel (0–4s)', 'The missing context he left out (4–18s)', 'Step-by-step implementation (18–38s)', 'The metric to track to know it\'s working (38–48s)'] },
      { title: 'Depth vs volume: a 30-day experiment', hook: '"I tested posting 2× a day vs 3× a week with full guides. One strategy destroyed the other."', scriptStarter: ['Set up the experiment (0–5s)', 'Week 1 results for each approach (5–18s)', 'Week 4 cumulative data (18–30s)', 'Which approach won and why (30–42s)', 'The one metric that proved it (42–50s)'] },
      { title: 'The full version of his best tip', hook: '"He mentioned this in 30 seconds. I\'m giving you the full breakdown it deserves."', scriptStarter: ['His tip (play clip or describe it) (0–5s)', '"But here\'s what he left out:" (5–8s)', 'Full step-by-step (8–35s)', 'Real example with numbers (35–45s)', 'Save CTA (45–50s)'] },
    ],
  },
  {
    id: 'c3', competitor: 'alexhormozi',
    theirApproach: 'Text-heavy slide reels with hard-hitting one-liners — all concept, no narrative',
    gap: 'Zero storytelling — every concept is abstract, never illustrated with a real journey',
    yourOpportunity: 'Tell the same concepts through a narrative arc — make the theory human',
    estimatedImpact: 'high',
    tactics: ['Take his most-viewed framework and illustrate it with a real personal story', 'Create "I tried [Hormozi\'s] method for 30 days — here\'s what actually happened"', 'Add a personal failure to each concept he teaches as if it\'s simple'],
    reelConcepts: [
      { title: '"I lived his best advice for 30 days"', hook: '"Alex Hormozi said this would change everything. I tested it. Here\'s the honest result."', scriptStarter: ['The Hormozi principle you\'re testing (0–5s)', 'Your starting stats and context (5–12s)', 'Week-by-week highlights (12–30s)', 'The real result with data (30–40s)', 'What you\'d change (40–50s)'] },
      { title: 'His one-liner, your full story', hook: '"He said it in 8 words. It took me 6 months to fully understand what he meant."', scriptStarter: ['Quote the one-liner on screen (0–4s)', 'What you thought it meant first (4–12s)', 'The moment it actually clicked (12–24s)', 'How it changed your approach (24–38s)', 'Your version of the principle (38–50s)'] },
      { title: 'The failure he never talks about', hook: '"Hormozi teaches the framework. Nobody teaches you what happens when it fails. Here\'s my experience."', scriptStarter: ['Acknowledge the framework is solid (0–4s)', 'Where and why it failed for you (4–18s)', 'What you changed to make it work (18–32s)', 'The nuance he leaves out (32–42s)', 'Your revised framework (42–50s)'] },
    ],
  },
  {
    id: 'c4', competitor: 'garyvee',
    theirApproach: 'High-energy motivational clips repurposed from podcasts/keynotes',
    gap: 'Completely non-niche — broad motivational content attracts wrong audience',
    yourOpportunity: 'Apply his energy to your specific niche problems — be him but for your audience',
    estimatedImpact: 'medium',
    tactics: ['Same format, niche topic: "Why [your niche] creators fail"', 'Create a niche-specific "Day in the Life" with his raw vlog energy', 'Respond to his broad advice with specific niche-context counters'],
    reelConcepts: [
      { title: 'GaryVee energy, [your niche] specificity', hook: '"Everyone quotes him. Nobody applies it to [your niche]. Let me fix that."', scriptStarter: ['The broad advice everyone knows (0–5s)', '"Here\'s what that actually looks like in [niche]:" (5–8s)', '3 specific niche applications (8–32s)', 'The result you got (32–42s)', 'Challenge them to try one (42–50s)'] },
      { title: 'The niche version of his most viral video', hook: '"He made [viral topic] famous. Here\'s the [niche] version you actually need."', scriptStarter: ['Reference his video (0–4s)', 'Why it doesn\'t directly apply to your niche (4–10s)', 'Your niche-specific version of each point (10–38s)', 'Why this version is more actionable for them (38–48s)'] },
      { title: 'Day in my life (his energy, your niche)', hook: '"What a [niche] creator\'s actual work day looks like. No highlight reel."', scriptStarter: ['6AM start — real setup (0–8s)', 'The unsexy work nobody sees (8–20s)', 'Mid-day results check with actual numbers (20–32s)', 'Evening reflection: what worked today (32–42s)', 'CTA: "This is what consistent actually looks like" (42–50s)'] },
    ],
  },
]

export const DUMMY_REEL_POOL: ReelIdea[] = [
  {
    id: 'r1', title: 'The Algorithm Secret Nobody Talks About',
    hook: '"I got 2M views on a reel with 0 followers. Here\'s the exact thing I did differently."',
    coreAngle: 'Insider reveal format — specific jarring data point → unexpected action → proof',
    whyItWorks: '"0 followers" + "2M views" is cognitively jarring. First line creates a massive curiosity gap that forces watch-through.',
    estimatedViews: '150K–400K', difficulty: 'easy', format: 'Talking head + text overlay',
    scriptOutline: ['Hook (0–3s): State the jarring stat — let it land', 'Context (3–8s): Who you are and why this matters to them', 'The reveal (8–25s): The specific setting/action taken — show it', 'Proof (25–38s): Screenshot or screen-record the actual result', 'CTA (38–45s): "Save — I\'ll explain more in comments"'],
    hookVariations: ['"I went from 0 to 2M views in 72 hours. No tricks, no budget."', '"This one setting change doubled my reel reach overnight."', '"Instagram told me exactly why my reels fail. Here\'s what they said."'],
    keyPoints: ['Specific numbers beat vague claims — always give a real figure', 'Show the actual setting or action clearly on screen', 'Address the objection "this won\'t work for me" directly before they think it'],
    cta: 'Save this reel and drop "algorithm" in comments — I\'ll send the full breakdown',
    hashtags: ['#instagramgrowth', '#reelstips', '#socialmediagrowth', '#contentcreator', '#instagramalgorithm'],
    musicSuggestion: 'Low-fi instrumental — lets your words carry the weight, no competing audio',
    setupTip: 'Film in one take, slightly handheld feel — too polished kills the credibility of a "secret" reveal',
  },
  {
    id: 'r2', title: '30-Day Content Experiment Results',
    hook: '"I posted the same reel 30 times in 30 days. Day 1 vs Day 30 is insane."',
    coreAngle: 'Personal experiment with documented results — data-driven but deeply human',
    whyItWorks: '"Same reel" is counterintuitive (why would anyone do that?) + 30-day journey = binge-trigger.',
    estimatedViews: '80K–250K', difficulty: 'medium', format: 'Split-screen / montage',
    scriptOutline: ['Hook (0–4s): State the experiment — let the absurdity land', 'Day 1 clip (4–12s): Raw, unpolished performance — don\'t over-edit this', 'Montage (12–28s): Progress clips with view counter visible on screen', 'Day 30 result (28–40s): The final video and its actual stats', 'Lesson (40–50s): The one thing that actually changed — be specific'],
    hookVariations: ['"What happens when you post every day for 30 days? I found out."', '"Day 1 vs Day 30: same creator, wildly different results."', '"30 days of posting. Here\'s every lesson I wish someone told me on day 1."'],
    keyPoints: ['Show real analytics — not estimates. Credibility depends on the screenshot', 'Be honest about what didn\'t work — it builds more trust than a clean success story', 'Frame the struggle as universal, not just personal'],
    cta: 'Follow for Day 31 — I\'m not done yet',
    hashtags: ['#30daychallenge', '#contentcreatorlife', '#instagramtips', '#reelsgrowth', '#socialmedia'],
    musicSuggestion: 'Trending upbeat track — energy should match the upward arc of the progress story',
    setupTip: 'Day 1 must look genuinely rough — do not over-edit the early clips or the transformation loses impact',
  },
  {
    id: 'r3', title: 'Hot Take: Why Most Creators Stay Small',
    hook: '"Most creators are building an audience wrong. The Instagram algorithm is punishing them for it."',
    coreAngle: 'Contrarian opinion — challenge a widely held belief with a defensible counter-argument',
    whyItWorks: '"Wrong" triggers both disagreement (comments) AND agreement (shares). Both signals boost reach simultaneously.',
    estimatedViews: '200K–600K', difficulty: 'easy', format: 'Talking head with text emphasis',
    scriptOutline: ['Hook (0–3s): Bold claim — deliver with conviction, no hedge', 'The common mistake (3–12s): What everyone does and believes', 'Why it\'s wrong (12–25s): The counterintuitive truth + one data point', 'What to do instead (25–38s): The correct approach — give a real example', 'Challenge (38–45s): Dare them to try your way for 7 days'],
    hookVariations: ['"Your strategy is right. Your execution is killing you. Here\'s why."', '"I\'ll tell you why you\'re posting too much. (Yes, too much.)"', '"Hot take: engagement pods are ruining your account. Here\'s the math."'],
    keyPoints: ['Back the hot take with one specific data point — opinion without proof is just noise', 'Acknowledge the counterargument before the viewer thinks it', 'End with a concrete challenge — not just advice'],
    cta: 'Tell me your take in the comments — agree or disagree?',
    hashtags: ['#hottake', '#instagramtips', '#contentmarketing', '#creatoreconomy', '#socialmediagrowth'],
    musicSuggestion: 'No music — raw audio only for hot takes builds authority and makes you seem certain',
    setupTip: 'Lean slightly forward toward camera — it subconsciously signals confidence and conviction',
  },
  {
    id: 'r4', title: 'React & Analyse a Viral Reel',
    hook: '"This reel got 5M views. I\'m telling you exactly why — and what you can steal from it."',
    coreAngle: 'Analysis of existing viral content — teaches AND entertains simultaneously',
    whyItWorks: 'Piggybacks on the viral reel\'s credibility while positioning you as the expert analyst. Low effort, high signal.',
    estimatedViews: '120K–350K', difficulty: 'easy', format: 'Split-screen reaction / analysis',
    scriptOutline: ['Hook (0–3s): Tease the viral reel you\'re breaking down', 'Play clip (3–15s): Show 10–12s of the viral reel', 'Break it down (15–35s): 3 specific tactical decisions they made', 'How to apply (35–45s): Tell viewer how to use each tactic today', 'CTA (45–50s): "Which tactic will you try first?"'],
    hookVariations: ['"I watched 100 viral reels this week. Here\'s the pattern nobody talks about."', '"This reel has 8M views. Here are the 4 decisions that made it happen."', '"I reverse-engineered the #1 reel in [your niche]. Here\'s the blueprint."'],
    keyPoints: ['Credit the original creator — it\'s ethical AND they may share your analysis', 'Be specific: don\'t say "good editing" — say "cuts every 1.8s in the hook"', 'End with a testable takeaway they can use in their next reel today'],
    cta: 'Save this for your next reel — use one tactic and tag me in the result',
    hashtags: ['#reelanalysis', '#contentcreator', '#viraltips', '#instagramreels', '#growthstrategy'],
    musicSuggestion: 'Match the music style of the clip you\'re reacting to — maintains continuity',
    setupTip: 'Use the built-in remix feature if possible — directly connects your reel to the original\'s audience',
  },
  {
    id: 'r5', title: '"I Did It Wrong" Confession',
    hook: '"I wasted 6 months posting daily. Here\'s the embarrassing mistake that killed my growth the whole time."',
    coreAngle: 'Vulnerability + lesson — share a real failure with a clear, teachable takeaway',
    whyItWorks: 'Vulnerability triggers relatability. "Embarrassing mistake" = curiosity gap. 6 months = stakes feel real.',
    estimatedViews: '100K–300K', difficulty: 'easy', format: 'Talking head, casual setting',
    scriptOutline: ['Hook (0–4s): The confession + the cost — quantify both', 'Backstory (4–15s): What you were doing and why you thought it was right', 'Realisation moment (15–28s): How you discovered the mistake — be specific', 'The fix (28–40s): Exactly what you changed + the measurable result', 'Lesson (40–50s): The one takeaway — give them the shortcut you didn\'t have'],
    hookVariations: ['"The strategy that grew my account was the one I told everyone to avoid. Oops."', '"I deleted 40 reels. Best decision I ever made. Here\'s why."', '"My worst-performing reel taught me more than my best one. Storytime."'],
    keyPoints: ['Quantify both the mistake AND the fix — time lost + views recovered', 'Position yourself as "learned and ahead" not "still recovering"', 'The confession must feel real — don\'t polish the delivery or it loses authenticity'],
    cta: 'Drop a 🔥 if you\'ve made this same mistake',
    hashtags: ['#contentcreatorlife', '#realtalk', '#growthmindset', '#instagramtips', '#creatorfails'],
    musicSuggestion: 'Soft lo-fi — matches the reflective, honest tone of a confession format',
    setupTip: 'Film this on a couch or casual setting — a professional setup kills the authenticity of a confession',
  },
  {
    id: 'r6', title: 'Hidden Tool Nobody In Your Niche Uses',
    hook: '"This free tool completely changed how I create content. I\'ve never seen anyone in my niche talk about it."',
    coreAngle: 'Hidden gem reveal — provide value through discovery and insider knowledge',
    whyItWorks: '"Free" + "nobody talks about it" = FOMO save behaviour. Saves signal to the algorithm that content has long-term value.',
    estimatedViews: '90K–220K', difficulty: 'easy', format: 'Screen recording + voiceover',
    scriptOutline: ['Hook (0–3s): The tool exists and nobody knows it', 'Problem it solves (3–10s): The painful workflow before this tool', 'Demo (10–35s): Screen-record the 3 most useful features — show not tell', 'Results (35–42s): How it changed your workflow with measurable metrics', 'Where to get it (42–50s): Free/paid, link in bio'],
    hookVariations: ['"I found a tool that writes my captions in 10 seconds. Here\'s the demo."', '"Stop spending hours on this. This tool does it in 30 seconds."', '"The Instagram tool I use every single day that nobody ever mentions."'],
    keyPoints: ['Demo is more powerful than description — always show on screen', 'Mention the "free" angle prominently if applicable', 'Quantify the time/money saved — make the value concrete'],
    cta: 'Save this and comment "tool" for the link',
    hashtags: ['#contentcreatortools', '#instagramtips', '#productivityhack', '#creatortips', '#socialmediatools'],
    musicSuggestion: 'Upbeat background track at low volume — screen recording needs clean audio, music fills silence',
    setupTip: 'Record the screen at full resolution — pixelated demos destroy credibility instantly',
  },
  {
    id: 'r7', title: 'Myth-Busting Format',
    hook: '"Stop doing this. Every creator says it works. The data says the opposite."',
    coreAngle: 'Debunk a popular myth with data or personal proof — position yourself as the truth-teller',
    whyItWorks: 'Challenging conventional wisdom triggers heated comment debates which massively amplify organic reach.',
    estimatedViews: '180K–500K', difficulty: 'medium', format: 'Text overlay + B-roll',
    scriptOutline: ['Hook (0–3s): Bold myth-bust statement — no softening', 'State the myth (3–10s): What everyone believes and does — make them feel seen', 'Evidence against it (10–25s): Data point, screenshot, or personal proof', 'The truth (25–38s): What actually works instead — be specific', 'Challenge (38–45s): Test it yourself and report back'],
    hookVariations: ['"Posting at 6PM is not the best time to post. Here\'s the actual data."', '"Using 30 hashtags is hurting your reach, not helping it."', '"The \'consistent posting\' advice is wrong for 90% of creators. Here\'s why."'],
    keyPoints: ['Need at least one verifiable data point — not just an opinion', 'Acknowledge it worked for some — nuance prevents you from looking simply wrong', 'End with an actionable alternative, not just the debunk'],
    cta: 'Try my method for 7 days and come back to tell me the result',
    hashtags: ['#instagrammyths', '#socialmediaadvice', '#contentcreator', '#reelstips', '#instagramtruths'],
    musicSuggestion: 'Suspenseful or reveal-style audio — matches the "myth exposed" energy',
    setupTip: 'Use a visual "evidence board" style — text and screenshots reinforce the debunk visually',
  },
  {
    id: 'r8', title: '"Beginner vs Advanced" Comparison',
    hook: '"Beginner creator vs advanced creator. The difference isn\'t what you think."',
    coreAngle: 'Binary contrast — makes abstract concepts immediately concrete and self-identifying',
    whyItWorks: '"vs" is the highest-converting reel format for shares — viewers immediately place themselves and share to prove a point.',
    estimatedViews: '140K–420K', difficulty: 'easy', format: 'Split-screen side-by-side',
    scriptOutline: ['Hook (0–3s): State the vs comparison — no build-up needed', 'Beginner approach (3–18s): Show it vividly — make it relatable, not condescending', 'Advanced approach (18–33s): Show the contrast clearly — achievable, not aspirational', 'The insight (33–42s): Why the difference produces 10× the result', 'Identity CTA (42–50s): "Which one are you right now?"'],
    hookVariations: ['"Posting 10× a week vs 3× a week. Here\'s which strategy won."', '"Creator with 100 followers vs 100K: the ONE mindset difference."', '"The reel that flopped vs the reel that hit 1M. Same topic, opposite result."'],
    keyPoints: ['The "beginner" side must be something the viewer has actually done — instant identification', 'The "advanced" side should feel achievable within 30 days, not 5 years', 'End with an identity question, not just a tip — identity content gets more shares'],
    cta: 'Comment "beginner" or "advanced" — I want to know where you are right now',
    hashtags: ['#contentcreator', '#instagramgrowth', '#beginnervspro', '#reelstips', '#socialmediamarketing'],
    musicSuggestion: 'Fast-tempo beat with a clear switch point — change the audio at the vs transition to amplify the contrast',
    setupTip: 'Film both sides yourself — don\'t use stock footage. Authenticity makes the comparison believable',
  },
]

export const DUMMY_POSTING_TIMES: PostingSlot[] = [
  { day: 'Tuesday', timeSlot: '7:00 PM – 9:00 PM', audience: 'Core audience (18–34) — post-work wind-down scroll session', confidence: 'high', reasoning: 'Your top 5 reels by views were all posted between 6:30–9:15 PM on weekdays' },
  { day: 'Friday', timeSlot: '12:00 PM – 2:00 PM', audience: 'Lunch-break scrollers with weekend headspace — discovery intent is highest', confidence: 'medium', reasoning: 'Fri/Sat reels in your account avg 22% higher shares than midweek posts' },
  { day: 'Sunday', timeSlot: '10:00 AM – 11:30 AM', audience: 'High-intent viewers planning their week — save rate peaks on Sunday mornings', confidence: 'medium', reasoning: 'Sunday saves are 31% above your weekly average — viewers bookmark for Monday reference' },
]

export const DUMMY_SOUNDS: ViralSound[] = [
  { name: 'Aesthetic Chill Beats (remix)', useCase: 'Tutorials / Day-in-life', trend: '2.3M reels this week', howToUse: 'Low BPM lets your voiceover carry the weight — use at 30% volume so it\'s felt, not heard', usageCount: '2.3M' },
  { name: 'Epic Cinematic Build', useCase: 'Reveal moments / transformations', trend: 'Rising +340% in creator niche', howToUse: 'Build tension through a process, then release the music peak at the result moment', usageCount: '890K' },
  { name: 'Lo-Fi Study Vibes', useCase: 'Text-heavy / educational reels', trend: 'Evergreen performer in education niche', howToUse: 'Perfect background for slides-style reels — doesn\'t compete with your message', usageCount: '5.1M' },
  { name: 'Trendy Phonk Drop', useCase: 'Hot takes / bold statements', trend: 'Viral in creator + business niche right now', howToUse: 'Start silent, drop the beat on your main point — creates a punchline effect', usageCount: '1.7M' },
]

export const DUMMY_SERIES: ContentSeries[] = [
  {
    id: 's1', title: '"The 30-Day Creator" Documentary',
    concept: 'Document your content creation journey for 30 days — raw numbers, wins, failures, mindset shifts',
    episodes: ['Day 1: Why I\'m doing this + starting stats (honest)', 'Day 7: First week results + the biggest surprise', 'Day 15: Halfway check-in + the thing I\'m changing', 'Day 30: Final results + every lesson condensed'],
    whyItWorks: 'Each episode drives viewers to wait for the next — builds a loyal repeat-viewer base the algorithm rewards with evergreen distribution',
    frequency: 'Weekly (stretch 30 days into 4 episodes for sustainability)',
  },
  {
    id: 's2', title: '"Steal This Strategy" Breakdown Series',
    concept: 'Break down one viral creator\'s full content strategy per episode — make it actionable for your audience',
    episodes: ['@MrBeast: The 5 patterns in every viral video', '@GaryVee: Why his "quantity" strategy actually works', '@Hormozi: The framework behind his 1-liners', 'The under-1K creator in your niche nobody\'s watching yet'],
    whyItWorks: 'Piggybacks on established creators\' brand recognition while positioning you as the strategic analyst — viewers learn AND associate your credibility with theirs',
    frequency: 'Bi-weekly',
  },
  {
    id: 's3', title: '"Ask Me Anything" Weekly Series',
    concept: 'Answer 3 follower questions per episode — curated from comments and DMs for maximum relevance',
    episodes: ['AMA #1: The questions I get most in DMs', 'AMA #2: Your hardest content creation questions', 'AMA #3: Controversial takes from the comments section', 'AMA Special: Questions from 0-follower creators'],
    whyItWorks: 'Incentivises comments (people ask questions hoping to be featured) which boosts the algorithm — also deepens audience relationship dramatically',
    frequency: 'Weekly — build it into your routine',
  },
]

export const DUMMY_HASHTAGS: HashtagCluster[] = [
  { label: 'Broad Discovery', tags: ['#instagramreels', '#reelsinstagram', '#contentcreator', '#socialmedia', '#viral'], size: 'large', description: 'High competition — needed for top-of-funnel discovery. Use 2–3 max or they dilute niche signals.' },
  { label: 'Niche Authority', tags: ['#reelstips', '#instagramtips', '#growyourinstagram', '#reelsgrowth', '#instagramgrowth'], size: 'medium', description: 'Your core niche — pulls the right followers, not just views. Prioritise these over broad tags.' },
  { label: 'Creator Community', tags: ['#contentcreatorlife', '#creatorcommunity', '#ugccreator', '#smallcreator', '#reelscreator'], size: 'niche', description: 'Tight-knit tags with high engagement rate — great for comments and community signals.' },
  { label: 'Trending This Week', tags: ['#reels2025', '#instagramalgorithm', '#reelsviral', '#growthstrategy', '#digitalmarketing'], size: 'medium', description: 'Time-sensitive — rotate these weekly to stay current. Check Instagram\'s trending section every Monday.' },
]

// ─── Workflow Idea Pools ───────────────────────────────────────────────────────

export const TRENDING_WORKFLOW_IDEAS: WorkflowIdea[] = [
  {
    id: 'tw1', title: 'POV Storytelling — Own Your Perspective',
    coreAngle: 'Put the viewer in the moment. First-person narrative that makes them feel like they lived it.',
    hooks: [
      '"POV: You just discovered the one thing every top creator does differently."',
      '"POV: It\'s 11PM. You post. It hits 100K by morning. Here\'s what I did."',
      '"POV: You finally stop guessing and just do this one thing instead."',
    ],
    scripts: {
      en: [
        'Opening (0–3s): State the POV scenario directly.\nBuild (3–15s): Walk through the moment with specific details — what you saw, felt, decided.\nTwist (15–25s): Reveal the insight hidden in that moment.\nAction (25–35s): Tell them exactly what to do with it.\nCTA (35–40s): "Save this. You\'ll need it."',
        'Hook (0–3s): Drop the POV line.\nContext (3–10s): Who this is for and why it matters right now.\nStory (10–28s): Three beats — problem, realisation, result.\nTakeaway (28–36s): One sentence they can act on today.\nCTA (36–40s): "Follow if this hit different."',
        'Opener (0–3s): POV hook.\nScene-set (3–8s): Where you are, what\'s happening.\nConflict (8–18s): The moment everything clicked.\nResolution (18–30s): What changed after.\nCTA (30–38s): "Drop a 🔥 if you\'ve been here."',
      ],
      hi: [
        'शुरुआत (0–3s): POV scenario seedha bolein.\nBuild (3–15s): Us moment ke specific details — kya dekha, kya feel kiya.\nTwist (15–25s): Us moment mein chupi insight reveal karein.\nAction (25–35s): Exactly batayein kya karna hai.\nCTA (35–40s): "Isko save karo — zaroorat padegi."',
        'Hook (0–3s): POV line drop karein.\nContext (3–10s): Yeh kiske liye hai aur abhi kyun matter karta hai.\nKahani (10–28s): Teen beats — problem, samajh, result.\nSiksha (28–36s): Ek sentence jo aaj kaam aa sake.\nCTA (36–40s): "Follow karo agar yeh alag laga."',
        'Opener (0–3s): POV hook.\nScene (3–8s): Kahan ho, kya ho raha hai.\nMoment (8–18s): Jab sab kuch samjha.\nResult (18–30s): Uske baad kya badla.\nCTA (30–38s): "🔥 dalo agar aap bhi yahan rahe ho."',
      ],
      hinglish: [
        'Opening (0–3s): POV scenario directly bol do.\nBuild (3–15s): Us moment ke specific details — kya dekha, kya feel hua.\nTwist (15–25s): Us moment mein chupi insight reveal karo.\nAction (25–35s): Exactly batao kya karna hai.\nCTA (35–40s): "Save kar lo. Zaroorat padegi."',
        'Hook (0–3s): POV line drop karo.\nContext (3–10s): Kiske liye hai yeh aur abhi kyun matter karta hai.\nStory (10–28s): Teen beats — problem, realization, result.\nTakeaway (28–36s): Ek sentence jo aaj act kar sake.\nCTA (36–40s): "Follow karo agar this hit different."',
        'Opener (0–3s): POV hook.\nScene-set (3–8s): Kahan ho, kya ho raha hai.\nConflict (8–18s): Jab sab kuch click hua.\nResolution (18–30s): Uske baad kya change hua.\nCTA (30–38s): "🔥 drop karo agar tum bhi yahan rahe ho."',
      ],
    },
    tagSets: [
      ['#povstorytelling', '#contentcreator', '#instagramreels', '#reelstips', '#viral'],
      ['#storytime', '#reelsviral', '#instagramgrowth', '#creatorlife', '#contentmarketing'],
      ['#pov', '#instagramreels2025', '#socialmediastrategy', '#reelscreator', '#growthhacks'],
    ],
    music: [
      { name: 'Lo-fi Ambient Build', vibe: 'Reflective, slow burn', howToUse: 'Start at low volume. Let it breathe under your voice — don\'t compete with it.' },
      { name: 'Cinematic Piano Loop', vibe: 'Emotional, storytelling', howToUse: 'Time the piano swell to your twist moment at 15s for maximum impact.' },
      { name: 'Soft Electronic Pulse', vibe: 'Modern, steady', howToUse: 'Use at 20% volume as a bed — keeps energy up without distracting from your words.' },
      { name: 'No music (raw audio)', vibe: 'Authentic, direct', howToUse: 'POV content often hits harder without music. Your voice carries the emotion.' },
    ],
  },
  {
    id: 'tw2', title: 'Hot Take — Challenge What Everyone Believes',
    coreAngle: 'Pick a widely held belief in your niche. Flip it. Back it with one data point. Watch comments explode.',
    hooks: [
      '"Hot take: the advice everyone gives you about growth is wrong. Here\'s the actual data."',
      '"I\'m going to say something that will get me unfollowed. And I\'m okay with that."',
      '"Everyone says do X. I stopped doing X. My reach doubled. Here\'s why."',
    ],
    scripts: {
      en: [
        'Hook (0–3s): Drop the bold claim with zero hedge.\nThe myth (3–10s): What everyone does and believes — make them feel seen.\nThe data (10–22s): One specific proof point that breaks the myth.\nThe truth (22–33s): What actually works instead.\nChallenge (33–40s): "Try my way for 7 days and tell me what happens."',
        'Opener (0–3s): Controversial statement.\nContext (3–8s): Why you\'re qualified to say this.\nEvidence (8–22s): Show the receipts — screenshot, stat, personal proof.\nAlternative (22–32s): The better approach in 3 simple steps.\nCTA (32–40s): "Agree or disagree? Comments open."',
        'Hook (0–3s): Hot take claim.\nSetup (3–12s): The common advice and why people follow it.\nFlip (12–26s): Why that advice specifically hurts you in [niche].\nFix (26–36s): What you do instead.\nCTA (36–40s): "Save this before they make me delete it."',
      ],
      hi: [
        'Hook (0–3s): Bold claim bina kisi hesitation ke bolein.\nMyth (3–10s): Sablog kya karte hain — unhe mahsoos karaein ki aap unke baare mein bol rahe hain.\nData (10–22s): Ek specific proof point jo myth ko todta hai.\nSach (22–33s): Iske bajay actually kya kaam karta hai.\nChallenge (33–40s): "Mera tarika 7 din try karo aur batao kya hua."',
        'Opener (0–3s): Controversial baat.\nContext (3–8s): Aap yeh kehne ke liye qualified kyun hain.\nEvidence (8–22s): Proof dikhao — screenshot, stat, personal example.\nAlternative (22–32s): Better approach 3 simple steps mein.\nCTA (32–40s): "Agree ho ya nahi? Comments mein batao."',
        'Hook (0–3s): Hot take claim.\nSetup (3–12s): Common advice aur log ise kyun follow karte hain.\nFlip (12–26s): Yeh advice specifically [niche] mein kyun hurt karta hai.\nFix (26–36s): Aap iske bajay kya karte hain.\nCTA (36–40s): "Save karo isse pehle delete karwaein."',
      ],
      hinglish: [
        'Hook (0–3s): Bold claim, bilkul seedha, koi hedge nahi.\nMyth (3–10s): Sablog kya karte hain — feel karao ki aap unke baare mein bol rahe ho.\nData (10–22s): Ek specific proof point jo myth ko break karta hai.\nTruth (22–33s): Iske bajay actually kya work karta hai.\nChallenge (33–40s): "Mera way 7 days try karo and tell me what happens."',
        'Opener (0–3s): Controversial statement.\nContext (3–8s): Aap yeh kehne ke liye qualified kyun ho.\nEvidence (8–22s): Proof dikhao — screenshot, stat, personal proof.\nAlternative (22–32s): Better approach in 3 simple steps.\nCTA (32–40s): "Agree ya disagree? Comments open hai."',
        'Hook (0–3s): Hot take claim.\nSetup (3–12s): Common advice aur log ise kyun follow karte hain.\nFlip (12–26s): Yeh advice specifically [niche] mein kyun hurt karta hai.\nFix (26–36s): Aap iske bajay kya karte ho.\nCTA (36–40s): "Save karo before they make me delete it."',
      ],
    },
    tagSets: [
      ['#hottake', '#instagramtips', '#contentcreator', '#socialmediagrowth', '#reelsviral'],
      ['#controversialtruth', '#creatoreconomy', '#instagramalgorithm', '#reelstips', '#growthhacks'],
      ['#realtalk', '#contentmarketing', '#instagramgrowth', '#digitalmarketing', '#viral'],
    ],
    music: [
      { name: 'No music (raw audio)', vibe: 'Authoritative, direct', howToUse: 'Hot takes land harder with no music. Silence = confidence.' },
      { name: 'Subtle Tension Drone', vibe: 'Suspenseful', howToUse: 'Low hum under your voice. Builds unease that makes the reveal more satisfying.' },
      { name: 'Phonk Drop (muted)', vibe: 'Bold, punchy', howToUse: 'Use as brief accent at the hook — then cut to silence for the body.' },
      { name: 'News-style Sting', vibe: 'Urgent, factual', howToUse: 'Short sting at the hook, then silence — makes the content feel like breaking news.' },
    ],
  },
  {
    id: 'tw3', title: 'Micro-Tutorial — Teach One Thing Perfectly',
    coreAngle: 'One specific skill. Thirty seconds. Zero fluff. The algorithm rewards watch-through, and tutorials nail it.',
    hooks: [
      '"Learn this in 30 seconds. Took me 6 months to figure out."',
      '"The one thing I do before every reel that nobody else does. Watch."',
      '"Stop spending hours on this. Here\'s the 30-second version."',
    ],
    scripts: {
      en: [
        'Hook (0–3s): State the skill and the time it takes.\nSetup (3–8s): Show the problem version — what most people do wrong.\nStep 1 (8–16s): The first move, shown clearly on screen.\nStep 2 (16–24s): The second move with the key nuance most people miss.\nResult (24–30s): Show the finished outcome side by side.\nCTA (30–35s): "Save this for your next post."',
        'Hook (0–3s): Time-saving promise.\nBefore (3–8s): The slow/wrong way — show it briefly.\nProcess (8–26s): Your method in 3 clear steps, each under 6s.\nAfter (26–32s): The result and how long it actually took.\nCTA (32–38s): "Try this and tag me — I want to see your version."',
        'Hook (0–3s): One-thing promise.\nContext (3–7s): Why this specific skill changes everything.\nTutorial (7–28s): Live demo with text labels — no narration needed.\nProof (28–34s): Before vs after or time-lapse of result.\nCTA (34–40s): "Follow for one new trick every week."',
      ],
      hi: [
        'Hook (0–3s): Skill aur time batayein.\nSetup (3–8s): Problem version dikhayein — log galat kya karte hain.\nStep 1 (8–16s): Pehla kadam clearly screen par dikhayein.\nStep 2 (16–24s): Doosra kadam with key nuance jo log miss karte hain.\nResult (24–30s): Final result side by side dikhayein.\nCTA (30–35s): "Isko save karo apne next post ke liye."',
        'Hook (0–3s): Time-saving promise.\nPehle (3–8s): Galat/slow tarika — thoda dikhayein.\nProcess (8–26s): Aapka method 3 clear steps mein.\nBaad mein (26–32s): Result aur kitna time laga.\nCTA (32–38s): "Yeh try karo aur mujhe tag karo."',
        'Hook (0–3s): Ek cheez ka promise.\nContext (3–7s): Yeh specific skill kyun sab kuch badal deta hai.\nTutorial (7–28s): Live demo with text labels.\nProof (28–34s): Before vs after.\nCTA (34–40s): "Har hafte ek nayi trick ke liye follow karo."',
      ],
      hinglish: [
        'Hook (0–3s): Skill aur time batao.\nSetup (3–8s): Problem version dikhao — log wrong kya karte hain.\nStep 1 (8–16s): Pehla step clearly screen pe dikhao.\nStep 2 (16–24s): Doosra step with key nuance jo most log miss karte hain.\nResult (24–30s): Finished outcome side by side dikhao.\nCTA (30–35s): "Save kar lo apne next post ke liye."',
        'Hook (0–3s): Time-saving promise.\nBefore (3–8s): Slow/wrong way — briefly show karo.\nProcess (8–26s): Apna method in 3 clear steps.\nAfter (26–32s): Result aur actually kitna time laga.\nCTA (32–38s): "Try karo aur tag karo mujhe."',
        'Hook (0–3s): One-thing promise.\nContext (3–7s): Yeh specific skill kyun everything change karta hai.\nTutorial (7–28s): Live demo with text labels.\nProof (28–34s): Before vs after.\nCTA (34–40s): "Follow karo for one new trick every week."',
      ],
    },
    tagSets: [
      ['#tutorial', '#instagramtips', '#contentcreator', '#reelstips', '#howto'],
      ['#quicktips', '#socialmediahacks', '#creatortips', '#instagramreels', '#learnontiktok'],
      ['#microtutorial', '#reelsgrowth', '#contentmarketing', '#digitalmarketing', '#growthhacks'],
    ],
    music: [
      { name: 'Upbeat Lo-fi', vibe: 'Focused, productive', howToUse: 'Perfect backdrop for screen recordings. Keep at 25% — just enough to fill silence.' },
      { name: 'Timer Countdown SFX', vibe: 'Urgent, focused', howToUse: 'Use the ticking sound under the tutorial. Reinforces the "30 seconds" promise visually.' },
      { name: 'Chill Electronic Beat', vibe: 'Clean, modern', howToUse: 'Consistent BPM helps viewers follow the tutorial rhythm. Cut on the beat for each step.' },
      { name: 'Success SFX at end', vibe: 'Satisfying', howToUse: 'Add a brief "ding" or success sound when showing the final result — triggers dopamine.' },
    ],
  },
  {
    id: 'tw4', title: 'Day-in-the-Life — Show the Unfiltered Reality',
    coreAngle: 'No highlights, no polish. Real schedule, real numbers, real decisions. Authenticity is the algorithm hack nobody talks about.',
    hooks: [
      '"What a real content creator\'s day actually looks like. No highlight reel."',
      '"I tracked every hour of my day as a creator. The results surprised me."',
      '"6AM to 11PM as a [niche] creator — the raw, unfiltered version."',
    ],
    scripts: {
      en: [
        'Hook (0–4s): State the raw premise.\n6AM (4–10s): Real morning — messy desk, no makeup, first task.\nMid-day (10–20s): The unsexy work: editing, emails, re-filming.\nWin (20–27s): One genuine win with real metric.\nLow (27–33s): One honest failure or frustration.\nClose (33–40s): "This is what consistent actually looks like."',
        'Hook (0–3s): Time-of-day promise.\nMorning routine (3–12s): Actual first 2 hours — real tasks, real numbers.\nContent block (12–22s): How you batch content — show the real process.\nStats check (22–30s): Real analytics or engagement numbers.\nCTA (30–38s): "Follow to see if tomorrow is better."',
        'Hook (0–4s): Unfiltered premise.\nEarly wins (4–14s): The things that worked before noon.\nThe grind (14–24s): What nobody shows — the repetitive, boring work.\nEvening wrap (24–33s): End of day numbers vs morning goal.\nCTA (33–40s): "Drop your creator schedule in comments."',
      ],
      hi: [
        'Hook (0–4s): Raw premise seedha bolein.\n6 Baje (4–10s): Actual morning — messy desk, pehla kaam.\nDopahar (10–20s): Unsexy kaam: editing, emails, dubara filming.\nJeet (20–27s): Ek sacchi jeet with real metric.\nHaar (27–33s): Ek honest failure ya frustration.\nClose (33–40s): "Consistent rehna aisa dikhta hai."',
        'Hook (0–3s): Time promise.\nSakal ki routine (3–12s): Pehle 2 ghante — real tasks, real numbers.\nContent block (12–22s): Batch content kaise karte hain.\nStats (22–30s): Real analytics.\nCTA (30–38s): "Follow karo dekhne ke liye kal aur better hoga ya nahi."',
        'Hook (0–4s): Unfiltered premise.\nSakal ki jeet (4–14s): Jo kaam kiya dopahar se pehle.\nMehnat (14–24s): Jo koi nahi dikhata — repetitive kaam.\nShaam wrap (24–33s): Din ke end mein numbers vs morning goal.\nCTA (33–40s): "Creator schedule comments mein daalo."',
      ],
      hinglish: [
        'Hook (0–4s): Raw premise seedha bol do.\n6AM (4–10s): Real morning — messy desk, no filter, pehla kaam.\nMid-day (10–20s): Unsexy work: editing, emails, re-filming.\nWin (20–27s): Ek genuine win with real metric.\nLow (27–33s): Ek honest failure ya frustration.\nClose (33–40s): "This is what consistent actually looks like."',
        'Hook (0–3s): Time-of-day promise.\nMorning routine (3–12s): Actual first 2 hours — real tasks, real numbers.\nContent block (12–22s): Batch content kaise karte ho — real process dikhao.\nStats (22–30s): Real analytics ya engagement numbers.\nCTA (30–38s): "Follow karo dekhne ke liye kal better hota hai ya nahi."',
        'Hook (0–4s): Unfiltered premise.\nEarly wins (4–14s): Jo kaam hua dopahar se pehle.\nThe grind (14–24s): Jo koi nahi dikhata — boring repetitive work.\nEvening wrap (24–33s): End of day numbers vs morning goal.\nCTA (33–40s): "Drop karo apna creator schedule comments mein."',
      ],
    },
    tagSets: [
      ['#dayinthelife', '#contentcreatorlife', '#creatorroutine', '#instagramreels', '#behindthescenes'],
      ['#creatorlife', '#contentcreator', '#reelsviral', '#socialmedia', '#reallife'],
      ['#dayinmylife', '#smallcreator', '#contentcreation', '#instagramgrowth', '#rawreality'],
    ],
    music: [
      { name: 'Vlog-style Acoustic Guitar', vibe: 'Warm, personal', howToUse: 'Classic vlog sound — signals "this is real and personal" before you say a word.' },
      { name: 'Upbeat Indie Pop', vibe: 'Energetic, optimistic', howToUse: 'Matches the fast-paced morning energy. Drop it at the 6AM timestamp.' },
      { name: 'Ambient Nature Sounds', vibe: 'Calm, grounded', howToUse: 'Use during the "grind" segment — contrasts the chaos and adds a meditative quality.' },
      { name: 'Late Night Lo-fi', vibe: 'Tired, reflective', howToUse: 'Switch to this track for the evening wrap segment — mood shift signals the day is winding down.' },
    ],
  },
  {
    id: 'tw5', title: 'Before vs After — The Contrast That Forces a Watch',
    coreAngle: 'Side-by-side comparison. Same creator, different result. The gap between them is your content.',
    hooks: [
      '"My reel from 6 months ago vs today. Same camera. Same topic. Wildly different result."',
      '"Beginner creator vs experienced creator. The difference isn\'t what you think."',
      '"Before I knew this vs after. The data speaks for itself."',
    ],
    scripts: {
      en: [
        'Hook (0–3s): Set up the vs.\nBefore (3–14s): Show the old version — don\'t over-edit it, let it look genuinely rough.\nThe gap (14–18s): "Here\'s the one thing that changed."\nAfter (18–28s): Show the new version — same structure, visible improvement.\nInsight (28–36s): Name the specific difference that caused the result gap.\nCTA (36–40s): "Which one would you have scrolled past?"',
        'Hook (0–3s): Comparison claim.\nSplit screen (3–20s): Run both versions simultaneously — let viewers spot the difference.\nBreakdown (20–32s): Pause and identify the 3 key differences.\nResult reveal (32–38s): Show the metrics for each.\nCTA (38–42s): "Comment \'before\' or \'after\' — which are you?"',
        'Hook (0–3s): Contrast statement.\nVersion A (3–15s): The common approach most people use.\nVersion B (15–27s): Your approach — show it clearly.\nWhy it matters (27–35s): The view count, save rate, or reach difference.\nCTA (35–40s): "Try version B today. Report back."',
      ],
      hi: [
        'Hook (0–3s): Vs set up karein.\nPehle (3–14s): Purana version dikhayein — zyada edit mat karein.\nGap (14–18s): "Yeh ek cheez badli."\nBaad (18–28s): Naya version — same structure, visible improvement.\nInsight (28–36s): Specific difference batayein jo result gap ka karan bana.\nCTA (36–40s): "Kaunsa aap scroll kar jaate?"',
        'Hook (0–3s): Comparison claim.\nSplit screen (3–20s): Dono versions ek saath chalayein.\nBreakdown (20–32s): 3 key differences identify karein.\nResult (32–38s): Dono ke metrics dikhayein.\nCTA (38–42s): "\'Pehle\' ya \'baad\' — aap kahan hain?"',
        'Hook (0–3s): Contrast statement.\nVersion A (3–15s): Common approach jo sablog use karte hain.\nVersion B (15–27s): Aapka approach clearly dikhayein.\nKyun matter karta hai (27–35s): Views, saves, ya reach ka difference.\nCTA (35–40s): "Aaj Version B try karo. Wapas aake batao."',
      ],
      hinglish: [
        'Hook (0–3s): Vs set up karo.\nBefore (3–14s): Old version dikhao — zyada edit mat karo, genuinely rough rehne do.\nThe gap (14–18s): "Yeh ek cheez change hui."\nAfter (18–28s): New version — same structure, visible improvement.\nInsight (28–36s): Specific difference naam karo jo result gap cause kiya.\nCTA (36–40s): "Kaunsa scroll kar jaate tum?"',
        'Hook (0–3s): Comparison claim.\nSplit screen (3–20s): Dono versions simultaneously run karo.\nBreakdown (20–32s): 3 key differences identify karo.\nResult reveal (32–38s): Dono ke metrics dikhao.\nCTA (38–42s): "Comment karo \'before\' ya \'after\' — tum kahan ho?"',
        'Hook (0–3s): Contrast statement.\nVersion A (3–15s): Common approach jo most log use karte hain.\nVersion B (15–27s): Apna approach clearly dikhao.\nWhy it matters (27–35s): View count, save rate, ya reach difference.\nCTA (35–40s): "Version B try karo aaj. Report back."',
      ],
    },
    tagSets: [
      ['#beforeandafter', '#contentcreator', '#instagramgrowth', '#reelstips', '#transformation'],
      ['#glowup', '#creatorjourney', '#reelsviral', '#instagramreels', '#contentcreatorlife'],
      ['#comparison', '#growthmindset', '#instagramtips', '#socialmediagrowth', '#reels2025'],
    ],
    music: [
      { name: 'Dramatic Pause + Beat Drop', vibe: 'High contrast', howToUse: 'Silence before the "after" reveal, then drop the beat at the exact moment — maximum impact.' },
      { name: 'Upbeat Pop Transition', vibe: 'Energetic, positive', howToUse: 'Let the music shift tempo at the transition point between before and after.' },
      { name: 'Cinematic Swell', vibe: 'Epic, emotional', howToUse: 'Build from soft to loud across the whole reel — crescendo at the result reveal.' },
      { name: 'Simple Piano', vibe: 'Clean, no distraction', howToUse: 'Minimalist choice that keeps focus on the visual difference rather than the sound.' },
    ],
  },
  {
    id: 'tw6', title: 'Confession + Lesson — Earn Trust Through Failure',
    coreAngle: 'Your mistake is their shortcut. Share a real failure, explain what it cost, then give the fix.',
    hooks: [
      '"I wasted 3 months doing this wrong. The embarrassing truth about why my content wasn\'t working."',
      '"The mistake that cost me 50K followers. And what I learned from it."',
      '"I deleted my best-performing reel. Here\'s why — and whether it was the right call."',
    ],
    scripts: {
      en: [
        'Hook (0–4s): The mistake and the cost — both specific.\nThe backstory (4–14s): What you believed and why it seemed right at the time.\nThe moment (14–24s): When you realised it was wrong — be specific about what triggered it.\nThe fix (24–34s): Exactly what you changed and the measurable result.\nGift (34–40s): The shortcut they get from your mistake.\nCTA (40–44s): "🔥 if you\'ve made this same mistake."',
        'Hook (0–3s): Confession line.\nWhat I thought (3–12s): The wrong belief stated confidently — this is how they identify with it.\nWhat actually happened (12–24s): The real result of that belief, with numbers.\nThe turn (24–32s): One thing I changed.\nProof (32–38s): The result after the change.\nCTA (38–42s): "Follow so you don\'t make my mistake."',
        'Hook (0–4s): The cost stated upfront.\nMyth I believed (4–14s): What I was taught or assumed.\nThe data that broke it (14–24s): Specific numbers or evidence.\nThe replacement belief (24–34s): What I believe now and why it works better.\nCTA (34–40s): "This one change is worth a save."',
      ],
      hi: [
        'Hook (0–4s): Galti aur uska kharcha — dono specific.\nKissa (4–14s): Aap kya sochte the aur kyun sahi laga.\nWoh moment (14–24s): Jab samjhe galat tha — specific trigger batayein.\nFix (24–34s): Exactly kya badla aur measurable result kya tha.\nTohfa (34–40s): Aapki galti se unhe jo shortcut milti hai.\nCTA (40–44s): "🔥 agar aapne bhi yahi galti ki hai."',
        'Hook (0–3s): Confession line.\nMera soch (3–12s): Galat belief confidently — log isse relate karenge.\nJo actually hua (12–24s): Us belief ka real result, numbers ke saath.\nTurn (24–32s): Ek cheez jo maine badli.\nProof (32–38s): Uske baad ka result.\nCTA (38–42s): "Follow karo taaki meri galti na karo."',
        'Hook (0–4s): Kharcha pehle batayein.\nMyth (4–14s): Jo mujhe sikhaya gaya ya maine assume kiya.\nData (14–24s): Specific numbers ya evidence.\nNaya belief (24–34s): Ab kya sochta/sochti hoon aur kyun better kaam karta hai.\nCTA (34–40s): "Yeh ek change save karne layak hai."',
      ],
      hinglish: [
        'Hook (0–4s): Galti aur uska cost — dono specific.\nBackstory (4–14s): Kya believe karte the aur kyun sahi lagta tha.\nThe moment (14–24s): Jab realize hua ki galat tha — specific trigger batao.\nFix (24–34s): Exactly kya change kiya aur measurable result kya raha.\nGift (34–40s): Apni galti se unhe jo shortcut milti hai.\nCTA (40–44s): "🔥 agar tumne bhi yahi mistake ki hai."',
        'Hook (0–3s): Confession line.\nMaine socha tha (3–12s): Wrong belief confidently bolein — they\'ll immediately relate.\nJo actually hua (12–24s): Us belief ka real result, numbers ke saath.\nThe turn (24–32s): Ek cheez jo change ki.\nProof (32–38s): Result after the change.\nCTA (38–42s): "Follow karo taaki meri mistake na karo."',
        'Hook (0–4s): Cost upfront batao.\nMyth (4–14s): Jo taught kiya gaya ya assume kiya tha.\nData (14–24s): Specific numbers ya evidence.\nReplacement belief (24–34s): Ab kya believe karta/karti hoon aur kyun better kaam karta hai.\nCTA (34–40s): "This one change is worth a save."',
      ],
    },
    tagSets: [
      ['#contentcreatorlife', '#realtalk', '#instagramtips', '#growthmindset', '#creatorfails'],
      ['#confessiontime', '#socialmediamistakes', '#reelstips', '#instagramgrowth', '#creatoreconomy'],
      ['#lessonlearned', '#contentcreator', '#reelsviral', '#instagramreels', '#rawreality'],
    ],
    music: [
      { name: 'Soft Lo-fi Piano', vibe: 'Reflective, honest', howToUse: 'Confession content lands better with gentle music. Lets the vulnerability breathe.' },
      { name: 'No music (raw audio)', vibe: 'Authentic, direct', howToUse: 'Going music-free for a confession makes it feel like a real conversation, not content.' },
      { name: 'Melancholic Acoustic', vibe: 'Emotional, personal', howToUse: 'Match the sad/nostalgic energy of the backstory, then let it lift as you get to the fix.' },
      { name: 'Hopeful Strings', vibe: 'Uplifting, forward', howToUse: 'Start at the fix section — contrast the lesson phase with an optimistic musical turn.' },
    ],
  },
]

export const COMPETITOR_WORKFLOW_IDEAS: WorkflowIdea[] = [
  {
    id: 'cw1', title: 'Own the Gap They Left Open',
    coreAngle: 'Your competitor owns a format. Find the one angle they never take. Make that your signature.',
    hooks: [
      '"@[competitor] has 2M followers. They\'ve never made this type of reel. So I did."',
      '"The format every big creator in my niche ignores. Here\'s why I\'m betting on it."',
      '"I studied the top 10 creators in [niche]. They all do X. None of them do Y. Guess which one I\'m doing."',
    ],
    scripts: {
      en: [
        'Hook (0–3s): Name the gap directly.\nTheir strength (3–10s): Acknowledge what your competitor does well — don\'t trash them.\nThe gap (10–20s): What they never cover and why that\'s a problem for their audience.\nYour angle (20–32s): Show exactly how you\'re filling it — with a specific example.\nResult (32–38s): What happened when you tried it.\nCTA (38–42s): "Follow if you want the format they skipped."',
        'Hook (0–3s): The gap claim.\nResearch (3–12s): Walk through your competitor analysis — 2-3 data points.\nOpportunity (12–24s): The specific underserved topic/angle in the niche.\nYour content plan (24–34s): 3 reel ideas you\'re making to fill it.\nCTA (34–40s): "Save this — I\'m releasing all 3 this week."',
        'Hook (0–3s): Bold observation.\nBig creator format (3–14s): Show what works for them and why.\nWhy it doesn\'t fit small creators (14–24s): The specific disadvantage you identified.\nYour modified version (24–34s): How you adapted their approach for your size.\nCTA (34–40s): "Try this instead. It\'s built for where you are now."',
      ],
      hi: [
        'Hook (0–3s): Gap seedha batayein.\nUnki takkat (3–10s): Competitor kya achha karta hai — burai mat karein.\nGap (10–20s): Woh kabhi kya cover nahi karte aur kyun yeh unke audience ke liye problem hai.\nAapka angle (20–32s): Aap kaise fill kar rahe hain — specific example ke saath.\nResult (32–38s): Jab aapne try kiya toh kya hua.\nCTA (38–42s): "Follow karo woh format ke liye jo unhone skip kiya."',
        'Hook (0–3s): Gap claim.\nResearch (3–12s): Competitor analysis — 2-3 data points.\nOpportunity (12–24s): Niche mein specific underserved topic.\nPlan (24–34s): 3 reel ideas jo aap fill karne ke liye bana rahe hain.\nCTA (34–40s): "Save karo — teeno is hafte release kar raha/rahi hoon."',
        'Hook (0–3s): Bold observation.\nBada creator format (3–14s): Unke liye kya kaam karta hai aur kyun.\nChote creators ke liye kyun theek nahi (14–24s): Specific disadvantage.\nAapka modified version (24–34s): Aapne unke approach ko apne size ke liye kaise adapt kiya.\nCTA (34–40s): "Iske bajay yeh try karo."',
      ],
      hinglish: [
        'Hook (0–3s): Gap directly bol do.\nUnki strength (3–10s): Competitor kya achha karta hai — uski burai mat karo.\nThe gap (10–20s): Woh kabhi kya cover nahi karte aur kyun yeh unke audience ke liye problem hai.\nApna angle (20–32s): Exactly kaise fill kar rahe ho — specific example ke saath.\nResult (32–38s): Jab try kiya toh kya hua.\nCTA (38–42s): "Follow karo for the format they skipped."',
        'Hook (0–3s): The gap claim.\nResearch (3–12s): Apna competitor analysis walk-through — 2-3 data points.\nOpportunity (12–24s): Niche mein specific underserved topic/angle.\nContent plan (24–34s): 3 reel ideas jo fill karne ke liye bana rahe ho.\nCTA (34–40s): "Save karo — teeno is week release kar raha/rahi hoon."',
        'Hook (0–3s): Bold observation.\nBig creator format (3–14s): Unke liye kya work karta hai aur kyun.\nWhy small creators ke liye fit nahi (14–24s): Specific disadvantage jo identify kiya.\nApna modified version (24–34s): Unke approach ko apne size ke liye kaise adapt kiya.\nCTA (34–40s): "Try this instead. Built for where you are now."',
      ],
    },
    tagSets: [
      ['#contentgap', '#contentcreator', '#instagramstrategy', '#reelstips', '#growthhacks'],
      ['#competitoranalysis', '#instagramgrowth', '#contentmarketing', '#socialmediagrowth', '#viral'],
      ['#nichestrategy', '#creatoreconomy', '#reelsviral', '#instagramreels', '#growthstrategy'],
    ],
    music: [
      { name: 'Confident Hip-Hop Beat', vibe: 'Bold, strategic', howToUse: 'Matches the "I figured something out" energy. Keep at 30% — assertive not aggressive.' },
      { name: 'Minimalist Electronic', vibe: 'Analytical, clean', howToUse: 'Signals this is a strategic breakdown — pairs well with research-style content.' },
      { name: 'No music (data voice-over)', vibe: 'Authoritative', howToUse: 'When presenting competitor data, silence adds credibility. Let the numbers land.' },
      { name: 'Rising Orchestral', vibe: 'Epic, discovery', howToUse: 'Use the build at the "opportunity reveal" moment — makes the gap feel like a treasure find.' },
    ],
  },
  {
    id: 'cw2', title: '"I Tested Their Strategy" — React With Proof',
    coreAngle: 'Take their most-viewed content format. Run it yourself for 2 weeks. Show honest results.',
    hooks: [
      '"I ran @[competitor]\'s exact strategy for 14 days. The result was not what I expected."',
      '"Everyone says copy what works. I copied the #1 creator in my niche. Here\'s what actually happened."',
      '"I spent 2 weeks being @[competitor]. Here\'s what I learned about my own account."',
    ],
    scripts: {
      en: [
        'Hook (0–4s): State the experiment.\nTheir strategy (4–12s): Show their format clearly — give credit.\nYour execution (12–24s): Show clips of you doing it their way.\nWeek 1 results (24–30s): Real numbers, even if they\'re bad.\nWeek 2 shift (30–38s): What you adjusted and the result.\nVerdict (38–44s): Would you keep their strategy, adapt it, or drop it?\nCTA (44–48s): "Save — doing this with a different creator next week."',
        'Hook (0–3s): Experiment claim.\nSetup (3–10s): Why you chose this competitor and what you expected.\nExecution (10–24s): Day-by-day clips — make it feel like a documentary.\nData reveal (24–34s): Side-by-side stats: their typical results vs yours.\nLesson (34–42s): The one insight you\'re keeping.\nCTA (42–46s): "Follow to see which creator I test next."',
        'Hook (0–4s): Bold experiment premise.\nTheir format explained (4–14s): What makes their content work.\nYour attempt (14–26s): You doing it — honest, including the awkward parts.\nResult comparison (26–36s): The numbers, side by side.\nTakeaway (36–42s): What any creator can steal from this test.\nCTA (42–46s): "Comment the creator you want me to test next."',
      ],
      hi: [
        'Hook (0–4s): Experiment batayein.\nUnki strategy (4–12s): Format clearly dikhayein — credit dein.\nAapka execution (12–24s): Aapke clips unke tarike se karte hue.\nWeek 1 results (24–30s): Real numbers, chahe bure ho.\nWeek 2 shift (30–38s): Kya adjust kiya aur result.\nVerdict (38–44s): Unki strategy rakhein, adapt karein, ya chhodein?\nCTA (44–48s): "Save karo — agli week alag creator ke saath yahi karoonga/karungi."',
        'Hook (0–3s): Experiment claim.\nSetup (3–10s): Yeh competitor kyun choose kiya aur kya expect kiya.\nExecution (10–24s): Day-by-day clips — documentary jaisa.\nData (24–34s): Side-by-side stats.\nLesson (34–42s): Ek insight jo rakh rahe hain.\nCTA (42–46s): "Follow karo dekhne ke liye kaunsa creator agle test hoga."',
        'Hook (0–4s): Bold experiment.\nUnka format (4–14s): Unki content kyun kaam karti hai.\nAapki koshish (14–26s): Aap karte hue — honest, awkward parts bhi.\nResult comparison (26–36s): Numbers, side by side.\nTakeaway (36–42s): Koi bhi creator kya le sakta hai is test se.\nCTA (42–46s): "Creator comment karein jo agle test karwaana chahte hain."',
      ],
      hinglish: [
        'Hook (0–4s): Experiment state karo.\nUnki strategy (4–12s): Format clearly dikhao — credit deo.\nApna execution (12–24s): Clips unke tarike se karte hue.\nWeek 1 results (24–30s): Real numbers, chahe bure ho.\nWeek 2 shift (30–38s): Kya adjust kiya aur result kya raha.\nVerdict (38–44s): Unki strategy rakhein, adapt karein, ya drop karein?\nCTA (44–48s): "Save karo — next week different creator ke saath yahi karoonga."',
        'Hook (0–3s): Experiment claim.\nSetup (3–10s): Yeh competitor kyun choose kiya aur kya expect kiya tha.\nExecution (10–24s): Day-by-day clips — make it feel like a documentary.\nData reveal (24–34s): Side-by-side stats: unke typical results vs tumhare.\nLesson (34–42s): Ek insight jo keep kar rahe ho.\nCTA (42–46s): "Follow karo dekhne ke liye kaunsa creator next test hoga."',
        'Hook (0–4s): Bold experiment premise.\nUnka format explained (4–14s): Unki content kyun kaam karti hai.\nApni attempt (14–26s): Tum karte hue — honest, including awkward parts.\nResult comparison (26–36s): Numbers, side by side.\nTakeaway (36–42s): Koi bhi creator kya steal kar sakta hai is test se.\nCTA (42–46s): "Comment karo kaunsa creator next test karwana chahte ho."',
      ],
    },
    tagSets: [
      ['#experimentresults', '#contentcreator', '#instagramgrowth', '#competitoranalysis', '#reelstips'],
      ['#socialmediaexperiment', '#reelsviral', '#instagramreels', '#growthstrategy', '#creatortips'],
      ['#testedandtried', '#contentmarketing', '#instagramtips', '#socialmediagrowth', '#creatorlife'],
    ],
    music: [
      { name: 'Documentary-style Score', vibe: 'Investigative, curious', howToUse: 'Signals "experiment in progress" — use a building score that resolves at the data reveal.' },
      { name: 'News Ticker Background', vibe: 'Factual, urgent', howToUse: 'Adds a "breaking news" credibility to the data segments.' },
      { name: 'Suspenseful Strings', vibe: 'Tension, anticipation', howToUse: 'Build under the experiment clips — release at the result reveal.' },
      { name: 'Upbeat Resolution', vibe: 'Satisfying, conclusive', howToUse: 'Switch to this the moment you reveal the takeaway — signals "here\'s what you came for."' },
    ],
  },
  {
    id: 'cw3', title: 'The Depth Play — Go Where They Won\'t',
    coreAngle: 'Big creators post quick and broad. You go deep on the exact topic they glossed over. Own the full breakdown.',
    hooks: [
      '"@[competitor] covered this in 30 seconds. Here\'s the full breakdown it deserves."',
      '"Everyone gave you the tip. I\'m giving you the full playbook behind it."',
      '"The short version is everywhere. Here\'s what they all left out."',
    ],
    scripts: {
      en: [
        'Hook (0–3s): Reference the shallow version that\'s everywhere.\nWhy it\'s incomplete (3–10s): What the short version misses and why it matters.\nLayer 1 (10–20s): The context most creators skip.\nLayer 2 (20–30s): The nuance that changes everything.\nLayer 3 (30–40s): The advanced application.\nCTA (40–44s): "Save this — the short version won\'t help you here."',
        'Hook (0–3s): Full breakdown promise.\nThe tip everyone knows (3–8s): State it briefly — signal you know it too.\n"But here\'s what\'s missing" (8–14s): The specific gap in the common advice.\nFull framework (14–38s): Your complete breakdown in 4 steps.\nCTA (38–42s): "This took me a year to learn. Save it."',
        'Hook (0–3s): Depth claim.\nTheir version (3–10s): What the popular version says — credit them.\nYour addition (10–35s): Everything the popular version left out, structured clearly.\nWhen to use each approach (35–42s): Match the advice to the creator\'s situation.\nCTA (42–46s): "Which stage are you in? Tell me in comments."',
      ],
      hi: [
        'Hook (0–3s): Jo shallow version sab jagah hai usse reference karein.\nKyun incomplete hai (3–10s): Short version kya miss karta hai aur kyun matter karta hai.\nLayer 1 (10–20s): Context jo zyatdar creators skip karte hain.\nLayer 2 (20–30s): Nuance jo sab kuch badal deti hai.\nLayer 3 (30–40s): Advanced application.\nCTA (40–44s): "Save karo — short version yahan help nahi karega."',
        'Hook (0–3s): Full breakdown ka vaada.\nTip jo sabko pata hai (3–8s): Briefly batayein — signal dein ki aapko bhi pata hai.\n"Yeh kya chhoot gaya" (8–14s): Common advice mein specific gap.\nPura framework (14–38s): 4 steps mein complete breakdown.\nCTA (38–42s): "Isse seekhne mein mujhe ek saal laga. Save karo."',
        'Hook (0–3s): Depth claim.\nUnka version (3–10s): Popular version kya kehta hai — credit dein.\nAapka addition (10–35s): Jo popular version mein chhoot gaya, clearly structured.\nKab kaun sa use karein (35–42s): Advice ko creator ki situation se match karein.\nCTA (42–46s): "Aap kis stage mein hain? Comments mein batayein."',
      ],
      hinglish: [
        'Hook (0–3s): Jo shallow version everywhere hai usse reference karo.\nKyun incomplete hai (3–10s): Short version kya miss karta hai aur kyun matter karta hai.\nLayer 1 (10–20s): Context jo most creators skip karte hain.\nLayer 2 (20–30s): Nuance jo everything change kar deta hai.\nLayer 3 (30–40s): Advanced application.\nCTA (40–44s): "Save karo — short version yahan help nahi karega."',
        'Hook (0–3s): Full breakdown promise.\nTip jo sabko pata hai (3–8s): Briefly state karo — signal karo ki tumhe bhi pata hai.\n"But yeh kya miss hua" (8–14s): Common advice mein specific gap.\nFull framework (14–38s): 4 steps mein complete breakdown.\nCTA (38–42s): "Isse seekhne mein ek saal laga. Save kar lo."',
        'Hook (0–3s): Depth claim.\nUnka version (3–10s): Popular version kya kehta hai — credit deo.\nApna addition (10–35s): Jo popular version mein chhoot gaya, clearly structured.\nKab kaun sa approach use karein (35–42s): Advice ko creator\'s situation se match karo.\nCTA (42–46s): "Tum kis stage mein ho? Comments mein batao."',
      ],
    },
    tagSets: [
      ['#deepdive', '#contentcreator', '#instagramtips', '#reelstips', '#contentmarketing'],
      ['#fullbreakdown', '#socialmediagrowth', '#instagramgrowth', '#reelsviral', '#growthhacks'],
      ['#completeguide', '#creatortips', '#instagramreels', '#digitalmarketing', '#contentcreation'],
    ],
    music: [
      { name: 'Focused Study Lo-fi', vibe: 'Intelligent, calm', howToUse: 'Signals depth without being distracting. Keep at 20% — the content is the music here.' },
      { name: 'Minimalist Piano + Soft Bass', vibe: 'Clean, smart', howToUse: 'Each piano note punctuates a new layer — sync the music beat to each section transition.' },
      { name: 'No music', vibe: 'Professor-mode', howToUse: 'Deep educational content often performs better in silence — nothing competes with the information.' },
      { name: 'Ambient Textures', vibe: 'Intellectual, immersive', howToUse: 'Very low volume background texture — creates focus without drawing attention.' },
    ],
  },
  {
    id: 'cw4', title: 'Niche Application — Take Their Generic, Make It Specific',
    coreAngle: 'Their advice works for everyone. Your version works for YOUR audience specifically. That\'s your edge.',
    hooks: [
      '"@[competitor]\'s advice is solid. But they\'re talking to everyone. I\'m talking to [specific niche]."',
      '"The generic version of this tip. And the version that actually works for [your niche]."',
      '"Stop following advice made for 10M-follower accounts. Here\'s the [niche] version."',
    ],
    scripts: {
      en: [
        'Hook (0–3s): Generic vs specific claim.\nThe original advice (3–10s): State the generic version — be fair to it.\nWhy it doesn\'t translate (10–20s): The specific way [niche] is different from the general case.\nYour adapted version (20–34s): Step-by-step, niche-specific application.\nExample (34–40s): One creator in your niche who did this well.\nCTA (40–44s): "Save — this is your version, not theirs."',
        'Hook (0–3s): Niche-specific claim.\nThe broad tip (3–8s): What everyone says.\n"But in [niche]..." (8–14s): The specific context shift.\nNiche application (14–36s): 3 specific examples of how it works differently in your niche.\nCTA (36–40s): "Follow for advice that\'s actually for you."',
        'Hook (0–3s): Callout claim.\nTheir audience vs yours (3–12s): Who they\'re really talking to vs who you\'re talking to.\nThe translation (12–30s): Every point of their advice, re-stated for your specific niche.\nThe result difference (30–38s): Why the niche-specific version outperforms.\nCTA (38–42s): "This is why niche content wins. Save it."',
      ],
      hi: [
        'Hook (0–3s): Generic vs specific claim.\nOriginal advice (3–10s): Generic version batayein — fair rehein.\nKyun translate nahi hota (10–20s): [Niche] specifically alag kaise hai.\nAapka adapted version (20–34s): Step-by-step, niche-specific application.\nExample (34–40s): Aapke niche mein ek creator jisne yeh achha kiya.\nCTA (40–44s): "Save karo — yeh aapka version hai, unka nahi."',
        'Hook (0–3s): Niche-specific claim.\nBroad tip (3–8s): Sablog kya kehte hain.\n"Lekin [niche] mein..." (8–14s): Specific context shift.\nNiche application (14–36s): Aapke niche mein 3 specific examples.\nCTA (36–40s): "Follow karo actual aapke liye advice ke liye."',
        'Hook (0–3s): Callout claim.\nUnka audience vs aapka (3–12s): Woh actually kise bol rahe hain vs aap kise bol rahe hain.\nTranslation (12–30s): Unki advice ke har point ko aapke niche ke liye restate karein.\nResult difference (30–38s): Niche-specific version kyun better perform karta hai.\nCTA (38–42s): "Isliye niche content jeetta hai. Save karo."',
      ],
      hinglish: [
        'Hook (0–3s): Generic vs specific claim.\nOriginal advice (3–10s): Generic version state karo — fair raho uske baare mein.\nKyun translate nahi hota (10–20s): [Niche] specifically kaise different hai.\nApna adapted version (20–34s): Step-by-step, niche-specific application.\nExample (34–40s): Apne niche mein ek creator jisne yeh well kiya.\nCTA (40–44s): "Save karo — yeh aapka version hai, unka nahi."',
        'Hook (0–3s): Niche-specific claim.\nBroad tip (3–8s): Sablog kya kehte hain.\n"But [niche] mein..." (8–14s): Specific context shift.\nNiche application (14–36s): 3 specific examples of how it differently works in apne niche mein.\nCTA (36–40s): "Follow karo advice ke liye jo actually tumhare liye hai."',
        'Hook (0–3s): Callout claim.\nUnka audience vs tumhara (3–12s): Woh kise bol rahe hain actually vs tum kise bol rahe ho.\nThe translation (12–30s): Unki advice ke har point ko apne specific niche ke liye restate karo.\nResult difference (30–38s): Niche-specific version kyun outperform karta hai.\nCTA (38–42s): "Isliye niche content wins. Save kar lo."',
      ],
    },
    tagSets: [
      ['#nichemarketing', '#contentcreator', '#instagramstrategy', '#reelstips', '#targeted'],
      ['#nichestrategy', '#socialmediagrowth', '#instagramgrowth', '#contentmarketing', '#reelsviral'],
      ['#audiencefirst', '#creatortips', '#instagramreels', '#growthhacks', '#contentcreation'],
    ],
    music: [
      { name: 'Community-Feel Acoustic', vibe: 'Inclusive, warm', howToUse: 'Signals "this is made for you specifically" — warm acoustic guitar creates belonging.' },
      { name: 'Upbeat Niche-Native Sound', vibe: 'Familiar, on-brand', howToUse: 'Use audio that your specific niche audience already recognises and resonates with.' },
      { name: 'Confident Pop Beat', vibe: 'Clear, assertive', howToUse: 'The assertiveness of the claim needs matching energy in the music — keep BPM above 100.' },
      { name: 'Soft R&B Undertone', vibe: 'Personal, intimate', howToUse: 'For niches where relationship and trust matter most — signals you\'re speaking directly to them.' },
    ],
  },
]

export const REEL_WORKFLOW_IDEAS: WorkflowIdea[] = [
  {
    id: 'rw1', title: 'The Algorithm Secret — Insider Reveal',
    coreAngle: 'Specific jarring data point → unexpected action → proof. Curiosity gap forces watch-through.',
    hooks: [
      '"I got 2M views on a reel with 0 followers. Here\'s the exact thing I did differently."',
      '"This one setting change doubled my reel reach overnight."',
      '"Instagram told me exactly why my reels fail. Here\'s what they said."',
    ],
    scripts: {
      en: [
        'Hook (0–3s): State the jarring stat — let it land.\nContext (3–8s): Who you are and why this matters to them.\nThe reveal (8–25s): The specific setting or action — show it on screen.\nProof (25–38s): Screenshot or screen-record the actual result.\nCTA (38–44s): "Save and drop \'algorithm\' in comments."',
        'Hook (0–3s): Open with the result, not the process.\nSetup (3–10s): What you were doing before discovering this.\nThe discovery (10–26s): Step-by-step what you changed and why.\nBefore vs after numbers (26–36s): Real data side by side.\nCTA (36–42s): "Follow — sharing the next one next week."',
        'Hook (0–3s): Bold result claim.\nMyth first (3–12s): What you believed before — what most people do.\nThe counter (12–28s): The evidence that broke that belief.\nThe right move (28–38s): Exactly what to do instead.\nCTA (38–44s): "Save this before you post next."',
      ],
      hi: [
        'Hook (0–3s): Jarring stat bolein — pause dein.\nContext (3–8s): Aap kaun hain aur yeh kyun matter karta hai.\nReveal (8–25s): Specific setting ya action — screen par dikhayein.\nProof (25–38s): Screenshot ya screen-record.\nCTA (38–44s): "Save karo aur \'algorithm\' comments mein daalo."',
        'Hook (0–3s): Process nahi, result se shuru karein.\nSetup (3–10s): Yeh discover karne se pehle kya karte the.\nDiscovery (10–26s): Step-by-step kya badla aur kyun.\nBefore vs after numbers (26–36s): Real data side by side.\nCTA (36–42s): "Follow karo — agla agli week share karoonga."',
        'Hook (0–3s): Bold result claim.\nPehle myth (3–12s): Pehle kya sochte the — sablog kya karte hain.\nCounter (12–28s): Jo evidence ne woh belief toda.\nSahi kadam (28–38s): Exactly iske bajay kya karna hai.\nCTA (38–44s): "Agle post se pehle save karo."',
      ],
      hinglish: [
        'Hook (0–3s): Jarring stat bolein — let it land.\nContext (3–8s): Aap kaun ho aur yeh kyun matter karta hai.\nThe reveal (8–25s): Specific setting ya action — screen pe dikhao.\nProof (25–38s): Screenshot ya screen-record karo actual result ka.\nCTA (38–44s): "Save karo aur \'algorithm\' drop karo comments mein."',
        'Hook (0–3s): Process se nahi, result se start karo.\nSetup (3–10s): Yeh discover karne se pehle kya karte the.\nDiscovery (10–26s): Step-by-step kya change kiya aur kyun.\nBefore vs after numbers (26–36s): Real data side by side.\nCTA (36–42s): "Follow karo — next one next week share karoonga."',
        'Hook (0–3s): Bold result claim.\nMyth first (3–12s): Pehle kya believe karte the — most log kya karte hain.\nThe counter (12–28s): Evidence jo woh belief break kiya.\nThe right move (28–38s): Exactly iske bajay kya karna hai.\nCTA (38–44s): "Save karo next post se pehle."',
      ],
    },
    tagSets: [
      ['#instagramalgorithm', '#reelstips', '#contentcreator', '#instagramgrowth', '#viral'],
      ['#socialmediasecrets', '#reelsgrowth', '#instagramreels', '#growthhacks', '#contentmarketing'],
      ['#instagramtips', '#reelsviral', '#contentcreation', '#digitalmarketing', '#creatoreconomy'],
    ],
    music: [
      { name: 'Low-fi Instrumental', vibe: 'Focused, credible', howToUse: 'Lets your words carry the weight. Keep at 15% — just enough to fill silence.' },
      { name: 'Suspenseful Reveal Tone', vibe: 'Tense, curious', howToUse: 'Build under the setup, release at the reveal moment.' },
      { name: 'No music', vibe: 'Authoritative', howToUse: 'Algorithm secrets land harder without music. Silence = I\'m serious.' },
      { name: 'Subtle Tech Beat', vibe: 'Modern, digital', howToUse: 'Fits the Instagram/tech theme. Keep it almost inaudible — 10% volume.' },
    ],
  },
  {
    id: 'rw2', title: '30-Day Experiment — Documented Results',
    coreAngle: 'Personal experiment with real data. Counterintuitive premise + daily proof = binge-worthy series energy.',
    hooks: [
      '"I posted the same reel 30 times in 30 days. Day 1 vs Day 30 is insane."',
      '"30 days of posting. Here\'s every lesson I wish someone told me on day 1."',
      '"What happens when you post every day for 30 days? I found out."',
    ],
    scripts: {
      en: [
        'Hook (0–4s): State the experiment — let the premise land.\nDay 1 clip (4–12s): Raw, unpolished — don\'t over-edit this.\nMontage (12–28s): Progress clips with view counter visible.\nDay 30 result (28–40s): Final video and actual stats.\nLesson (40–48s): The one specific thing that changed.\nCTA (48–52s): "Follow for Day 31."',
        'Hook (0–3s): 30-day promise.\nWhy I did it (3–10s): The question you were trying to answer.\nKey milestones (10–28s): Day 5, Day 15, Day 25 — what changed.\nThe surprise (28–38s): The result you didn\'t expect.\nThe lesson (38–44s): What every creator should know from this.\nCTA (44–48s): "Save — I\'m not done yet."',
        'Hook (0–4s): Experiment statement.\nExpectation (4–10s): What you thought would happen.\nReality (10–30s): What actually happened, week by week.\nThe gap (30–38s): Why expectation and reality were so different.\nTakeaway (38–44s): The actionable version of the lesson.\nCTA (44–48s): "Comment: have you tried this?"',
      ],
      hi: [
        'Hook (0–4s): Experiment batayein.\nDin 1 clip (4–12s): Raw, unpolished — zyada edit mat karein.\nMontage (12–28s): Progress clips view counter ke saath.\nDin 30 result (28–40s): Final video aur actual stats.\nSiksha (40–48s): Ek specific cheez jo badli.\nCTA (48–52s): "Din 31 ke liye follow karo."',
        'Hook (0–3s): 30-din ka vaada.\nKyun kiya (3–10s): Kaunsa sawal answer karna tha.\nKey milestones (10–28s): Din 5, 15, 25 — kya badla.\nSurprise (28–38s): Jo result expect nahi kiya tha.\nSiksha (38–44s): Har creator ko yeh jaanna chahiye.\nCTA (44–48s): "Save karo — abhi khatam nahi hua."',
        'Hook (0–4s): Experiment statement.\nExpectation (4–10s): Kya sochte the hoga.\nReality (10–30s): Actually kya hua, hafte hafte.\nGap (30–38s): Expectation aur reality itni alag kyun thi.\nTakeaway (38–44s): Actionable version of the lesson.\nCTA (44–48s): "Comment: kya aapne yeh try kiya?"',
      ],
      hinglish: [
        'Hook (0–4s): Experiment state karo.\nDay 1 clip (4–12s): Raw, unpolished — zyada edit mat karo.\nMontage (12–28s): Progress clips with view counter visible.\nDay 30 result (28–40s): Final video aur actual stats.\nLesson (40–48s): Ek specific cheez jo change hui.\nCTA (48–52s): "Follow karo Day 31 ke liye."',
        'Hook (0–3s): 30-day promise.\nKyun kiya (3–10s): Kaunsa question answer karna tha.\nKey milestones (10–28s): Day 5, 15, 25 — kya change hua.\nThe surprise (28–38s): Jo result expect nahi kiya tha.\nThe lesson (38–44s): Har creator ko yeh jaanna chahiye.\nCTA (44–48s): "Save karo — I\'m not done yet."',
        'Hook (0–4s): Experiment statement.\nExpectation (4–10s): Kya lagta tha hoga.\nReality (10–30s): Actually kya hua, week by week.\nThe gap (30–38s): Expectation aur reality itni different kyun thi.\nTakeaway (38–44s): Actionable version of the lesson.\nCTA (44–48s): "Comment karo: kya tumne yeh try kiya?"',
      ],
    },
    tagSets: [
      ['#30daychallenge', '#contentcreatorlife', '#instagramtips', '#reelsgrowth', '#socialmedia'],
      ['#contentexperiment', '#reelsviral', '#instagramgrowth', '#creatorjourney', '#growthhacks'],
      ['#documentedresults', '#contentmarketing', '#instagramreels', '#reelstips', '#creatortips'],
    ],
    music: [
      { name: 'Trending Upbeat Track', vibe: 'Energetic, progressive', howToUse: 'Energy should match the upward arc of the progress story — louder by Day 30.' },
      { name: 'Montage-style Pop', vibe: 'Fast-paced, exciting', howToUse: 'Time cuts to the beat — each clip change on a beat hit makes the montage pop.' },
      { name: 'Reflective Lo-fi', vibe: 'Thoughtful, honest', howToUse: 'Use during the "lesson" segment — signals you\'re being real, not just celebrating.' },
      { name: 'Journey-style Instrumental', vibe: 'Cinematic, evolving', howToUse: 'Single track that builds from Day 1 to Day 30 — mirrors the transformation arc.' },
    ],
  },
  {
    id: 'rw3', title: 'Myth-Busting — Debunk With Data',
    coreAngle: 'Challenge a widely held belief with a specific data point. Comment debates amplify reach organically.',
    hooks: [
      '"Stop doing this. Every creator says it works. The data says the opposite."',
      '"Posting at 6PM is not the best time to post. Here\'s the actual data."',
      '"Using 30 hashtags is hurting your reach, not helping it."',
    ],
    scripts: {
      en: [
        'Hook (0–3s): Bold myth-bust — no softening.\nState the myth (3–10s): What everyone believes — make them feel seen.\nEvidence (10–25s): Data point, screenshot, or personal proof.\nThe truth (25–38s): What actually works instead — be specific.\nChallenge (38–44s): "Test it for 7 days. Come back and tell me."',
        'Hook (0–3s): Controversial claim.\nWhy people believe the myth (3–12s): How it became conventional wisdom.\nWhere it breaks down (12–26s): The specific scenario where it fails.\nThe better approach (26–36s): Your alternative with evidence.\nCTA (36–42s): "Agree or disagree? I\'m reading every comment."',
        'Hook (0–3s): Myth exposed.\nThe advice (3–8s): State it exactly as people hear it.\nMy test (8–22s): What happened when I followed it vs when I didn\'t.\nThe data (22–34s): Side-by-side numbers.\nThe verdict (34–40s): What to do instead, simply stated.\nCTA (40–44s): "Save before your next post."',
      ],
      hi: [
        'Hook (0–3s): Bold myth-bust — koi softening nahi.\nMyth batayein (3–10s): Sablog kya believe karte hain — feel karaein.\nEvidence (10–25s): Data point, screenshot, ya personal proof.\nSach (25–38s): Iske bajay actually kya kaam karta hai.\nChallenge (38–44s): "7 din test karo. Wapas aake batao."',
        'Hook (0–3s): Controversial claim.\nLog myth kyun believe karte hain (3–12s): Yeh conventional wisdom kaise bana.\nKahan toot ta hai (12–26s): Specific scenario jahan fail karta hai.\nBetter approach (26–36s): Aapka alternative evidence ke saath.\nCTA (36–42s): "Agree ya disagree? Har comment padh raha/rahi hoon."',
        'Hook (0–3s): Myth exposed.\nAdvice (3–8s): Exactly waise batayein jaise log sunte hain.\nMera test (8–22s): Follow karne par vs na karne par kya hua.\nData (22–34s): Side-by-side numbers.\nVerdict (34–40s): Iske bajay kya karna hai, simply.\nCTA (40–44s): "Agle post se pehle save karo."',
      ],
      hinglish: [
        'Hook (0–3s): Bold myth-bust — bilkul koi softening nahi.\nMyth state karo (3–10s): Sablog kya believe karte hain — feel karao.\nEvidence (10–25s): Data point, screenshot, ya personal proof.\nThe truth (25–38s): Iske bajay actually kya kaam karta hai — specific raho.\nChallenge (38–44s): "7 days test karo. Come back and tell me."',
        'Hook (0–3s): Controversial claim.\nLog myth kyun believe karte hain (3–12s): Yeh conventional wisdom kaise bana.\nKahan break karta hai (12–26s): Specific scenario where it fails.\nBetter approach (26–36s): Apna alternative with evidence.\nCTA (36–42s): "Agree ya disagree? Main har comment padh raha/rahi hoon."',
        'Hook (0–3s): Myth exposed.\nThe advice (3–8s): Exactly waise state karo jaise log sunte hain.\nMera test (8–22s): Follow karne par vs na karne par kya hua.\nThe data (22–34s): Side-by-side numbers.\nThe verdict (34–40s): Iske bajay kya karna hai, simply stated.\nCTA (40–44s): "Save karo next post se pehle."',
      ],
    },
    tagSets: [
      ['#instagrammyths', '#reeltips', '#contentcreator', '#socialmediaadvice', '#viral'],
      ['#mythbusting', '#instagramtips', '#reelsviral', '#growthstrategy', '#contentmarketing'],
      ['#realtalk', '#instagramalgorithm', '#contentcreation', '#socialmediagrowth', '#growthhacks'],
    ],
    music: [
      { name: 'Suspenseful Reveal Audio', vibe: 'Tense, exposing', howToUse: 'Matches the "myth exposed" energy — suspense build, then release at the truth.' },
      { name: 'News-style Sting', vibe: 'Urgent, credible', howToUse: 'Short sting at the hook, then silence — makes it feel like breaking news.' },
      { name: 'No music', vibe: 'Confident, direct', howToUse: 'Myth-busting lands hardest in silence. No music = maximum authority.' },
      { name: 'Dramatic Piano', vibe: 'Bold, definitive', howToUse: 'Single notes at each revelation point — punctuates the data like a verdict.' },
    ],
  },
]
