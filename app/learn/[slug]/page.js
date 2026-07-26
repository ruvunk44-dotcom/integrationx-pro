'use client'
import { useEffect, useState, useRef, use as useUnwrap } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, PlayCircle, Lock, FileText, Download, MessageCircle, StickyNote, Home, Award, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { getUserId } from '@/lib/user'

export default function LearnPage({ params }) {
  const { slug } = useUnwrap(params)
  const [course, setCourse] = useState(null)
  const [currentLesson, setCurrentLesson] = useState(null)
  const [completedLessons, setCompletedLessons] = useState([])
  const [progress, setProgress] = useState(0)
  const [note, setNote] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const saveTimer = useRef(null)

  const flatLessons = course ? course.curriculum.flatMap(m => m.lessons.map(l => ({ ...l, moduleTitle: m.title }))) : []
  const currentIndex = currentLesson ? flatLessons.findIndex(l => l.id === currentLesson.id) : -1
  const totalLessons = flatLessons.length

  useEffect(() => {
    fetch(`/api/courses/${slug}`).then(r => r.json()).then(async d => {
      setCourse(d.course)
      const first = d.course.curriculum[0].lessons[0]
      const uid = getUserId()
      // ensure enrolled
      await fetch('/api/enroll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid, courseSlug: slug }) })
      const p = await fetch(`/api/progress?userId=${uid}&courseSlug=${slug}`).then(r => r.json())
      setCompletedLessons(p.completedLessons || [])
      setProgress(p.progress || 0)
      setCurrentLesson(first)
      setLoading(false)
    })
  }, [slug])

  useEffect(() => {
    if (!currentLesson) return
    const uid = getUserId()
    fetch(`/api/notes?userId=${uid}&courseSlug=${slug}&lessonId=${currentLesson.id}`).then(r => r.json()).then(d => setNote(d.note?.content || ''))
  }, [currentLesson, slug])

  const saveNote = (v) => {
    setNote(v)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      const uid = getUserId()
      await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid, courseSlug: slug, lessonId: currentLesson.id, content: v }) })
    }, 700)
  }

  const markComplete = async (lessonId = currentLesson?.id, forceState) => {
    if (!lessonId) return
    const isDone = completedLessons.includes(lessonId)
    const newState = forceState !== undefined ? forceState : !isDone
    const uid = getUserId()
    const r = await fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid, courseSlug: slug, lessonId, completed: newState }) }).then(r => r.json())
    setCompletedLessons(r.completedLessons)
    setProgress(r.progress)
    if (newState) toast.success('Lesson marked complete 🎉')
  }

  const goto = (dir) => {
    if (dir === 'next' && currentIndex < totalLessons - 1) setCurrentLesson(flatLessons[currentIndex + 1])
    if (dir === 'prev' && currentIndex > 0) setCurrentLesson(flatLessons[currentIndex - 1])
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-muted-foreground">Loading your learning space...</div></div>

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 glass-strong border-b border-border/50">
        <div className="px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="shrink-0">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <Link href={`/courses/${slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground shrink-0">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="min-w-0 hidden sm:block">
              <div className="text-xs text-muted-foreground truncate">{course.categoryName}</div>
              <div className="font-semibold text-sm truncate">{course.title}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex flex-col items-end min-w-[140px]">
              <div className="text-[10px] text-muted-foreground">{progress}% complete</div>
              <Progress value={progress} className="h-1.5 w-32" />
            </div>
            {progress === 100 && (
              <Button size="sm" className="gradient-primary text-white border-0">
                <Award className="w-4 h-4 mr-1" /> Certificate
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside initial={{ x: -320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -320, opacity: 0 }} className="w-80 shrink-0 border-r border-border/50 h-[calc(100vh-56px)] sticky top-14 overflow-y-auto bg-background/50 backdrop-blur-xl">
              <div className="p-4">
                <div className="glass rounded-xl p-3 mb-3">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold">Your Progress</span>
                    <span className="text-muted-foreground">{completedLessons.length}/{totalLessons}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                {course.curriculum.map((m, mi) => (
                  <div key={m.id} className="mb-4">
                    <div className="px-2 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Module {mi+1}: {m.title}</div>
                    <div className="space-y-0.5">
                      {m.lessons.map((l, li) => {
                        const done = completedLessons.includes(l.id)
                        const active = currentLesson?.id === l.id
                        return (
                          <button key={l.id} onClick={() => setCurrentLesson(l)} className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-2.5 transition ${active ? 'bg-primary/10 border border-primary/30' : 'hover:bg-accent/50'}`}>
                            {done ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> : <PlayCircle className={`w-4 h-4 mt-0.5 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />}
                            <div className="flex-1 min-w-0">
                              <div className={`text-xs font-medium leading-snug line-clamp-2 ${active ? 'text-primary' : ''}`}>{li+1}. {l.title}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">{l.duration}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="max-w-5xl mx-auto p-4 md:p-6">
            {/* Video */}
            <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl shadow-primary/10">
              <iframe src={currentLesson?.videoUrl} title={currentLesson?.title} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
            </div>

            {/* Meta */}
            <div className="mt-5 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-xs text-primary font-semibold uppercase tracking-wider">{currentLesson?.moduleTitle}</div>
                <h1 className="text-2xl font-extrabold mt-1">{currentLesson?.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">Lesson {currentIndex+1} of {totalLessons} · {currentLesson?.duration}</p>
              </div>
              <Button onClick={() => markComplete()} className={completedLessons.includes(currentLesson?.id) ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'gradient-primary text-white border-0'}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> {completedLessons.includes(currentLesson?.id) ? 'Completed' : 'Mark Complete'}
              </Button>
            </div>

            {/* Tabs */}
            <div className="mt-6">
              <Tabs defaultValue="notes" className="w-full">
                <TabsList className="grid grid-cols-4 w-full max-w-2xl">
                  <TabsTrigger value="notes"><StickyNote className="w-4 h-4 mr-1" /> Notes</TabsTrigger>
                  <TabsTrigger value="attachments"><Download className="w-4 h-4 mr-1" /> Downloads</TabsTrigger>
                  <TabsTrigger value="transcript"><FileText className="w-4 h-4 mr-1" /> Transcript</TabsTrigger>
                  <TabsTrigger value="discussion"><MessageCircle className="w-4 h-4 mr-1" /> Discussion</TabsTrigger>
                </TabsList>
                <TabsContent value="notes" className="mt-4">
                  <div className="glass rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">Your notes for this lesson</h3>
                      <span className="text-[10px] text-muted-foreground">Auto-saved</span>
                    </div>
                    <Textarea value={note} onChange={e => saveNote(e.target.value)} placeholder="Take notes while you learn... your notes are saved automatically and searchable later." rows={8} className="resize-none bg-background/50" />
                  </div>
                </TabsContent>
                <TabsContent value="attachments" className="mt-4">
                  <div className="glass rounded-2xl p-2">
                    {currentLesson?.resources?.map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs uppercase ${r.type === 'pdf' ? 'bg-red-500/15 text-red-500' : r.type === 'zip' ? 'bg-amber-500/15 text-amber-500' : 'bg-blue-500/15 text-blue-500'}`}>{r.type}</div>
                          <div>
                            <div className="font-medium text-sm">{r.name}</div>
                            <div className="text-xs text-muted-foreground">{r.size}</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="glass"><Download className="w-4 h-4 mr-1" /> Download</Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="transcript" className="mt-4">
                  <div className="glass rounded-2xl p-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">{currentLesson?.transcript}</p>
                  </div>
                </TabsContent>
                <TabsContent value="discussion" className="mt-4">
                  <div className="glass rounded-2xl p-6 text-center text-muted-foreground text-sm">
                    <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    Join the discussion — ask questions, share insights with 4,000+ learners.
                    <Button className="mt-4 gradient-primary text-white border-0">Open Discussion</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Nav */}
            <div className="mt-8 flex items-center justify-between">
              <Button variant="outline" onClick={() => goto('prev')} disabled={currentIndex <= 0} className="glass"><ChevronLeft className="w-4 h-4 mr-1" /> Previous</Button>
              <Button onClick={() => goto('next')} disabled={currentIndex >= totalLessons - 1} className="gradient-primary text-white border-0">Next Lesson <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
