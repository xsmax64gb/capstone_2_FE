import { Clock3, ShieldAlert, UserPlus, Users2 } from "lucide-react";
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
    label: "Hồ sơ đang hoạt động",
    value: "12,420",
    hint: "Tăng nhẹ trong 7 ngày qua",
    icon: Users2,
  },
  {
    label: "Moi onboard",
    value: "214",
    hint: "Cần theo dõi tỉ lệ hoàn tất onboarding",
    icon: UserPlus,
  },
  {
    label: "Tài khoản cần xem xét",
    value: "09",
    hint: "Bao gồm role và trạng thái bất thường",
    icon: ShieldAlert,
  },
] as const;

const queueItems = [
  "Danh sách có bộ lọc theo role, level, onboardingDone và last active.",
  "Bulk action cho lock, unlock, cấp quyền và gán nhóm học viên.",
  "Drawer hoặc side panel để xem nhanh profile mà không rời khỏi bảng.",
] as const;

const nextSteps = [
  "Nối API danh sách người dùng và thông tin phân trang.",
  "Thêm badge role, trạng thái, và cảnh báo onboarding.",
  "Tích hợp tìm kiếm realtime để giảm thao tác của admin.",
] as const;

export default function AdminUsersPage() {
  return (
    <>
      <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
        <Badge
          variant="outline"
          className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
        >
          User Operations
        </Badge>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          Khu vận hành học viên và tài khoản.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          Trang này đã có khung để gắn bảng user, filter, search, role badge và
          các thao tác hàng loạt. Bạn có thể xem nó như khu operations desk cho
          toàn bộ lifecycle của người học.
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
            <CardTitle>Những khối nên có trong màn quản lý user</CardTitle>
            <CardDescription>
              Đây là bố cục hợp lý để tiếp tục lấp đầy dữ liệu thật.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {queueItems.map((item, index) => (
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
            <CardTitle>Hướng mở rộng tiếp theo</CardTitle>
            <CardDescription>
              Có thể thao tác tiếp từ shell này mà không phải sửa lại layout.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {nextSteps.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
              >
                <p className="text-sm leading-6 text-slate-600">{item}</p>
              </div>
            ))}
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Clock3 className="h-4 w-4" />
              Khu này phù hợp để đặt bảng data table ở sprint tiếp theo.
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
