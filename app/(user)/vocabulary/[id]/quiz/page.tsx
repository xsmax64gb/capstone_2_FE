import { notFound } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { getVocabularyById } from '../../data'
import { VocabularyQuizClient } from './quiz-client'

type VocabularyQuizPageProps = {
  params: Promise<{ id: string }>
}

export default async function VocabularyQuizPage({ params }: VocabularyQuizPageProps) {
  const { id } = await params
  const item = getVocabularyById(id)

  if (!item) {
    notFound()
  }

  return (
    <ProtectedRoute>
      <VocabularyQuizClient item={item} />
    </ProtectedRoute>
  )
}
