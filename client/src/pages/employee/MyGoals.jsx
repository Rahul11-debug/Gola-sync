import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import GoalCard from '../../components/GoalCard'
import WeightMeter from '../../components/WeightMeter'
import Modal from '../../components/Modal'
import Loader from '../../components/Loader'
import Empty from '../../components/Empty'
import { QUARTERS, CURRENT_QUARTER, THRUST_AREAS, UOM_TYPES } from '../../utils/helpers'
import useGoalStore from '../../store/goalStore'
import { Plus, Send, Zap } from 'lucide-react'
import api from '../../api/axiosInstance'

const EMPTY_FORM = { title: '', description: '', thrust_area: '', uom_type: 'numeric', target: '', weightage: '', quarter: CURRENT_QUARTER, deadline: '' }

export default function MyGoals() {
  const { goals, fetchMyGoals, createGoal, updateGoal, deleteGoal, submitGoals, loading } = useGoalStore()
  const [quarter, setQuarter] = useState(CURRENT_QUARTER)
  const [modal, setModal] = useState(false)
  const [editGoal, setEditGoal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [vague, setVague] = useState('')
  const [aiModal, setAiModal] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchMyGoals(quarter) }, [quarter])

  const drafts = goals.filter(g => g.status === 'draft')
  const others = goals.filter(g => g.status !== 'draft')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openCreate = () => { setEditGoal(null); setForm({ ...EMPTY_FORM, quarter }); setModal(true) }
  const openEdit   = (g) => { setEditGoal(g); setForm({ title: g.title, description: g.description || '', thrust_area: g.thrust_area || '', uom_type: g.uom_type, target: g.target, weightage: g.weightage, quarter: g.quarter, deadline: g.deadline ? g.deadline.slice(0,10) : '' }); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editGoal) await updateGoal(editGoal._id, form)
      else await createGoal({ ...form, target: Number(form.target), weightage: Number(form.weightage) })
      setModal(false)
      showToast(editGoal ? 'Goal updated!' : 'Goal created!')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving goal', 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return
    await deleteGoal(id)
    showToast('Goal deleted')
  }

  const handleSubmit = async () => {
    if (!confirm(`Submit all ${drafts.length} draft goals for ${quarter}?`)) return
    setSubmitting(true)
    try {
      await submitGoals(quarter)
      showToast('Goals submitted for manager approval!')
    } catch (err) {
      showToast(err.response?.data?.message || 'Submission failed', 'error')
    } finally { setSubmitting(false) }
  }

  const handleAI = async () => {
    if (!vague.trim()) return
    setAiLoading(true)
    try {
      const { data } = await api.post('/ai/smart-goal', { vague_goal: vague })
      const s = data.suggestion
      setForm(f => ({
        ...f, title: s.title, description: s.description,
        target: s.target, uom_type: s.uom_type,
        thrust_area: s.thrust_area,
        deadline: s.deadline_suggestion || '',
      }))
      setAiModal(false)
      setModal(true)
      showToast('AI generated a SMART goal!')
    } catch { showToast('AI unavailable', 'error') }
    finally { setAiLoading(false) }
  }

  const totalDraftWeight = drafts.reduce((s, g) => s + g.weightage, 0)
  const canSubmit = drafts.length > 0 && drafts.length <= 8 && totalDraftWeight === 100

  return (
    <Layout title="My Goals">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border text-sm font-medium animate-slide-up shadow-xl ${toast.type === 'error' ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'}`}>
          {toast.msg}
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <select className="input w-36 py-1.5" value={quarter} onChange={e => setQuarter(e.target.value)}>
              {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAiModal(true)} className="btn-secondary flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" /> AI Generate
            </button>
            <button onClick={openCreate} className="btn-primary flex items-center gap-1.5">
              <Plus size={14} /> Add Goal
            </button>
          </div>
        </div>

        {/* Weight meter */}
        {drafts.length > 0 && <WeightMeter goals={drafts} />}

        {/* Submit bar */}
        {drafts.length > 0 && (
          <div className="card flex items-center justify-between gap-4">
            <div className="text-sm">
              <span className="text-slate-300 font-medium">{drafts.length} draft goals</span>
              <span className="text-muted"> · Total weight: </span>
              <span className={`font-mono font-bold ${totalDraftWeight === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>{totalDraftWeight}%</span>
            </div>
            <button onClick={handleSubmit} disabled={!canSubmit || submitting} className={`btn-primary flex items-center gap-1.5 ${!canSubmit ? 'opacity-40 cursor-not-allowed' : ''}`}>
              <Send size={14} /> {submitting ? 'Submitting…' : 'Submit for Approval'}
            </button>
          </div>
        )}

        {loading ? <Loader /> : (
          <>
            {drafts.length > 0 && (
              <div>
                <h3 className="text-xs text-muted uppercase tracking-wider mb-3">Drafts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {drafts.map(g => <GoalCard key={g._id} goal={g} onEdit={openEdit} onDelete={handleDelete} />)}
                </div>
              </div>
            )}
            {others.length > 0 && (
              <div>
                <h3 className="text-xs text-muted uppercase tracking-wider mb-3">Submitted / Active</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {others.map(g => <GoalCard key={g._id} goal={g} showActions={false} />)}
                </div>
              </div>
            )}
            {goals.length === 0 && (
              <Empty icon={Plus} title="No goals yet" sub="Start by creating your first goal for this quarter." action={<button onClick={openCreate} className="btn-primary">Create Goal</button>} />
            )}
          </>
        )}
      </div>

      {/* Goal Form Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editGoal ? 'Edit Goal' : 'Create Goal'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Goal Title *</label>
            <input className="input" placeholder="e.g. Complete 250 DSA problems" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required disabled={editGoal?.is_read_only_title} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} placeholder="Brief description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Thrust Area</label>
              <select className="input" value={form.thrust_area} onChange={e => setForm({...form, thrust_area: e.target.value})}>
                <option value="">Select…</option>
                {THRUST_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Unit of Measurement *</label>
              <select className="input" value={form.uom_type} onChange={e => setForm({...form, uom_type: e.target.value})} required>
                {UOM_TYPES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Target *</label>
              <input type="number" className="input" placeholder="e.g. 250" value={form.target} onChange={e => setForm({...form, target: e.target.value})} required disabled={editGoal?.is_read_only_target} />
            </div>
            <div>
              <label className="label">Weightage % (min 10) *</label>
              <input type="number" className="input" placeholder="e.g. 20" min={10} max={100} value={form.weightage} onChange={e => setForm({...form, weightage: e.target.value})} required />
            </div>
          </div>
          <div>
            <label className="label">Deadline</label>
            <input type="date" className="input" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : editGoal ? 'Update Goal' : 'Create Goal'}</button>
          </div>
        </form>
      </Modal>

      {/* AI Modal */}
      <Modal open={aiModal} onClose={() => setAiModal(false)} title="AI SMART Goal Generator" size="sm">
        <div className="space-y-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-xs text-amber-300">Describe your goal in simple words. AI will convert it to a SMART goal.</p>
          </div>
          <div>
            <label className="label">Your vague goal</label>
            <textarea className="input resize-none" rows={3} placeholder="e.g. Get better at coding, improve sales numbers, reduce bugs..." value={vague} onChange={e => setVague(e.target.value)} />
          </div>
          <button onClick={handleAI} disabled={aiLoading || !vague.trim()} className="btn-primary w-full flex items-center justify-center gap-2">
            <Zap size={14} />
            {aiLoading ? 'Generating…' : 'Generate SMART Goal'}
          </button>
        </div>
      </Modal>
    </Layout>
  )
}
