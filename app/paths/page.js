'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, Users, Award, ArrowRight, CheckCircle2, TrendingUp, Route } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'

export default function PathsPage() {
  const [paths, setPaths] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/paths').then(r => r.json()).then(d => { setPaths(d.paths || []); setLoading(false) })
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="pt-32 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <div className="inline-flex items-center gap-2 glass px-3 py-1 rounded-full text-[11px] font-bold text-primary mb-3 uppercase tracking-widest">
            <Route className="w-3 h-3" /> Curated Career Roadmaps
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold">Learning <span className="gradient-text">Paths</span></h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Guided multi-course bundles designed by industry architects. Save up to 35% · finish in months, not years · come out job-ready.</p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">{[0,1,2,3].map(i => <div key={i} className="h-96 glass rounded-2xl animate-pulse" />)}</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {paths.map((p, i) => (
                <motion.div key={p.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                  <Link href={`/paths/${p.slug}`} className="block glass rounded-2xl overflow-hidden hover:border-primary/40 hover:-translate-y-0.5 transition group">
                    <div className={`relative bg-gradient-to-br ${p.color} p-6 text-white overflow-hidden`}>
                      <div className="absolute -right-6 -bottom-6 text-9xl opacity-15">{p.icon}</div>
                      <div className="text-5xl mb-3">{p.icon}</div>
                      <h3 className="text-2xl font-extrabold">{p.title}</h3>
                      <p className="text-sm opacity-90 mt-1">{p.subtitle}</p>
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div><div className="text-lg font-extrabold gradient-text">{p.duration}</div><div className="text-[10px] text-muted-foreground uppercase tracking-wider">Duration</div></div>
                        <div><div className="text-lg font-extrabold gradient-text">{p.courses.length}</div><div className="text-[10px] text-muted-foreground uppercase tracking-wider">Courses</div></div>
                        <div><div className="text-lg font-extrabold gradient-text">{p.students.toLocaleString('en-IN')}+</div><div className="text-[10px] text-muted-foreground uppercase tracking-wider">Learners</div></div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {p.courses.map(c => (
                          <span key={c.slug} className="text-[11px] px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">{c.categoryName}</span>
                        ))}
                      </div>
                      <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-muted-foreground">Bundle price</div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-extrabold gradient-text">₹{p.bundlePrice.toLocaleString('en-IN')}</span>
                            <span className="text-sm text-muted-foreground line-through">₹{p.totalPrice.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="text-[10px] text-emerald-500 font-bold mt-0.5">Save ₹{(p.totalPrice - p.bundlePrice).toLocaleString('en-IN')} (35% off)</div>
                        </div>
                        <ArrowRight className="w-6 h-6 text-primary group-hover:translate-x-1 transition" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
