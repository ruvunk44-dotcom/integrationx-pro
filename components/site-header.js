'use client'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun, Menu, X, Search, GraduationCap, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

const NAV = [
  { label: 'Courses', href: '/courses' },
  { label: 'Live Batches', href: '/#live-batches' },
  { label: 'Corporate', href: '/#corporate' },
  { label: 'Dashboard', href: '/dashboard' },
]

export default function SiteHeader() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-3'}`}>
      <div className={`mx-auto max-w-7xl px-4 transition-all duration-300`}>
        <div className={`glass-strong rounded-2xl px-4 md:px-6 py-3 flex items-center justify-between shadow-lg shadow-primary/5`}>
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <GraduationCap className="w-5 h-5 text-white" strokeWidth={2.5} />
              <div className="absolute -inset-0.5 rounded-xl gradient-primary blur opacity-40 group-hover:opacity-70 transition" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-base tracking-tight">Integration<span className="gradient-text">X</span> Pro</span>
              <span className="text-[10px] text-muted-foreground font-medium">SAP BTP & Integration Suite</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map(n => (
              <Link key={n.href} href={n.href} className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/courses" className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition">
              <Search className="w-4 h-4" /> Search
            </Link>
            {mounted && (
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-lg">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            )}
            <Button asChild className="gradient-primary text-white border-0 hover:opacity-90 rounded-lg font-semibold hidden sm:inline-flex">
              <Link href="/courses">Start Learning</Link>
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden rounded-lg" onClick={() => setOpen(!open)}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="glass-strong mt-2 rounded-2xl p-3 lg:hidden">
              {NAV.map(n => (
                <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent/50">
                  {n.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
