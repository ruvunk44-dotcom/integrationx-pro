'use client'
import { useState, use as useUnwrap } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, ArrowLeft, Loader2, KeyRound, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ResetPasswordPage({ params }) {
  const { token } = useUnwrap(params)
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) return toast.error('Passwords do not match')
    if (password.length < 6) return toast.error('At least 6 characters')
    setLoading(true)
    try {
      const r = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, newPassword: password }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Reset failed')
      setDone(true)
      toast.success('Password reset! Please sign in.')
      setTimeout(() => router.push('/login'), 1200)
    } catch (err) { toast.error(err.message) } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh" />
      <Link href="/login" className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground z-10"><ArrowLeft className="w-4 h-4" /> Back to login</Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="glass-strong rounded-3xl p-8 shadow-2xl shadow-primary/10">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">{done ? <CheckCircle2 className="w-6 h-6 text-white" /> : <KeyRound className="w-6 h-6 text-white" />}</div>
          <h1 className="text-2xl font-extrabold">{done ? 'Password reset!' : 'Set new password'}</h1>
          <p className="text-sm text-muted-foreground mt-1">{done ? 'Redirecting you to sign in…' : 'Choose a strong password you can remember. At least 6 characters.'}</p>

          {!done && (
            <form onSubmit={onSubmit} className="space-y-4 mt-6">
              <div className="space-y-1.5"><Label className="text-xs">New password</Label>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" className="pl-10 h-11 bg-background/50" /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Confirm password</Label>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="password" required minLength={6} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" className="pl-10 h-11 bg-background/50" /></div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 gradient-primary text-white border-0 font-semibold">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset password'}</Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
