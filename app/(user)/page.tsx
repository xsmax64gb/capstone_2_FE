import Link from "next/link";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  Compass,
  GraduationCap,
  ListChecks,
  MessageSquare,
  Mic,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Waves,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const coreFeatures = [
  {
    title: "AI Voice Practice",
    description: "Talk with AI in real-time and get instant speaking feedback.",
    href: "/ai",
    action: "Start speaking",
    icon: Mic,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD63g8SzYGC_Qj0D_8rLiYR5YLZW3txwqA7GsKUeGyktjpKO4Q6DSoguMh8BmtJGJ47GPtAoUTXR5b0FHhBWOg3GpF7A7mwYtZnYhXbPlirLarrZY-_JhWK3ehXBLWSP6-rKNi1BdoRmYOIsjRtiXMC1cRYNx74_N_HgsvbXGbGUB_seGuULLbSuO5serMXGI83KlH--HZecV6rTqImexRVhEFTevOxFCv9xsPUwSnCdgKs2qYei1ChsIcTSL7yOjDD_iAjmjXFeapd",
  },
  {
    title: "Vocabulary Builder",
    description: "Learn words by topic and level with context-rich examples.",
    href: "/vocabulary",
    action: "Open vocabulary",
    icon: BookOpen,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDkHd8UJkk0tKsH-WI92KXxEhjDAj97l5oVuGnrGlRzvqls_sdBENfU7YbC15_QFl2lGHD8koNlLhZ4NB2nAHzUCzC7wMxzsAee6uEBwx2IDNJzA_PkbjOl_TquQrhRC_PwAjSPDRQg5OSbk3k5KgMJIylwsBFSaFaWAu35K2JeKBVwU9XscP5BLq_7BlucwCTIO7-hlgoEynBsa5C8t4ZV8S4s3U-SoITsiu9k_k8YfUmos-YFAkxJKCY9N76gtfRZMgC3-Z678t4M",
  },
  {
    title: "Exercise Arena",
    description: "Do grammar and reading drills with level-based challenges.",
    href: "/exercises",
    action: "Start exercises",
    icon: ListChecks,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD--BLKmCk2XERkZsjBk2Knjtbv8AERjUvskv5mAiB31qRGd1P_ViekbdMKjmXuyM0uNk0GGZyIyC9pp2ksPGD_Nc_FHjM_CJkkobhtpkR-phm0OlqZ-GbvKv-D7mqSUPs-hynj9nqRjfU-rBZkSQE81LXgNZX4rPlnzEAF4Vhtfi9w3PCSYRwvy-jDwb90w7WkMpRUwdTQYLc7WlrGq5uDXaFxE6S7SsKFDp7DRB08AXEftsZfJO1bynMGAZP96fx57xUfqbU9LL5j",
  },
];

const quickStats = [
  { label: "Daily speaking target", value: "15-20 min" },
  { label: "Vocabulary focus", value: "20 words/week" },
  { label: "Practice style", value: "Short loops, high frequency" },
  { label: "Recommended streak", value: "30+ days" },
];

const learningSteps = [
  {
    title: "Listen and repeat",
    detail:
      "Start with guided prompts to warm up pronunciation, rhythm, and sentence stress before free conversation.",
    icon: Waves,
  },
  {
    title: "Talk with AI partner",
    detail:
      "Move into short real-time dialogues to train reaction speed, confidence, and spontaneous speaking.",
    icon: MessageSquare,
  },
  {
    title: "Collect useful words",
    detail:
      "Save words from your sessions into topic-based sets so vocabulary stays connected to context.",
    icon: BookOpen,
  },
  {
    title: "Lock in with exercises",
    detail:
      "Use focused drills to reinforce grammar and comprehension around the same language patterns.",
    icon: ListChecks,
  },
];

const weeklyPlan = [
  {
    day: "Mon",
    focus: "Voice warm-up + pronunciation",
    tasks: ["10 min guided speaking", "5 min shadowing", "Feedback review"],
  },
  {
    day: "Tue",
    focus: "Daily conversation topic",
    tasks: ["2 AI role-play rounds", "Save 8 new words", "Quick recap notes"],
  },
  {
    day: "Wed",
    focus: "Grammar in context",
    tasks: ["Targeted exercise set", "Error pattern check", "1 retry session"],
  },
  {
    day: "Thu",
    focus: "Vocabulary deep review",
    tasks: [
      "Spaced repetition",
      "Example sentence writing",
      "Speak with saved words",
    ],
  },
  {
    day: "Fri",
    focus: "Speed speaking challenge",
    tasks: ["Timed prompts", "Fluency score compare", "Pronunciation snapshot"],
  },
  {
    day: "Sat",
    focus: "Reading + comprehension drills",
    tasks: ["Short passage set", "Inference questions", "Error notes"],
  },
  {
    day: "Sun",
    focus: "Weekly checkpoint",
    tasks: ["Progress reflection", "Pick next themes", "Plan next week"],
  },
];

