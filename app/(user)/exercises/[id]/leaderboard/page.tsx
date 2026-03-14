import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Medal, Timer, Trophy } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { EXERCISE_LEADERBOARD, formatDuration, getExerciseById } from '../../data'

type ExerciseLeaderboardPageProps = {
  params: Promise<{ id: string }>
}

export default async function ExerciseLeaderboardPage({ params }: ExerciseLeaderboardPageProps) {
  const { id } = await params
  const exercise = getExerciseById(id)

  if (!exercise) {
    notFound()
  }

  const leaderboard = EXERCISE_LEADERBOARD[id] ?? []

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-10">
        <section className="mb-8">
          <Link
            href={`/exercises/${exercise.id}`}
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to detail
          </Link>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="mt-1 text-slate-500">{exercise.title}</p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          {leaderboard.length === 0 && <p className="text-sm text-slate-500">No ranking data yet.</p>}
          {leaderboard.length > 0 && (
            <div className="space-y-3">
              {leaderboard.map((item) => (
                <article
                  key={`${item.rank}-${item.name}`}
                  className="flex flex-wrap items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold">
                      {item.rank}
                    </span>
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-slate-500">Rank #{item.rank}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <p className="inline-flex items-center font-semibold">
                      <Trophy className="mr-1.5 h-4 w-4 text-amber-500" />
                      {item.score}/{exercise.questionCount}
                    </p>
                    <p className="inline-flex items-center font-semibold">
                      <Timer className="mr-1.5 h-4 w-4 text-slate-500" />
                      {formatDuration(item.durationSec)}
                    </p>
                    <p className="inline-flex items-center font-semibold">
                      <Medal className="mr-1.5 h-4 w-4 text-slate-500" />
                      Top {item.rank}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </ProtectedRoute>
  )
}
