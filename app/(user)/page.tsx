import { Flame, Mic, Sparkles } from 'lucide-react'

const quickAccessItems = [
  {
    title: 'Placement Test',
    description: 'Assess your current level and get a tailored roadmap.',
    action: 'Start',
  },
  {
    title: 'Practice Exercises',
    description: 'Interactive drills to master grammar and sentence structure.',
    action: 'Go',
  },
  {
    title: 'Vocabulary',
    description: 'Expand your lexicon with context-aware flashcards.',
    action: 'Start',
  },
  {
    title: 'AI Speaking',
    description: 'Real-time conversations with instant pronunciation feedback.',
    action: 'Go',
  },
]

const lessons = [
  {
    title: 'Advanced Business Idioms',
    level: 'C1',
    duration: '15 mins',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD63g8SzYGC_Qj0D_8rLiYR5YLZW3txwqA7GsKUeGyktjpKO4Q6DSoguMh8BmtJGJ47GPtAoUTXR5b0FHhBWOg3GpF7A7mwYtZnYhXbPlirLarrZY-_JhWK3ehXBLWSP6-rKNi1BdoRmYOIsjRtiXMC1cRYNx74_N_HgsvbXGbGUB_seGuULLbSuO5serMXGI83KlH--HZecV6rTqImexRVhEFTevOxFCv9xsPUwSnCdgKs2qYei1ChsIcTSL7yOjDD_iAjmjXFeapd',
  },
  {
    title: 'Mastering Group Discussions',
    level: 'B2',
    duration: '10 mins',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDkHd8UJkk0tKsH-WI92KXxEhjDAj97l5oVuGnrGlRzvqls_sdBENfU7YbC15_QFl2lGHD8koNlLhZ4NB2nAHzUCzC7wMxzsAee6uEBwx2IDNJzA_PkbjOl_TquQrhRC_PwAjSPDRQg5OSbk3k5KgMJIylwsBFSaFaWAu35K2JeKBVwU9XscP5BLq_7BlucwCTIO7-hlgoEynBsa5C8t4ZV8S4s3U-SoITsiu9k_k8YfUmos-YFAkxJKCY9N76gtfRZMgC3-Z678t4M',
  },
  {
    title: 'Introduction to AI Terminology',
    level: 'B1',
    duration: '12 mins',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD--BLKmCk2XERkZsjBk2Knjtbv8AERjUvskv5mAiB31qRGd1P_ViekbdMKjmXuyM0uNk0GGZyIyC9pp2ksPGD_Nc_FHjM_CJkkobhtpkR-phm0OlqZ-GbvKv-D7mqSUPs-hynj9nqRjfU-rBZkSQE81LXgNZX4rPlnzEAF4Vhtfi9w3PCSYRwvy-jDwb90w7WkMpRUwdTQYLc7WlrGq5uDXaFxE6S7SsKFDp7DRB08AXEftsZfJO1bynMGAZP96fx57xUfqbU9LL5j',
  },
]

