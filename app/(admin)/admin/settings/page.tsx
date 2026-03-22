import { BellRing, Lock, Settings2, ShieldCheck } from "lucide-react";
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
    label: "Rule đang bật",
    value: "24",
    hint: "Bao gồm auth, moderation và notifications",
    icon: Settings2,
  },
  {
    label: "Integration đang dùng",
    value: "07",
    hint: "Email, storage, analytics, AI services",
    icon: ShieldCheck,
  },
  {
    label: "Notification flow",
    value: "05",
    hint: "Cảnh báo queue, hệ thống và báo cáo ngày",
    icon: BellRing,
  },
] as const;

const configAreas = [
  "Role và quyền hạn theo từng khu vực admin.",
  "Các giá trị cấu hình cho queue, retry và moderation.",
  "Toggle cho feature flags, release gate va external integrations.",
] as const;

const securityNotes = [
  "Nhóm settings nên tách thành tabs: general, security, integrations, notifications.",
  "Nên có audit trail cho các thay đổi quan trọng để dễ truy vết.",
  "Có thể thêm confirm dialog cho thao tác nhạy cảm như rotate key hay đổi rule auth.",
] as const;

export default function AdminSettingsPage() {
  return (
    <>
      <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
        <Badge
          variant="outline"
          className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
        >
          System Settings
        </Badge>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          Cấu hình hệ thống, quyền hạn và integrations.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          Layout settings đã để sẵn cho việc tách section, thêm tabs và những
          thao tác nhạy cảm. Đây là nơi phù hợp để gom các config một cách gọn
          và an toàn.
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
            <CardTitle>Những khối settings nên có</CardTitle>
            <CardDescription>
              Đây là bố cục hợp lý để admin tìm config nhanh và ít nhầm lẫn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {configAreas.map((item, index) => (
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
            <CardTitle>Chú ý bảo mật và vận hành</CardTitle>
            <CardDescription>
              Nên giữ những flow nhạy cảm rõ ràng và có xác nhận.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {securityNotes.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
              >
                <p className="text-sm leading-6 text-slate-600">{item}</p>
              </div>
            ))}
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Lock className="h-4 w-4" />
              Có thể thêm confirm step và audit log cho action nhạy cảm.
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
