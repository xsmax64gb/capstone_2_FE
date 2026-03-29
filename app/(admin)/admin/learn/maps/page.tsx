'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { AdminRoute } from '@/components/auth/admin-route'
import { Button } from '@/components/ui/button'
import { useGetAdminLearnMapsQuery } from '@/lib/api/learnApi'

export default function AdminLearnMapsPage() {
  const { data, isLoading } = useGetAdminLearnMapsQuery()

  return (
    <AdminRoute>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Learn maps</h1>
            <p className="text-sm text-slate-600">Quản lý bản đồ, bước học và boss.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/learn/achievements">Achievements</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/learn/maps/new" className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New map
              </Link>
            </Button>
          </div>
        </div>

        {isLoading && <p className="text-sm text-slate-500">Loading…</p>}

        <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {data?.items?.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-4 px-4 py-4">
              <div>
                <p className="font-semibold text-slate-900">{m.title}</p>
                <p className="text-xs text-slate-500">
                  slug: {m.slug} · order {m.order} ·{' '}
                  {m.isPublished ? (
                    <span className="text-emerald-600">published</span>
                  ) : (
                    <span className="text-amber-600">draft</span>
                  )}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/learn/maps/${m.id}`}>Edit</Link>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </AdminRoute>
  )
}
