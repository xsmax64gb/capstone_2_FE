'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Send } from 'lucide-react'
import type { ExerciseItem } from '../../data'

type AttemptClientProps = {
  exercise: ExerciseItem
}

export function AttemptClient({ exercise }: AttemptClientProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [elapsedSec, setElapsedSec] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSec((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const currentQuestion = exercise.questions[currentIndex]
  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers]
  )

  const submit = () => {
    let score = 0
    exercise.questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) score += 1
    })

    const answersParam = exercise.questions
      .map((q) => String(answers[q.id] ?? -1))
      .join(',')

    router.push(
      `/exercises/${exercise.id}/result?score=${score}&total=${exercise.questions.length}&time=${elapsedSec}&answers=${encodeURIComponent(answersParam)}`
    )
  }

  const selectAnswer = (index: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: index }))
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-10">
      <section className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/exercises/${exercise.id}`}
          className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to detail
        </Link>
        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
          <Clock3 className="mr-1.5 h-4 w-4" />
          {Math.floor(elapsedSec / 60)}:{String(elapsedSec % 60).padStart(2, '0')}
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              {exercise.title} - Question {currentIndex + 1}/{exercise.questions.length}
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Attempt Session</h1>
          </div>
          <p className="text-sm font-semibold text-slate-700">
            Answered: {answeredCount}/{exercise.questions.length}
          </p>
        </div>

        <div className="h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-black transition-all"
            style={{ width: `${((currentIndex + 1) / exercise.questions.length) * 100}%` }}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold leading-relaxed">{currentQuestion.prompt}</h2>
        <div className="mt-5 space-y-3">
          {currentQuestion.options.map((option, index) => {
            const selected = answers[currentQuestion.id] === index
            return (
              <button
                key={option}
                onClick={() => selectAnswer(index)}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
                  selected
                    ? 'border-black bg-black text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {option}
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-5">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentIndex === 0}
            className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </button>

          <div className="flex gap-2">
            {currentIndex < exercise.questions.length - 1 && (
              <button
                onClick={() =>
                  setCurrentIndex((prev) => Math.min(prev + 1, exercise.questions.length - 1))
                }
                className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            )}

            {currentIndex === exercise.questions.length - 1 && (
              <button
                onClick={submit}
                className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Send className="mr-1.5 h-4 w-4" />
                Submit
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="inline-flex items-center text-sm text-slate-600">
          <CheckCircle2 className="mr-1.5 h-4 w-4" />
          Tip: You can change any answer before submitting.
        </p>
      </section>
    </main>
  )
}
