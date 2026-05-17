import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Loader from '../../components/Loader'
import { fmtDate } from '../../utils/helpers'
import { Lock, RefreshCw } from 'lucide-react'
import api from '../../api/axiosInstance'

const ACTION_COLORS = {
  GOAL_APPROVED: 'text-emerald-400',
  GOAL_REJECTED: 'text-red-400',
  GOAL_LOCKED:   'text-purple-400',
  GOAL_UNLOCKED: 'text-amber-400',
  GOALS_SUBMITTED: 'text-blue-400',
  USER_CREATED:  'text-brand-400',
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [skip, setSkip] = useState(0)
  const LIMIT = 30

  const load = (s = 0) => {
    setLoading(true)
    api.get('/admin/audit-logs', { params: { limit: LIMIT, skip: s } })
      .then(r => { setLogs(r.data.logs); setTotal(r.data.total) })
      .finally(() => setLoading(false))
  }
  useEffect(() => load(skip), [skip])

  return (
    <Layout title="Audit Logs">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">{total} total events</span>
          <button onClick={() => load(skip)} className="btn-secondary flex items-center gap-1.5">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {loading ? <Loader /> : (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-muted uppercase tracking-wider px-5 py-3">Timestamp</th>
                  <th className="text-left text-muted uppercase tracking-wider px-5 py-3">User</th>
                  <th className="text-left text-muted uppercase tracking-wider px-5 py-3">Action</th>
                  <th className="text-left text-muted uppercase tracking-wider px-5 py-3">Entity</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id} className="border-b border-border/40 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-2.5 text-muted font-mono">{new Date(log.timestamp).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-2.5 text-slate-300">{log.user_id?.name || '—'}</td>
                    <td className="px-5 py-2.5">
                      <span className={`font-mono font-medium ${ACTION_COLORS[log.action] || 'text-slate-400'}`}>{log.action}</span>
                    </td>
                    <td className="px-5 py-2.5 text-muted">{log.entity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-center gap-2">
          <button onClick={() => setSkip(Math.max(0, skip - LIMIT))} disabled={skip === 0} className="btn-secondary">← Prev</button>
          <span className="text-sm text-muted flex items-center">{skip + 1}–{Math.min(skip + LIMIT, total)} of {total}</span>
          <button onClick={() => setSkip(skip + LIMIT)} disabled={skip + LIMIT >= total} className="btn-secondary">Next →</button>
        </div>
      </div>
    </Layout>
  )
}
