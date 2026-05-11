export type Language = 'en' | 'hi' | 'hinglish'

export interface WorkflowIdea {
  id: string
  title: string
  coreAngle: string
  hooks: string[]
  scripts: Record<Language, string[]>
  tagSets: string[][]
  music: Array<{ name: string; vibe: string; howToUse: string }>
}

export type Momentum = 'rising' | 'peaked' | 'stable'
export type Impact = 'high' | 'medium' | 'low'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type Confidence = 'high' | 'medium' | 'low'
export type TagSize = 'large' | 'medium' | 'niche'

export interface TrendingTopic {
  topic: string
  category: 'niche' | 'global'
  momentum: Momentum
  relevance: number
  reason: string
}

export interface WorkingTheme {
  theme: string
  avgViews: number
  topExample: string
  insight: string
}

export interface AvoidTheme {
  theme: string
  avgViews: number
  reason: string
  alternative: string
}

export interface CompetitorOpportunity {
  id: string
  competitor: string
  theirApproach: string
  gap: string
  yourOpportunity: string
  estimatedImpact: Impact
  tactics: string[]
  reelConcepts: Array<{ title: string; hook: string; scriptStarter: string[] }>
}

export interface ReelIdea {
  id: string
  title: string
  hook: string
  coreAngle: string
  whyItWorks: string
  estimatedViews: string
  difficulty: Difficulty
  format: string
  scriptOutline: string[]
  hookVariations: string[]
  keyPoints: string[]
  cta: string
  hashtags: string[]
  musicSuggestion: string
  setupTip: string
}

export interface PostingSlot {
  day: string
  timeSlot: string
  audience: string
  confidence: Confidence
  reasoning: string
}

export interface HeadlineInsightData {
  headline: string
  supporting: string
  action: string
}

export interface ViralSound {
  name: string
  useCase: string
  trend: string
  howToUse: string
  usageCount: string
}

export interface ContentSeries {
  id: string
  title: string
  concept: string
  episodes: string[]
  whyItWorks: string
  frequency: string
}

export interface HashtagCluster {
  label: string
  tags: string[]
  size: TagSize
  description: string
}

export interface CompetitorGapIdea {
  id: string
  title: string
  competitorName: string
  theirWeakness: string
  yourAngle: string
  whyItWins: string
  hookDirection: string
  estimatedImpact: 'high' | 'medium'
}

export interface LockedContent {
  idea: CompetitorGapIdea
  hook: string
  script: string
  language: Language
  lockedAt: string
}

export interface ReachEstimate {
  range: string
  reason: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  reachEstimate?: ReachEstimate
  idea?: CompetitorGapIdea
}
