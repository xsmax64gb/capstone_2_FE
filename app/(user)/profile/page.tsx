'use client'

import { Flame, Gift, Medal, Trophy } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/lib/auth-context'

const DEFAULT_AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAHrbU6dGptCG-_BbdkQIQBO5sKyHsHQ3kIcpfJM3eQak-gKt79i7-H0EAqM-qIJ14pXancOSo4qvoDgyqlFP0ChUVL3QtU0PnuHjHKU2bDHY80nSC7YfRssSXAl92pMdk1oHHaMF8ae4b8WG8rXwGQRxDYqO6vASZHYmvH7DULLHz1Eq9gnhyUHy0RR3GZ3iltSlU42ZdpZPzGUVRVpvB9HNXAEu887lKJybHw3qVD5SRa8M36W9QQXIGMPrGHF3u8KyVrQM8c2OWB'

export default function ProfilePage() {
  const { user } = useAuth()

  const profileName = user?.fullName || user?.name || 'Learner'
  const profileEmail = user?.email || 'No email'
  const avatarUrl = user?.avatarUrl || DEFAULT_AVATAR_URL

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <div
              className="relative h-24 w-24 rounded-full border-4 border-white bg-slate-200 shadow-sm"
              style={{
                backgroundImage: `url('${avatarUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-bold text-white shadow-lg ring-2 ring-white">
                +
              </button>
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold tracking-tight">{profileName}</h1>
              <p className="text-slate-500">{profileEmail}</p>
            </div>
          </div>
          <button className="inline-flex h-11 items-center justify-center rounded-lg bg-black px-6 text-sm font-semibold text-white transition-all hover:bg-slate-800">
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="mb-8 border-b border-slate-200">
              <nav className="flex gap-8 overflow-x-auto pb-px">
                <button className="border-b-2 border-black pb-4 text-sm font-semibold text-black">
                  Personal Info
                </button>
                <button className="border-b-2 border-transparent pb-4 text-sm font-medium text-slate-500">
                  Security
                </button>
                <button className="border-b-2 border-transparent pb-4 text-sm font-medium text-slate-500">
                  Learning Preferences
                </button>
                <button className="border-b-2 border-transparent pb-4 text-sm font-medium text-slate-500">
                  Subscription
                </button>
                <button className="border-b-2 border-transparent pb-4 text-sm font-medium text-slate-500">
                  Achievements
                </button>
              </nav>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-black focus:ring-1 focus:ring-black"
                    type="text"
                    defaultValue={profileName}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email Address</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-black focus:ring-1 focus:ring-black"
                    type="email"
                    defaultValue={profileEmail}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Bio</label>
                  <textarea
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-black focus:ring-1 focus:ring-black"
                    rows={4}
                    defaultValue="Passionate about linguistics and AI-powered learning."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Native Language</label>
                  <select className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-black focus:ring-1 focus:ring-black">
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Timezone</label>
                  <select className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-black focus:ring-1 focus:ring-black">
                    <option>Pacific Time (PT)</option>
                    <option>Eastern Time (ET)</option>
                    <option>Greenwich Mean Time (GMT)</option>
                    <option>Central European Time (CET)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end border-t border-slate-200 pt-6">
                <button className="inline-flex h-10 items-center justify-center rounded-lg bg-black px-8 text-sm font-semibold text-white shadow transition-all hover:bg-slate-800">
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8 lg:col-span-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-lg font-bold">Learning Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <Medal className="h-5 w-5 text-black" />
                    <span className="text-sm font-medium">Level</span>
                  </div>
                  <span className="font-bold">{user?.currentLevel || 'A1 Beginner'}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <Flame className="h-5 w-5 text-black" />
                    <span className="text-sm font-medium">Streak</span>
                  </div>
                  <span className="font-bold">15 Days</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-black" />
                    <span className="text-sm font-medium">Points</span>
                  </div>
                  <span className="font-bold">{user?.exp ?? 0} XP</span>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl bg-black p-6 text-white shadow-lg">
              <div className="relative z-10">
                <h3 className="mb-2 text-lg font-bold">Refer a Friend</h3>
                <p className="mb-6 text-sm text-slate-300">
                  Invite your friends to SmartLingo and both of you get 1 month of Premium free.
                </p>
                <button className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-white px-4 text-sm font-bold text-black transition-colors hover:bg-slate-100">
                  <Gift className="mr-2 h-4 w-4" />
                  Share Invite Link
                </button>
              </div>
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl transition-all group-hover:bg-white/20" />
              <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5 blur-3xl transition-all group-hover:bg-white/10" />
            </div>

            <div className="rounded-xl border border-dashed border-slate-300 p-6">
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                Upcoming Milestone
              </h4>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Trophy className="h-5 w-5 text-black" />
                </div>
                <div>
                  <p className="text-sm font-bold">Polyglot Master</p>
                  <p className="text-xs text-slate-500">550 XP remaining for next badge</p>
                </div>
              </div>
              <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
                <div className="h-2 w-3/4 rounded-full bg-black" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}
