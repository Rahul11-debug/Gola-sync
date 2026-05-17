import { useState } from 'react'
import { Zap, X, ArrowRight } from 'lucide-react'
import api from '../api/axiosInstance'

export default function SMARTGoalGenerator({ onApply }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const generate = async () => {
    if (!input.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const { data } = await api.post('/ai/smart-goal', { vague_goal: input })
      setResult(data.suggestion)
    } catch (err) {
      setError(err.response?.data?.message || 'AI generation failed. Check your API key.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card border-amber-500/20 bg-amber-500/5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
          <Zap size={14} className="text-amber-400" />
        </div>
        <h3 className="font-display font-semibold text-white text-sm">AI SMART Goal Generator</h3>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          className="input flex-1 text-sm"
          placeholder='Describe vaguely, e.g. "improve coding skills"'
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && generate()}
        />
        <button
          onClick={generate}
          disabled={loading || !input.trim()}
          className="btn-primary px-4 flex items-center gap-2"
        >
          {loading
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <ArrowRight size={15} />}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 mb-3">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-surface rounded-xl p-4 border border-border animate-slide-up">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs text-amber-400 font-medium uppercase tracking-wider">AI Suggestion</p>
            <button onClick={() => setResult(null)} className="text-muted hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="label">Title</p>
              <p className="text-sm text-white font-display font-semibold">{result.title}</p>
            </div>
            <div>
              <p className="label">Description</p>
              <p className="text-xs text-slate-400 leading-relaxed">{result.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card rounded-lg p-2">
                <p className="label text-[10px]">Target</p>
                <p className="text-sm font-mono text-white">{result.target}</p>
              </div>
              <div className="bg-card rounded-lg p-2">
                <p className="label text-[10px]">UoM Type</p>
                <p className="text-sm font-mono text-white capitalize">{result.uom_type?.replace('_',' ')}</p>
              </div>
              <div className="bg-card rounded-lg p-2">
                <p className="label text-[10px]">Deadline</p>
                <p className="text-sm font-mono text-white">{result.deadline_suggestion || '—'}</p>
              </div>
              <div className="bg-card rounded-lg p-2">
                <p className="label text-[10px]">Thrust Area</p>
                <p className="text-sm font-mono text-white">{result.thrust_area || '—'}</p>
              </div>
            </div>
          </div>
          {onApply && (
            <button
              onClick={() => { onApply(result); setResult(null); setInput('') }}
              className="btn-primary mt-4 w-full text-xs"
            >
              Apply to Goal Form
            </button>
          )}
        </div>
      )}
    </div>
  )
}
