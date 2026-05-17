import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Loader from '../../components/Loader'
import ProgressBar from '../../components/ProgressBar'
import { QUARTERS, CURRENT_QUARTER } from '../../utils/helpers'
import useGoalStore from '../../store/goalStore'
import api from '../../api/axiosInstance'
import { Save, TrendingUp } from 'lucide-react'

export default function QuarterlyUpdate() {
  const { goals, fetchMyGoals, loading } = useGoalStore()
  const [quarter, setQuarter] = useState(CURRENT_QUARTER)
  const [updates, setUpdates] = useState({}) // goalId -> { actual, status, notes, progress_score }
  const [savedUpdates, setSavedUpdates] = useState({})
  const [saving, setSaving] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchMyGoals(quarter) }, [quarter])

  useEffect(() => {
    // Load existing quarterly updates for locked/approved goals
    const activeGoals = goals.filter(g => ['locked','approved'].includes(g.status))
    activeGoals.forEach(async (g) => {
      try {
        const { data } = await api.get(`/goals/${g._id}/quarterly`)
        const upd = data.updates.find(u => u.quarter === quarter)
        if (upd) {
          setSavedUpdates(s => ({ ...s, [g._id]: upd }))
          setUpdates(u => ({ ...u, [g._id]: { actual: upd.actual, status: upd.status, notes: upd.notes || '' } }))
        }
      } catch {}
    })
  }, [goals, quarter])

  const activeGoals = goals.filter(g => ['locked','approved'].includes(g.status))

  const showToast = (msg, type='success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async (goal) => {
    const upd = updates[goal._id]
    if (!upd || upd.actual === undefined || upd.actual === '') return showToast('Enter actual value', 'error')
    setSaving(goal._id)
    try {
      const { data } = await api.post(`/goals/${goal._id}/quarterly`, {
        quarter, planned: goal.target,
        actual: Number(upd.actual),
        status: upd.status || 'on_track',
        notes: upd.notes || '',
      })
      setSavedUpdates(s => ({ ...s, [goal._id]: data.update }))
      showToast('Progress saved!')
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error')
    } finally { setSaving(null) }
  }

  const setField = (goalId, field, val) => {
    setUpdates(u => ({ ...u, [goalId]: { ...u[goalId], [field]: val } }))
  }

  return (
    <Layout title="Quarterly Updates">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border text-sm font-medium animate-slide-up shadow-xl ${toast.type==='error' ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'}`}>{toast.msg}</div>
      )}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <select className="input w-36 py-1.5" value={quarter} onChange={e => setQuarter(e.target.value)}>
            {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
          <span className="text-muted text-sm">{activeGoals.length} active goals</span>
        </div>

        {loading ? <Loader /> : activeGoals.length === 0 ? (
          <div className="card text-center py-12">
            <TrendingUp size={40} className="text-muted opacity-30 mx-auto mb-3" />
            <p className="text-slate-400 font-display font-semibold">No approved goals</p>
            <p className="text-muted text-sm mt-1">Goals must be approved & locked by your manager before you can update progress.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeGoals.map(g => {
              const upd = updates[g._id] || {}
              const saved = savedUpdates[g._id]
              return (
                <div key={g._id} className="card space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display font-semibold text-white">{g.title}</h3>
                      <p className="text-xs text-muted">{g.thrust_area} · Target: <span className="font-mono text-slate-300">{g.target}</span> · Weight: <span className="text-brand-400 font-mono">{g.weightage}%</span></p>
                    </div>
                    {saved && <ProgressBar score={saved.progress_score} height={4} showLabel />}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="label">Actual Achievement</label>
                      <input type="number" className="input" placeholder={`Target: ${g.target}`} value={upd.actual || ''} onChange={e => setField(g._id, 'actual', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Status</label>
                      <select className="input" value={upd.status || 'on_track'} onChange={e => setField(g._id, 'status', e.target.value)}>
                        <option value="not_started">Not Started</option>
                        <option value="on_track">On Track</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Notes</label>
                      <input className="input" placeholder="Optional notes..." value={upd.notes || ''} onChange={e => setField(g._id, 'notes', e.target.value)} />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button onClick={() => handleSave(g)} disabled={saving === g._id} className="btn-primary flex items-center gap-1.5">
                      <Save size={13} /> {saving === g._id ? 'Saving…' : 'Save Progress'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
