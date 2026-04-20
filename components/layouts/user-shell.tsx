import { UserFooter } from "./user-footer";
import { UserHeader } from "./user-header";
import { UserProfileBootstrap } from "./user-profile-bootstrap";

export function UserShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <UserProfileBootstrap />
      <UserHeader />
      {children}
      <UserFooter />
    </div>
  );
}
