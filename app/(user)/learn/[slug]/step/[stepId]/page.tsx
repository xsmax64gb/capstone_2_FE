'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useGetLearnMapBySlugQuery } from '@/lib/api/learnApi'
import { LearnStepClient } from './learn-step-client'

export default function LearnStepPage() {
  const params = useParams()
  const slug = typeof params.slug === 'string' ? params.slug : ''
  const stepId = typeof params.stepId === 'string' ? params.stepId : ''
  const { data, isLoading } = useGetLearnMapBySlugQuery(slug, { skip: !slug })
  const step = data?.steps?.find((s) => s.id === stepId)

  return (
    <ProtectedRoute>
      <main className="min-h-[100vh] bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col px-5 py-6 md:px-8 md:py-8">
          <Link
            href={`/learn/${slug}`}
            className="mb-5 inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại bản đồ / Back to map
          </Link>

          {isLoading && <p className="text-sm text-slate-500">Đang tải… / Loading…</p>}
          {!isLoading && !step && (
            <p className="text-sm text-red-600">Không tìm thấy bước trong bản đồ này. / This step was not found in the map.</p>
          )}
          {step && <LearnStepClient slug={slug} step={step} />}
        </div>
      </main>
    </ProtectedRoute>
  )
}
