import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { getVocabularyById } from '../../../data'

type VocabularyQuizResultPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    score?: string
    total?: string
    time?: string
    answers?: string
  }>
}

function toInt(value: string | undefined, fallback: number) {
  const num = Number.parseInt(value ?? '', 10)
  return Number.isFinite(num) ? num : fallback
}

export default async function VocabularyQuizResultPage({
  params,
  searchParams,
}: VocabularyQuizResultPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const item = getVocabularyById(id)

  if (!item) {
    notFound()
  }

  const score = toInt(query.score, Math.ceil(item.quiz.length * 0.7))
  const total = toInt(query.total, item.quiz.length)
  const time = toInt(query.time, 180)
  const percent = Math.max(0, Math.min(100, Math.round((score / Math.max(total, 1)) * 100)))

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-10">
        <section className="mb-8">
          <Link
            href={`/vocabulary/${item.id}/quiz`}
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to quiz
          </Link>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">Quiz Result</h1>
          <p className="mt-1 text-slate-500">{item.word}</p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Score</p>
              <p className="mt-1 text-xl font-bold">
                {score}/{total}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Accuracy</p>
              <p className="mt-1 text-xl font-bold">{percent}%</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Time</p>
              <p className="mt-1 text-xl font-bold">
                {Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <Link
              href={`/vocabulary/${item.id}/quiz`}
              className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Retry quiz
            </Link>
            <Link
              href={`/vocabulary/${item.id}/quiz/result/review?answers=${encodeURIComponent(query.answers ?? '')}`}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Review answers
            </Link>
            <Link
              href={`/vocabulary/${item.id}/flashcards`}
              className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Trophy className="mr-1.5 h-4 w-4 text-amber-500" />
              Back to Flashcards
            </Link>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  )
}
