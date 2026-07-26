'use client'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun, Menu, X, Search, GraduationCap, LogOut, User, LayoutDashboard, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/auth-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const NAV = [
  { label: 'Courses', href: '/courses' },
  { label: 'Live Batches', href: '/#live-batches' },
  { label: 'Corporate', href: '/#corporate' },
]

export default function SiteHeader() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout, loading } = useAuth()
  const router = useRouter()

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out. See you soon!')
    router.push('/')
  }

  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'

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
            {user && (
              <Link href="/dashboard" className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                Dashboard
              </Link>
            )}
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

            {!loading && !user && (
              <>
                <Button asChild variant="ghost" className="hidden sm:inline-flex font-semibold"><Link href="/login">Log in</Link></Button>
                <Button asChild className="gradient-primary text-white border-0 hover:opacity-90 rounded-lg font-semibold">
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
            {!loading && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary/30 hover:ring-primary/60 transition shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full gradient-primary flex items-center justify-center text-white text-xs font-bold">{initials}</div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 glass-strong border-border/50">
                  <DropdownMenuLabel className="pb-2">
                    <div className="font-semibold text-sm truncate">{user.name}</div>
                    <div className="text-xs text-muted-foreground font-normal truncate">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/dashboard" className="cursor-pointer"><LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/courses" className="cursor-pointer"><BookOpen className="w-4 h-4 mr-2" /> Browse Courses</Link></DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild><Link href="/admin" className="cursor-pointer text-primary"><LayoutDashboard className="w-4 h-4 mr-2" /> Admin Console</Link></DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500"><LogOut className="w-4 h-4 mr-2" /> Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

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
              {user && (
                <Link href="/dashboard" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent/50">Dashboard</Link>
              )}
              {!user && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button asChild variant="outline"><Link href="/login" onClick={() => setOpen(false)}>Log in</Link></Button>
                  <Button asChild className="gradient-primary text-white border-0"><Link href="/signup" onClick={() => setOpen(false)}>Sign up</Link></Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
