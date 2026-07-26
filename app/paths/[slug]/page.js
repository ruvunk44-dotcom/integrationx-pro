'use client'
import { useEffect, useState, use as useUnwrap } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, ChevronRight, Users, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import CourseCard from '@/components/course-card'

export default function PathDetail({ params }) {
  const { slug } = useUnwrap(params)
  const [path, setPath] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/paths/${slug}`).then(r => r.json()).then(d => { setPath(d.path); setLoading(false) })
  }, [slug])

  if (loading) return <div className="min-h-screen bg-background"><SiteHeader /><div className="pt-32 max-w-7xl mx-auto px-4"><div className="h-96 glass rounded-2xl animate-pulse" /></div></div>
  if (!path) return <div className="min-h-screen bg-background"><SiteHeader /><div className="pt-32 text-center"><h1 className="text-2xl font-bold">Path not found</h1></div></div>

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className={`relative pt-28 pb-16 bg-gradient-to-br ${path.color} text-white overflow-hidden`}>
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-2 text-xs opacity-80 mb-4">
            <Link href="/paths" className="hover:underline">Learning Paths</Link>
            <ChevronRight className="w-3 h-3" />
            <span>{path.title}</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-6xl mb-4">{path.icon}</div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">{path.title}</h1>
              <p className="text-lg opacity-90 mt-3">{path.subtitle}</p>
              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur"><Clock className="w-3.5 h-3.5 inline mr-1" /> {path.duration}</span>
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur">{path.level}</span>
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur"><Users className="w-3.5 h-3.5 inline mr-1" /> {path.students.toLocaleString('en-IN')}+ enrolled</span>
              </div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-strong rounded-3xl p-6 text-foreground">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Bundle Price</div>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl font-extrabold gradient-text">₹{path.bundlePrice.toLocaleString('en-IN')}</span>
                <span className="text-lg text-muted-foreground line-through">₹{path.totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-sm text-emerald-500 font-bold mt-1">You save ₹{path.saving.toLocaleString('en-IN')} (35% off)</div>
              <p className="text-xs text-muted-foreground mt-3">All {path.courses.length} courses · Lifetime access · Certificate on completion · GST included</p>
              <Button asChild size="lg" className="w-full mt-5 gradient-primary text-white border-0 h-12 font-bold">
                <Link href={`/courses/${path.courses[0]?.slug || '/courses'}`}>Start with Course 1 <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <p className="text-center text-[10px] text-muted-foreground mt-2">Bundle checkout coming soon — enrol course-by-course for now</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">By the end of this path, you will be able to:</h2>
              <div className="space-y-3">
                {path.outcomes.map((o, i) => (
                  <div key={i} className="flex gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> <span>{o}</span></div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Courses in this path <span className="text-muted-foreground text-base font-normal">({path.courses.length})</span></h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {path.courses.map((c, i) => <CourseCard key={c.slug} course={c} index={i} />)}
              </div>
            </div>
          </div>
          <div>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-sm mb-3">Ideal for:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {path.careerFor.map(x => <li key={x} className="flex gap-2"><ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {x}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
