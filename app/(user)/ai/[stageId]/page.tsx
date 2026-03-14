import Link from 'next/link'
import {
  ArrowLeft,
  Bot,
  Bolt,
  Briefcase,
  CheckCircle2,
  Clock3,
  Plane,
  Settings,
  SpellCheck,
  StopCircle,
  User,
  Volume2,
  WandSparkles,
} from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'

type AIStageDetailPageProps = {
  params: Promise<{ stageId: string }>
}

const pastSessions = [
  { title: "Today's Session", meta: 'Business English • 14m', icon: Clock3, active: true },
  { title: 'Interview Prep', meta: 'Yesterday • 22m', icon: Briefcase },
  { title: 'Travel Phrases', meta: '2 days ago • 18m', icon: Plane },
]

export default async function AIStageDetailPage({ params }: AIStageDetailPageProps) {
  const { stageId } = await params

  return (
    <ProtectedRoute>
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 overflow-hidden">
        <aside className="hidden w-72 flex-col gap-6 border-r border-slate-200 bg-white p-6 xl:flex">
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Past Conversations</h3>
            <div className="flex flex-col gap-1">
              {pastSessions.map((session) => {
                const Icon = session.icon
                return (
                  <button
                    key={session.title}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                      session.active
                        ? 'bg-slate-100 text-black'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <p className="text-sm font-semibold">{session.title}</p>
                      <p className="text-xs text-slate-500">{session.meta}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-xs font-semibold text-slate-500">Weekly Goal</p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-3/4 bg-black" />
            </div>
            <p className="mt-2 text-[11px] text-slate-500">4.5 / 6 hours completed</p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <Link
              href="/ai"
              className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to AI Map
            </Link>
            <div className="flex items-center gap-2">
              <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
                <Settings className="h-5 w-5" />
              </button>
              <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="mx-auto mb-10 max-w-2xl rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stageId}</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Speaking Practice Session</h1>
            </div>

            <div className="mb-10 flex flex-col items-center justify-center py-6">
              <div className="relative mb-8 flex items-center justify-center">
                <div className="absolute h-48 w-48 rounded-full border border-slate-200 animate-pulse" />
                <div className="absolute h-64 w-64 rounded-full border border-slate-100" />
                <div className="z-10 flex h-32 w-32 items-center justify-center rounded-full bg-black text-white shadow-2xl">
                  <Volume2 className="h-10 w-10" />
                </div>
              </div>

              <div className="mb-4 flex h-16 items-center gap-1.5">
                <div className="h-4 w-1.5 rounded-full bg-slate-200" />
                <div className="h-8 w-1.5 rounded-full bg-slate-300" />
                <div className="h-12 w-1.5 rounded-full bg-black" />
                <div className="h-16 w-1.5 rounded-full bg-black" />
                <div className="h-10 w-1.5 rounded-full bg-black" />
                <div className="h-14 w-1.5 rounded-full bg-black" />
                <div className="h-6 w-1.5 rounded-full bg-slate-300" />
                <div className="h-10 w-1.5 rounded-full bg-slate-200" />
              </div>
              <p className="text-sm font-medium text-slate-400">Listening to your response...</p>
            </div>

            <div className="mx-auto w-full max-w-2xl space-y-6 pb-8">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="max-w-[85%]">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">SmartLingo AI</p>
                  <div className="mt-1 rounded-2xl rounded-tl-none bg-slate-100 p-4">
                    <p className="text-[15px] leading-relaxed">
                      Great response. Why do you think focused morning habits improve productivity for the rest of your day?
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-row-reverse gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
                <div className="max-w-[85%] text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">You</p>
                  <div className="mt-1 rounded-2xl rounded-tr-none bg-black p-4 text-white">
                    <p className="text-[15px] leading-relaxed">
                      It helps me start calmly and focus on one thing at a time instead of distractions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white p-6">
            <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
                Pause
              </button>
              <button className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600">
                <StopCircle className="h-7 w-7" />
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                <WandSparkles className="h-4 w-4" />
                Translate
              </button>
            </div>
          </div>
        </section>

        <aside className="hidden w-80 flex-col gap-6 border-l border-slate-200 bg-white p-6 lg:flex">
          <div>
            <h3 className="mb-6 text-xs font-bold uppercase tracking-wider text-slate-400">Real-time Feedback</h3>
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-bold">Pronunciation</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-500">88%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[88%] bg-emerald-500" />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">Good clarity. Work on vowel sound in long words.</p>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SpellCheck className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-bold">Grammar</span>
                  </div>
                  <span className="text-sm font-bold text-amber-500">72%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[72%] bg-amber-500" />
                </div>
                <div className="mt-2 rounded border border-amber-100 bg-amber-50 p-2">
                  <p className="text-[11px] text-amber-700">
                    <span className="opacity-70 line-through">I can focuses</span> → I can{' '}
                    <span className="font-bold">focus</span>
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bolt className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-bold">Fluency</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-500">91%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[91%] bg-emerald-500" />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">Natural pace. Minimal hesitation detected.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h4 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Vocabulary Booster</h4>
            <div className="flex flex-wrap gap-2">
              {['Mindfulness', 'Ritual', 'Momentum', 'Cognitive Load'].map((word) => (
                <span
                  key={word}
                  className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] font-medium"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-bold text-white hover:bg-slate-800">
              View Full Report
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </main>
    </ProtectedRoute>
  )
}
