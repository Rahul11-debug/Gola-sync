import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import ProgressBar from '../../components/ProgressBar'
import Loader from '../../components/Loader'
import { QUARTERS, CURRENT_QUARTER } from '../../utils/helpers'
import { Users, CheckSquare, Clock, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axiosInstance'

export default function TeamDashboard() {
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [quarter, setQuarter] = useState(CURRENT_QUARTER)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    api.get('/manager/team', { params: { quarter } })
      .then(r => setTeam(r.data.team))
      .finally(() => setLoading(false))
  }, [quarter])

  const pending = team.reduce((s, e) => s + (e.pending_approval || 0), 0)
  const avgScore = team.length ? Math.round(team.reduce((s, e) => s + e.overall_score, 0) / team.length) : 0

  return (
    <Layout title="Team Dashboard">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <select className="input w-36 py-1.5" value={quarter} onChange={e => setQuarter(e.target.value)}>
            {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Team Members"      value={team.length} icon={Users}       color="brand" />
          <StatCard label="Pending Approvals" value={pending}     icon={Clock}       color="amber" />
          <StatCard label="Avg Team Score"    value={`${avgScore}%`} icon={TrendingUp} color="emerald" />
          <StatCard label="Active Quarter"    value={quarter}     icon={CheckSquare} color="purple" />
        </div>

        {loading ? <Loader /> : (
          <div className="card">
            <h3 className="font-display font-semibold text-white mb-4">Team Members</h3>
            <div className="space-y-3">
              {team.map(emp => (
                <div key={emp.employee._id}
                  onClick={() => navigate(`/manager/employee/${emp.employee._id}?quarter=${quarter}`)}
                  className="flex items-center gap-4 p-4 bg-surface rounded-xl hover:border hover:border-brand-500/30 cursor-pointer transition-all group border border-transparent">
                  <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0">
                    <span className="font-display font-bold text-brand-400 text-sm">{emp.employee.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-slate-200 text-sm">{emp.employee.name}</p>
                      <span className="text-xs font-mono text-brand-400">{emp.overall_score}%</span>
                    </div>
                    <ProgressBar score={emp.overall_score} showLabel={false} height={4} />
                    <div className="flex gap-3 mt-2 text-xs text-muted">
                      <span>{emp.total_goals} goals</span>
                      {emp.pending_approval > 0 && <span className="text-amber-400">{emp.pending_approval} pending</span>}
                      <span className="text-emerald-400">{emp.goals_status.locked || 0} active</span>
                    </div>
                  </div>
                  <div className="text-muted group-hover:text-brand-400 transition-colors">→</div>
                </div>
              ))}
              {team.length === 0 && <p className="text-center text-muted text-sm py-8">No team members found.</p>}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
