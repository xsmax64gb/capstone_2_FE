'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { BookOpen, CheckCircle2, Layers3, Search, Sparkles } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import {
  STATUS_LABELS,
  TOPIC_LABELS,
  VOCABULARIES,
  VOCABULARY_PROGRESS,
  type VocabularyItem,
} from './data'

export default function VocabularyPage() {
  const [query, setQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<'all' | VocabularyItem['level']>('all')
  const [selectedTopic, setSelectedTopic] = useState<'all' | VocabularyItem['topic']>('all')
  const [masteredIds, setMasteredIds] = useState<string[]>(
    VOCABULARY_PROGRESS.filter((item) => item.status === 'mastered').map((item) => item.vocabularyId)
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    return VOCABULARIES.filter((item) => {
      const matchLevel = selectedLevel === 'all' || item.level === selectedLevel
      const matchTopic = selectedTopic === 'all' || item.topic === selectedTopic
      const matchQuery =
        !q ||
        item.word.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.example.toLowerCase().includes(q)

      return matchLevel && matchTopic && matchQuery
    })
  }, [query, selectedLevel, selectedTopic])

  const masteredCount = masteredIds.length
  const progress = Math.round((masteredCount / VOCABULARIES.length) * 100)

  const toggleMastered = (id: string) => {
    setMasteredIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Vocabulary Lab</h1>
              <p className="mt-1 text-slate-500">
                Two practice modes available: Flashcards and Quiz, plus full overview table.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/vocabulary/overview"
                className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Layers3 className="mr-1.5 h-4 w-4" />
                Overview Table
              </Link>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <p className="font-semibold">
              {masteredCount}/{VOCABULARIES.length} mastered ({progress}%)
            </p>
            <div className="mt-2 h-2 w-52 rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-black" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search word, meaning, example..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-black"
              />
            </label>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as 'all' | VocabularyItem['level'])}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
            >
              <option value="all">All levels</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
            </select>

            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value as 'all' | VocabularyItem['topic'])}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
            >
              <option value="all">All topics</option>
              <option value="daily-life">Daily Life</option>
              <option value="work">Work</option>
              <option value="travel">Travel</option>
              <option value="technology">Technology</option>
            </select>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {VOCABULARY_PROGRESS.map((item) => {
            const word = VOCABULARIES.find((vocab) => vocab.id === item.vocabularyId)
            if (!word) return null
            return (
              <article key={item.vocabularyId} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold">{word.word}</p>
                <p className="mt-1 text-xs text-slate-500">{STATUS_LABELS[item.status]}</p>
                <p className="mt-2 text-xs text-slate-600">
                  Correct rate: <span className="font-semibold">{item.correctRate}%</span>
                </p>
              </article>
            )
          })}
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((item) => {
            const mastered = masteredIds.includes(item.id)

            return (
              <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-bold leading-none">{item.word}</h3>
                    <p className="mt-1 text-sm text-slate-500">{item.phonetic}</p>
                  </div>
                  <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold">
                    {item.level}
                  </span>
                </div>

                <p className="mb-3 text-sm">
                  <span className="font-semibold">Meaning:</span> {item.meaning}
                </p>
                <p className="mb-4 text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">Example:</span> {item.example}
                </p>

                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                    <BookOpen className="mr-1 h-3.5 w-3.5" />
                    {TOPIC_LABELS[item.topic]}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                    {item.partOfSpeech}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  <Link
                    href={`/vocabulary/${item.id}`}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Detail
                  </Link>
                  <Link
                    href={`/vocabulary/${item.id}/flashcards`}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Flashcard
                  </Link>
                  <Link
                    href={`/vocabulary/${item.id}/quiz`}
                    className="inline-flex items-center justify-center rounded-lg bg-black px-2 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Quiz
                  </Link>
                  <button
                    onClick={() => toggleMastered(item.id)}
                    className={`inline-flex items-center justify-center rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${
                      mastered ? 'bg-black text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    {mastered ? 'Mastered' : 'Mark'}
                  </button>
                </div>
              </article>
            )
          })}
        </section>

        {filtered.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-semibold">No vocabulary found</p>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your keyword, level, or topic filter.
            </p>
          </div>
        )}

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="inline-flex items-center text-lg font-bold">
            <Sparkles className="mr-2 h-4 w-4" />
            Suggested Route
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Open <span className="font-semibold">Overview Table</span> to scan all words, then study
            with <span className="font-semibold">Flashcards</span>, and finish with{' '}
            <span className="font-semibold">Quiz</span>.
          </p>
        </section>
      </main>
    </ProtectedRoute>
  )
}
