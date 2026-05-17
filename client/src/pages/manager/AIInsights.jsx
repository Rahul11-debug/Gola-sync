import { useState } from 'react'
import Layout from '../../components/Layout'
import { QUARTERS, CURRENT_QUARTER } from '../../utils/helpers'
import { Zap, AlertTriangle, TrendingDown } from 'lucide-react'
import api from '../../api/axiosInstance'

export default function AIInsights() {
  const [quarter, setQuarter] = useState(CURRENT_QUARTER)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    setReport(null)
    try {
      const { data } = await api.post('/ai/risk-report', { quarter })
      setReport(data)
    } catch { alert('AI unavailable') }
    finally { setLoading(false) }
  }

  return (
    <Layout title="AI Insights">
      <div className="max-w-2xl space-y-6">
        <div className="card bg-gradient-to-r from-amber-500/10 to-red-500/10 border-amber-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={18} className="text-amber-400" />
            <span className="font-display font-semibold text-white">Team Risk Report</span>
          </div>
          <p className="text-sm text-muted">AI detects employees at risk of missing their quarterly targets.</p>
        </div>

        <div className="flex gap-3">
          <select className="input w-36 py-1.5" value={quarter} onChange={e => setQuarter(e.target.value)}>
            {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
          <button onClick={generate} disabled={loading} className="btn-primary flex items-center gap-2">
            <Zap size={14} /> {loading ? 'Analyzing…' : 'Generate Risk Report'}
          </button>
        </div>

        {report && (
          <div className="space-y-4 animate-slide-up">
            <div className={`card border-2 ${report.at_risk_count > 0 ? 'border-red-500/30 bg-red-500/5' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
              <div className="flex items-center gap-2 mb-3">
                {report.at_risk_count > 0 ? <AlertTriangle size={18} className="text-red-400" /> : <Zap size={18} className="text-emerald-400" />}
                <span className="font-display font-semibold text-white">{report.at_risk_count} goal{report.at_risk_count !== 1 ? 's' : ''} at risk</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{report.summary}</p>
            </div>

            {report.at_risk_goals.length > 0 && (
              <div className="card">
                <h3 className="font-display font-semibold text-white mb-3">At-Risk Goals</h3>
                <div className="space-y-2">
                  {report.at_risk_goals.map((g, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-surface rounded-lg">
                      <TrendingDown size={16} className="text-red-400 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-200">{g.goal}</p>
                        <p className="text-xs text-muted">{g.employee}</p>
                      </div>
                      <span className="text-red-400 font-mono font-bold text-sm">{g.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
