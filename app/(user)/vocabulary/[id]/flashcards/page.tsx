import { notFound } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { getVocabularyById } from '../../data'
import { FlashcardsClient } from './flashcards-client'

type VocabularyFlashcardsPageProps = {
  params: Promise<{ id: string }>
}

export default async function VocabularyFlashcardsPage({ params }: VocabularyFlashcardsPageProps) {
  const { id } = await params
  const item = getVocabularyById(id)

  if (!item) {
    notFound()
  }

  return (
    <ProtectedRoute>
      <FlashcardsClient item={item} />
    </ProtectedRoute>
  )
}
