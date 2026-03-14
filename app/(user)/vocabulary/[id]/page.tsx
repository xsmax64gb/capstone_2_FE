import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, CheckCircle2, Flame, Layers3, Sparkles } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { TOPIC_LABELS, getRelatedVocabulary, getVocabularyById } from '../data'

type VocabularyDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function VocabularyDetailPage({ params }: VocabularyDetailPageProps) {
  const { id } = await params
  const vocabulary = getVocabularyById(id)

  if (!vocabulary) {
    notFound()
  }

  const relatedWords = getRelatedVocabulary(vocabulary.id, 3)
  const estimatedMinutes = Math.max(6, Math.min(14, vocabulary.word.length + 4))
  const masteryPercent = Math.max(65, Math.min(95, vocabulary.word.length * 8))

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        <section className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/vocabulary"
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vocabulary Lab
          </Link>
          <Link
            href="/vocabulary/overview"
            className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Layers3 className="mr-1.5 h-4 w-4" />
            Overview Table
          </Link>
        </section>

        <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100">
                <BookOpen className="h-8 w-8 text-slate-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">{TOPIC_LABELS[vocabulary.topic]}</p>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{vocabulary.word}</h1>
                <p className="mt-1 text-slate-500">{vocabulary.phonetic}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold">
                {vocabulary.level}
              </span>
              <button className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as mastered
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="mb-8 border-b border-slate-200">
              <nav className="flex gap-4 overflow-x-auto pb-px text-sm font-medium">
                <span className="border-b-2 border-black pb-4 text-black">Word Info</span>
                <Link href={`/vocabulary/${vocabulary.id}/flashcards`} className="pb-4 text-slate-500 hover:text-black">
                  Flashcards
                </Link>
                <Link href={`/vocabulary/${vocabulary.id}/quiz`} className="pb-4 text-slate-500 hover:text-black">
                  Quiz
                </Link>
              </nav>
            </div>

            <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Word</p>
                <input
                  readOnly
                  value={vocabulary.word}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Meaning</p>
                <input
                  readOnly
                  value={vocabulary.meaning}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Example sentence</p>
                <textarea
                  readOnly
                  value={vocabulary.example}
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">Part of speech</p>
                  <p className="mt-1 text-sm font-semibold capitalize">{vocabulary.partOfSpeech}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">Synonyms</p>
                  <p className="mt-1 text-sm font-semibold">{vocabulary.synonyms.join(', ') || '-'}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">Antonyms</p>
                  <p className="mt-1 text-sm font-semibold">{vocabulary.antonyms.join(', ') || '-'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                <Link
                  href={`/vocabulary/${vocabulary.id}/flashcards`}
                  className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Study with Flashcards
                </Link>
                <Link
                  href={`/vocabulary/${vocabulary.id}/quiz`}
                  className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Start Quiz
                </Link>
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-5 text-lg font-bold">Learning Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                  <span className="text-sm font-medium text-slate-600">Level</span>
                  <span className="font-bold">{vocabulary.level}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-slate-600">Session streak</span>
                  </div>
                  <span className="font-bold">7 days</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                  <span className="text-sm font-medium text-slate-600">Estimated time</span>
                  <span className="font-bold">{estimatedMinutes} mins</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-black p-6 text-white shadow-lg">
              <h3 className="mb-2 text-lg font-bold">Mastery Progress</h3>
              <p className="mb-5 text-sm text-slate-300">
                Complete flashcards and quiz mode to lock this word into memory.
              </p>
              <div className="h-2 w-full rounded-full bg-white/20">
                <div className="h-2 rounded-full bg-white" style={{ width: `${masteryPercent}%` }} />
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-300">{masteryPercent}% progress</p>
            </div>
          </aside>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold tracking-tight">Related words</h2>
          {relatedWords.length > 0 && (
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
          {relatedWords.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
              No related words yet for this topic.
            </div>
          )}
        </section>
      </main>
    </ProtectedRoute>
  )
}
