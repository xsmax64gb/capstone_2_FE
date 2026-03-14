'use client'

import { useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useGetExerciseByIdQuery } from '@/lib/api/exercisesApi'
import { AttemptClient } from './attempt-client'

export default function ExerciseAttemptPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id ?? ''
  const { data, isLoading, isError } = useGetExerciseByIdQuery(id, { skip: !id })

  return (
    <ProtectedRoute>
      {isLoading && (
        <main className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-10">
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Loading attempt session...
          </div>
        </main>
      )}

      {isError && (
        <main className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-10">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Failed to load exercise.
          </div>
        </main>
      )}

      {!isLoading && !isError && data?.exercise && <AttemptClient exercise={data.exercise} />}
    </ProtectedRoute>
  )
}
