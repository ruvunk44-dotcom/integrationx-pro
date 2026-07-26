'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import CourseCard from '@/components/course-card'
import { motion } from 'framer-motion'

function Catalog() {
  const params = useSearchParams()
  const [q, setQ] = useState('')
  const [category, setCategory] = useState(params.get('category') || 'all')
  const [level, setLevel] = useState('all')
  const [sort, setSort] = useState('popular')
  const [courses, setCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/catalog').then(r => r.json()).then(d => setCategories(d.categories || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    const url = new URL('/api/courses', window.location.origin)
    if (q) url.searchParams.set('q', q)
    if (category !== 'all') url.searchParams.set('category', category)
    if (level !== 'all') url.searchParams.set('level', level)
    url.searchParams.set('sort', sort)
    fetch(url).then(r => r.json()).then(d => { setCourses(d.courses || []); setLoading(false) })
  }, [q, category, level, sort])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="pt-32 pb-10 relative">
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold">Explore <span className="gradient-text">All Courses</span></h1>
            <p className="text-muted-foreground mt-2">{courses.length} courses · Learn from world-class instructors</p>
          </motion.div>

          <div className="mt-8 glass rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search courses, skills, instructors..." className="pl-10 h-11 bg-background/50 border-border" />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-44 h-11"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-full md:w-36 h-11"><SelectValue placeholder="Level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="All Levels">All Levels</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full md:w-40 h-11"><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category chips */}
          <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <button onClick={() => setCategory('all')} className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${category === 'all' ? 'gradient-primary text-white' : 'glass text-muted-foreground hover:text-foreground'}`}>All</button>
            {categories.map(c => (
              <button key={c.slug} onClick={() => setCategory(c.slug)} className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${category === c.slug ? 'gradient-primary text-white' : 'glass text-muted-foreground hover:text-foreground'}`}>
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-80 rounded-2xl glass animate-pulse" />)}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold">No courses found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c, i) => <CourseCard key={c.slug} course={c} index={i} />)}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

export default function CoursesPage() {
  return <Suspense fallback={<div className="min-h-screen bg-background" />}><Catalog /></Suspense>
}
