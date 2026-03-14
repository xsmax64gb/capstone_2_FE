import { notFound } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { getExerciseById } from '../../data'
import { AttemptClient } from './attempt-client'

type ExerciseAttemptPageProps = {
  params: Promise<{ id: string }>
}

export default async function ExerciseAttemptPage({ params }: ExerciseAttemptPageProps) {
  const { id } = await params
  const exercise = getExerciseById(id)

  if (!exercise) {
    notFound()
  }

  return (
    <ProtectedRoute>
      <AttemptClient exercise={exercise} />
    </ProtectedRoute>
  )
}
