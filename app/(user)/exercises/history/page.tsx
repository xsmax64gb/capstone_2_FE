import Link from 'next/link'
import { ArrowLeft, Clock3, FileClock, RotateCcw } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { EXERCISES, EXERCISE_HISTORY, TOPIC_LABELS, formatDuration } from '../data'

export default function ExerciseHistoryPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        <section className="mb-8">
          <Link
            href="/exercises"
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exercise Arena
          </Link>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">Attempt History</h1>
          <p className="mt-1 text-slate-500">Track your recent submissions, scores, and completion speed.</p>
        </section>

        <section className="space-y-4">
          {EXERCISE_HISTORY.map((item) => {
            const exercise = EXERCISES.find((ex) => ex.id === item.exerciseId)
            if (!exercise) return null

            const percent = Math.round((item.score / item.total) * 100)
            return (
              <article key={item.attemptId} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{exercise.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{TOPIC_LABELS[exercise.topic]}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full border border-slate-200 px-2.5 py-1 font-semibold">
                      {exercise.level}
                    </span>
                    <span className="rounded-full border border-slate-200 px-2.5 py-1 font-semibold">
                      {item.score}/{item.total}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase text-slate-500">Result</p>
                    <p className="mt-1 text-sm font-semibold">{percent}%</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase text-slate-500">Duration</p>
                    <p className="mt-1 inline-flex items-center text-sm font-semibold">
                      <Clock3 className="mr-1 h-4 w-4" />
                      {formatDuration(item.durationSec)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase text-slate-500">Submitted</p>
                    <p className="mt-1 inline-flex items-center text-sm font-semibold">
                      <FileClock className="mr-1 h-4 w-4" />
                      {new Date(item.submittedAt).toLocaleString('en-US')}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/exercises/${exercise.id}/result?score=${item.score}&total=${item.total}&time=${item.durationSec}`}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Open result
                  </Link>
                  <Link
                    href={`/exercises/${exercise.id}/attempt`}
                    className="inline-flex items-center rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                    Retry
                  </Link>
                </div>
              </article>
            )
          })}
        </section>
      </main>
    </ProtectedRoute>
  )
}
