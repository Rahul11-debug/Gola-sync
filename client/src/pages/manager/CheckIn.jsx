import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Loader from '../../components/Loader'
import { QUARTERS, CURRENT_QUARTER } from '../../utils/helpers'
import { MessageSquare, Send } from 'lucide-react'
import api from '../../api/axiosInstance'

export default function CheckIn() {
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [quarter, setQuarter] = useState(CURRENT_QUARTER)
  const [form, setForm] = useState({ employee_id: '', comment: '', rating: 4 })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    api.get('/manager/team', { params: { quarter } }).then(r => setTeam(r.data.team)).finally(() => setLoading(false))
  }, [quarter])

  const showToast = (msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.employee_id || !form.comment.trim()) return showToast('Select employee and add comment', 'error')
    setSaving(true)
    try {
      await api.post('/manager/checkin', { ...form, quarter })
      setForm({ employee_id: '', comment: '', rating: 4 })
      showToast('Check-in feedback saved!')
    } catch (err) { showToast(err.response?.data?.message || 'Error', 'error') }
    finally { setSaving(false) }
  }

  return (
    <Layout title="Quarterly Check-ins">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border text-sm font-medium animate-slide-up shadow-xl ${toast.type==='error' ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'}`}>{toast.msg}</div>
      )}
      <div className="max-w-xl space-y-6">
        <select className="input w-36 py-1.5" value={quarter} onChange={e => setQuarter(e.target.value)}>
          {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
        </select>

        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <MessageSquare size={18} className="text-brand-400" />
            <h3 className="font-display font-semibold text-white">Add Feedback</h3>
          </div>
          {loading ? <Loader /> : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Employee</label>
                <select className="input" value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})} required>
                  <option value="">Select team member...</option>
                  {team.map(m => <option key={m.employee._id} value={m.employee._id}>{m.employee.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Rating (1–5)</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button type="button" key={n} onClick={() => setForm({...form, rating: n})}
                      className={`w-10 h-10 rounded-xl border font-display font-bold text-sm transition-all ${form.rating >= n ? 'bg-brand-500 border-brand-500 text-white' : 'border-border text-muted hover:border-brand-500/50'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Comment *</label>
                <textarea className="input resize-none" rows={4} placeholder="Share feedback on this employee's performance and progress this quarter..." value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} required />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
                <Send size={14} /> {saving ? 'Saving…' : 'Save Check-in'}
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  )
}
