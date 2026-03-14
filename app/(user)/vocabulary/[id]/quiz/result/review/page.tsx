import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Check, X } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { getVocabularyById } from '../../../../data'

type VocabularyQuizReviewPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ answers?: string }>
}

function parseAnswers(value: string | undefined, total: number) {
  const parsed = (value ?? '')
    .split(',')
    .map((item) => Number.parseInt(item, 10))
    .map((num) => (Number.isFinite(num) ? num : -1))
  if (!parsed.length) return Array.from({ length: total }, () => -1)
  return parsed
}

export default async function VocabularyQuizReviewPage({
  params,
  searchParams,
}: VocabularyQuizReviewPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const item = getVocabularyById(id)

  if (!item) {
    notFound()
  }

  const answers = parseAnswers(query.answers, item.quiz.length)

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-10">
        <section className="mb-8">
          <Link
            href={`/vocabulary/${item.id}/quiz/result?answers=${encodeURIComponent(query.answers ?? '')}`}
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to quiz result
          </Link>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">Quiz Answer Review</h1>
          <p className="mt-1 text-slate-500">{item.word}</p>
        </section>

        <section className="space-y-4">
          {item.quiz.map((question, index) => {
            const selected = answers[index] ?? -1
            const isCorrect = selected === question.correctIndex
            return (
              <article key={question.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-bold">
                    Q{index + 1}. {question.prompt}
                  </h2>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {isCorrect ? (
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
                  {selected >= 0 ? question.options[selected] : 'Not answered'}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  <span className="font-semibold">Correct answer:</span>{' '}
                  {question.options[question.correctIndex]}
                </p>
                <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Explanation:</span> {question.explanation}
                </p>
              </article>
            )
          })}
        </section>
      </main>
    </ProtectedRoute>
  )
}
