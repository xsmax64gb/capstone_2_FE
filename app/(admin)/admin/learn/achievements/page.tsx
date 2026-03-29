'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AdminRoute } from '@/components/auth/admin-route'
import { Button } from '@/components/ui/button'
import {
  useCreateAdminLearnAchievementMutation,
  useDeleteAdminLearnAchievementMutation,
  useGetAdminLearnAchievementsQuery,
} from '@/lib/api/learnApi'

export default function AdminLearnAchievementsPage() {
  const { data, refetch } = useGetAdminLearnAchievementsQuery()
  const [createA, { isLoading }] = useCreateAdminLearnAchievementMutation()
  const [del] = useDeleteAdminLearnAchievementMutation()
  const [key, setKey] = useState('first_boss_win')
  const [title, setTitle] = useState('First boss win')
  const [description, setDescription] = useState('Defeat your first boss.')
  const [xpReward, setXpReward] = useState('100')

  const onCreate = async () => {
    await createA({
      key,
      title,
      description,
      xpReward: Number(xpReward),
    }).unwrap()
    void refetch()
  }

  return (
    <AdminRoute>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <div>
          <Link href="/admin/learn/maps" className="text-sm font-semibold text-slate-600 hover:text-black">
            ← Learn maps
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Achievements</h1>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Create</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Key (slug)
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Title
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label className="col-span-full text-sm">
              Description
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label className="text-sm">
              XP
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={xpReward}
                onChange={(e) => setXpReward(e.target.value)}
              />
            </label>
          </div>
          <Button className="mt-4" type="button" disabled={isLoading} onClick={() => void onCreate()}>
            Add achievement
          </Button>
        </section>

        <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {data?.items?.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="font-medium text-slate-900">
                  {a.title} <span className="text-xs text-slate-500">({a.key})</span>
                </p>
                <p className="text-xs text-slate-600">{a.description}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => del(a.id).then(() => refetch())}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </AdminRoute>
  )
}
