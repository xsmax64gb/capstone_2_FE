import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { TOPIC_LABELS, VOCABULARIES, VOCABULARY_PROGRESS } from '../data'

export default function VocabularyOverviewPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        <section className="mb-8">
          <Link
            href="/vocabulary"
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vocabulary Lab
          </Link>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">Vocabulary Overview Table</h1>
          <p className="mt-1 text-slate-500">
            Full table view for all words, progress, and quick jump to Flashcard/Quiz mode.
          </p>
        </section>

        <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Word</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Meaning</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Topic</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Level</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Progress</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {VOCABULARIES.map((item) => {
                const progress = VOCABULARY_PROGRESS.find((p) => p.vocabularyId === item.id)
                return (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-semibold">{item.word}</td>
                    <td className="px-4 py-3 text-slate-600">{item.meaning}</td>
                    <td className="px-4 py-3 text-slate-600">{TOPIC_LABELS[item.topic]}</td>
                    <td className="px-4 py-3 text-slate-600">{item.level}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {progress ? `${progress.status} (${progress.correctRate}%)` : 'new'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/vocabulary/${item.id}/flashcards`}
                          className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Flashcard
                        </Link>
                        <Link
                          href={`/vocabulary/${item.id}/quiz`}
                          className="rounded-md bg-black px-2 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                          Quiz
                        </Link>
                        <Link
                          href={`/vocabulary/${item.id}`}
                          className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Detail
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      </main>
    </ProtectedRoute>
  )
}
