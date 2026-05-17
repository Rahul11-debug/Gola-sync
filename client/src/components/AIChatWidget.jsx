import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import api from '../api/axiosInstance'

export default function AIChatWidget() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your GoalFlow AI assistant. Ask me anything about your goals, performance, or pending tasks." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)
    try {
      const { data } = await api.post('/ai/chat', {
        message: userMsg.content,
        history: updated.slice(1), // skip the static welcome msg
      })
      setMessages(m => [...m, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const QUICK = ['What goals are pending?', 'Show my progress', 'What should I focus on?']

  return (
    <div className="card flex flex-col h-[520px]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
          <Bot size={16} className="text-amber-400" />
        </div>
        <div>
          <p className="font-display font-semibold text-white text-sm">AI Assistant</p>
          <p className="text-xs text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Powered by Gemini
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'assistant'
                ? 'bg-amber-500/20 border border-amber-500/30'
                : 'bg-brand-500/20 border border-brand-500/30'
            }`}>
              {msg.role === 'assistant'
                ? <Bot size={13} className="text-amber-400" />
                : <User size={13} className="text-brand-400" />}
            </div>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'assistant'
                ? 'bg-surface border border-border text-slate-200 rounded-tl-sm'
                : 'bg-brand-500 text-white rounded-tr-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Bot size={13} className="text-amber-400" />
            </div>
            <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-border space-y-2">
        <div className="flex gap-2 flex-wrap">
          {QUICK.map(q => (
            <button key={q} onClick={() => setInput(q)}
              className="text-xs px-3 py-1 rounded-full border border-border hover:border-brand-500/50 text-muted hover:text-brand-400 transition-all">
              {q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="input flex-1 text-sm"
            placeholder="Ask anything about your goals..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button onClick={send} disabled={loading || !input.trim()} className="btn-primary px-3">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
