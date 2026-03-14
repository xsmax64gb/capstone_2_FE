import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookCheck, CheckCircle2, Clock3, Sparkles } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { EXERCISES, TOPIC_LABELS, TYPE_LABELS } from '../data'

type ExerciseDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function ExerciseDetailPage({ params }: ExerciseDetailPageProps) {
  const { id } = await params
  const exercise = EXERCISES.find((item) => item.id === id)

  if (!exercise) {
    notFound()
  }

  const relatedExercises = EXERCISES.filter(
    (item) => item.topic === exercise.topic && item.id !== exercise.id
  ).slice(0, 3)

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

        <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">{TOPIC_LABELS[exercise.topic]}</p>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{exercise.title}</h1>
              <p className="mt-2 text-slate-500">{exercise.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold">
                {exercise.level}
              </span>
              <button className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Start now
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">Exercise details</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Type</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{TYPE_LABELS[exercise.type]}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Topic</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{TOPIC_LABELS[exercise.topic]}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Questions</p>
                  <p className="mt-1 inline-flex items-center text-sm font-semibold text-slate-900">
                    <BookCheck className="mr-1.5 h-4 w-4" />
                    {exercise.questionCount} questions
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Duration</p>
                  <p className="mt-1 inline-flex items-center text-sm font-semibold text-slate-900">
                    <Clock3 className="mr-1.5 h-4 w-4" />
                    {exercise.durationMinutes} mins
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-bold">How this exercise works</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>1. Read each question carefully before answering.</li>
                <li>2. Submit all answers to get final score and feedback.</li>
                <li>3. Retry to improve your best result and learning streak.</li>
              </ul>
              <button className="mt-5 inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI Hint
              </button>
            </div>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-5 text-lg font-bold">Session Goal</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                  <span className="text-sm font-medium text-slate-600">Target score</span>
                  <span className="font-bold">80+</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                  <span className="text-sm font-medium text-slate-600">Max attempts</span>
                  <span className="font-bold">3</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                  <span className="text-sm font-medium text-slate-600">Reward</span>
                  <span className="font-bold">+30 XP</span>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold tracking-tight">Related exercises</h2>
          {relatedExercises.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {relatedExercises.map((item) => (
                <Link
                  key={item.id}
                  href={`/exercises/${item.id}`}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-black"
                >
                  <p className="mb-1 text-sm font-semibold text-slate-500">{TOPIC_LABELS[item.topic]}</p>
                  <p className="text-lg font-bold">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-600">{TYPE_LABELS[item.type]}</p>
                </Link>
              ))}
            </div>
          )}
          {relatedExercises.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
              No related exercise in this topic yet.
            </div>
          )}
        </section>
      </main>
    </ProtectedRoute>
  )
}
