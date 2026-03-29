'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AdminRoute } from '@/components/auth/admin-route'
import { Button } from '@/components/ui/button'
import {
  useCreateAdminLearnStepMutation,
  useDeleteAdminLearnStepMutation,
  useGetAdminLearnMapsQuery,
  useGetAdminLearnStepsQuery,
  useUpdateAdminLearnMapMutation,
} from '@/lib/api/learnApi'

export default function AdminLearnMapEditPage() {
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : ''
  const { data: mapsData, isLoading: mapsLoading } = useGetAdminLearnMapsQuery()
  const map = mapsData?.items?.find((m) => m.id === id)
  const { data: stepsData, refetch: refetchSteps } = useGetAdminLearnStepsQuery(id, {
    skip: !id,
  })
  const [updateMap] = useUpdateAdminLearnMapMutation()
  const [createStep] = useCreateAdminLearnStepMutation()
  const [deleteStep] = useDeleteAdminLearnStepMutation()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [order, setOrder] = useState('0')
  const [isPublished, setIsPublished] = useState(false)
  const [bossXPReward, setBossXPReward] = useState('0')
  const [unlocksMapId, setUnlocksMapId] = useState('')

  useEffect(() => {
    if (!map) return
    setTitle(map.title)
    setSlug(map.slug)
    setDescription(map.description)
    setOrder(String(map.order))
    setIsPublished(map.isPublished)
    setBossXPReward(String(map.bossXPReward))
    setUnlocksMapId(map.unlocksMapId ?? '')
  }, [map])

  const [stepTitle, setStepTitle] = useState('Lesson')
  const [stepType, setStepType] = useState<'lesson' | 'boss'>('lesson')
  const [stepOrder, setStepOrder] = useState('0')
  const [aiSystemPrompt, setAiSystemPrompt] = useState(
    'You are a friendly English tutor at an airport. Keep replies short.',
  )
  const [openingMessage, setOpeningMessage] = useState(
    'Hi! I work at the check-in desk. How can I help you today?',
  )
  const [minTurns, setMinTurns] = useState('2')
  const [xpReward, setXpReward] = useState('20')
  const [passCriteria, setPassCriteria] = useState('check-in, flight')
  const [bossName, setBossName] = useState('Gate Boss')
  const [bossTasksJson, setBossTasksJson] = useState(
    '[{"id":"t1","description":"Ask about departure time"},{"id":"t2","description":"Request seat change"}]',
  )

  const saveMap = async () => {
    if (!id) return
    await updateMap({
      id,
      body: {
        title,
        slug,
        description,
        order: Number(order),
        isPublished,
        bossXPReward: Number(bossXPReward),
        unlocksMapId: unlocksMapId || null,
      },
    }).unwrap()
  }

  const addStep = async () => {
    let bossTasks: { id: string; description: string }[] | undefined
    if (stepType === 'boss') {
      try {
        const parsed = JSON.parse(bossTasksJson) as { id: string; description: string }[]
        bossTasks = Array.isArray(parsed) ? parsed : []
      } catch {
        bossTasks = []
      }
    }
    await createStep({
      mapId: id,
      body: {
        title: stepTitle,
        type: stepType,
        order: Number(stepOrder),
        aiSystemPrompt,
        openingMessage,
        minTurns: Number(minTurns),
        xpReward: Number(xpReward),
        passCriteria: passCriteria
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        bossName: stepType === 'boss' ? bossName : '',
        bossTasks: stepType === 'boss' ? bossTasks : [],
        bossHPMax: stepType === 'boss' ? 100 : undefined,
        playerHPMax: stepType === 'boss' ? 100 : undefined,
      },
    }).unwrap()
    void refetchSteps()
  }

  if (mapsLoading || !mapsData) {
    return (
      <AdminRoute>
        <p className="p-8 text-sm text-slate-500">Loading…</p>
      </AdminRoute>
    )
  }

  if (!map) {
    return (
      <AdminRoute>
        <p className="p-8 text-sm text-red-600">Map not found.</p>
      </AdminRoute>
    )
  }

  return (
    <AdminRoute>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <div>
          <Link href="/admin/learn/maps" className="text-sm font-semibold text-slate-600 hover:text-black">
            ← Maps
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Edit map</h1>
        </div>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Map settings</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Title
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Slug
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </label>
            <label className="col-span-full text-sm">
              Description
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Order
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Boss XP reward
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={bossXPReward}
                onChange={(e) => setBossXPReward(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Unlocks map id (Mongo ObjectId)
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
                value={unlocksMapId}
                onChange={(e) => setUnlocksMapId(e.target.value)}
                placeholder="optional"
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
          </div>
          <Button type="button" onClick={() => void saveMap()}>
            Save map
          </Button>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Steps</h2>
          <ul className="space-y-2">
            {stepsData?.items?.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-3 py-2"
              >
                <span className="text-sm">
                  <span className="font-medium">{s.title}</span>{' '}
                  <span className="text-slate-500">({s.type})</span>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    deleteStep({ id: s.id, mapId: id }).then(() => refetchSteps())
                  }
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>

          <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4">
            <h3 className="text-sm font-semibold text-slate-800">Add step</h3>
            <label className="text-sm">
              Title
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={stepTitle}
                onChange={(e) => setStepTitle(e.target.value)}
              />
            </label>
            <div className="flex gap-4">
              <label className="text-sm">
                Type
                <select
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={stepType}
                  onChange={(e) => setStepType(e.target.value as 'lesson' | 'boss')}
                >
                  <option value="lesson">lesson</option>
                  <option value="boss">boss</option>
                </select>
              </label>
              <label className="text-sm">
                Order
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={stepOrder}
                  onChange={(e) => setStepOrder(e.target.value)}
                />
              </label>
            </div>
            <label className="text-sm">
              AI system prompt
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
                rows={4}
                value={aiSystemPrompt}
                onChange={(e) => setAiSystemPrompt(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Opening message
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                rows={2}
                value={openingMessage}
                onChange={(e) => setOpeningMessage(e.target.value)}
              />
            </label>
            <div className="flex gap-4">
              <label className="text-sm">
                Min turns
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={minTurns}
                  onChange={(e) => setMinTurns(e.target.value)}
                />
              </label>
              <label className="text-sm">
                XP reward
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={xpReward}
                  onChange={(e) => setXpReward(e.target.value)}
                />
              </label>
            </div>
            <label className="text-sm">
              Pass criteria (comma-separated substrings)
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={passCriteria}
                onChange={(e) => setPassCriteria(e.target.value)}
              />
            </label>
            {stepType === 'boss' && (
              <>
                <label className="text-sm">
                  Boss name
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    value={bossName}
                    onChange={(e) => setBossName(e.target.value)}
                  />
                </label>
                <label className="text-sm">
                  Boss tasks JSON
                  <textarea
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
                    rows={4}
                    value={bossTasksJson}
                    onChange={(e) => setBossTasksJson(e.target.value)}
                  />
                </label>
              </>
            )}
            <Button type="button" onClick={() => void addStep()}>
              Add step
            </Button>
          </div>
        </section>
      </div>
    </AdminRoute>
  )
}
