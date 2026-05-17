import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Modal from '../../components/Modal'
import Loader from '../../components/Loader'
import Empty from '../../components/Empty'
import { Users, Plus, Edit, UserX, Search } from 'lucide-react'
import api from '../../api/axiosInstance'

const EMPTY = { name: '', email: '', password: '', role: 'employee', department: '', manager_id: '' }

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/admin/users').then(r => {
      setUsers(r.data.users)
      setManagers(r.data.users.filter(u => ['manager','admin'].includes(u.role)))
    }).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const showToast = (msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/auth/register', form)
      load()
      setModal(false)
      setForm(EMPTY)
      showToast('User created!')
    } catch (err) { showToast(err.response?.data?.message || 'Error', 'error') }
    finally { setSaving(false) }
  }

  const deactivate = async (id) => {
    if (!confirm('Deactivate this user?')) return
    try {
      await api.delete(`/admin/users/${id}`)
      load()
      showToast('User deactivated')
    } catch (err) { showToast(err.response?.data?.message || 'Error', 'error') }
  }

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  const ROLE_COLORS = { employee: 'text-brand-400 bg-brand-500/10', manager: 'text-amber-400 bg-amber-500/10', admin: 'text-purple-400 bg-purple-500/10' }

  return (
    <Layout title="User Management">
      {toast && <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border text-sm font-medium animate-slide-up shadow-xl ${toast.type==='error' ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'}`}>{toast.msg}</div>}

      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input pl-8 w-64" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={() => { setForm(EMPTY); setModal(true) }} className="btn-primary flex items-center gap-1.5">
            <Plus size={14} /> Add User
          </button>
        </div>

        {loading ? <Loader /> : filtered.length === 0 ? (
          <Empty icon={Users} title="No users found" />
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-muted uppercase tracking-wider px-5 py-3">Name</th>
                  <th className="text-left text-xs text-muted uppercase tracking-wider px-5 py-3">Email</th>
                  <th className="text-left text-xs text-muted uppercase tracking-wider px-5 py-3">Role</th>
                  <th className="text-left text-xs text-muted uppercase tracking-wider px-5 py-3">Department</th>
                  <th className="text-left text-xs text-muted uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id} className="border-b border-border/50 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-200">{u.name}</td>
                    <td className="px-5 py-3 text-muted">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3 text-muted">{u.department || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${u.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {u.isActive && (
                        <button onClick={() => deactivate(u._id)} className="text-muted hover:text-red-400 transition-colors" title="Deactivate">
                          <UserX size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Create User" size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Full Name *</label>
              <input className="input" placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" className="input" placeholder="john@company.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Password *</label>
              <input type="password" className="input" placeholder="Min 6 chars" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
            </div>
            <div>
              <label className="label">Role *</label>
              <select className="input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Department</label>
              <input className="input" placeholder="Engineering" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
            </div>
            <div>
              <label className="label">Manager</label>
              <select className="input" value={form.manager_id} onChange={e => setForm({...form, manager_id: e.target.value})}>
                <option value="">None</option>
                {managers.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Creating…' : 'Create User'}</button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
