'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Clock, PlayCircle, Users, Sparkles, TrendingUp } from 'lucide-react'

export default function CourseCard({ course, index = 0, compact = false }) {
  const badgeColor = {
    'Bestseller': 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    'New': 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    'Popular': 'bg-purple-500/15 text-purple-500 border-purple-500/30',
  }[course.badge] || 'bg-primary/15 text-primary border-primary/30'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link href={`/courses/${course.slug}`} className="group block h-full">
        <div className="relative h-full rounded-2xl overflow-hidden glass hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20">
          <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20">
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            {course.badge && (
              <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-md ${badgeColor}`}>
                {course.badge === 'Bestseller' && <TrendingUp className="w-3 h-3 inline mr-1" />}
                {course.badge === 'New' && <Sparkles className="w-3 h-3 inline mr-1" />}
                {course.badge}
              </span>
            )}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white text-xs bg-black/60 backdrop-blur-md px-2 py-1 rounded-md">
              <Clock className="w-3 h-3" /> {course.duration}
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-2xl">
                <PlayCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          <div className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold text-primary">
              {course.categoryName} · {course.level}
            </div>
            <h3 className="font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h3>
            {!compact && <p className="text-xs text-muted-foreground line-clamp-2">{course.subtitle}</p>}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-foreground">{course.rating}</span>
                <span>({course.reviews.toLocaleString()})</span>
              </div>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {course.students.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <img src={course.instructor.avatar} alt={course.instructor.name} className="w-6 h-6 rounded-full" />
              <span className="text-xs text-muted-foreground">{course.instructor.name}</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold gradient-text">${course.price}</span>
                <span className="text-xs text-muted-foreground line-through">${course.originalPrice}</span>
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">{course.discount}% OFF</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
