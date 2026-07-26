'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, Loader2, GraduationCap, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'

function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back 👋')
      router.push(next)
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const google = () => { window.location.href = `/api/auth/google?next=${encodeURIComponent(next)}` }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute top-32 -right-40 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl animate-float" />
      <div className="absolute bottom-32 -left-40 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl animate-float" style={{animationDelay:'2s'}}/>

      <Link href="/" className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground z-10">
        <ArrowLeft className="w-4 h-4" /> Back to home
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="glass-strong rounded-3xl p-8 shadow-2xl shadow-primary/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <GraduationCap className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-bold text-lg">Integration<span className="gradient-text">X</span> Pro</div>
              <div className="text-xs text-muted-foreground">Welcome back</div>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold mb-1">Sign in to your account</h1>
          <p className="text-sm text-muted-foreground mb-6">Continue where you left off</p>

          <button type="button" onClick={google} className="w-full h-11 rounded-lg glass hover:bg-accent/50 flex items-center justify-center gap-3 font-medium text-sm transition mb-4">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/><path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/><path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="pl-10 h-11 bg-background/50" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <button type="button" className="text-[11px] text-primary hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-10 h-11 bg-background/50" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 gradient-primary text-white border-0 font-semibold shadow-lg shadow-primary/30">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <LogIn className="w-4 h-4 ml-2" /></>}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            New here? <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-primary font-semibold hover:underline">Create an account</Link>
          </p>
        </div>
        <p className="text-center text-[11px] text-muted-foreground mt-4">Trusted by 84,000+ Indian SAP & IT professionals</p>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense fallback={<div className="min-h-screen bg-background" />}><LoginForm /></Suspense>
}
