import { Activity, BarChart3, Clock3, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const metrics = [
  {
    label: "Completion rate",
    value: "74%",
    hint: "Tăng 5 điểm so với tháng trước",
    icon: TrendingUp,
  },
  {
    label: "Speaking minutes",
    value: "8.9k",
    hint: "Tổng thời lượng trên AI speaking trong 7 ngày",
    icon: Activity,
  },
  {
    label: "Cảnh báo mở",
    value: "06",
    hint: "Chủ yếu liên quan performance và moderation",
    icon: BarChart3,
  },
] as const;

const reportIdeas = [
  "Retention theo cohort, level và kênh acquisition.",
  "So sánh mức độ sử dụng giữa AI, vocabulary và exercises.",
  "Heatmap khung giờ sử dụng để canh moderation và hạ tầng.",
] as const;

const deepDive = [
  "Thêm chart line hoặc area cho active learners, attempts và speaking minutes.",
  "Có bộ lọc date range, level, campaign và learning path.",
  "Export CSV hoặc PDF cho team vận hành và stakeholders.",
] as const;

export default function AdminReportsPage() {
  return (
    <>
      <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
        <Badge
          variant="outline"
          className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
        >
          Reporting
        </Badge>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          Tổng hợp hiệu suất, sử dụng và điểm nghẽn hệ thống.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          Khu này đã sẵn bố cục cho charts, filters và alert cards. Khi có API
          thật, mình có thể đổ dữ liệu vào từng card mà không đổi lại nhận diện
          của màn báo cáo.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((item) => {
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
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200 py-5">
          <CardHeader>
            <CardTitle>Những báo cáo nên xuất hiện</CardTitle>
            <CardDescription>
              Đây là khung dữ liệu có giá trị nhất cho admin và stakeholder.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reportIdeas.map((item, index) => (
              <div
                key={item}
                className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
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
            <CardTitle>Hướng đào sâu</CardTitle>
            <CardDescription>
              Bố cục này hợp với chart grid, filter bar và export actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deepDive.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
              >
                <p className="text-sm leading-6 text-slate-600">{item}</p>
              </div>
            ))}
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Clock3 className="h-4 w-4" />
              Phù hợp để gắn dashboard realtime hoặc batch analytics.
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
