import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Loader from '../../components/Loader'
import { QUARTERS, CURRENT_QUARTER } from '../../utils/helpers'
import { Download, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../../api/axiosInstance'

export default function Reports() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quarter, setQuarter] = useState(CURRENT_QUARTER)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get('/admin/reports', { params: { quarter } }).then(r => setReport(r.data.summary)).finally(() => setLoading(false))
  }, [quarter])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await api.get('/admin/export', { params: { quarter }, responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `goals-${quarter}.csv`
      a.click()
    } catch { alert('Export failed') }
    finally { setExporting(false) }
  }

  const chartData = report ? Object.entries(report.goalsByStatus || {}).map(([name, value]) => ({ name, value })) : []
  const STATUS_COLORS = { draft: '#64748b', submitted: '#f59e0b', under_review: '#3b82f6', approved: '#10b981', rejected: '#ef4444', locked: '#a855f7' }

  return (
    <Layout title="Reports & Analytics">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <select className="input w-36 py-1.5" value={quarter} onChange={e => setQuarter(e.target.value)}>
            {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
          <button onClick={handleExport} disabled={exporting} className="btn-secondary flex items-center gap-1.5">
            <Download size={14} /> {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>

        {loading ? <Loader /> : report && (
          <>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Users', value: report.totalUsers },
                { label: 'Total Goals', value: report.totalGoals },
                { label: 'Avg Progress', value: `${report.avgProgress}%` },
              ].map(s => (
                <div key={s.label} className="card text-center">
                  <div className="text-3xl font-display font-bold text-white mb-1">{s.value}</div>
                  <div className="text-sm text-muted">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="card">
              <h3 className="font-display font-semibold text-white mb-4">Goal Status Breakdown</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ left: -20 }}>
                    <XAxis dataKey="name" tick={{ fill: '#8892a4', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#8892a4', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#161b27', border: '1px solid #1e2636', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }} />
                    <Bar dataKey="value" radius={[4,4,0,0]}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={STATUS_COLORS[entry.name] || '#64748b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-muted py-10">No data for this quarter.</p>}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
