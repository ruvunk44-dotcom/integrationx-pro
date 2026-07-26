'use client'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/components/auth-provider'

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <AuthProvider>
        {children}
        <Toaster position="top-right" richColors closeButton theme="system" />
      </AuthProvider>
    </ThemeProvider>
  )
}
