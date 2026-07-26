'use client'
import { useEffect, useState, use as useUnwrap } from 'react'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2, Shield, ArrowLeft, Calendar, User, BookOpen, Award, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export default function VerifyPage({ params }) {
  const { id } = useUnwrap(params)
  const [state, setState] = useState({ loading: true, valid: false, cert: null })

  useEffect(() => {
    fetch(`/api/verify/${id}`).then(r => r.json()).then(d => {
      setState({ loading: false, valid: d.valid, cert: d.certificate })
    }).catch(() => setState({ loading: false, valid: false, cert: null }))
  }, [id])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl animate-float" />
      <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl animate-float" style={{animationDelay:'2s'}}/>

      <Link href="/" className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground z-10">
        <ArrowLeft className="w-4 h-4" /> Back to home
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-xl">
        <div className="glass-strong rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">
          <div className="gradient-primary p-6 text-white text-center">
            <Shield className="w-10 h-10 mx-auto mb-2" />
            <div className="text-xs uppercase tracking-widest opacity-90">Certificate Verification</div>
            <div className="text-lg font-bold mt-1">IntegrationX Pro</div>
          </div>

          <div className="p-8">
            {state.loading && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-3">Verifying certificate…</p>
              </div>
            )}

            {!state.loading && !state.valid && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto">
                  <XCircle className="w-9 h-9 text-red-500" />
                </div>
                <h1 className="text-2xl font-extrabold mt-4">Certificate Not Found</h1>
                <p className="text-muted-foreground text-sm mt-2">The certificate ID <span className="font-mono">{id}</span> could not be verified. It may be invalid or has been revoked.</p>
                <Button asChild className="mt-6 gradient-primary text-white border-0"><Link href="/">Return home</Link></Button>
              </div>
            )}

            {!state.loading && state.valid && (
              <div>
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <CheckCircle2 className="w-11 h-11 text-emerald-500" />
                    </div>
                    <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-amber-400 animate-pulse" />
                  </div>
                  <h1 className="text-2xl font-extrabold mt-4">Certificate Verified</h1>
                  <p className="text-muted-foreground text-sm mt-2">Authenticated and issued by IntegrationX Pro. This is a valid learning credential.</p>
                </div>

                <div className="mt-8 space-y-4">
                  {[
                    [User, 'Awarded to', state.cert.userName],
                    [BookOpen, 'For successfully completing', state.cert.courseTitle],
                    [Award, 'Instructor', state.cert.instructor],
                    [Calendar, 'Issued', new Date(state.cert.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })],
                  ].map(([Icon, label, value]) => (
                    <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-background/40 border border-border/50">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-primary" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
                        <div className="font-semibold text-sm mt-0.5 break-words">{value}</div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-border/50 text-center">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Certificate ID</div>
                    <div className="font-mono text-sm mt-0.5">{state.cert.id}</div>
                  </div>
                </div>

                <Button asChild className="w-full mt-6 gradient-primary text-white border-0"><Link href="/courses">Browse Courses</Link></Button>
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-[11px] text-muted-foreground mt-4">Powered by IntegrationX Pro · SAP BTP & Integration Suite Experts</p>
      </motion.div>
    </div>
  )
}
