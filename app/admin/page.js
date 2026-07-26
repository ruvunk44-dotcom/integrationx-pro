'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, Users, CreditCard, BookOpen, TrendingUp, IndianRupee, Award, ShieldAlert, LogOut } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { useAuth } from '@/components/auth-provider'

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login?next=/admin'); return }
    fetch('/api/admin/stats', { credentials: 'include' }).then(r => r.json().then(d => ({ ok: r.ok, d }))).then(({ ok, d }) => {
      if (!ok) { setError(d.error || 'Access denied'); setLoading(false); return }
      setData(d); setLoading(false)
    }).catch(e => { setError('Failed to load'); setLoading(false) })
  }, [user, authLoading, router])

  if (authLoading || (loading && !error)) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading admin console...</div>

  if (error) return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="pt-32 max-w-md mx-auto px-4 text-center">
        <div className="glass-strong rounded-2xl p-8">
          <ShieldAlert className="w-14 h-14 text-red-500 mx-auto mb-3" />
          <h1 className="text-2xl font-extrabold">Access Denied</h1>
          <p className="text-sm text-muted-foreground mt-2">{error}. Only administrators can view this page.</p>
          <Button asChild className="mt-6 gradient-primary text-white border-0"><Link href="/dashboard">Go to Dashboard</Link></Button>
        </div>
      </div>
    </div>
  )

  const { stats, users = [], payments = [], enrollments = [], certificates = [], courses = [] } = data

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="pt-28 pb-16 max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div>
            <div className="inline-flex items-center gap-2 glass px-3 py-1 rounded-full text-[11px] font-bold text-primary mb-2 uppercase tracking-widest">
              <ShieldAlert className="w-3 h-3" /> Admin Console
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold">Platform <span className="gradient-text">Overview</span></h1>
            <p className="text-muted-foreground mt-1">Signed in as {user.name} · {user.email}</p>
          </div>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: IndianRupee, label: 'Total Revenue', value: `₹${(stats.revenue || 0).toLocaleString('en-IN')}`, sub: 'GST included', color: 'from-emerald-500 to-teal-500' },
            { icon: Users, label: 'Users', value: stats.users.toLocaleString('en-IN'), sub: `${stats.newUsers7d} in last 7 days`, color: 'from-blue-500 to-cyan-500' },
            { icon: CreditCard, label: 'Payments', value: stats.payments.toLocaleString('en-IN'), sub: 'successful captures', color: 'from-purple-500 to-pink-500' },
            { icon: BookOpen, label: 'Enrollments', value: stats.enrollments.toLocaleString('en-IN'), sub: `${stats.completions} completed`, color: 'from-amber-500 to-orange-500' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-lg`}><s.icon className="w-5 h-5 text-white" /></div>
              <div className="text-2xl font-extrabold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              <div className="text-[10px] text-primary/80 mt-1 font-medium">{s.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="glass rounded-2xl p-2">
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-4">
              <TabsTrigger value="users"><Users className="w-4 h-4 mr-1" /> Users</TabsTrigger>
              <TabsTrigger value="payments"><CreditCard className="w-4 h-4 mr-1" /> Payments</TabsTrigger>
              <TabsTrigger value="enrollments"><BookOpen className="w-4 h-4 mr-1" /> Enrollments</TabsTrigger>
              <TabsTrigger value="certificates"><Award className="w-4 h-4 mr-1" /> Certificates</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="p-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/50">
                    <tr><th className="p-3 font-semibold">User</th><th className="p-3 font-semibold">Email</th><th className="p-3 font-semibold">Provider</th><th className="p-3 font-semibold">Role</th><th className="p-3 font-semibold">Joined</th></tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-border/30 hover:bg-accent/20">
                        <td className="p-3 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                            {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full gradient-primary text-white flex items-center justify-center text-xs font-bold">{u.name?.[0]?.toUpperCase() || 'U'}</div>}
                          </div>
                          <span className="font-medium">{u.name || '—'}</span>
                        </td>
                        <td className="p-3 text-muted-foreground">{u.email}</td>
                        <td className="p-3"><span className="text-xs px-2 py-0.5 rounded bg-accent/50">{u.provider}</span></td>
                        <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded ${u.role === 'admin' ? 'bg-red-500/15 text-red-500' : 'bg-primary/10 text-primary'}`}>{u.role}</span></td>
                        <td className="p-3 text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="payments" className="p-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/50">
                    <tr><th className="p-3 font-semibold">Date</th><th className="p-3 font-semibold">Payment ID</th><th className="p-3 font-semibold">Course</th><th className="p-3 font-semibold">User</th><th className="p-3 font-semibold text-right">Amount</th></tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.razorpayPaymentId} className="border-b border-border/30 hover:bg-accent/20">
                        <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(p.verifiedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="p-3 font-mono text-xs">{p.razorpayPaymentId?.slice(0, 22)}</td>
                        <td className="p-3 max-w-xs truncate">{p.courseTitle}</td>
                        <td className="p-3 text-xs text-muted-foreground">{p.userId?.slice(0, 12)}</td>
                        <td className="p-3 text-right font-bold">₹{(p.amountRupees || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                    {payments.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-muted-foreground text-sm">No payments yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="enrollments" className="p-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/50">
                    <tr><th className="p-3 font-semibold">Course Slug</th><th className="p-3 font-semibold">User</th><th className="p-3 font-semibold">Progress</th><th className="p-3 font-semibold">Enrolled</th></tr>
                  </thead>
                  <tbody>
                    {enrollments.map(e => (
                      <tr key={e.id} className="border-b border-border/30 hover:bg-accent/20">
                        <td className="p-3">{e.courseSlug}</td>
                        <td className="p-3 text-xs text-muted-foreground">{e.userId?.slice(0, 12)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-accent rounded-full max-w-[100px]"><div className="h-full gradient-primary rounded-full" style={{width:`${e.progress||0}%`}} /></div>
                            <span className="text-xs font-semibold">{e.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{new Date(e.enrolledAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      </tr>
                    ))}
                    {enrollments.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-muted-foreground text-sm">No enrollments yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="certificates" className="p-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/50">
                    <tr><th className="p-3 font-semibold">Cert ID</th><th className="p-3 font-semibold">Awarded To</th><th className="p-3 font-semibold">Course</th><th className="p-3 font-semibold">Issued</th></tr>
                  </thead>
                  <tbody>
                    {certificates.map(c => (
                      <tr key={c.id} className="border-b border-border/30 hover:bg-accent/20">
                        <td className="p-3 font-mono text-xs text-primary">{c.id}</td>
                        <td className="p-3">{c.userName}</td>
                        <td className="p-3 max-w-xs truncate">{c.courseTitle}</td>
                        <td className="p-3 text-xs text-muted-foreground">{new Date(c.issuedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      </tr>
                    ))}
                    {certificates.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-muted-foreground text-sm">No certificates issued yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
