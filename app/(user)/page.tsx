"use client";

import { useRouter } from "next/navigation";
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
import { Bilingual } from "@/components/i18n/bilingual";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useI18n } from "@/lib/i18n/context";
import { AuthAwareLink } from "@/components/auth/auth-aware-link";

export default function UserHomePage() {
  const { t } = useI18n();

  const coreFeatures = [
    {
      title: t("Luyện tập giọng nói AI"),
      description: t(
        "Trò chuyện với AI theo thời gian thực và nhận phản hồi tức thì về khả năng nói.",
      ),
      href: "/ai",
      action: t("Bắt đầu nói"),
      icon: Mic,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD63g8SzYGC_Qj0D_8rLiYR5YLZW3txwqA7GsKUeGyktjpKO4Q6DSoguMh8BmtJGJ47GPtAoUTXR5b0FHhBWOg3GpF7A7mwYtZnYhXbPlirLarrZY-_JhWK3ehXBLWSP6-rKNi1BdoRmYOIsjRtiXMC1cRYNx74_N_HgsvbXGbGUB_seGuULLbSuO5serMXGI83KlH--HZecV6rTqImexRVhEFTevOxFCv9xsPUwSnCdgKs2qYei1ChsIcTSL7yOjDD_iAjmjXFeapd",
    },
    {
      title: t("Trình tạo từ vựng"),
      description: t("Học từ theo chủ đề và cấp độ với ví dụ giàu ngữ cảnh."),
      href: "/vocabulary",
      action: t("Mở từ vựng"),
      icon: BookOpen,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDkHd8UJkk0tKsH-WI92KXxEhjDAj97l5oVuGnrGlRzvqls_sdBENfU7YbC15_QFl2lGHD8koNlLhZ4NB2nAHzUCzC7wMxzsAee6uEBwx2IDNJzA_PkbjOl_TquQrhRC_PwAjSPDRQg5OSbk3k5KgMJIylwsBFSaFaWAu35K2JeKBVwU9XscP5BLq_7BlucwCTIO7-hlgoEynBsa5C8t4ZV8S4s3U-SoITsiu9k_k8YfUmos-YFAkxJKCY9N76gtfRZMgC3-Z678t4M",
    },
    {
      title: t("Sân thi đấu bài tập"),
      description: t(
        "Làm bài tập ngữ pháp và đọc hiểu với thử thách theo cấp độ.",
      ),
      href: "/exercises",
      action: t("Bắt đầu bài tập"),
      icon: ListChecks,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD--BLKmCk2XERkZsjBk2Knjtbv8AERjUvskv5mAiB31qRGd1P_ViekbdMKjmXuyM0uNk0GGZyIyC9pp2ksPGD_Nc_FHjM_CJkkobhtpkR-phm0OlqZ-GbvKv-D7mqSUPs-hynj9nqRjfU-rBZkSQE81LXgNZX4rPlnzEAF4Vhtfi9w3PCSYRwvy-jDwb90w7WkMpRUwdTQYLc7WlrGq5uDXaFxE6S7SsKFDp7DRB08AXEftsZfJO1bynMGAZP96fx57xUfqbU9LL5j",
    },
  ];

  const quickStats = [
    { label: t("Mục tiêu nói hàng ngày"), value: "15-20 min" },
    { label: t("Trọng tâm từ vựng"), value: "20 words/week" },
    { label: t("Phong cách luyện tập"), value: "Short loops, high frequency" },
    { label: t("Chuỗi khuyến nghị"), value: "30+ days" },
  ];

  const learningSteps = [
    {
      title: t("Nghe và lặp lại"),
      detail: t(
        "Bắt đầu với các lời nhắc có hướng dẫn để làm nóng phát âm, nhịp điệu và trọng âm câu trước khi trò chuyện tự do.",
      ),
      icon: Waves,
    },
    {
      title: t("Trò chuyện với đối tác AI"),
      detail: t(
        "Chuyển sang các cuộc đối thoại thời gian thực ngắn để rèn luyện tốc độ phản ứng, sự tự tin và khả năng nói tự phát.",
      ),
      icon: MessageSquare,
    },
    {
      title: t("Thu thập từ hữu ích"),
      detail: t(
        "Lưu từ từ các phiên của bạn vào các bộ theo chủ đề để từ vựng luôn kết nối với ngữ cảnh.",
      ),
      icon: BookOpen,
    },
    {
      title: t("Khóa lại với bài tập"),
      detail: t(
        "Sử dụng bài tập tập trung để củng cố ngữ pháp và hiểu biết xung quanh cùng các mẫu ngôn ngữ.",
      ),
      icon: ListChecks,
    },
  ];

  const weeklyPlan = [
    {
      day: t("Thứ Hai"),
      focus: t("Làm nóng giọng nói + phát âm"),
      tasks: [
        t("10 phút nói có hướng dẫn"),
        t("5 phút lặp lại bóng"),
        t("Xem lại phản hồi"),
      ],
    },
    {
      day: t("Thứ Ba"),
      focus: t("Chủ đề trò chuyện hàng ngày"),
      tasks: [t("2 vòng vai diễn AI"), t("Lưu 8 từ mới"), t("Tóm tắt nhanh")],
    },
    {
      day: t("Thứ Tư"),
      focus: t("Ngữ pháp trong ngữ cảnh"),
      tasks: [
        t("Bộ bài tập mục tiêu"),
        t("Kiểm tra mẫu lỗi"),
        t("1 phiên làm lại"),
      ],
    },
    {
      day: t("Thứ Năm"),
      focus: t("Ôn tập từ vựng sâu"),
      tasks: [
        t("Ôn tập cách biệt"),
        t("Viết câu ví dụ"),
        t("Nói với từ đã lưu"),
      ],
    },
    {
      day: t("Thứ Sáu"),
      focus: t("Thử thách nói nhanh"),
      tasks: [
        t("Lời nhắc theo thời gian"),
        t("So sánh điểm số trôi chảy"),
        t("Ảnh chụp phát âm"),
      ],
    },
    {
      day: t("Thứ Bảy"),
      focus: t("Bài tập đọc + hiểu biết"),
      tasks: [t("Bộ đoạn ngắn"), t("Câu hỏi suy luận"), t("Ghi chú lỗi")],
    },
    {
      day: t("Chủ Nhật"),
      focus: t("Điểm kiểm tra hàng tuần"),
      tasks: [
        t("Phản ánh tiến độ"),
        t("Chọn chủ đề tiếp theo"),
        t("Lập kế hoạch tuần tiếp theo"),
      ],
    },
  ];

  const trustPoints = [
    {
      title: t("Tiến bộ rõ ràng"),
      detail: t(
        "Mỗi hoạt động có vai trò trong vòng lặp học tập kết nối, không phải nhiệm vụ ngẫu nhiên.",
      ),
      icon: TrendingUp,
    },
    {
      title: t("Ngữ cảnh thực tế"),
      detail: t(
        "Từ vựng và ngữ pháp xuất hiện trong các tình huống nói mà bạn thực sự có thể sử dụng.",
      ),
      icon: Compass,
    },
    {
      title: t("Nhịp điệu thân thiện với thói quen"),
      detail: t(
        "Các phiên ngắn và cấu trúc hàng ngày làm cho sự nhất quán thực tế với lịch trình bận rộn.",
      ),
      icon: Clock3,
    },
    {
      title: t("Phản hồi được hỗ trợ bởi AI"),
      detail: t(
        "Nhận tín hiệu có thể hành động ngay lập tức thay vì chờ sửa chữa bị trì hoãn.",
      ),
      icon: Brain,
    },
  ];

  const testimonials = [
    {
      name: "Linh N.",
      role: t("Sinh viên đại học"),
      quote: t(
        "Tôi đã ngừng tránh các nhiệm vụ nói. Luồng hàng ngày ngắn làm cho việc luyện tập ít đáng sợ hơn và tự nhiên hơn.",
      ),
    },
    {
      name: "Minh T.",
      role: t("Nhà phát triển trẻ"),
      quote: t(
        "Các phiên giọng nói cộng với ôn tập từ vựng đã mang lại cho tôi ngôn ngữ mà tôi có thể sử dụng trong các cuộc họp nhóm và trò chuyện nhóm nhanh chóng.",
      ),
    },
    {
      name: "Phuong A.",
      role: t("Ứng viên hỗ trợ khách hàng"),
      quote: t(
        "Tôi thích rằng mỗi tuần có cấu trúc. Tôi biết phải làm gì mỗi ngày và tôi có thể thấy tiến độ rõ ràng.",
      ),
    },
  ];

  const faqItems = [
    {
      q: t("Tôi có cần tiếng Anh nâng cao để bắt đầu không?"),
      a: t(
        "Không. Luồng được thiết kế để mở rộng từ các cấp độ cơ bản. Bạn có thể bắt đầu với các lời nhắc có hướng dẫn ngắn và tăng độ phức tạp theo thời gian.",
      ),
    },
    {
      q: t("Tôi nên luyện tập bao lâu mỗi ngày?"),
      a: t(
        "Một phiên tập trung 15-25 phút là đủ cho hầu hết người học khi thực hiện nhất quán trong tuần.",
      ),
    },
    {
      q: t("Tôi có thể chỉ tập trung vào nói không?"),
      a: t(
        "Có, nhưng kết quả tốt nhất đến từ việc kết hợp nói với từ vựng và bài tập củng cố ngắn.",
      ),
    },
    {
      q: t("Nếu tôi bỏ lỡ một ngày thì sao?"),
      a: t(
        "Tiếp tục với phiên tiếp theo. Cấu trúc hàng tuần linh hoạt và được thiết kế cho lịch trình thực tế.",
      ),
    },
  ];
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
                {t("Học tiếng Anh với AI")}
              </span>
              <Bilingual
                as="h1"
                viKey="Luyện tiếng Anh mỗi ngày với lộ trình rõ ràng"
                className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 md:text-6xl"
                primaryClassName="block"
                secondaryClassName="mt-3 block text-xl font-semibold leading-snug text-slate-600 md:text-2xl"
              />
              <Bilingual
                as="p"
                viKey="Nói, từ vựng và bài tập trong một vòng lặp — theo dõi tiến độ mỗi ngày."
                className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg"
                primaryClassName="block"
                secondaryClassName="mt-2 block text-sm leading-relaxed text-slate-500 md:text-base"
              />
              <div className="mt-8 flex flex-wrap gap-3">
                <AuthAwareLink
                  href="/learn"
                  className="rounded-lg bg-black px-7 py-3 text-sm font-semibold text-white transition-all hover:translate-y-[-1px] hover:bg-slate-800"
                >
                  {t("Bắt đầu luyện nói AI")}
                </AuthAwareLink>
                <AuthAwareLink
                  href="/vocabulary"
                  className="rounded-lg border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-slate-700 transition-all hover:translate-y-[-1px] hover:bg-slate-50"
                >
                  {t("Mở từ vựng")}
                </AuthAwareLink>
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
                <h3 className="text-xl font-bold">{t("Phiên luyện nói AI")}</h3>
                <p className="mt-2 text-sm text-slate-300">
                  {t(
                    "Nói tự nhiên và nhận phản hồi ngay lập tức về độ trôi chảy, phát âm và rõ ràng.",
                  )}
                </p>
                <button className="mt-6 inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition-transform hover:scale-105">
                  <Waves className="mr-2 h-4 w-4" />
                  {t("Luyện tập trực tiếp")}
                </button>
              </div>
              <div className="absolute -right-2 -top-4 hidden rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm md:block">
                <Mic className="mr-1 inline h-3.5 w-3.5" />
                {t("Ưu tiên giọng nói")}
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
              {t("Tính năng cốt lõi")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 md:text-base">
              {t(
                "Không có thứ gì thừa, chỉ những gì sản phẩm thực sự cung cấp.",
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {coreFeatures.map((item, index) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={item.title} delay={120 + index * 120}>
                  <AuthAwareLink
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
                        {t("Luồng chính")}
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
                  </AuthAwareLink>
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
                {t("Giọng nói AI")}
              </p>
              <p className="mt-2 text-sm text-slate-700">
                {t(
                  "Xây dựng sự tự tin khi nói với cuộc trò chuyện AI trực tiếp.",
                )}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("Từ vựng")}
              </p>
              <p className="mt-2 text-sm text-slate-700">
                {t("Học và ôn lại từ với chủ đề theo cấp độ.")}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("Bài tập")}
              </p>
              <p className="mt-2 text-sm text-slate-700">
                {t("Luyện tập ngữ pháp và hiểu biết với bài tập nhanh.")}
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={120}>
        <section className="py-14">
          <div className="mb-8 max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              {t("Cách vòng lặp học tập hoạt động")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 md:text-base">
              {t(
                "Một workflow dài hơn, hoàn chỉnh hơn có nghĩa là bạn luôn biết phải làm gì tiếp theo. Mỗi bước nuôi dưỡng bước tiếp theo, vì vậy khả năng nói, lựa chọn từ và ngữ pháp của bạn cải thiện cùng nhau.",
              )}
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
                      {t("Bước")} {index + 1}
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
                {t("Kế hoạch hàng tuần đầy đủ bạn có thể theo dõi")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 md:text-base">
                {t(
                  "Routine mẫu này biến trang chủ của bạn thành hướng dẫn thực tế, không chỉ là phần giới thiệu ngắn. Sử dụng nó như cấu trúc mặc định và điều chỉnh cường độ theo cấp độ.",
                )}
              </p>
            </div>
            <AuthAwareLink
              href="/learn"
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Target className="mr-2 h-4 w-4" />
              {t("Áp dụng kế hoạch này")}
            </AuthAwareLink>
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
                {t("Tại sao người học duy trì nhất quán")}
              </span>
              <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-3xl">
                {t("Long-form home content guides action, not just attention")}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-200 md:text-base">
                {t(
                  "A detailed page helps users understand the full product value before they click the first button. It sets expectation, builds trust, and gives a practical path from day one.",
                )}
              </p>
              <div className="mt-6 space-y-3">
                <div className="rounded-xl bg-white/10 p-3 text-sm">
                  {t("Clear next steps reduce drop-off.")}
                </div>
                <div className="rounded-xl bg-white/10 p-3 text-sm">
                  {t("Visible routines increase daily return rate.")}
                </div>
                <div className="rounded-xl bg-white/10 p-3 text-sm">
                  {t("Context-rich copy improves user confidence.")}
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
                      {t("Tín hiệu tin cậy")}
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
              {t("Phản hồi của người học")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 md:text-base">
              {t(
                "Real users often mention confidence and structure first. These testimonials show what improves when sessions are short, frequent, and connected.",
              )}
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
                {t("Câu hỏi thường gặp")}
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
                  {t("Sẵn sàng bắt đầu routine dài hạn của bạn?")}
                </span>
                <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                  {t(
                    "Biến các phiên hàng ngày nhỏ thành sự phát triển tiếng Anh có thể thấy",
                  )}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
                  {t(
                    "Mở bảng điều khiển của bạn, chọn một chủ đề và chạy vòng lặp nói có hướng dẫn đầu tiên của bạn hôm nay. Duy trì đà trong một tuần và bạn sẽ cảm nhận sự khác biệt.",
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <AuthAwareLink
                  href="/learn"
                  className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  {t("Mở bản đồ AI")}
                </AuthAwareLink>
                <AuthAwareLink
                  href="/exercises"
                  className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  {t("Xem luồng bài tập")}
                </AuthAwareLink>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}
