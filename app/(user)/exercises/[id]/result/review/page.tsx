'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, Check, X } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useGetExerciseReviewQuery } from '@/lib/api/exercisesApi'

export default function ExerciseReviewPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const id = params?.id ?? ''

  const answers = searchParams.get('answers') ?? ''
  const score = searchParams.get('score') ?? ''
  const total = searchParams.get('total') ?? ''

  const { data, isLoading, isError } = useGetExerciseReviewQuery({ id, answers }, { skip: !id })
  const review = data?.review ?? []

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-10">
        <section className="mb-8">
          <Link
            href={`/exercises/${id}/result?score=${score}&total=${total}&answers=${encodeURIComponent(answers)}`}
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to result
          </Link>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">Answer Review</h1>
          <p className="mt-1 text-slate-500">
            Check each explanation to understand mistakes and improve faster.
          </p>
        </section>

        {isLoading && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Loading review details...
          </div>
        )}

        {isError && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Failed to load review details.
          </div>
        )}

        <section className="space-y-4">
          {review.map((question, index) => (
            <article key={question.questionId} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold">
                  Q{index + 1}. {question.prompt}
                </h2>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                    question.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {question.isCorrect ? (
                    <>
                      <Check className="mr-1 h-3.5 w-3.5" />
                      Correct
                    </>
                  ) : (
                    <>
                      <X className="mr-1 h-3.5 w-3.5" />
                      Incorrect
                    </>
                  )}
                </span>
              </div>
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Your answer:</span>{' '}
                {question.selectedText ?? 'Not answered'}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                <span className="font-semibold">Correct answer:</span> {question.correctText ?? '-'}
              </p>
              <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                <span className="font-semibold text-slate-800">Explanation:</span> {question.explanation}
              </p>
            </article>
          ))}
        </section>

        {!isLoading && !isError && review.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-semibold">No review data</p>
            <p className="mt-1 text-sm text-slate-500">Submit an attempt first to generate review details.</p>
          </div>
        )}
      </main>
    </ProtectedRoute>
  )
}
