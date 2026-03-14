import { UserFooter } from './user-footer'
import { UserHeader } from './user-header'

export function UserShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <UserHeader />
      {children}
      <UserFooter />
    </div>
  )
}
