import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import {
  LayoutDashboard, Target, CheckSquare, BarChart3,
  Users, Settings, LogOut, Zap, Lock, FileText, TrendingUp
} from 'lucide-react'

const NAV = {
  employee: [
    { to: '/employee/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employee/goals',      icon: Target,          label: 'My Goals' },
    { to: '/employee/quarterly',  icon: TrendingUp,      label: 'Quarterly Updates' },
    { to: '/employee/ai',         icon: Zap,             label: 'AI Assistant' },
  ],
  manager: [
    { to: '/manager/dashboard',   icon: LayoutDashboard, label: 'Team Dashboard' },
    { to: '/manager/approvals',   icon: CheckSquare,     label: 'Approvals' },
    { to: '/manager/checkin',     icon: FileText,        label: 'Check-ins' },
    { to: '/manager/ai',          icon: Zap,             label: 'AI Insights' },
  ],
  admin: [
    { to: '/admin/dashboard',     icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/users',         icon: Users,           label: 'Users' },
    { to: '/admin/shared-goals',  icon: Target,          label: 'Shared Goals' },
    { to: '/admin/reports',       icon: BarChart3,       label: 'Reports' },
    { to: '/admin/audit',         icon: Lock,            label: 'Audit Logs' },
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const links = NAV[user?.role] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-60 min-h-screen bg-card border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Target size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-white text-lg">GoalFlow</span>
        </div>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-border">
        <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center mb-2">
          <span className="text-brand-400 font-display font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
        <p className="text-xs text-muted capitalize">{user?.role} · {user?.department || 'N/A'}</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/25'
                  : 'text-muted hover:text-slate-200 hover:bg-white/5'
              }`
            }
          >
            <Icon size={16} />
            <span className="font-body">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
        >
          <LogOut size={16} />
          <span className="font-body">Sign out</span>
        </button>
      </div>
    </aside>
  )
}
