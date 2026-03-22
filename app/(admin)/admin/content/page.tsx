import { BookOpen, ClipboardCheck, FileClock, Layers3 } from "lucide-react";
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
    label: "Module đã publish",
    value: "128",
    hint: "Bao gồm bài học, vocabulary và exercise packs",
    icon: BookOpen,
  },
  {
    label: "Bản nháp đang chờ duyệt",
    value: "21",
    hint: "Tập trung ở unit B1 và speaking prompts",
    icon: FileClock,
  },
  {
    label: "Asset cần đối soát",
    value: "46",
    hint: "Image, audio, và metadata cần verify",
    icon: Layers3,
  },
] as const;

const pipeline = [
  "Danh sách draft với status rõ: drafting, review, approved, published.",
  "Preview card cho bài học để admin xem nhanh title, level và owner.",
  "Action panel cho approve, reject, duplicate và schedule publish.",
] as const;

const reviewNotes = [
  "Nội dung admin nên ưu tiên bố trí theo pipeline thay vì chỉ là list phẳng.",
  "Nên có bộ lọc theo cấp độ, kỹ năng, owner và ngày cập nhật.",
  "Có thể thêm panel phụ để hiện media assets liên quan và lịch sử chỉnh sửa.",
] as const;

export default function AdminContentPage() {
  return (
    <>
      <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
        <Badge
          variant="outline"
          className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
        >
          Content Desk
        </Badge>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          Quản lý pipeline nội dung học tập.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          Đây là khu để thêm moderation flow, preview, schedule và release note
          cho bài học. Layout hiện tại ưu tiên việc chuyển draft thành publish
          nhanh và dễ quan sát.
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
            <CardTitle>Pipeline xuất bản để xây tiếp</CardTitle>
            <CardDescription>
              Khung này phù hợp cho board hoặc list moderation sau này.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pipeline.map((item, index) => (
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
            <CardTitle>Gợi ý triển khai</CardTitle>
            <CardDescription>
              Những điểm nên ưu tiên để màn content không bị rối khi lớn dần.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviewNotes.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
              >
                <p className="text-sm leading-6 text-slate-600">{item}</p>
              </div>
            ))}
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <ClipboardCheck className="h-4 w-4" />
              Hợp lý để gắn editor status, owner và release history.
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