const trustPoints = [
  {
    title: "Clear progression",
    detail:
      "Each activity has a role in a connected learning loop, not random tasks.",
    icon: TrendingUp,
  },
  {
    title: "Practical context",
    detail:
      "Vocabulary and grammar appear in speaking scenarios you can actually use.",
    icon: Compass,
  },
  {
    title: "Habit-friendly rhythm",
    detail:
      "Short sessions and daily structure make consistency realistic for busy schedules.",
    icon: Clock3,
  },
  {
    title: "AI-supported feedback",
    detail:
      "Get immediate, actionable signals instead of waiting for delayed correction.",
    icon: Brain,
  },
];

const testimonials = [
  {
    name: "Linh N.",
    role: "University student",
    quote:
      "I stopped avoiding speaking tasks. The short daily flow made practice less scary and more natural.",
  },
  {
    name: "Minh T.",
    role: "Junior developer",
    quote:
      "The voice sessions plus vocab review gave me language I could use in standups and team chat quickly.",
  },
  {
    name: "Phuong A.",
    role: "Customer support trainee",
    quote:
      "I like that every week has structure. I know what to do each day and I can see progress clearly.",
  },
];

const faqItems = [
  {
    q: "Do I need advanced English to start?",
    a: "No. The flow is designed to scale from foundation levels. You can start with short guided prompts and increase complexity over time.",
  },
  {
    q: "How long should I practice each day?",
    a: "A focused 15-25 minute session is enough for most learners when done consistently across the week.",
  },
  {
    q: "Can I focus only on speaking?",
    a: "Yes, but best results come from combining speaking with vocabulary and short reinforcement exercises.",
  },
  {
    q: "What if I miss a day?",
    a: "Resume with the next session. The weekly structure is flexible and designed for real schedules.",
  },
];

