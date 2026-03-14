'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react'
import type { VocabularyItem } from '../../data'

type FlashcardsClientProps = {
  item: VocabularyItem
}

export function FlashcardsClient({ item }: FlashcardsClientProps) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [knownSet, setKnownSet] = useState<Set<number>>(new Set())

  const card = item.flashcards[index]
  const progress = useMemo(() => Math.round(((index + 1) / item.flashcards.length) * 100), [index, item.flashcards.length])

  const toggleKnown = () => {
    setKnownSet((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-10">
      <section className="mb-8">
        <Link
          href={`/vocabulary/${item.id}`}
          className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to word detail
        </Link>
      </section>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Flashcard Mode</h1>
            <p className="mt-1 text-sm text-slate-500">
              {item.word} • Card {index + 1}/{item.flashcards.length}
            </p>
          </div>
          <p className="text-sm font-semibold text-slate-700">Known cards: {knownSet.size}</p>
        </div>

        <div className="h-2 w-full rounded-full bg-slate-100">
          <div className="h-2 rounded-full bg-black transition-all" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section
        onClick={() => setFlipped((prev) => !prev)}
        className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm transition hover:border-black"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {flipped ? 'Back' : 'Front'}
        </p>
        <p className="text-3xl font-bold tracking-tight md:text-4xl">
          {flipped ? card.back : card.front}
        </p>
        <p className="mt-4 text-xs text-slate-500">Click card to flip</p>
      </section>

      <section className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => {
            setIndex((prev) => Math.max(prev - 1, 0))
            setFlipped(false)
          }}
          disabled={index === 0}
          className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFlipped((prev) => !prev)}
            className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RotateCw className="mr-1 h-4 w-4" />
            Flip
          </button>
          <button
            onClick={toggleKnown}
            className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold ${
              knownSet.has(index) ? 'bg-black text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="mr-1 h-4 w-4" />
            {knownSet.has(index) ? 'Known' : 'Mark known'}
          </button>
        </div>

        {index < item.flashcards.length - 1 ? (
          <button
            onClick={() => {
              setIndex((prev) => Math.min(prev + 1, item.flashcards.length - 1))
              setFlipped(false)
            }}
            className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        ) : (
          <Link
            href={`/vocabulary/${item.id}/quiz`}
            className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Start Quiz
          </Link>
        )}
      </section>
    </main>
  )
}
