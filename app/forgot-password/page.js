'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Loader2, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [devLink, setDevLink] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim().toLowerCase() }) })
      const d = await r.json()
      setSent(true)
      if (d.devLink) setDevLink(d.devLink)
      toast.success('If an account exists, a reset link has been sent.')
    } catch { toast.error('Something went wrong') } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh" />
      <Link href="/login" className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground z-10"><ArrowLeft className="w-4 h-4" /> Back to login</Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="glass-strong rounded-3xl p-8 shadow-2xl shadow-primary/10">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4"><KeyRound className="w-6 h-6 text-white" /></div>
          <h1 className="text-2xl font-extrabold">Forgot your password?</h1>
          <p className="text-sm text-muted-foreground mt-1">No worries — enter your email and we\'ll send you a reset link.</p>

          {!sent ? (
            <form onSubmit={onSubmit} className="space-y-4 mt-6">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="pl-10 h-11 bg-background/50" />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 gradient-primary text-white border-0 font-semibold">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send reset link'}
              </Button>
            </form>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm">
                ✅ If an account with <b>{email}</b> exists, a reset link has been sent. Check your inbox (and spam folder). Link is valid for 60 minutes.
              </div>
              {devLink && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                  <div className="font-bold text-amber-500 mb-2">DEV MODE — Email provider not configured</div>
                  <p className="text-muted-foreground mb-2">Since SENDGRID_API_KEY is not set, we\'re showing the reset link directly here for testing:</p>
                  <Link href={devLink.replace(/^.*\/reset-password/, '/reset-password')} className="text-primary hover:underline break-all font-mono text-[10px]">{devLink}</Link>
                </div>
              )}
              <Button asChild variant="outline" className="w-full glass"><Link href="/login">Return to login</Link></Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
