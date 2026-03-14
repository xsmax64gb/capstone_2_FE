'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { BookCheck, Clock3, Search } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { EXERCISES, TOPIC_LABELS, TYPE_LABELS, type ExerciseItem } from './data'

export default function ExercisesPage() {
  const [query, setQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<'all' | ExerciseItem['level']>('all')
  const [selectedType, setSelectedType] = useState<'all' | ExerciseItem['type']>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return EXERCISES.filter((item) => {
      const matchLevel = selectedLevel === 'all' || item.level === selectedLevel
      const matchType = selectedType === 'all' || item.type === selectedType
      const matchQuery =
        !q || item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)

      return matchLevel && matchType && matchQuery
    })
  }, [query, selectedLevel, selectedType])

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Exercise Arena</h1>
            <p className="mt-1 text-slate-500">
              Choose an exercise set by level and type, then start practicing.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search exercise..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-black"
              />
            </label>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as 'all' | ExerciseItem['level'])}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
            >
              <option value="all">All levels</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'all' | ExerciseItem['type'])}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
            >
              <option value="all">All types</option>
              <option value="mcq">Multiple Choice</option>
              <option value="fill_blank">Fill in the Blank</option>
              <option value="matching">Matching</option>
            </select>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold leading-tight">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                </div>
                <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold">
                  {item.level}
                </span>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
                  {TYPE_LABELS[item.type]}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
                  {TOPIC_LABELS[item.topic]}
                </span>
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
                  <BookCheck className="mr-1 h-3.5 w-3.5" />
                  {item.questionCount} questions
                </span>
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
                  <Clock3 className="mr-1 h-3.5 w-3.5" />
                  {item.durationMinutes} mins
                </span>
              </div>

              <Link
                href={`/exercises/${item.id}`}
                className="inline-flex rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Open exercise
              </Link>
            </article>
          ))}
        </section>

        {filtered.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-semibold">No exercise found</p>
            <p className="mt-1 text-sm text-slate-500">
              Try another keyword, level, or exercise type.
            </p>
          </div>
        )}
      </main>
    </ProtectedRoute>
  )
}
