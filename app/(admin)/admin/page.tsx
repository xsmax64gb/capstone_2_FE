import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  Settings2,
  Sparkles,
  Users2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const overviewStats = [
  {
    label: "Người học hoạt động",
    value: "12.4k",
    hint: "+8.2% so với 7 ngày trước",
    icon: Users2,
  },
  {
    label: "Buổi luyện hoàn tất",
    value: "3.8k",
    hint: "Tỉ lệ hoàn thành trung bình 74%",
    icon: CheckCircle2,
  },
  {
    label: "Phiên AI đang xử lý",
    value: "248",
    hint: "Mốc cao nhất trong 24h gần đây",
    icon: Sparkles,
  },
  {
    label: "Nội dung chờ duyệt",
    value: "18",
    hint: "03 mục nên ưu tiên hôm nay",
    icon: BookOpen,
  },
] as const;

const activityFeed = [
  {
    title: "Batch onboarding mới đã được kích hoạt",
    detail: "214 học viên từ lớp TOEIC sprint vừa vào hệ thống trong 2 giờ qua.",
    time: "05 phút trước",
  },
  {
    title: "Nhóm speaking cần theo dõi độ trễ",
    detail: "3 phòng AI speaking có latency vượt mốc 2 giây trong khung cao điểm.",
    time: "18 phút trước",
  },
  {
    title: "Nội dung unit B1-03 đang chờ review",
    detail: "Bộ bài vocabulary và flashcards đã sẵn sàng để kiểm duyệt lần cuối.",
    time: "41 phút trước",
  },
] as const;

const focusItems = [
  "Hoàn thiện bộ lọc cho danh sách học viên và role badge.",
  "Thêm bảng tổng hợp tiêu hao token hoặc chi phí cho AI speaking.",
  "Nối dashboard admin với dữ liệu thật từ BE khi API sẵn sàng.",
] as const;

const quickActions = [
  {
    title: "Quản lý người dùng",
    description: "Theo dõi onboarding, role và nhóm học viên đang cần chăm sóc.",
    href: "/admin/users",
    icon: Users2,
  },
  {
    title: "Kiểm duyệt nội dung",
    description: "Mở khu vực bài học, vocabulary set và tài nguyên media.",
    href: "/admin/content",
    icon: BookOpen,
  },
  {
    title: "Xem báo cáo",
    description: "Tổng hợp retention, mức độ sử dụng và các điểm nghẽn vận hành.",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    title: "Điều chỉnh hệ thống",
    description: "Quản lý rule, notifications và cấu hình quyền truy cập.",
    href: "/admin/settings",
    icon: Settings2,
  },
] as const;

export default function AdminDashboardPage() {
  return (
    <>
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-8">
          <div className="relative overflow-hidden rounded-[28px] bg-slate-950 px-6 py-7 text-white">
            <div className="pointer-events-none absolute -right-16 top-0 h-44 w-44 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="pointer-events-none absolute left-0 top-12 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <Badge className="rounded-full bg-white/10 px-3 py-1 text-white hover:bg-white/10">
                SmartLingo Admin
              </Badge>
              <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Một layout admin gọn, rõ, và sẵn sàng mở rộng cho toàn bộ hệ thống.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Shell quản trị đã được tách riêng với sidebar, topbar và vùng
                content. Từ đây mình có thể gắn dữ liệu thật, bảng, form, và
                các workflow duyệt nội dung mà không cần làm lại khung giao
                dien.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="rounded-xl bg-white text-slate-950 hover:bg-slate-100">
                  <Link href="/admin/users">Mở khu người dùng</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/admin/reports">Theo dõi báo cáo</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Card className="border-slate-200 bg-slate-50/90 py-5">
              <CardHeader className="pb-0">
                <CardTitle className="text-base">Nhịp vận hành hôm nay</CardTitle>
                <CardDescription>
                  Hệ thống đang ổn định và sẵn sàng cho cấp tiếp theo.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                    <span>Release admin shell</span>
                    <span className="font-semibold text-slate-900">Ready</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                    <span>Queue moderation</span>
                    <span className="font-semibold text-slate-900">18 items</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                    <span>Daily sync</span>
                    <span className="font-semibold text-emerald-600">On track</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 py-5">
              <CardHeader className="pb-0">
                <CardTitle className="text-base">Cảnh báo ưu tiên</CardTitle>
                <CardDescription>
                  Những mục nên được đẩy vào sprint tiếp theo.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">
                      Dashboard đã có shell
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Có thể tiếp tục gắn data grid, filter và chart mà không phá
                      vỡ layout.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Clock3 className="h-4 w-4 text-slate-400" />
                    Cập nhật cuối lúc 10:24
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label} className="border-slate-200 py-5">
              <CardContent className="flex items-start justify-between gap-4 pt-1">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{item.hint}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-slate-200 py-5">
          <CardHeader>
            <CardTitle>Hoạt động cần chú ý</CardTitle>
            <CardDescription>
              Đây là feed mẫu để sau này gắn từ event log, moderation queue và alert engine.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activityFeed.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <span className="text-xs font-medium text-slate-500">
                    {item.time}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.detail}
                </p>
              </article>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border-slate-200 py-5">
            <CardHeader>
              <CardTitle>Ưu tiên tiếp theo</CardTitle>
              <CardDescription>
                Những mốc hợp lý để đẩy tiếp admin area sau khi có layout.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {focusItems.map((item, index) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 py-5">
            <CardHeader>
              <CardTitle>Đi nhanh tới module</CardTitle>
              <CardDescription>
                Các entry point admin đã có sẵn để bạn tiếp tục lấp đầy dữ liệu.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {quickActions.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition-colors hover:border-slate-300 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
