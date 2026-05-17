import { Bell, Search } from 'lucide-react'
import useAuthStore from '../store/authStore'

export default function Navbar({ title }) {
  const { user } = useAuthStore()
  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-6 shrink-0">
      <h1 className="font-display font-semibold text-white text-base">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted hover:text-white hover:border-brand-500 transition-all">
          <Bell size={15} />
        </button>
        <div className="text-right">
          <p className="text-xs font-medium text-slate-300">{user?.name}</p>
          <p className="text-xs text-muted capitalize">{user?.role}</p>
        </div>
      </div>
    </header>
  )
}
