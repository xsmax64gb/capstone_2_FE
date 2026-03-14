'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronLeft, ChevronRight, Clock3, Send } from 'lucide-react'
import type { VocabularyItem } from '../../data'

type VocabularyQuizClientProps = {
  item: VocabularyItem
}

export function VocabularyQuizClient({ item }: VocabularyQuizClientProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [elapsedSec, setElapsedSec] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setElapsedSec((prev) => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const currentQuestion = item.quiz[currentIndex]
  const total = item.quiz.length

  const submit = () => {
    let score = 0
    item.quiz.forEach((q) => {
      if (answers[q.id] === q.correctIndex) score += 1
    })

    const answersParam = item.quiz.map((q) => String(answers[q.id] ?? -1)).join(',')
    router.push(
      `/vocabulary/${item.id}/quiz/result?score=${score}&total=${total}&time=${elapsedSec}&answers=${encodeURIComponent(answersParam)}`
    )
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-10">
      <section className="mb-8 flex flex-wrap items-center justify-between gap-2">
        <Link
          href={`/vocabulary/${item.id}`}
          className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to word detail
        </Link>
        <span className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
          <Clock3 className="mr-1.5 h-4 w-4" />
          {Math.floor(elapsedSec / 60)}:{String(elapsedSec % 60).padStart(2, '0')}
        </span>
      </section>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Vocabulary Quiz Mode</h1>
        <p className="mt-1 text-sm text-slate-500">
          {item.word} • Question {currentIndex + 1}/{total}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold leading-relaxed">{currentQuestion.prompt}</h2>
        <div className="mt-5 space-y-3">
          {currentQuestion.options.map((option, index) => {
            const selected = answers[currentQuestion.id] === index
            return (
              <button
                key={option}
                onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: index }))}
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

        <div className="mt-6 flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentIndex === 0}
            className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </button>

          {currentIndex < total - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, total - 1))}
              className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={submit}
              className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Send className="mr-1.5 h-4 w-4" />
              Submit quiz
            </button>
          )}
        </div>
      </section>
    </main>
  )
}