export default function UserHomePage() {
  return (
    <main className="mx-auto max-w-7xl px-6 pb-24">
      <section className="flex flex-col items-center justify-between gap-12 py-16 md:flex-row md:py-24">
        <div className="max-w-xl">
          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-slate-900 md:text-6xl">
            Improve Your English with <span className="italic text-black">AI</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            Personalized learning path, vocabulary practice, grammar exercises, and AI
            speaking feedback. Achieve fluency faster than ever.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button className="rounded-lg bg-black px-8 py-3.5 font-semibold text-white transition-all hover:bg-slate-800">
              Start Learning
            </button>
            <button className="rounded-lg border border-slate-200 bg-white px-8 py-3.5 font-semibold text-slate-700 transition-all hover:bg-slate-50">
              Take Placement Test
            </button>
          </div>
        </div>

        <div className="flex w-full justify-center md:w-1/2">
          <div className="relative aspect-[4/3] w-full max-w-[500px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-2xl">
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-12 text-white">
              <div className="mb-8 flex h-16 items-center gap-1.5">
                <div className="h-4 w-1 rounded-full bg-white/20" />
                <div className="h-8 w-1 rounded-full bg-white/40" />
                <div className="h-12 w-1 animate-pulse rounded-full bg-white/60" />
                <div className="h-16 w-1 rounded-full bg-white" />
                <div className="h-12 w-1 animate-pulse rounded-full bg-white/60" />
                <div className="h-8 w-1 rounded-full bg-white/40" />
                <div className="h-4 w-1 rounded-full bg-white/20" />
              </div>
              <h4 className="mb-2 text-xl font-bold">AI Voice Assistant</h4>
              <p className="mb-8 max-w-[240px] text-center text-sm text-slate-400">
                Ready for your daily conversation practice.
              </p>
              <button className="flex items-center gap-3 rounded-full bg-white px-6 py-3 font-bold text-black transition-transform hover:scale-105">
                <Mic className="h-4 w-4" />
                Start AI Conversation
              </button>
            </div>
            <div className="absolute left-4 top-4 flex gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-[10px] font-bold uppercase tracking-tighter text-white/50">
                Live Audio
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 py-12">
        <h3 className="mb-8 text-sm font-semibold uppercase tracking-widest text-slate-400">
          Quick Access
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {quickAccessItems.map((item) => (
            <div
              key={item.title}
              className="group cursor-pointer rounded-xl border border-slate-200 p-6 transition-all hover:border-black"
            >
              <Sparkles className="mb-4 h-8 w-8 text-slate-400 transition-colors group-hover:text-black" />
              <h4 className="mb-2 text-lg font-bold">{item.title}</h4>
              <p className="mb-4 text-sm leading-relaxed text-slate-500">{item.description}</p>
              <span className="flex items-center gap-1 text-sm font-semibold group-hover:underline">
                {item.action}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Active Learner
                </span>
                <h3 className="text-3xl font-extrabold tracking-tight">B2 Upper Intermediate</h3>
                <p className="mt-1 text-slate-500">You're in the top 15% of learners this week.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">72% to C1 Advanced</p>
                  <p className="text-xs text-slate-500">Expected in 14 days</p>
                </div>
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-slate-100">
                  <span className="text-xs font-bold">72%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-8 md:grid-cols-4">
              <div>
                <span className="mb-1 block text-sm font-medium text-slate-500">Total Lessons</span>
                <span className="text-3xl font-bold">24</span>
              </div>
              <div>
                <span className="mb-1 block text-sm font-medium text-slate-500">Words Mastered</span>
                <span className="text-3xl font-bold">850</span>
              </div>
              <div>
                <span className="mb-1 block text-sm font-medium text-slate-500">Speaking Time</span>
                <span className="text-3xl font-bold">12.5h</span>
              </div>
              <div>
                <span className="mb-1 block text-sm font-medium text-slate-500">Current Streak</span>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">7</span>
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-2xl font-bold tracking-tight">
            Recommended Lessons{' '}
            <span className="ml-3 rounded bg-black px-2 py-1 align-middle text-[10px] font-bold uppercase tracking-widest text-white">
              Personalized for You
            </span>
          </h3>
          <button className="text-sm font-semibold hover:underline">View All</button>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <div
              key={lesson.title}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-lg"
            >
              <div className="h-40 bg-slate-100">
                <img
                  src={lesson.image}
                  alt={lesson.title}
                  className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex h-full flex-col p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[9px] font-bold uppercase text-black">
                    <Sparkles className="h-3 w-3" /> AI Selected
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase">
                    Level {lesson.level}
                  </span>
                  <span className="text-xs text-slate-500">{lesson.duration}</span>
                </div>
                <h4 className="mb-6 text-lg font-bold">{lesson.title}</h4>
                <button className="mt-auto w-full rounded-lg bg-black py-2.5 font-semibold text-white transition-colors hover:bg-slate-800">
                  Start Lesson
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
