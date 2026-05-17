import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Modal from '../../components/Modal'
import Loader from '../../components/Loader'
import { QUARTERS, CURRENT_QUARTER, THRUST_AREAS, UOM_TYPES } from '../../utils/helpers'
import { Share2, Plus } from 'lucide-react'
import api from '../../api/axiosInstance'

export default function SharedGoals() {
  const [goals, setGoals] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', thrust_area: '', uom_type: 'numeric', target: '', quarter: CURRENT_QUARTER, employee_ids: [] })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const load = () => {
    setLoading(true)
    Promise.all([api.get('/admin/shared-goals'), api.get('/admin/users?role=employee')])
      .then(([g, u]) => { setGoals(g.data.goals); setEmployees(u.data.users) })
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const showToast = (msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const toggleEmp = (id) => {
    setForm(f => ({ ...f, employee_ids: f.employee_ids.includes(id) ? f.employee_ids.filter(e => e !== id) : [...f.employee_ids, id] }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (form.employee_ids.length === 0) return showToast('Select at least one employee', 'error')
    setSaving(true)
    try {
      await api.post('/admin/shared-goals', { ...form, target: Number(form.target) })
      load()
      setModal(false)
      showToast('Shared goal created and pushed to employees!')
    } catch (err) { showToast(err.response?.data?.message || 'Error', 'error') }
    finally { setSaving(false) }
  }

  return (
    <Layout title="Shared Goals">
      {toast && <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border text-sm font-medium animate-slide-up shadow-xl ${toast.type==='error' ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'}`}>{toast.msg}</div>}

      <div className="space-y-5">
        <div className="flex justify-end">
          <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-1.5">
            <Plus size={14} /> Create Shared Goal
          </button>
        </div>

        {loading ? <Loader /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map(g => (
              <div key={g._id} className="card">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0">
                    <Share2 size={14} className="text-brand-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-white text-sm">{g.title}</h3>
                    <p className="text-xs text-muted">{g.quarter} · Target: {g.target}</p>
                  </div>
                </div>
                <div className="text-xs text-muted">
                  Pushed to: <span className="text-slate-300">{g.linked_employee_ids?.map(e => e.name).join(', ') || '—'}</span>
                </div>
              </div>
            ))}
            {goals.length === 0 && <p className="text-center text-muted col-span-2 py-10">No shared goals yet.</p>}
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Create Shared Goal" size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Goal Title *</label>
            <input className="input" placeholder="e.g. Team Revenue Target — Q1" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Thrust Area</label>
              <select className="input" value={form.thrust_area} onChange={e => setForm({...form, thrust_area: e.target.value})}>
                <option value="">Select…</option>
                {THRUST_AREAS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="label">UoM Type *</label>
              <select className="input" value={form.uom_type} onChange={e => setForm({...form, uom_type: e.target.value})}>
                {UOM_TYPES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Target *</label>
              <input type="number" className="input" value={form.target} onChange={e => setForm({...form, target: e.target.value})} required />
            </div>
          </div>
          <div>
            <label className="label">Quarter *</label>
            <select className="input w-40" value={form.quarter} onChange={e => setForm({...form, quarter: e.target.value})}>
              {QUARTERS.map(q => <option key={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Push to Employees ({form.employee_ids.length} selected)</label>
            <div className="max-h-40 overflow-y-auto space-y-1.5 mt-1">
              {employees.map(emp => (
                <label key={emp._id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface cursor-pointer">
                  <input type="checkbox" checked={form.employee_ids.includes(emp._id)} onChange={() => toggleEmp(emp._id)} className="accent-brand-500" />
                  <span className="text-sm text-slate-300">{emp.name}</span>
                  <span className="text-xs text-muted">{emp.department}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Creating…' : 'Create & Push'}</button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
