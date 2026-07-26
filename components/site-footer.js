import Link from 'next/link'
import { GraduationCap, Github, Twitter, Linkedin, Youtube } from 'lucide-react'

export default function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-border/50">
      <div className="absolute inset-0 gradient-mesh opacity-40 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <GraduationCap className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-lg">DevLearn <span className="gradient-text">Pro</span></span>
                <span className="text-xs text-muted-foreground">Master IT Skills with Real Projects</span>
              </div>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              The premium destination for professional IT training. Live classes, expert mentors, hands-on projects, and industry-recognized certifications.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Twitter, Linkedin, Youtube, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg glass flex items-center justify-center hover:bg-primary/10 hover:text-primary transition">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: 'Learn', items: ['Browse Courses','Live Batches','Learning Paths','Certificates','Free Resources'] },
            { title: 'Company', items: ['About Us','Instructors','Corporate Training','Blog','Careers'] },
            { title: 'Support', items: ['Help Center','Contact','FAQs','Refund Policy','Terms of Service'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="font-semibold text-sm mb-4 tracking-wide uppercase text-foreground">{col.title}</h4>
              <ul className="space-y-3">
                {col.items.map(i => (
                  <li key={i}><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition">{i}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2025 DevLearn Pro. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Trusted by 84,000+ learners</span>
            <span>•</span>
            <span>Endorsed by 200+ hiring partners</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
