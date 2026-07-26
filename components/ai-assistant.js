'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, X, Bot, User, Loader2, Brain, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from '@/components/auth-provider'

const SUGGESTIONS = [
  'Explain SAP CPI iFlow lifecycle in simple Hindi',
  'What is CDS View in ABAP on HANA?',
  'AWS EC2 vs Lambda - kya difference hai?',
  'Give me a 30-day SAP BTP learning roadmap',
]

export default function AiAssistant() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [model, setModel] = useState('gpt-mini')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (open && !sessionId) {
      let sid = localStorage.getItem('ixp_ai_session')
      if (!sid) { sid = 'ai_' + uuidv4(); localStorage.setItem('ixp_ai_session', sid) }
      setSessionId(sid)
    }
  }, [open, sessionId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const t = (text ?? input).trim()
    if (!t || loading) return
    setInput('')
    const newMessages = [...messages, { role: 'user', content: t }]
    setMessages(newMessages)
    setLoading(true)
    try {
      const r = await fetch('/api/ai/chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: t, model, history: newMessages.slice(0, -1) }),
      })
      const d = await r.json()
      if (!r.ok) { toast.error(d.error || 'AI is temporarily unavailable'); setMessages(newMessages); return }
      setMessages([...newMessages, { role: 'assistant', content: d.reply, model: d.model }])
    } catch { toast.error('Network error') } finally { setLoading(false) }
  }

  const reset = () => {
    const sid = 'ai_' + uuidv4()
    localStorage.setItem('ixp_ai_session', sid)
    setSessionId(sid); setMessages([])
    toast.success('New conversation started')
  }

  return (
    <>
      {/* Floating action button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full gradient-primary shadow-2xl shadow-primary/40 flex items-center justify-center group pulse-glow"
            aria-label="Open AI Tutor"
          >
            <Brain className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-white" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            className="fixed bottom-5 right-5 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[640px] max-h-[calc(100vh-2rem)] glass-strong rounded-2xl shadow-2xl shadow-primary/20 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="gradient-primary p-4 text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center"><Brain className="w-5 h-5" /></div>
              <div className="flex-1">
                <div className="font-bold text-sm">IntegrationX AI Tutor</div>
                <div className="text-[10px] opacity-90 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> Online · English + Hindi</div>
              </div>
              <button onClick={reset} className="text-white/80 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10" title="New chat">Reset</button>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>

            {/* Model selector */}
            <div className="px-3 py-2 border-b border-border/50 flex items-center gap-2">
              <span className="text-[10px] uppercase text-muted-foreground font-semibold">Model</span>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="h-7 text-xs w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-mini">GPT-4o mini (fast)</SelectItem>
                  <SelectItem value="gpt">GPT-4o (smart)</SelectItem>
                  <SelectItem value="claude">Claude Sonnet 4</SelectItem>
                  <SelectItem value="gemini">Gemini 2.5 Flash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary mb-3"><Sparkles className="w-7 h-7 text-white" /></div>
                  <h3 className="font-bold text-base">Namaste{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">Ask me anything about SAP BTP, CPI, ABAP, Fiori,<br />AWS, DevOps or careers in IT.</p>
                  <div className="space-y-2">
                    {SUGGESTIONS.map(s => (
                      <button key={s} onClick={() => send(s)} className="w-full text-left text-xs p-2.5 rounded-lg glass hover:border-primary/40 hover:bg-accent/40 transition">
                        <MessageCircle className="w-3 h-3 inline text-primary mr-1.5" /> {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
                  {m.role === 'assistant' && (
                    <div className="shrink-0 w-7 h-7 rounded-lg gradient-primary flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.role === 'user' ? 'gradient-primary text-white rounded-br-sm' : 'glass rounded-bl-sm'}`}>
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>
                  {m.role === 'user' && (
                    <div className="shrink-0 w-7 h-7 rounded-lg bg-accent flex items-center justify-center"><User className="w-4 h-4" /></div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-2">
                  <div className="shrink-0 w-7 h-7 rounded-lg gradient-primary flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
                  <div className="glass rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/50">
              <form onSubmit={e => { e.preventDefault(); send() }} className="flex items-end gap-2">
                <Textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                  placeholder="Ask in English or Hindi..."
                  rows={1}
                  className="resize-none bg-background/50 text-sm min-h-[42px] max-h-32"
                />
                <Button type="submit" disabled={loading || !input.trim()} className="gradient-primary text-white border-0 h-[42px] px-3">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <p className="text-[10px] text-muted-foreground mt-1.5 text-center">AI can make mistakes. Verify critical SAP configs in official docs.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
