'use client'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from '@/components/auth-provider'
import AiAssistant from '@/components/ai-assistant'
import { usePathname } from 'next/navigation'

function AiAssistantGate() {
  const { user } = useAuth()
  const pathname = usePathname()
  // hide on auth pages
  if (!user) return null
  if (pathname?.startsWith('/login') || pathname?.startsWith('/signup') || pathname?.startsWith('/verify')) return null
  return <AiAssistant />
}

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <AuthProvider>
        {children}
        <AiAssistantGate />
        <Toaster position="top-right" richColors closeButton theme="system" />
      </AuthProvider>
    </ThemeProvider>
  )
}
