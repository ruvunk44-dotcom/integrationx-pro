'use client'
import { useEffect, useState, use as useUnwrap } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Star, Clock, Users, PlayCircle, CheckCircle2, Lock, ChevronRight, Globe, Award, Sparkles, Download, MessageCircle, Heart, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { getUserId } from '@/lib/user'

export default function CourseDetail({ params }) {
  const { slug } = useUnwrap(params)
  const router = useRouter()
  const [course, setCourse] = useState(null)
  const [enrolled, setEnrolled] = useState(false)
  const [wishlist, setWishlist] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/courses/${slug}`).then(r => r.json()).then(d => { setCourse(d.course); setLoading(false) })
    const uid = getUserId()
    fetch(`/api/enrollments?userId=${uid}`).then(r => r.json()).then(d => {
      setEnrolled((d.enrollments || []).some(e => e.courseSlug === slug))
    })
    fetch(`/api/wishlist?userId=${uid}`).then(r => r.json()).then(d => {
      setWishlist((d.wishlist || []).some(w => w.courseSlug === slug))
    })
  }, [slug])

  const enroll = async () => {
    const uid = getUserId()
    const r = await fetch('/api/enroll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid, courseSlug: slug }) })
    if (r.ok) {
      toast.success('Enrolled! Redirecting to your learning space...')
      setTimeout(() => router.push(`/learn/${slug}`), 700)
    }
  }

  const toggleWishlist = async () => {
    const uid = getUserId()
    setWishlist(!wishlist)
    await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid, courseSlug: slug, action: wishlist ? 'remove' : 'add' }) })
    toast.success(wishlist ? 'Removed from wishlist' : 'Added to wishlist')
  }

  if (loading) return <div className="min-h-screen bg-background"><SiteHeader /><div className="pt-32 max-w-7xl mx-auto px-4"><div className="h-96 glass rounded-2xl animate-pulse" /></div></div>
  if (!course) return <div className="min-h-screen bg-background"><SiteHeader /><div className="pt-32 text-center"><h1 className="text-2xl font-bold">Course not found</h1></div></div>

  const totalLessons = course.curriculum.reduce((n, m) => n + m.lessons.length, 0)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero Banner */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={course.banner} alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          <div className="absolute inset-0 gradient-mesh opacity-40" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 grid lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/courses" className="hover:text-foreground">Courses</Link>
              <ChevronRight className="w-3 h-3" />
              <span>{course.categoryName}</span>
            </div>
            {course.badge && <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 mb-3"><Sparkles className="w-3 h-3" /> {course.badge}</span>}
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">{course.title}</h1>
            <p className="text-lg text-muted-foreground mt-3 max-w-2xl">{course.subtitle}</p>

            <div className="flex flex-wrap items-center gap-4 mt-5 text-sm">
              <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /><span className="font-bold">{course.rating}</span> <span className="text-muted-foreground">({course.reviews.toLocaleString()} reviews)</span></div>
              <div className="flex items-center gap-1 text-muted-foreground"><Users className="w-4 h-4" /> {course.students.toLocaleString()} students</div>
              <div className="flex items-center gap-1 text-muted-foreground"><Globe className="w-4 h-4" /> {course.language}</div>
              <div className="flex items-center gap-1 text-muted-foreground"><Award className="w-4 h-4" /> {course.level}</div>
            </div>

            <div className="flex items-center gap-3 mt-5">
              <img src={course.instructor.avatar} alt={course.instructor.name} className="w-11 h-11 rounded-full ring-2 ring-primary/30" />
              <div>
                <div className="text-xs text-muted-foreground">Created by</div>
                <div className="font-semibold">{course.instructor.name}</div>
              </div>
            </div>
          </motion.div>

          {/* Sticky Enroll Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:sticky lg:top-24 lg:self-start">
            <div className="glass-strong rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
              <div className="relative aspect-video group cursor-pointer">
                <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-2xl group-hover:scale-110 transition">
                    <PlayCircle className="w-9 h-9 text-white" />
                  </div>
                </div>
                <span className="absolute bottom-3 left-3 text-xs font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md">Watch Preview</span>
              </div>
              <div className="p-5">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-extrabold gradient-text">${course.price}</span>
                  <span className="text-sm text-muted-foreground line-through">${course.originalPrice}</span>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded ml-1">{course.discount}% OFF</span>
                </div>
                <p className="text-xs text-red-500 font-semibold mb-4">⏰ Sale ends in 23:45:12</p>
                {enrolled ? (
                  <Button asChild className="w-full h-12 gradient-primary text-white border-0 font-bold">
                    <Link href={`/learn/${slug}`}>Continue Learning <ChevronRight className="w-4 h-4 ml-1" /></Link>
                  </Button>
                ) : (
                  <Button onClick={enroll} className="w-full h-12 gradient-primary text-white border-0 font-bold text-base shadow-lg shadow-primary/30">
                    Enroll Now
                  </Button>
                )}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button variant="outline" onClick={toggleWishlist} className="glass">
                    <Heart className={`w-4 h-4 mr-2 ${wishlist ? 'fill-red-500 text-red-500' : ''}`} /> Wishlist
                  </Button>
                  <Button variant="outline" className="glass"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
                </div>
                <div className="mt-6 pt-5 border-t border-border/50 space-y-3 text-sm">
                  <div className="font-semibold">This course includes:</div>
                  {[
                    [PlayCircle, `${course.duration} on-demand video`],
                    [Download, 'Downloadable resources (PDF, ZIP, PPT)'],
                    [Award, 'Certificate of completion'],
                    [MessageCircle, 'Community & mentor access'],
                    [Globe, 'Lifetime access on all devices'],
                  ].map(([Icon, t]) => (
                    <div key={t} className="flex items-center gap-2 text-muted-foreground"><Icon className="w-4 h-4 text-primary" /> {t}</div>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">30-Day Money-Back Guarantee · Full lifetime access</p>
          </motion.div>
        </div>
      </section>

      {/* Details */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">What you'll learn</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {course.whatYouLearn.map((w, i) => (
                  <div key={i} className="flex gap-2 text-sm"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> <span>{w}</span></div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Skills you'll master</h2>
              <div className="flex flex-wrap gap-2">
                {course.skills.map(s => (
                  <span key={s} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20">{s}</span>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Course Curriculum</h2>
                <span className="text-sm text-muted-foreground">{course.curriculum.length} modules · {totalLessons} lessons · {course.duration}</span>
              </div>
              <Accordion type="multiple" defaultValue={['0']} className="space-y-2">
                {course.curriculum.map((m, i) => (
                  <AccordionItem key={m.id} value={String(i)} className="border border-border/50 rounded-xl px-4 bg-background/40">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-3">
                        <span className="font-semibold text-left">Module {i+1}: {m.title}</span>
                        <span className="text-xs text-muted-foreground ml-4">{m.lessons.length} lessons</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1">
                        {m.lessons.map(l => (
                          <div key={l.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-accent/30">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {l.free ? <PlayCircle className="w-4 h-4 text-primary shrink-0" /> : <Lock className="w-4 h-4 text-muted-foreground shrink-0" />}
                              <span className="text-sm truncate">{l.title}</span>
                              {l.free && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">Preview</span>}
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0 ml-3">{l.duration}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Instructor */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Your Instructor</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <img src={course.instructor.avatar} alt={course.instructor.name} className="w-20 h-20 rounded-2xl ring-2 ring-primary/30" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{course.instructor.name}</h3>
                  <p className="text-sm text-primary font-medium">{course.instructor.title}</p>
                  <div className="flex gap-5 mt-2 text-xs text-muted-foreground">
                    <span>⭐ {course.instructor.rating} rating</span>
                    <span>👥 {course.instructor.students.toLocaleString()} students</span>
                    <span>📚 {course.instructor.courses} courses</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">{course.instructor.bio}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">About this course</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
            </div>
          </div>

          {/* right col stays sticky via hero */}
          <div className="hidden lg:block" />
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
