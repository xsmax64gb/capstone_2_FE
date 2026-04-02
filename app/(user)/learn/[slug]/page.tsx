'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Check, Crown, Lock, MessageSquare, Play, Star } from 'lucide-react'
import {
  LearnPathOverlay,
  LEARN_NODE_COL_CLASS,
  LEARN_PATH_TRACK_CLASS,
} from '@/components/learn/zigzag-connector'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { useGetLearnMapBySlugQuery, type LearnStep } from '@/store/services/learnApi'

type StepVisual = 'completed' | 'current' | 'locked'

function StepStars({ stars }: { stars: number }) {
  if (stars <= 0) return null

  return (
    <div className="mt-2 flex items-center justify-center gap-0.5 text-amber-500">
      {Array.from({ length: 3 }, (_, index) => (
        <Star
          key={`step-star-${index}`}
          className={`h-3.5 w-3.5 ${index < stars ? 'fill-current' : 'text-slate-200'}`}
        />
      ))}
    </div>
  )
}

function stepVisual(
  step: LearnStep,
  mapLocked: boolean,
  currentStepId: string | null | undefined,
  completedStepIds: Set<string>,
): StepVisual {
  if (mapLocked) return 'locked'
  if (completedStepIds.has(step.id)) return 'completed'
  if (currentStepId && step.id === currentStepId) return 'current'
  return 'locked'
}

