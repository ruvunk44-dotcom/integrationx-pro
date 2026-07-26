'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Loader2, Video, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { useAuth } from '@/components/auth-provider'
import { useEffect } from 'react'

const CATS = [
  { slug: 'sap-btp', name: 'SAP BTP' },
  { slug: 'sap-cpi', name: 'SAP Integration Suite' },
  { slug: 'sap-abap', name: 'SAP ABAP' },
  { slug: 'sap-fiori', name: 'SAP Fiori / UI5' },
  { slug: 'sap-successfactors', name: 'SuccessFactors' },
  { slug: 'ai', name: 'AI & GenAI' },
  { slug: 'aws', name: 'AWS' },
  { slug: 'devops', name: 'DevOps' },
  { slug: 'python', name: 'Python' },
  { slug: 'react', name: 'React' },
]

export default function NewCoursePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', subtitle: '', category: 'sap-btp', level: 'Intermediate', language: 'English + Hindi',
    price: 9999, originalPrice: 19999,
    thumbnail: '', promoVideo: '', description: '',
    whatYouLearn: ['', '', ''], skills: '',
    published: false,
    modules: [{ title: '', lessons: [{ title: '', duration: '10:00', videoUrl: '', free: true }] }],
  })

  useEffect(() => { if (!authLoading && !user) router.push('/login?next=/instructor/courses/new') }, [user, authLoading, router])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setModule = (i, k, v) => setForm(f => ({ ...f, modules: f.modules.map((m, idx) => idx === i ? { ...m, [k]: v } : m) }))
  const setLesson = (mi, li, k, v) => setForm(f => ({ ...f, modules: f.modules.map((m, idx) => idx === mi ? { ...m, lessons: m.lessons.map((l, j) => j === li ? { ...l, [k]: v } : l) } : m) }))
  const addModule = () => setForm(f => ({ ...f, modules: [...f.modules, { title: '', lessons: [{ title: '', duration: '10:00', videoUrl: '', free: false }] }] }))
  const removeModule = (i) => setForm(f => ({ ...f, modules: f.modules.filter((_, idx) => idx !== i) }))
  const addLesson = (mi) => setForm(f => ({ ...f, modules: f.modules.map((m, idx) => idx === mi ? { ...m, lessons: [...m.lessons, { title: '', duration: '10:00', videoUrl: '', free: false }] } : m) }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.category) return toast.error('Title and category are required')
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice),
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        whatYouLearn: form.whatYouLearn.filter(x => x.trim()),
      }
      const r = await fetch('/api/instructor/courses', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed to publish')
      toast.success(form.published ? 'Course published 🎉' : 'Draft saved')
      router.push('/instructor')
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }

  if (authLoading || !user) return <div className="min-h-screen bg-background" />

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <form onSubmit={submit} className="pt-28 pb-20 max-w-4xl mx-auto px-4">
        <Link href="/instructor" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="w-4 h-4" /> Back to Studio</Link>
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">Create New <span className="gradient-text">Course</span></h1>
            <p className="text-muted-foreground mt-1 text-sm">Paste video URLs (YouTube, Vimeo, or your CDN) — no direct upload needed.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2"><Switch checked={form.published} onCheckedChange={v => set('published', v)} /><Label className="text-xs">Publish immediately</Label></div>
            <Button type="submit" disabled={saving} className="gradient-primary text-white border-0 h-11 px-5 font-semibold">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" /> {form.published ? 'Publish' : 'Save Draft'}</>}</Button>
          </div>
        </div>

        {/* Basic info */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-lg">Basic info</h2>
          <div className="space-y-2">
            <Label className="text-xs">Title *</Label>
            <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. SAP CPI Advanced Patterns" className="h-11 bg-background/50" required />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Subtitle</Label>
            <Input value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="One-line hook" className="h-11 bg-background/50" />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="space-y-2"><Label className="text-xs">Category *</Label>
              <Select value={form.category} onValueChange={v => set('category', v)}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>{CATS.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label className="text-xs">Level</Label>
              <Select value={form.level} onValueChange={v => set('level', v)}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Beginner">Beginner</SelectItem><SelectItem value="Intermediate">Intermediate</SelectItem><SelectItem value="Advanced">Advanced</SelectItem><SelectItem value="All Levels">All Levels</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label className="text-xs">Language</Label>
              <Input value={form.language} onChange={e => set('language', e.target.value)} className="h-11 bg-background/50" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2"><Label className="text-xs">Price (₹) *</Label><Input type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} className="h-11 bg-background/50" required /></div>
            <div className="space-y-2"><Label className="text-xs">Original price (₹)</Label><Input type="number" min="0" value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} className="h-11 bg-background/50" /></div>
          </div>
          <div className="space-y-2"><Label className="text-xs">Thumbnail URL</Label><Input value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} placeholder="https://..." className="h-11 bg-background/50" /></div>
          <div className="space-y-2"><Label className="text-xs">Promo Video URL (YouTube/Vimeo embed)</Label><Input value={form.promoVideo} onChange={e => set('promoVideo', e.target.value)} placeholder="https://www.youtube.com/embed/..." className="h-11 bg-background/50" /></div>
          <div className="space-y-2"><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} className="bg-background/50 resize-none" /></div>
          <div className="space-y-2"><Label className="text-xs">Skills (comma separated)</Label><Input value={form.skills} onChange={e => set('skills', e.target.value)} placeholder="SAP CPI, Groovy, iFlow Design" className="h-11 bg-background/50" /></div>
          <div className="space-y-2"><Label className="text-xs">What learners will achieve (3+ bullet points)</Label>
            {form.whatYouLearn.map((w, i) => (
              <Input key={i} value={w} onChange={e => set('whatYouLearn', form.whatYouLearn.map((x, idx) => idx === i ? e.target.value : x))} placeholder={`Outcome ${i+1}`} className="h-10 bg-background/50" />
            ))}
            <Button type="button" variant="ghost" size="sm" onClick={() => set('whatYouLearn', [...form.whatYouLearn, ''])}><Plus className="w-3 h-3 mr-1" /> Add outcome</Button>
          </div>
        </div>

        {/* Curriculum */}
        <div className="glass rounded-2xl p-6 space-y-4 mt-6">
          <div className="flex items-center justify-between"><h2 className="font-bold text-lg">Curriculum</h2><Button type="button" variant="outline" size="sm" onClick={addModule}><Plus className="w-3 h-3 mr-1" /> Module</Button></div>
          {form.modules.map((m, mi) => (
            <div key={mi} className="border border-border/50 rounded-xl p-4 bg-background/30 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Module {mi+1}</span>
                <Input value={m.title} onChange={e => setModule(mi, 'title', e.target.value)} placeholder="Module title" className="flex-1 h-9 bg-background/50" />
                {form.modules.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeModule(mi)}><Trash2 className="w-4 h-4 text-red-500" /></Button>}
              </div>
              {m.lessons.map((l, li) => (
                <div key={li} className="grid md:grid-cols-12 gap-2 items-start pl-4 border-l-2 border-primary/30">
                  <Input value={l.title} onChange={e => setLesson(mi, li, 'title', e.target.value)} placeholder=`Lesson ${li+1} title` className="md:col-span-5 h-9 bg-background/50" />
                  <Input value={l.videoUrl} onChange={e => setLesson(mi, li, 'videoUrl', e.target.value)} placeholder="YouTube embed URL" className="md:col-span-4 h-9 bg-background/50 text-xs" />
                  <Input value={l.duration} onChange={e => setLesson(mi, li, 'duration', e.target.value)} placeholder="MM:SS" className="md:col-span-2 h-9 bg-background/50" />
                  <label className="md:col-span-1 flex items-center gap-1 text-xs mt-2"><input type="checkbox" checked={l.free} onChange={e => setLesson(mi, li, 'free', e.target.checked)} /> Free</label>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={() => addLesson(mi)} className="ml-4"><Plus className="w-3 h-3 mr-1" /> Lesson</Button>
            </div>
          ))}
        </div>
      </form>
      <SiteFooter />
    </div>
  )
}
