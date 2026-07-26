import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'DevLearn Pro — Master Industry Skills with Real Projects',
  description: 'Premium online learning platform for professional IT courses — SAP, AWS, AI, DevOps, React, Python and more. Live training, mentoring, certificates.',
  keywords: ['IT courses', 'online learning', 'SAP', 'AWS', 'React', 'DevOps', 'AI', 'Python', 'certification'],
  openGraph: {
    title: 'DevLearn Pro — Premium IT Learning Platform',
    description: 'Master industry skills with real projects. Live classes, expert mentors, verified certificates.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
