'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Medal, Plus, Sparkles, Trash2 } from 'lucide-react'

import { AdminPageError, AdminPageLoading } from '@/components/admin/admin-query-state'
import { AdminRoute } from '@/components/auth/admin-route'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatNumber, notify } from '@/lib/admin'
import {
  useCreateAdminLearnAchievementMutation,
  useDeleteAdminLearnAchievementMutation,
  useGetAdminLearnAchievementsQuery,
} from '@/store/services/learnApi'
import { handleApiError } from '@/lib/api-error-handler'

export default function AdminLearnAchievementsPage() {
  const { data, isLoading, error, refetch } = useGetAdminLearnAchievementsQuery()
  const [createAchievement, { isLoading: isCreating }] = useCreateAdminLearnAchievementMutation()
  const [deleteAchievement, { isLoading: isDeleting }] = useDeleteAdminLearnAchievementMutation()
  const [key, setKey] = useState('first_boss_win')
  const [title, setTitle] = useState('Chiến thắng boss đầu tiên')
  const [description, setDescription] = useState('Hoàn thành trận boss đầu tiên trong lộ trình học.')
  const [xpReward, setXpReward] = useState('100')
  const items = data?.items ?? []
  const totalXpReward = items.reduce((sum, item) => sum + (item.xpReward ?? 0), 0)
  const triggeredCount = items.filter((item) => item.trigger).length

  const onCreate = async () => {
    if (!key.trim() || !title.trim()) {
      notify({
        type: 'warning',
        title: 'Thiếu thông tin bắt buộc',
        message: 'Vui lòng nhập mã định danh và tên hiển thị cho huy hiệu.',
      })
      return
    }

    try {
      await createAchievement({
        key: key.trim(),
        title: title.trim(),
        description: description.trim(),
        xpReward: Number(xpReward) || 0,
      }).unwrap()
      notify({
        type: 'success',
        title: 'Đã tạo huy hiệu',
        message: 'Huy hiệu mới đã được thêm vào hệ thống học tập.',
      })
      setKey('')
      setTitle('')
      setDescription('')
      setXpReward('100')
      void refetch()
    } catch (createError) {
      const apiError = handleApiError(createError)
      notify({
        type: 'error',
        title: 'Tạo huy hiệu thất bại',
        message: apiError.message,
      })
    }
  }

  const onDelete = async (id: string, achievementTitle: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa huy hiệu "${achievementTitle}" không?`)) {
      return
    }

    try {
      await deleteAchievement(id).unwrap()
      notify({
        type: 'success',
        title: 'Đã xóa huy hiệu',
        message: `Huy hiệu "${achievementTitle}" đã được gỡ khỏi hệ thống.`,
      })
      void refetch()
    } catch (deleteError) {
      const apiError = handleApiError(deleteError)
      notify({
        type: 'error',
        title: 'Xóa huy hiệu thất bại',
        message: apiError.message,
      })
    }
  }

  return (
    <AdminRoute>
      <div className="space-y-6">
        <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link
                href="/admin/learn/maps"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại danh sách bản đồ học
              </Link>
              <Badge
                variant="outline"
                className="mt-4 rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
              >
                Thành tựu học tập
              </Badge>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                Quản lý huy hiệu và thành tựu
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                Tạo các huy hiệu thưởng XP, quản lý mã định danh nội bộ và rà soát những thành
                tựu đang dùng trong hành trình học. Trang này dành cho phần thưởng hệ thống, không
                phải nội dung bài học.
              </p>
            </div>
            <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
              <p className="font-semibold">Lưu ý vận hành</p>
              <p className="mt-1 max-w-sm leading-6 text-amber-800">
                Giữ `key` ngắn gọn và ổn định vì đây là mã dùng để backend kích hoạt huy hiệu.
              </p>
            </div>
          </div>
        </section>

        {isLoading ? <AdminPageLoading /> : null}

        {!isLoading && error ? (
          <AdminPageError message="Không tải được danh sách huy hiệu học tập." />
        ) : null}

        {!isLoading && !error ? (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <Card className="border-slate-200 py-5">
                <CardContent className="flex items-start justify-between gap-4 pt-1">
                  <div>
                    <p className="text-sm text-slate-500">Tổng số huy hiệu</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                      {formatNumber(items.length)}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Medal className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 py-5">
                <CardContent className="flex items-start justify-between gap-4 pt-1">
                  <div>
                    <p className="text-sm text-slate-500">Tổng XP thưởng</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                      {formatNumber(totalXpReward)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Cộng gộp XP thưởng của toàn bộ thành tựu
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 py-5">
                <CardContent className="flex items-start justify-between gap-4 pt-1">
                  <div>
                    <p className="text-sm text-slate-500">Đã có trigger</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                      {formatNumber(triggeredCount)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatNumber(items.length - triggeredCount)} huy hiệu chưa gắn trigger rõ ràng
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Plus className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
              <Card className="border-slate-200 py-5">
                <CardHeader>
                  <CardTitle>Tạo huy hiệu mới</CardTitle>
                  <CardDescription>
                    Điền thông tin cơ bản để thêm một phần thưởng mới cho hệ thống học tập.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="achievement-key">Mã định danh (`key`)</Label>
                    <Input
                      id="achievement-key"
                      value={key}
                      onChange={(event) => setKey(event.target.value)}
                      placeholder="first_boss_win"
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="achievement-title">Tên hiển thị</Label>
                    <Input
                      id="achievement-title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Chiến thắng boss đầu tiên"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="achievement-description">Mô tả ngắn</Label>
                    <Textarea
                      id="achievement-description"
                      rows={4}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Hoàn thành trận boss đầu tiên trong lộ trình học."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="achievement-xp">XP thưởng</Label>
                    <Input
                      id="achievement-xp"
                      type="number"
                      min={0}
                      value={xpReward}
                      onChange={(event) => setXpReward(event.target.value)}
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-600">
                    Sau khi tạo, huy hiệu sẽ xuất hiện ngay trong danh sách. Nếu cần icon hoặc
                    trigger riêng, backend hoặc trang cấu hình mở rộng có thể bổ sung sau.
                  </div>

                  <Button
                    type="button"
                    className="w-full rounded-xl"
                    disabled={isCreating}
                    onClick={() => void onCreate()}
                  >
                    <Plus className="h-4 w-4" />
                    {isCreating ? 'Đang tạo huy hiệu...' : 'Tạo huy hiệu'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200 py-5">
                <CardHeader>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <CardTitle>Danh sách huy hiệu hiện có</CardTitle>
                      <CardDescription>
                        {formatNumber(items.length)} huy hiệu đang được lưu trong hệ thống
                      </CardDescription>
                    </div>
                    <p className="text-sm text-slate-500">
                      Có thể xóa nhanh các bản thử nghiệm hoặc rà lại phần thưởng XP tại đây.
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                      <p className="text-lg font-semibold text-slate-900">Chưa có huy hiệu nào</p>
                      <p className="mt-2 text-sm text-slate-600">
                        Tạo thành tựu đầu tiên để bắt đầu thưởng XP cho các mốc học tập.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((achievement) => (
                        <div
                          key={achievement.id}
                          className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-lg font-semibold text-slate-950">
                                  {achievement.title}
                                </p>
                                <Badge
                                  variant="outline"
                                  className="rounded-full border-slate-200 bg-white font-mono text-[11px] text-slate-600"
                                >
                                  {achievement.key}
                                </Badge>
                                <Badge className="rounded-full bg-sky-600 text-white hover:bg-sky-600">
                                  {formatNumber(achievement.xpReward ?? 0)} XP
                                </Badge>
                              </div>

                              <p className="max-w-3xl text-sm leading-6 text-slate-600">
                                {achievement.description || 'Chưa có mô tả cho huy hiệu này.'}
                              </p>

                              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                <span className="rounded-full bg-white px-3 py-1">
                                  Trigger: {achievement.trigger || 'Chưa cấu hình'}
                                </span>
                                <span className="rounded-full bg-white px-3 py-1">
                                  Icon: {achievement.iconUrl ? 'Đã có' : 'Chưa có'}
                                </span>
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                              disabled={isDeleting}
                              onClick={() => void onDelete(achievement.id, achievement.title)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Xóa huy hiệu
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </AdminRoute>
  )
}
