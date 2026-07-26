'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, BookOpen, Users, TrendingUp, IndianRupee, Award, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { useAuth } from '@/components/auth-provider'

export default function InstructorPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login?next=/instructor'); return }
    fetch('/api/instructor/courses', { credentials: 'include' }).then(r => r.json()).then(d => { setCourses(d.courses || []); setLoading(false) })
  }, [user, authLoading, router])

  if (authLoading || !user) return <div className="min-h-screen bg-background" />

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="pt-28 pb-16 max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div>
            <div className="inline-flex items-center gap-2 glass px-3 py-1 rounded-full text-[11px] font-bold text-primary mb-2 uppercase tracking-widest"><Video className="w-3 h-3" /> Instructor Studio</div>
            <h1 className="text-3xl md:text-4xl font-extrabold">Your <span className="gradient-text">Courses</span></h1>
            <p className="text-muted-foreground mt-1">Publish new content, track engagement, and grow your teaching business.</p>
          </div>
          <Button asChild className="gradient-primary text-white border-0 h-11 px-5 font-semibold"><Link href="/instructor/courses/new"><Plus className="w-4 h-4 mr-2" /> Create New Course</Link></Button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: BookOpen, label: 'Courses', value: courses.length, color: 'from-blue-500 to-cyan-500' },
            { icon: Users, label: 'Total Students', value: courses.reduce((n, c) => n + (c.students || 0), 0), color: 'from-purple-500 to-pink-500' },
            { icon: TrendingUp, label: 'Avg Rating', value: courses.length ? (courses.reduce((n, c) => n + (c.rating || 0), 0) / courses.length).toFixed(1) : '—', color: 'from-emerald-500 to-teal-500' },
            { icon: IndianRupee, label: 'Est. Revenue', value: '₹' + courses.reduce((n, c) => n + (c.students || 0) * (c.price || 0), 0).toLocaleString('en-IN'), color: 'from-amber-500 to-orange-500' },
          ].map((s, i) => (
            <div key={s.label} className="glass rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-lg`}><s.icon className="w-5 h-5 text-white" /></div>
              <div className="text-2xl font-extrabold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="h-40 glass rounded-2xl animate-pulse" />
        ) : courses.length === 0 ? (
          <div className="glass-strong rounded-3xl p-12 text-center">
            <Award className="w-14 h-14 mx-auto text-primary mb-3" />
            <h3 className="text-xl font-bold">Publish your first course</h3>
            <p className="text-muted-foreground text-sm mt-2 mb-6">Share your SAP / IT expertise with 84,000+ learners. Upload video URLs, structure your curriculum, set the price — we handle payments, certificates, and hosting.</p>
            <Button asChild className="gradient-primary text-white border-0"><Link href="/instructor/courses/new"><Plus className="w-4 h-4 mr-2" /> Create Course</Link></Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map(c => (
              <div key={c.id} className="glass rounded-2xl overflow-hidden hover:border-primary/40 transition">
                {c.thumbnail && <img src={c.thumbnail} alt={c.title} className="w-full aspect-video object-cover" />}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase text-primary">{c.categoryName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.published ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'}`}>{c.published ? 'Published' : 'Draft'}</span>
                  </div>
                  <h3 className="font-bold text-base line-clamp-2">{c.title}</h3>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span>₹{(c.price || 0).toLocaleString('en-IN')}</span>
                    <span>{c.lectures} lectures</span>
                    <span>{c.students || 0} students</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  )
}
