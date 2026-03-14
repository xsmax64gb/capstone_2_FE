import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { getExerciseById } from '../../data'

type ExerciseResultPageProps = {
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

export default async function ExerciseResultPage({ params, searchParams }: ExerciseResultPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const exercise = getExerciseById(id)

  if (!exercise) {
    notFound()
  }

  const score = toInt(query.score, Math.ceil(exercise.questionCount * 0.75))
  const total = toInt(query.total, exercise.questionCount)
  const time = toInt(query.time, exercise.durationMinutes * 60)
  const percent = Math.max(0, Math.min(100, Math.round((score / Math.max(total, 1)) * 100)))
  const earnedXp = Math.round((percent / 100) * exercise.rewardsXp)

  const resultLabel =
    percent >= 85 ? 'Excellent' : percent >= 70 ? 'Good Progress' : percent >= 50 ? 'Keep Going' : 'Needs Retry'

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-10">
        <section className="mb-8">
          <Link
            href={`/exercises/${exercise.id}`}
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to exercise detail
          </Link>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold text-slate-500">{exercise.title}</p>
              <h1 className="text-3xl font-bold tracking-tight">Result Summary</h1>
              <p className="mt-1 text-slate-500">{resultLabel}</p>
            </div>
            <div className="rounded-xl bg-black px-5 py-4 text-white">
              <p className="text-xs uppercase tracking-wide text-slate-300">Score</p>
              <p className="text-2xl font-bold">
                {score}/{total}
              </p>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Accuracy</p>
              <p className="mt-1 text-lg font-bold">{percent}%</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Time Spent</p>
              <p className="mt-1 text-lg font-bold">
                {Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Earned XP</p>
              <p className="mt-1 inline-flex items-center text-lg font-bold">
                <Trophy className="mr-1.5 h-4 w-4 text-amber-500" />+{earnedXp}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-5">
            <Link
              href={`/exercises/${exercise.id}/attempt`}
              className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Retry attempt
            </Link>
            <Link
              href={`/exercises/${exercise.id}/result/review?score=${score}&total=${total}&answers=${encodeURIComponent(
                query.answers ?? ''
              )}`}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Review answers
            </Link>
            <Link
              href={`/exercises/${exercise.id}/leaderboard`}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Open leaderboard
            </Link>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  )
}
