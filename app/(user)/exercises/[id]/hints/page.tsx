import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Lightbulb, WandSparkles } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { TYPE_LABELS, getExerciseById } from '../../data'

type ExerciseHintsPageProps = {
  params: Promise<{ id: string }>
}

const genericHints = [
  'Read all choices first, then remove obviously wrong ones.',
  'Pay attention to signal words (because, however, although, therefore).',
  'For fill blanks, check grammar before and after the blank.',
  'For matching, identify key terms and definitions before pairing.',
]

export default async function ExerciseHintsPage({ params }: ExerciseHintsPageProps) {
  const { id } = await params
  const exercise = getExerciseById(id)

  if (!exercise) {
    notFound()
  }

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
          <h1 className="text-3xl font-bold tracking-tight">AI Hint Generator</h1>
          <p className="mt-1 text-slate-500">
            {exercise.title} - {TYPE_LABELS[exercise.type]}
          </p>
        </section>

        <section className="space-y-4">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="inline-flex items-center text-sm font-semibold text-slate-700">
              <WandSparkles className="mr-1.5 h-4 w-4" />
              Personalized Tips (Mock)
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {exercise.skills.map((skill) => (
                <li key={skill} className="rounded-lg bg-slate-50 px-3 py-2">
                  Focus on <span className="font-semibold">{skill.replaceAll('-', ' ')}</span> while solving.
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="inline-flex items-center text-sm font-semibold text-slate-700">
              <Lightbulb className="mr-1.5 h-4 w-4" />
              Strategy Hints
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {genericHints.map((hint) => (
                <li key={hint} className="rounded-lg bg-slate-50 px-3 py-2">
                  {hint}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="mt-6 flex flex-wrap gap-2">
          <Link
            href={`/exercises/${exercise.id}/attempt`}
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Start attempt
          </Link>
          <Link
            href={`/exercises/${exercise.id}/result/review`}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Open review template
          </Link>
        </section>
      </main>
    </ProtectedRoute>
  )
}
