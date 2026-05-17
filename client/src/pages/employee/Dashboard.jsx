import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import ProgressBar from '../../components/ProgressBar'
import Loader from '../../components/Loader'
import { statusBadge, statusLabel, CURRENT_QUARTER } from '../../utils/helpers'
import useGoalStore from '../../store/goalStore'
import useAuthStore from '../../store/authStore'
import { Target, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { useNavigate } from 'react-router-dom'

export default function EmployeeDashboard() {
  const { goals, fetchMyGoals, loading } = useGoalStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [quarter] = useState(CURRENT_QUARTER)

  useEffect(() => { fetchMyGoals(quarter) }, [quarter])

  const locked   = goals.filter(g => g.status === 'locked')
  const drafts   = goals.filter(g => g.status === 'draft')
  const submitted = goals.filter(g => ['submitted','under_review'].includes(g.status))

  const chartData = goals.map(g => ({
    name: g.title.length > 20 ? g.title.slice(0, 20) + '…' : g.title,
    weight: g.weightage,
  }))

  const totalWeight = drafts.reduce((s, g) => s + g.weightage, 0)

  return (
    <Layout title="My Dashboard">
      <div className="space-y-6 animate-slide-up">
        {/* Welcome */}
        <div className="card bg-gradient-to-r from-brand-500/10 to-purple-500/10 border-brand-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Welcome back,</p>
              <h2 className="font-display font-bold text-white text-xl">{user?.name}</h2>
              <p className="text-sm text-muted mt-0.5">{quarter} · {user?.department}</p>
            </div>
            <div className="text-right">
              {drafts.length > 0 && (
                <button onClick={() => navigate('/employee/goals')} className="btn-primary">
                  Complete Setup →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Goals"    value={goals.length}     icon={Target}      color="brand" />
          <StatCard label="Locked/Active"  value={locked.length}    icon={CheckCircle} color="emerald" />
          <StatCard label="Pending Review" value={submitted.length} icon={Clock}       color="amber" />
          <StatCard label="Drafts"         value={drafts.length}    icon={AlertCircle} color="red" />
        </div>

        {loading ? <Loader /> : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Goal list */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-white">Goals — {quarter}</h3>
                <button onClick={() => navigate('/employee/goals')} className="text-xs text-brand-400 hover:text-brand-300">
                  View all →
                </button>
              </div>
              <div className="space-y-2">
                {goals.length === 0 && (
                  <p className="text-sm text-muted text-center py-6">No goals yet. <button onClick={() => navigate('/employee/goals')} className="text-brand-400 hover:underline">Create your first goal →</button></p>
                )}
                {goals.map(g => (
                  <div key={g._id} className="flex items-center gap-3 p-3 bg-surface rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{g.title}</p>
                      <span className={`${statusBadge(g.status)} mt-1`}>{statusLabel(g.status)}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-brand-400 font-mono font-bold text-sm">{g.weightage}%</span>
                    </div>
                  </div>
                ))}
              </div>
              {drafts.length > 0 && (
                <div className={`mt-3 p-3 rounded-lg border text-sm ${totalWeight === 100 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/30 bg-amber-500/10 text-amber-400'}`}>
                  Total weightage: {totalWeight}% {totalWeight === 100 ? '✓ Ready to submit' : `(need ${100 - totalWeight}% more)`}
                </div>
              )}
            </div>

            {/* Weight distribution chart */}
            <div className="card">
              <h3 className="font-display font-semibold text-white mb-4">Weightage Distribution</h3>
              {goals.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-muted text-sm">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fill: '#8892a4', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#8892a4', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#161b27', border: '1px solid #1e2636', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }} />
                    <Bar dataKey="weight" radius={[4,4,0,0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={`hsl(${200 + i * 20}, 80%, 55%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
