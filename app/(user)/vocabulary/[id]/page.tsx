import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, CheckCircle2, Volume2 } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { TOPIC_LABELS, VOCABULARIES } from '../data'

type VocabularyDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function VocabularyDetailPage({ params }: VocabularyDetailPageProps) {
  const { id } = await params
  const vocabulary = VOCABULARIES.find((item) => item.id === id)

  if (!vocabulary) {
    notFound()
  }

  const relatedWords = VOCABULARIES.filter(
    (item) => item.topic === vocabulary.topic && item.id !== vocabulary.id
  ).slice(0, 3)

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        <div className="mb-6">
          <Link
            href="/vocabulary"
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vocabulary Lab
          </Link>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">{TOPIC_LABELS[vocabulary.topic]}</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">{vocabulary.word}</h1>
              <p className="mt-2 text-base text-slate-500">{vocabulary.phonetic}</p>
            </div>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold">
              {vocabulary.level}
            </span>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Meaning</p>
              <p className="text-lg font-semibold text-slate-900">{vocabulary.meaning}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Example</p>
              <p className="text-sm leading-6 text-slate-700">{vocabulary.example}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
            <button className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Volume2 className="mr-2 h-4 w-4" />
              Listen pronunciation
            </button>
            <button className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark as mastered
            </button>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-4">
          <h2 className="text-lg font-bold tracking-tight">Related words</h2>
          {relatedWords.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
              No related words yet for this topic.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {relatedWords.map((item) => (
                <Link
                  key={item.id}
                  href={`/vocabulary/${item.id}`}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-black"
                >
                  <p className="mb-1 text-sm font-semibold text-slate-500">{TOPIC_LABELS[item.topic]}</p>
                  <p className="text-xl font-bold">{item.word}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.phonetic}</p>
                  <p className="mt-3 inline-flex items-center text-xs font-semibold text-slate-700">
                    <BookOpen className="mr-1 h-3.5 w-3.5" />
                    Open detail
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </ProtectedRoute>
  )
}
