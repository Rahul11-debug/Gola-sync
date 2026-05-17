import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import Loader from '../../components/Loader'
import { QUARTERS, CURRENT_QUARTER } from '../../utils/helpers'
import { Users, Target, TrendingUp, CheckCircle } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '../../api/axiosInstance'

const COLORS = { draft: '#64748b', submitted: '#f59e0b', under_review: '#3b82f6', approved: '#10b981', rejected: '#ef4444', locked: '#a855f7' }

export default function AdminDashboard() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quarter, setQuarter] = useState(CURRENT_QUARTER)

  useEffect(() => {
    setLoading(true)
    api.get('/admin/reports', { params: { quarter } }).then(r => setReport(r.data.summary)).finally(() => setLoading(false))
  }, [quarter])

  const pieData = report ? Object.entries(report.goalsByStatus || {}).map(([name, value]) => ({ name, value })) : []

  return (
    <Layout title="Admin Overview">
      <div className="space-y-6">
        <select className="input w-36 py-1.5" value={quarter} onChange={e => setQuarter(e.target.value)}>
          {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
        </select>

        {loading ? <Loader /> : report && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Active Users"   value={report.totalUsers}   icon={Users}       color="brand" />
              <StatCard label="Total Goals"    value={report.totalGoals}   icon={Target}      color="purple" />
              <StatCard label="Avg Progress"   value={`${report.avgProgress}%`} icon={TrendingUp} color="emerald" />
              <StatCard label="Locked Goals"   value={report.goalsByStatus?.locked || 0} icon={CheckCircle} color="amber" />
            </div>

            <div className="card">
              <h3 className="font-display font-semibold text-white mb-4">Goals by Status</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {pieData.map((entry, i) => <Cell key={i} fill={COLORS[entry.name] || '#64748b'} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#161b27', border: '1px solid #1e2636', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-muted py-12">No data for this quarter.</p>}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
