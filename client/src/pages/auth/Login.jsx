import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { Target, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const { login, loading, error } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const user = await login(form.email, form.password)
      if (user.role === 'employee') navigate('/employee/dashboard')
      else if (user.role === 'manager') navigate('/manager/dashboard')
      else navigate('/admin/dashboard')
    } catch {}
  }

  const fillDemo = (role) => {
    const creds = {
      employee: { email: 'emp1@demo.com',    password: 'Demo@1234' },
      manager:  { email: 'manager@demo.com', password: 'Demo@1234' },
      admin:    { email: 'admin@demo.com',   password: 'Demo@1234' },
    }
    setForm(creds[role])
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/30 items-center justify-center mb-4">
            <Target size={28} className="text-brand-400" />
          </div>
          <h1 className="font-display font-bold text-white text-2xl">GoalFlow</h1>
          <p className="text-muted text-sm mt-1">Performance Portal</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="font-display font-semibold text-white mb-5">Sign in to your account</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-5 pt-5 border-t border-border">
            <p className="text-xs text-muted mb-3 text-center">Quick demo access</p>
            <div className="grid grid-cols-3 gap-2">
              {['employee','manager','admin'].map(role => (
                <button key={role} onClick={() => fillDemo(role)}
                  className="text-xs py-2 px-2 rounded-lg border border-border hover:border-brand-500/50 text-muted hover:text-brand-400 transition-all capitalize">
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