export default function LearnMapDetailPage() {
  const params = useParams()
  const slug = typeof params.slug === 'string' ? params.slug : ''
  const trackRef = useRef<HTMLDivElement | null>(null)
  const anchorRefs = useRef<Array<HTMLDivElement | null>>([])
  const { data, isLoading, error } = useGetLearnMapBySlugQuery(slug, { skip: !slug })

  const mapLocked = data?.progress?.status === 'locked'
  const steps = data?.steps ?? []
  anchorRefs.current.length = steps.length
  const completedStepIds = new Set(
    steps.filter((step) => step.bestScore != null).map((step) => step.id),
  )
  const requestedCurrentStepId = data?.progress?.currentStepId
  const currentStepId =
    requestedCurrentStepId && !completedStepIds.has(requestedCurrentStepId)
      ? requestedCurrentStepId
      : steps.find((step) => !completedStepIds.has(step.id))?.id ?? null
  const primaryCurrentIndex = steps.findIndex((s) => s.id === currentStepId)
  const effectivePrimary = primaryCurrentIndex >= 0 ? primaryCurrentIndex : -1

  return (
    <ProtectedRoute>
      <main className="min-h-[60vh] bg-gradient-to-b from-slate-50 via-white to-slate-50 px-5 py-8 md:px-10">
        <Link
          href="/learn"
          className="inline-flex items-center text-sm font-semibold text-slate-600 transition-colors hover:text-black"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Về bản đồ lớn
        </Link>

        {isLoading && <p className="mt-10 text-center text-sm text-slate-500">Đang tải…</p>}
        {error && (
          <p className="mt-10 text-center text-sm text-red-600">Không tải được bản đồ.</p>
        )}

        {data && (
          <>
            <ScrollReveal>
              <header className="mx-auto mt-8 max-w-2xl text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Trong map</p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  {data.map.title}
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{data.map.description}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Level {data.map.level} · {data.progress?.totalXPEarned ?? 0} / {data.map.requiredXPToComplete} XP
                </p>
                {mapLocked && (
                  <p className="mx-auto mt-5 flex max-w-lg items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <Lock className="h-4 w-4 shrink-0" />
                    Bản đồ đang khóa — cần hoàn thành map trước và đạt đủ XP yêu cầu để mở.
                  </p>
                )}
              </header>
            </ScrollReveal>

            <div ref={trackRef} className={`relative isolate mt-12 ${LEARN_PATH_TRACK_CLASS}`}>
              <LearnPathOverlay containerRef={trackRef} anchorRefs={anchorRefs} anchorCount={steps.length} />
              {steps.map((step, index) => {
                const side: 'left' | 'right' = index % 2 === 0 ? 'left' : 'right'
                const visual = stepVisual(step, mapLocked, currentStepId, completedStepIds)
                const isBoss = step.type === 'boss'
                const isLocked = visual === 'locked'
                const isCurrent = visual === 'current'
                const isCompleted = visual === 'completed'
                const stepStars = isCompleted ? Math.max(0, Math.min(step.starsEarned ?? 0, 3)) : 0
                const href = isLocked ? '#' : `/learn/${slug}/step/${step.id}`
                const emphasizeFloat = isCurrent && index === effectivePrimary

                const cardInner = (
                  <div
                    className={`ai-node-card group inline-flex w-full max-w-[13rem] flex-col items-center rounded-2xl border border-transparent px-2 py-2 transition-all duration-300 ${
                      isLocked
                        ? 'cursor-not-allowed opacity-75'
                        : 'cursor-pointer hover:-translate-y-1 hover:scale-[1.02] hover:border-slate-200 hover:bg-white hover:shadow-xl'
                    }`}
                  >
                    <div
                      ref={(node) => {
                        anchorRefs.current[index] = node
                      }}
                      className={`ai-node-glow relative flex h-14 w-14 items-center justify-center rounded-full border text-sm font-bold text-white shadow-lg transition-transform md:h-16 md:w-16 ${
                        isBoss
                          ? isCompleted
                            ? 'border-violet-700 bg-violet-700'
                            : isCurrent
                              ? 'border-violet-600 bg-white text-violet-700'
                              : 'border-violet-200 bg-violet-100 text-violet-400'
                          : isCompleted
                            ? 'border-black bg-black text-white'
                            : isCurrent
                              ? 'border-black bg-white text-black'
                              : 'border-slate-200 bg-slate-100 text-slate-400'
                      } ${emphasizeFloat ? 'animate-float' : ''} ${!isLocked ? 'group-hover:scale-110' : ''}`}
                    >
                      {isBoss && isCompleted && <Check className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.5} />}
                      {isBoss && isCurrent && <Crown className="h-5 w-5 md:h-6 md:w-6" />}
                      {isBoss && isLocked && <Lock className="h-5 w-5 md:h-6 md:w-6" />}
                      {!isBoss && isCompleted && <Check className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.5} />}
                      {!isBoss && isCurrent && <Play className="h-5 w-5 fill-current md:h-6 md:w-6" />}
                      {!isBoss && isLocked && <span className="text-sm font-bold">{index + 1}</span>}
                    </div>

                    <h2 className="mt-3 text-center text-sm font-bold tracking-tight text-slate-900 md:text-base">
                      {step.title}
                    </h2>
                    <span className="mt-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                      {step.type}
                    </span>
                    {!isLocked && (
                      <div className="mt-2 flex flex-wrap justify-center gap-1">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {step.gradingDifficulty || 'medium'}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          pass {step.minimumPassScore ?? 'auto'}
                        </span>
                      </div>
                    )}
                    {step.scenarioTitle && (
                      <p className="mt-2 line-clamp-2 text-center text-[11px] text-slate-500">{step.scenarioTitle}</p>
                    )}
                    <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                      <MessageSquare className="h-3 w-3" />
                      {isLocked ? 'Làm bước trước' : isCurrent ? 'Tiếp tục' : 'Ôn lại'}
                    </p>
                    <StepStars stars={stepStars} />
                  </div>
                )

                return (
                  <div key={step.id}>
                    <ScrollReveal delay={60 + index * 90}>
                      <div className={`flex w-full ${side === 'left' ? 'justify-start' : 'justify-end'}`}>
                        <div className={LEARN_NODE_COL_CLASS}>
                          {isLocked ? (
                            <div className="select-none">{cardInner}</div>
                          ) : (
                            <Link href={href} className="block w-full">
                              {cardInner}
                            </Link>
                          )}
                        </div>
                      </div>
                    </ScrollReveal>
                  </div>
                )
              })}

              {steps.length === 0 && (
                <p className="text-center text-sm text-slate-500">Chưa có bước nào trong map này.</p>
              )}
            </div>
          </>
        )}
      </main>
    </ProtectedRoute>
  )
}
