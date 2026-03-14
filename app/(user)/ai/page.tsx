'use client'

import Link from 'next/link'
import { Check, Lock, Play, Sparkles } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

type StageStatus = 'completed' | 'current' | 'locked'

type Stage = {
  id: string
  title: string
  subtitle: string
  xp: number
  status: StageStatus
}

const AI_STAGES: Stage[] = [
  { id: 'a1-001', title: 'Basic 101', subtitle: 'Greeting and introductions', xp: 30, status: 'completed' },
  { id: 'a1-002', title: 'Common Verbs', subtitle: 'Daily action conversation', xp: 40, status: 'completed' },
  { id: 'a1-003', title: 'Travel Essentials', subtitle: 'Airport and transport', xp: 55, status: 'current' },
  { id: 'a1-004', title: 'Business Vocabulary', subtitle: 'Office communication', xp: 65, status: 'locked' },
  { id: 'a1-005', title: 'Food & Restaurant', subtitle: 'Ordering and requests', xp: 50, status: 'locked' },
  { id: 'a2-001', title: 'Small Talk Mastery', subtitle: 'Keep conversation flowing', xp: 70, status: 'locked' },
  { id: 'a2-002', title: 'Storytelling Basics', subtitle: 'Talk about past events', xp: 80, status: 'locked' },
  { id: 'a2-003', title: 'Opinion & Debate', subtitle: 'Express agreement/disagreement', xp: 85, status: 'locked' },
  { id: 'b1-001', title: 'Problem Solving', subtitle: 'Discuss issues and solutions', xp: 95, status: 'locked' },
  { id: 'b1-002', title: 'Project Discussion', subtitle: 'Planning and team meeting', xp: 110, status: 'locked' },
]

function stageBadge(status: StageStatus) {
  if (status === 'completed') return 'COMPLETED'
  if (status === 'current') return 'IN PROGRESS'
  return 'LOCKED'
}

function StageNode({ stage, side }: { stage: Stage; side: 'left' | 'right' }) {
  const isLocked = stage.status === 'locked'
  const isCurrent = stage.status === 'current'
  const isCompleted = stage.status === 'completed'

  const content = (
    <div
      className={`ai-node-card inline-flex max-w-[220px] flex-col items-center rounded-2xl border border-transparent px-3 py-2 transition-all duration-300 ${
        side === 'left' ? 'md:translate-x-4' : 'md:-translate-x-4'
      } ${
        isLocked
          ? 'cursor-not-allowed opacity-80'
          : 'cursor-pointer hover:-translate-y-1 hover:scale-[1.02] hover:border-slate-200 hover:bg-white hover:shadow-xl'
      }`}
    >
      <div
        className={`ai-node-glow relative flex h-16 w-16 items-center justify-center rounded-full border text-white shadow-xl transition-transform duration-500 ${
          isCompleted
            ? 'border-black bg-black'
            : isCurrent
              ? 'border-black bg-white text-black'
              : 'border-slate-200 bg-slate-100 text-slate-400'
        } ${isCurrent ? 'animate-float' : ''} ${!isLocked ? 'group-hover:scale-110' : ''}`}
      >
        {isCompleted && <Check className="h-6 w-6" />}
        {isCurrent && <Play className="h-6 w-6 fill-current" />}
        {isLocked && <Lock className="h-5 w-5" />}
      </div>

      <h3 className="mt-3 text-center text-base font-bold tracking-tight text-slate-900">{stage.title}</h3>
      <p className="mt-1 text-xs text-slate-500">{stage.subtitle}</p>
      <p
        className={`mt-1 text-[11px] font-bold ${
          isCompleted ? 'text-emerald-600' : isCurrent ? 'text-amber-600' : 'text-slate-400'
        }`}
      >
        {stageBadge(stage.status)}
      </p>
      <p className="text-[10px] font-semibold text-slate-400">+{stage.xp} XP</p>

      <div className="mt-3">
        {isLocked ? (
          <span className="inline-flex rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-400">
            Locked
          </span>
        ) : (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
              isCurrent
                ? 'bg-black text-white group-hover:bg-slate-800'
                : 'border border-slate-200 text-slate-700 group-hover:bg-slate-50'
            }`}
          >
            {isCurrent ? 'Continue' : 'Review'}
          </span>
        )}
      </div>
    </div>
  )

  return (
    <div className={`relative flex w-full ${side === 'left' ? 'justify-start' : 'justify-end'}`}>
      {isLocked ? (
        content
      ) : (
        <Link
          href={`/ai/${stage.id}`}
          className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2"
          aria-label={`Open stage ${stage.title}`}
          title={`Open ${stage.title}`}
        >
          {content}
        </Link>
      )}
    </div>
  )
}

function Connector({ reverse }: { reverse: boolean }) {
  return (
    <div className="pointer-events-none relative my-1 h-16 w-full md:my-2 md:h-24">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id={reverse ? 'aiGradR' : 'aiGradL'} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(15,23,42,0.15)" />
            <stop offset="45%" stopColor="rgba(15,23,42,0.45)" />
            <stop offset="100%" stopColor="rgba(15,23,42,0.2)" />
          </linearGradient>
        </defs>
        <path
          className="ai-connector-base"
          d={reverse ? 'M82,8 C68,22 56,48 48,58 C38,72 24,82 14,92' : 'M18,8 C32,22 44,48 52,58 C62,72 76,82 86,92'}
          fill="none"
          stroke={`url(#${reverse ? 'aiGradR' : 'aiGradL'})`}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          className="ai-connector-flow"
          d={reverse ? 'M82,8 C68,22 56,48 48,58 C38,72 24,82 14,92' : 'M18,8 C32,22 44,48 52,58 C62,72 76,82 86,92'}
          fill="none"
          stroke="rgba(15,23,42,0.55)"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

export default function AIMapPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-5xl px-4 py-10 md:px-8">
        <ScrollReveal>
          <section className="mb-10 rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 shadow-sm md:p-8">
            <p className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              AI Adventure Map
            </p>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Conquer Speaking Stages
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
              Complete one stage to unlock the next. Locked lessons stay hidden until you pass
              your current checkpoint.
            </p>
          </section>
        </ScrollReveal>

        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-4 py-8 shadow-sm md:px-8 md:py-10">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -left-10 top-10 h-56 w-56 rounded-full bg-slate-100 blur-3xl" />
            <div className="absolute -right-10 bottom-20 h-64 w-64 rounded-full bg-slate-100 blur-3xl" />
          </div>

          <div className="relative">
            {AI_STAGES.map((stage, index) => {
              const side = index % 2 === 0 ? 'left' : 'right'
              const reverse = index % 2 === 1

              return (
                <div key={stage.id}>
                  <ScrollReveal delay={index * 60}>
                    <div className="flex justify-center">
                      <StageNode stage={stage} side={side} />
                    </div>
                  </ScrollReveal>
                  {index < AI_STAGES.length - 1 && (
                    <ScrollReveal delay={index * 60 + 40}>
                      <Connector reverse={reverse} />
                    </ScrollReveal>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </ProtectedRoute>
  )
}
