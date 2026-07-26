'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles, Trophy, Users, Globe, CheckCircle2, Zap, Shield, Star, ChevronRight, Award, Building2, Calendar, BookOpen, Rocket, Target, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { toast } from 'sonner'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import CourseCard from '@/components/course-card'

export default function HomePage() {
  const [data, setData] = useState({ courses: [], categories: [], testimonials: [], liveBatches: [], faqs: [], stats: {} })
  const [email, setEmail] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/courses?sort=popular').then(r => r.json()),
      fetch('/api/catalog').then(r => r.json()),
    ]).then(([c, cat]) => setData({ courses: c.courses || [], ...cat }))
  }, [])

  const subscribe = async (e) => {
    e.preventDefault()
    if (!email) return
    const r = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    if (r.ok) { toast.success('Welcome aboard! Check your inbox for a special gift.'); setEmail('') }
    else toast.error('Something went wrong')
  }

  const bestsellers = data.courses.filter(c => c.badge === 'Bestseller')
  const newCourses = data.courses.filter(c => c.badge === 'New' || c.tags?.includes('New'))
  const sapCourses = data.courses.filter(c => (c.category || '').startsWith('sap'))
  const popularCourses = data.courses.filter(c => !(c.category || '').startsWith('sap')).slice(0, 3)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative mx-auto max-w-7xl px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                SAP CPI Live Cohort — <span className="gradient-text font-semibold">Only 8 seats left · Starts July 15</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
                Master <span className="gradient-text">SAP BTP</span><br />
                & Integration Suite
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                The #1 platform for SAP integration professionals. Learn <b className="text-foreground">Integration Suite (CPI), BTP, ABAP, Fiori, SuccessFactors</b> — from principal architects at Deloitte, Accenture, TCS & SAP Labs. Real corporate projects, verified certificates, guaranteed placements.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="gradient-primary text-white border-0 hover:opacity-90 font-semibold shadow-xl shadow-primary/30 h-12 px-6">
                  <Link href="/courses">Start Learning <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="glass h-12 px-6 font-semibold">
                  <Link href="/courses">Browse Courses</Link>
                </Button>
                <Button size="lg" variant="ghost" className="h-12 px-4 font-semibold">
                  <Play className="w-4 h-4 mr-2" /> Book Free Consultation
                </Button>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg">
                {[
                  { v: '84K+', l: 'Learners' },
                  { v: '4.8★', l: 'Avg Rating' },
                  { v: '96%', l: 'Placement' },
                ].map(s => (
                  <div key={s.l}>
                    <div className="text-2xl md:text-3xl font-extrabold gradient-text">{s.v}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }} className="relative">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden glass-strong pulse-glow">
                <img src="https://images.unsplash.com/photo-1591439657848-9f4b9ce436b9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHw0fHxkZXZlbG9wZXIlMjBjb2Rpbmd8ZW58MHx8fGJsdWV8MTc4NTA0NTcxMnww&ixlib=rb-4.1.0&q=85" alt="Coding" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-transparent to-purple-900/30" />
              </div>
              {/* Floating cards */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="absolute -bottom-6 -left-6 glass-strong p-4 rounded-2xl shadow-2xl w-56 hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center"><Award className="w-5 h-5 text-white" /></div>
                  <div>
                    <div className="text-xs text-muted-foreground">Just earned</div>
                    <div className="font-bold text-sm">AWS Certified 🎉</div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="absolute -top-6 -right-4 glass-strong p-4 rounded-2xl shadow-2xl hidden md:block">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[47,48,49].map(i => <img key={i} src={`https://i.pravatar.cc/40?img=${i}`} className="w-8 h-8 rounded-full border-2 border-background" />)}
                  </div>
                  <div>
                    <div className="text-xs font-bold">+1,240 today</div>
                    <div className="text-[10px] text-muted-foreground">enrolled this week</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Trusted by SAP companies */}
          <div className="mt-20 glass rounded-2xl p-6">
            <div className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-4">Trusted by SAP professionals at</div>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 opacity-80">
              {['Deloitte','Accenture','TCS','Infosys','Capgemini','IBM','Wipro','SAP'].map(brand => (
                <span key={brand} className="text-base md:text-lg font-bold tracking-tight text-muted-foreground">{brand}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-16 relative">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold">Explore <span className="gradient-text">Categories</span></h2>
              <p className="text-muted-foreground mt-2">Learn the tools that top companies actually use</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {data.categories.slice(0, 12).map((c, i) => (
              <motion.div key={c.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                <Link href={`/courses?category=${c.slug}`} className="group block glass rounded-xl p-5 hover:border-primary/50 transition hover:-translate-y-0.5">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center text-2xl mb-3 shadow-md`}>{c.icon}</div>
                  <div className="font-semibold text-sm group-hover:text-primary transition">{c.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{c.count} courses</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SAP MASTERY TRACK — Signature Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/10" />
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 glass px-3 py-1 rounded-full text-[11px] font-bold text-primary mb-3 uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Signature Track
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold">SAP <span className="gradient-text">Mastery Track</span></h2>
              <p className="text-muted-foreground mt-2 max-w-2xl">Built by SAP Mentors & principal architects. The most comprehensive SAP curriculum on the internet — covering BTP, Integration Suite, ABAP, Fiori, and SuccessFactors.</p>
            </div>
            <Button asChild variant="outline" className="glass"><Link href="/courses?category=sap-btp">Explore SAP Track <ChevronRight className="w-4 h-4 ml-1" /></Link></Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sapCourses.map((c, i) => <CourseCard key={c.slug} course={c} index={i} />)}
          </div>
        </div>
      </section>

      {/* POPULAR COURSES */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold">Also <span className="gradient-text">Trending</span></h2>
              <p className="text-muted-foreground mt-2">Complement your SAP skills with cloud, AI & modern web</p>
            </div>
            <Button asChild variant="ghost"><Link href="/courses">View all <ChevronRight className="w-4 h-4 ml-1" /></Link></Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCourses.map((c, i) => <CourseCard key={c.slug} course={c} index={i} />)}
          </div>
        </div>
      </section>

      {/* LIVE BATCHES */}
      <section id="live-batches" className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live Cohorts
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold">Upcoming <span className="gradient-text">Live Batches</span></h2>
            <p className="text-muted-foreground mt-2">Join a small cohort. Live sessions. Mentor access. Guaranteed transformation.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.liveBatches.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Link href={`/courses/${b.slug}`} className="block glass rounded-2xl p-5 hover:border-primary/50 transition h-full">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2"><Calendar className="w-3.5 h-3.5" /> {new Date(b.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  <h3 className="font-bold text-base leading-snug mb-2">{b.course}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{b.duration} · {b.time}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">by {b.instructor}</span>
                    <span className="text-xs font-bold text-amber-500">{b.seats} seats left</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold">Why <span className="gradient-text">DevLearn Pro</span></h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">We do things differently. Small cohorts. World-class instructors. Real projects that go on your GitHub.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Building2, title: 'SAP-First DNA', desc: 'Founded by SAP Mentors. Every SAP course reflects real corporate migration & integration work.', color: 'from-blue-500 to-cyan-500' },
              { icon: Users, title: 'Small Live Cohorts', desc: 'Max 20 students per batch. Personal attention. Real mentor access on Slack & Zoom.', color: 'from-purple-500 to-pink-500' },
              { icon: Target, title: 'Industry Instructors', desc: 'Learn from principal architects at SAP Labs, Deloitte, Accenture, TCS, AWS.', color: 'from-emerald-500 to-teal-500' },
              { icon: Brain, title: 'AI Learning Assistant', desc: 'Get 24/7 tutoring, quizzes & personalized study plans powered by GPT-5.', color: 'from-amber-500 to-orange-500' },
            ].map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass rounded-2xl p-6 hover:border-primary/40 transition group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold">Student <span className="gradient-text">Success Stories</span></h2>
            <p className="text-muted-foreground mt-2">Real people. Real careers. Real transformations.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="glass rounded-2xl p-6 hover:border-primary/30 transition">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm leading-relaxed text-foreground/90 mb-5">“{t.text}”</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full" />
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CERTIFICATION + CORPORATE */}
      <section id="corporate" className="py-16">
        <div className="mx-auto max-w-7xl px-4 grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-strong rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full gradient-primary blur-3xl opacity-30" />
            <Award className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-2xl font-extrabold mb-3">Industry-Recognized <span className="gradient-text">Certificates</span></h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5">Every completion earns you a verifiable certificate with unique ID, QR verification, and one-click LinkedIn share. Endorsed by 200+ hiring partners globally.</p>
            <ul className="space-y-2">
              {['Unique Verification ID','QR Code Verification','LinkedIn Shareable','Employer Endorsed'].map(x => (
                <li key={x} className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> {x}</li>
              ))}
            </ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-strong rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-purple-500 blur-3xl opacity-30" />
            <Building2 className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="text-2xl font-extrabold mb-3">Corporate <span className="gradient-text">Training</span></h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5">Upskill your entire team with customized cohorts. Used by Deloitte, TCS, Accenture, Infosys and 40+ enterprises to build world-class engineering teams.</p>
            <div className="flex flex-wrap gap-2">
              {['Custom Curriculum','Dedicated Success Manager','LMS Integration','Progress Reports','SLA-backed'].map(x => (
                <span key={x} className="text-xs font-medium px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">{x}</span>
              ))}
            </div>
            <Button className="mt-6 gradient-primary text-white border-0">Talk to Sales <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold">Frequently <span className="gradient-text">Asked</span></h2>
            <p className="text-muted-foreground mt-2">Everything you need to know before starting</p>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {data.faqs.map((f, i) => (
              <AccordionItem key={i} value={`f${i}`} className="glass rounded-2xl px-5 border-0">
                <AccordionTrigger className="text-left font-semibold hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="glass-strong rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 gradient-mesh opacity-40" />
            <div className="relative">
              <Sparkles className="w-10 h-10 mx-auto text-primary mb-4" />
              <h2 className="text-3xl md:text-4xl font-extrabold">Get <span className="gradient-text">Weekly Insights</span></h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Curated IT roadmaps, live batch launches, career tips — delivered every Sunday. Plus a free SAP CPI cheatsheet on signup.</p>
              <form onSubmit={subscribe} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" type="email" required className="h-12 bg-background/50" />
                <Button type="submit" className="gradient-primary text-white border-0 h-12 px-6 font-semibold">Subscribe</Button>
              </form>
              <p className="text-xs text-muted-foreground mt-3">Join 42,000+ IT professionals. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
