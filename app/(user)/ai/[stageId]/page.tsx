import Link from 'next/link'
import { ArrowLeft, Mic, Sparkles } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'

type AIStageDetailPageProps = {
  params: Promise<{ stageId: string }>
}

export default async function AIStageDetailPage({ params }: AIStageDetailPageProps) {
  const { stageId } = await params

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-10">
        <section className="mb-8">
          <Link
            href="/ai"
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to AI Map
          </Link>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stageId}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">AI Stage Lobby</h1>
          <p className="mt-2 text-slate-600">
            This is a stage detail page. You can plug real AI session logic here next.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <button className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              <Mic className="mr-2 h-4 w-4" />
              Start AI Conversation
            </button>
            <button className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Objective
            </button>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  )
}
