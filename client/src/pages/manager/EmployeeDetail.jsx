import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import ProgressBar from '../../components/ProgressBar'
import Loader from '../../components/Loader'
import { statusBadge, statusLabel, fmtDate } from '../../utils/helpers'
import { ArrowLeft, Zap, Brain } from 'lucide-react'
import api from '../../api/axiosInstance'

export default function EmployeeDetail() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const quarter = params.get('quarter') || 'Q1-2025'
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)

  useEffect(() => {
    api.get(`/manager/employee/${id}`, { params: { quarter } })
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [id, quarter])

  const generateSummary = async () => {
    setSummaryLoading(true)
    try {
      const { data: res } = await api.post('/ai/performance-summary', { employee_id: id, quarter })
      setSummary(res.summary)
    } catch { setSummary('AI summary unavailable.') }
    finally { setSummaryLoading(false) }
  }

  if (loading) return <Layout title="Employee Detail"><Loader /></Layout>
  if (!data) return <Layout title="Employee Detail"><p className="text-muted">Not found.</p></Layout>

  const { employee, goals, updates } = data

  return (
    <Layout title={employee.name}>
      <div className="space-y-5 max-w-3xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors">
          <ArrowLeft size={15} /> Back to Team
        </button>

        {/* Header */}
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <span className="font-display font-bold text-brand-400 text-xl">{employee.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold text-white text-lg">{employee.name}</h2>
            <p className="text-sm text-muted">{employee.email} · {employee.department} · {quarter}</p>
          </div>
          <button onClick={generateSummary} disabled={summaryLoading} className="btn-secondary flex items-center gap-1.5">
            <Brain size={14} className="text-amber-400" />
            {summaryLoading ? 'Generating…' : 'AI Summary'}
          </button>
        </div>

        {/* AI Summary */}
        {summary && (
          <div className="card bg-amber-500/5 border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-amber-400" />
              <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">AI Performance Summary</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Goals */}
        <div className="card">
          <h3 className="font-display font-semibold text-white mb-4">Goals — {quarter}</h3>
          <div className="space-y-3">
            {goals.map(g => {
              const upd = updates.find(u => u.goal_id === g._id || u.goal_id?.toString?.() === g._id)
              return (
                <div key={g._id} className="bg-surface rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-medium text-white text-sm">{g.title}</p>
                      <span className={`${statusBadge(g.status)} mt-1`}>{statusLabel(g.status)}</span>
                    </div>
                    <span className="text-brand-400 font-mono font-bold">{g.weightage}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div className="bg-card rounded-lg p-2 text-center">
                      <div className="text-muted mb-0.5">Target</div>
                      <div className="font-mono text-slate-300">{g.target}</div>
                    </div>
                    <div className="bg-card rounded-lg p-2 text-center">
                      <div className="text-muted mb-0.5">Actual</div>
                      <div className="font-mono text-slate-300">{upd?.actual ?? '—'}</div>
                    </div>
                    <div className="bg-card rounded-lg p-2 text-center">
                      <div className="text-muted mb-0.5">Status</div>
                      <div className="text-slate-300 capitalize">{upd?.status?.replace('_', ' ') ?? '—'}</div>
                    </div>
                  </div>
                  {upd && <ProgressBar score={upd.progress_score} />}
                </div>
              )
            })}
            {goals.length === 0 && <p className="text-sm text-muted text-center py-4">No goals for this quarter.</p>}
          </div>
        </div>
      </div>
    </Layout>
  )
}