export default function UserHomePage() {
  return (
    <main className="mx-auto max-w-7xl px-6 pb-28">
      <ScrollReveal>
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 px-6 py-14 md:px-10 md:py-20">
          <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-slate-200/60 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-slate-300/30 blur-3xl" />
          <div className="relative flex flex-col items-center justify-between gap-12 lg:flex-row">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                English Learning with AI
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 md:text-6xl">
                Your Complete English Practice Hub{" "}
                <br className="hidden md:block" />
                Built For Daily Momentum
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
                SmartLingo gives you a full routine from speaking to vocabulary
                and structured drills. Instead of random lessons, you get a
                long-form learning journey you can follow every day with clear
                direction and measurable progress.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/ai"
                  className="rounded-lg bg-black px-7 py-3 text-sm font-semibold text-white transition-all hover:translate-y-[-1px] hover:bg-slate-800"
                >
                  Start AI Voice
                </Link>
                <Link
                  href="/vocabulary"
                  className="rounded-lg border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-slate-700 transition-all hover:translate-y-[-1px] hover:bg-slate-50"
                >
                  Open Vocabulary
                </Link>
              </div>
            </div>

            <div className="relative w-full max-w-[420px] lg:max-w-[460px]">
              <div className="animate-float rounded-2xl border border-slate-200 bg-black p-8 text-white shadow-2xl">
                <div className="mb-6 flex items-end gap-1.5">
                  <div className="h-3 w-1 rounded-full bg-white/30" />
                  <div className="h-5 w-1 rounded-full bg-white/50" />
                  <div className="h-10 w-1 rounded-full bg-white/80" />
                  <div className="h-14 w-1 rounded-full bg-white" />
                  <div className="h-10 w-1 rounded-full bg-white/80" />
                  <div className="h-5 w-1 rounded-full bg-white/50" />
                  <div className="h-3 w-1 rounded-full bg-white/30" />
                </div>
                <h3 className="text-xl font-bold">AI Voice Session</h3>
                <p className="mt-2 text-sm text-slate-300">
                  Speak naturally and receive immediate cues on fluency,
                  pronunciation, and clarity.
                </p>
                <button className="mt-6 inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition-transform hover:scale-105">
                  <Waves className="mr-2 h-4 w-4" />
                  Live Practice
                </button>
              </div>
              <div className="absolute -right-2 -top-4 hidden rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm md:block">
                <Mic className="mr-1 inline h-3.5 w-3.5" />
                Voice First
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={60}>
        <section className="py-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-2 text-xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <section className="py-14">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Core Features
            </h2>
            <p className="mt-1 text-sm text-slate-500 md:text-base">
              No extra clutter, only what your product really offers.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {coreFeatures.map((item, index) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={item.title} delay={120 + index * 120}>
                  <Link
                    href={item.href}
                    className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-black hover:shadow-xl"
                  >
                    <div className="h-44 overflow-hidden border-b border-slate-100 bg-slate-100">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        <Icon className="mr-1.5 h-3.5 w-3.5" />
                        Main Flow
                      </span>
                      <h3 className="mt-3 text-xl font-bold tracking-tight">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                      <span className="mt-5 inline-flex text-sm font-semibold text-slate-900 group-hover:underline">
                        {item.action}
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <section className="py-8">
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-3 md:p-8">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                AI Voice
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Build speaking confidence with live AI conversation.
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Vocabulary
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Learn and review words with level-based topics.
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Exercises
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Practice grammar and comprehension with quick drills.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={120}>
        <section className="py-14">
          <div className="mb-8 max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              How The Learning Loop Works
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 md:text-base">
              A longer, more complete workflow means you always know what to do
              next. Every step feeds the next one, so your speaking, word
              choice, and grammar improve together.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {learningSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <ScrollReveal key={step.title} delay={120 + index * 90}>
                  <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      <Icon className="mr-1.5 h-3.5 w-3.5" />
                      Step {index + 1}
                    </div>
                    <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {step.detail}
                    </p>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={140}>
        <section className="py-14">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                A Full Weekly Plan You Can Follow
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 md:text-base">
                This sample routine turns your home page into a practical guide,
                not just a short intro. Use it as your default structure and
                adjust intensity by level.
              </p>
            </div>
            <Link
              href="/ai"
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Target className="mr-2 h-4 w-4" />
              Apply This Plan
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="grid grid-cols-1 divide-y divide-slate-200 md:grid-cols-7 md:divide-x md:divide-y-0">
              {weeklyPlan.map((item) => (
                <article key={item.day} className="p-4 md:p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {item.day}
                  </p>
                  <h3 className="mt-2 text-sm font-semibold leading-snug text-slate-900">
                    {item.focus}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {item.tasks.map((task) => (
                      <li
                        key={task}
                        className="flex items-start text-xs leading-relaxed text-slate-600"
                      >
                        <CheckCircle2 className="mr-1.5 mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={160}>
        <section className="py-14">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-black p-7 text-white md:p-9">
              <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
                Why learners stay consistent
              </span>
              <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-3xl">
                Long-form home content guides action, not just attention
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-200 md:text-base">
                A detailed page helps users understand the full product value
                before they click the first button. It sets expectation, builds
                trust, and gives a practical path from day one.
              </p>
              <div className="mt-6 space-y-3">
                <div className="rounded-xl bg-white/10 p-3 text-sm">
                  Clear next steps reduce drop-off.
                </div>
                <div className="rounded-xl bg-white/10 p-3 text-sm">
                  Visible routines increase daily return rate.
                </div>
                <div className="rounded-xl bg-white/10 p-3 text-sm">
                  Context-rich copy improves user confidence.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {trustPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <article
                    key={point.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      <Icon className="mr-1.5 h-3.5 w-3.5" />
                      Trust Signal
                    </span>
                    <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900">
                      {point.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {point.detail}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={180}>
        <section className="py-14">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Learner Feedback
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 md:text-base">
              Real users often mention confidence and structure first. These
              testimonials show what improves when sessions are short, frequent,
              and connected.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {testimonials.map((item, index) => (
              <ScrollReveal key={item.name} delay={180 + index * 100}>
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-3 flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700">
                    "{item.quote}"
                  </p>
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500">{item.role}</p>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <section className="py-14">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-9">
            <div className="mb-7 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-slate-700" />
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-4">
              {faqItems.map((item) => (
                <article
                  key={item.q}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <h3 className="text-base font-semibold text-slate-900">
                    {item.q}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.a}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={220}>
        <section className="py-12">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 via-white to-slate-200 p-7 md:p-10">
            <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-slate-300/40 blur-3xl" />
            <div className="pointer-events-none absolute -right-12 bottom-0 h-52 w-52 rounded-full bg-slate-400/30 blur-3xl" />
            <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Ready to start your long-run routine?
                </span>
                <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                  Turn small daily sessions into visible English growth
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
                  Open your dashboard, pick a topic, and run your first guided
                  speaking loop today. Keep momentum for one week and you will
                  feel the difference.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/ai"
                  className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Open AI Map
                </Link>
                <Link
                  href="/exercises"
                  className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  View Exercise Flow
                </Link>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}
