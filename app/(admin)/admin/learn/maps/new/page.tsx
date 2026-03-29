'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminRoute } from '@/components/auth/admin-route'
import { Button } from '@/components/ui/button'
import { useCreateAdminLearnMapMutation } from '@/lib/api/learnApi'

export default function AdminNewLearnMapPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [order, setOrder] = useState('0')
  const [isPublished, setIsPublished] = useState(true)
  const [bossXPReward, setBossXPReward] = useState('50')
  const [createMap, { isLoading }] = useCreateAdminLearnMapMutation()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await createMap({
        title,
        slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
        description,
        order: Number(order),
        isPublished,
        bossXPReward: Number(bossXPReward),
      }).unwrap()
      router.push(`/admin/learn/maps/${res.map.id}`)
    } catch {
      /* toast optional */
    }
  }

  return (
    <AdminRoute>
      <div className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">New map</h1>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Title</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Slug</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto from title if empty"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Description</span>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Order</span>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Boss XP reward</span>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={bossXPReward}
              onChange={(e) => setBossXPReward(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            Published
          </label>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving…' : 'Create'}
          </Button>
        </form>
      </div>
    </AdminRoute>
  )
}
