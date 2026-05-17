import { useState, useRef, useEffect } from 'react'
import Layout from '../../components/Layout'
import api from '../../api/axiosInstance'
import { Send, Zap, Bot, User } from 'lucide-react'

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your GoalFlow AI assistant. Ask me about your goals, progress, or anything related to performance tracking.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    try {
      const history = newMessages.filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0)
      const { data } = await api.post('/ai/chat', { message: userMsg.content, history: newMessages.slice(1) })
      setMessages(m => [...m, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally { setLoading(false) }
  }

  const QUICK = ['What are my current goals?', 'Which goals need attention?', 'How is my progress this quarter?', 'What should I focus on next?']

  return (
    <Layout title="AI Assistant">
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
        <div className="card mb-4 flex items-center gap-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Zap size={18} className="text-amber-400" />
          </div>
          <div>
            <p className="font-display font-semibold text-white text-sm">Powered by Gemini AI</p>
            <p className="text-xs text-muted">Context-aware answers about your goals and performance</p>
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-brand-500/20 border border-brand-500/30' : 'bg-amber-500/20 border border-amber-500/30'}`}>
                {m.role === 'user' ? <User size={13} className="text-brand-400" /> : <Bot size={13} className="text-amber-400" />}
              </div>
              <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-brand-500 text-white rounded-tr-sm' : 'bg-card border border-border text-slate-200 rounded-tl-sm'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <Bot size={13} className="text-amber-400" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {QUICK.map(q => (
            <button key={q} onClick={() => { setInput(q) }} className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-brand-500/50 text-muted hover:text-brand-400 transition-all">
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Ask about your goals..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button onClick={send} disabled={!input.trim() || loading} className="btn-primary px-3 aspect-square flex items-center justify-center">
            <Send size={15} />
          </button>
        </div>
      </div>
    </Layout>
  )
}
