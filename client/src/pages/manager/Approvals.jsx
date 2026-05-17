import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Loader from '../../components/Loader'
import Modal from '../../components/Modal'
import Empty from '../../components/Empty'
import { QUARTERS, CURRENT_QUARTER, fmtDate } from '../../utils/helpers'
import { CheckCircle, XCircle, Edit, CheckSquare } from 'lucide-react'
import api from '../../api/axiosInstance'

export default function Approvals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [quarter, setQuarter] = useState(CURRENT_QUARTER)
  const [editModal, setEditModal] = useState(false)
  const [rejectModal, setRejectModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [editForm, setEditForm] = useState({ target: '', weightage: '', description: '' })
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(null)
  const [toast, setToast] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/manager/pending', { params: { quarter } })
      .then(r => setGoals(r.data.goals))
      .finally(() => setLoading(false))
  }
  useEffect(load, [quarter])

  const showToast = (msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const approve = async (id) => {
    setProcessing(id)
    try {
      await api.put(`/manager/approve/${id}`)
      setGoals(g => g.filter(x => x._id !== id))
      showToast('Goal approved and locked!')
    } catch (err) { showToast(err.response?.data?.message || 'Error', 'error') }
    finally { setProcessing(null) }
  }

  const openReject = (g) => { setSelected(g); setRejectReason(''); setRejectModal(true) }
  const handleReject = async () => {
    setProcessing(selected._id)
    try {
      await api.put(`/manager/reject/${selected._id}`, { reason: rejectReason })
      setGoals(g => g.filter(x => x._id !== selected._id))
      setRejectModal(false)
      showToast('Goal rejected')
    } catch (err) { showToast(err.response?.data?.message || 'Error', 'error') }
    finally { setProcessing(null) }
  }

  const openEdit = (g) => {
    setSelected(g)
    setEditForm({ target: g.target, weightage: g.weightage, description: g.description || '' })
    setEditModal(true)
  }
  const handleEdit = async () => {
    try {
      await api.put(`/manager/goals/${selected._id}`, editForm)
      load()
      setEditModal(false)
      showToast('Goal updated')
    } catch (err) { showToast(err.response?.data?.message || 'Error', 'error') }
  }

  // Group by employee
  const grouped = goals.reduce((acc, g) => {
    const emp = g.employee_id
    const key = emp._id
    if (!acc[key]) acc[key] = { emp, goals: [] }
    acc[key].goals.push(g)
    return acc
  }, {})

  return (
    <Layout title="Pending Approvals">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border text-sm font-medium animate-slide-up shadow-xl ${toast.type==='error' ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'}`}>{toast.msg}</div>
      )}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <select className="input w-36 py-1.5" value={quarter} onChange={e => setQuarter(e.target.value)}>
            {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
          <span className="text-sm text-muted">{goals.length} goals pending</span>
        </div>

        {loading ? <Loader /> : goals.length === 0 ? (
          <Empty icon={CheckSquare} title="All caught up!" sub="No goals pending approval for this quarter." />
        ) : (
          Object.values(grouped).map(({ emp, goals: empGoals }) => (
            <div key={emp._id} className="card">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                  <span className="font-display font-bold text-brand-400 text-sm">{emp.name?.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-display font-semibold text-white text-sm">{emp.name}</p>
                  <p className="text-xs text-muted">{emp.email} · {emp.department}</p>
                </div>
                <span className="ml-auto text-xs text-muted">{empGoals.length} goal{empGoals.length > 1 ? 's' : ''}</span>
              </div>

              <div className="space-y-3">
                {empGoals.map(g => (
                  <div key={g._id} className="bg-surface rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-white text-sm">{g.title}</h4>
                        {g.description && <p className="text-xs text-muted mt-0.5">{g.description}</p>}
                      </div>
                      <span className="text-brand-400 font-mono font-bold text-sm shrink-0">{g.weightage}%</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                      <div className="bg-card rounded-lg p-2 text-center">
                        <div className="text-muted mb-0.5">Target</div>
                        <div className="font-mono text-slate-300">{g.target}</div>
                      </div>
                      <div className="bg-card rounded-lg p-2 text-center">
                        <div className="text-muted mb-0.5">UoM</div>
                        <div className="text-slate-300 capitalize">{g.uom_type?.replace('_', ' ')}</div>
                      </div>
                      <div className="bg-card rounded-lg p-2 text-center">
                        <div className="text-muted mb-0.5">Deadline</div>
                        <div className="text-slate-300">{fmtDate(g.deadline)}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(g)} className="btn-secondary flex-1 flex items-center justify-center gap-1 py-1.5 text-xs">
                        <Edit size={12} /> Edit
                      </button>
                      <button onClick={() => openReject(g)} disabled={processing === g._id} className="btn-danger flex-1 flex items-center justify-center gap-1 py-1.5 text-xs">
                        <XCircle size={12} /> Reject
                      </button>
                      <button onClick={() => approve(g._id)} disabled={processing === g._id} className="btn-success flex-1 flex items-center justify-center gap-1 py-1.5 text-xs">
                        <CheckCircle size={12} /> {processing === g._id ? '…' : 'Approve'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Goal" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Target</label>
              <input type="number" className="input" value={editForm.target} onChange={e => setEditForm({...editForm, target: e.target.value})} />
            </div>
            <div>
              <label className="label">Weightage %</label>
              <input type="number" className="input" min={10} max={100} value={editForm.weightage} onChange={e => setEditForm({...editForm, weightage: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleEdit} className="btn-primary flex-1">Save Changes</button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectModal} onClose={() => setRejectModal(false)} title="Reject Goal" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted">Rejecting: <span className="text-slate-300">{selected?.title}</span></p>
          <div>
            <label className="label">Reason (optional)</label>
            <textarea className="input resize-none" rows={3} placeholder="Explain why this goal is being rejected..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setRejectModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleReject} disabled={processing} className="btn-danger flex-1">Confirm Reject</button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
