'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, Award, Heart, Download, Clock, TrendingUp, PlayCircle, ChevronRight, Trophy, Target, Flame, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { useAuth } from '@/components/auth-provider'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [enrollments, setEnrollments] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login?next=/dashboard'); return }
    Promise.all([
      fetch('/api/enrollments', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/wishlist', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/payments', { credentials: 'include' }).then(r => r.json()),
    ]).then(([e, w, p]) => {
      setEnrollments((e.enrollments || []).filter(en => en.course))
      setWishlist((w.wishlist || []).filter(x => x.course))
      setPayments(p.payments || [])
      setLoading(false)
    })
  }, [user, authLoading, router])

  const totalLessonsCompleted = enrollments.reduce((n, e) => n + (e.completedLessons?.length || 0), 0)
  const avgProgress = enrollments.length ? Math.round(enrollments.reduce((n, e) => n + (e.progress || 0), 0) / enrollments.length) : 0
  const completedCourses = enrollments.filter(e => e.progress === 100).length
  const totalSpent = payments.reduce((n, p) => n + (p.amountRupees || 0), 0)

  if (authLoading || !user) return <div className="min-h-screen bg-background" />

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="pt-28 pb-8 relative">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-primary/30 shrink-0">
                {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : <div className="w-full h-full gradient-primary flex items-center justify-center text-white text-lg font-bold">{user.name?.[0]?.toUpperCase() || 'U'}</div>}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Welcome back 👋</p>
                <h1 className="text-2xl md:text-3xl font-extrabold">{user.name || user.email}</h1>
              </div>
            </div>
            <Button asChild className="gradient-primary text-white border-0"><Link href="/courses">Explore Courses <ChevronRight className="w-4 h-4 ml-1" /></Link></Button>
          </motion.div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: BookOpen, label: 'Enrolled Courses', value: enrollments.length, color: 'from-blue-500 to-cyan-500' },
              { icon: TrendingUp, label: 'Avg Progress', value: `${avgProgress}%`, color: 'from-purple-500 to-pink-500' },
              { icon: Flame, label: 'Lessons Completed', value: totalLessonsCompleted, color: 'from-amber-500 to-orange-500' },
              { icon: Trophy, label: 'Certificates', value: completedCourses, color: 'from-emerald-500 to-teal-500' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass rounded-2xl p-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-lg`}><s.icon className="w-5 h-5 text-white" /></div>
                <div className="text-2xl font-extrabold">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-extrabold">My Courses</h2>
            <Link href="/courses" className="text-sm text-primary hover:underline">Browse more →</Link>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-56 glass rounded-2xl animate-pulse" />)}</div>
          ) : enrollments.length === 0 ? (
            <div className="glass-strong rounded-3xl p-12 text-center">
              <div className="text-5xl mb-3">🎓</div>
              <h3 className="text-xl font-bold">Start your first course</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-5">You haven't enrolled in any course yet. Explore our catalog to find your next skill.</p>
              <Button asChild className="gradient-primary text-white border-0"><Link href="/courses">Browse Courses</Link></Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrollments.map((e, i) => (
                <motion.div key={e.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Link href={`/learn/${e.courseSlug}`} className="block glass rounded-2xl overflow-hidden hover:border-primary/40 transition group">
                    <div className="relative aspect-video overflow-hidden">
                      <img src={e.course.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center justify-between text-xs text-white mb-1">
                          <span className="font-semibold">{e.progress}% complete</span>
                          <span>{e.completedLessons?.length || 0} lessons</span>
                        </div>
                        <Progress value={e.progress} className="h-1.5 bg-white/20" />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-[10px] font-bold uppercase text-primary">{e.course.categoryName}</div>
                      <h3 className="font-bold text-sm mt-1 line-clamp-2 group-hover:text-primary transition">{e.course.title}</h3>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                        <img src={e.course.instructor.avatar} className="w-6 h-6 rounded-full" alt="" />
                        <span className="text-xs text-muted-foreground flex-1">{e.course.instructor.name}</span>
                        <PlayCircle className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Heart className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold">Wishlist</h2>
              <span className="text-sm text-muted-foreground">({wishlist.length})</span>
            </div>
            {wishlist.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">Save courses you love — they'll appear here.</div>
            ) : (
              <div className="space-y-3">
                {wishlist.map(w => (
                  <Link key={w.courseSlug} href={`/courses/${w.courseSlug}`} className="flex gap-3 items-center p-2 rounded-xl hover:bg-accent/40 transition">
                    <img src={w.course.thumbnail} className="w-24 h-16 rounded-lg object-cover" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold uppercase text-primary">{w.course.categoryName}</div>
                      <h4 className="font-semibold text-sm line-clamp-1">{w.course.title}</h4>
                      <div className="text-xs text-muted-foreground">₹{w.course.price.toLocaleString('en-IN')} · {w.course.duration}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Upcoming</h2>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Live Q&A: SAP BTP', when: 'Today, 8:00 PM IST', tag: 'Live' },
                { title: 'Assignment Due: iFlow Design', when: 'Tomorrow, 11:59 PM IST', tag: 'Due' },
                { title: 'Mentor Call: Rajesh Kumar', when: 'Fri, 6:00 PM IST', tag: 'Mentor' },
              ].map((u, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className={`shrink-0 mt-1 w-2 h-2 rounded-full ${u.tag === 'Live' ? 'bg-red-500 animate-pulse' : u.tag === 'Due' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{u.title}</div>
                    <div className="text-xs text-muted-foreground">{u.when}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-primary/10 text-primary">{u.tag}</span>
                </div>
              ))}
            </div>
            {payments.length > 0 && (
              <div className="mt-6 pt-5 border-t border-border/50">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Payments</div>
                <div className="text-2xl font-extrabold gradient-text">₹{totalSpent.toLocaleString('en-IN')}</div>
                <div className="text-xs text-muted-foreground">{payments.length} transactions · GST included</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
