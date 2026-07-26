'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const AuthContext = createContext({ user: null, loading: true, login: async () => {}, register: async () => {}, logout: async () => {}, refresh: async () => {} })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/auth/me', { credentials: 'include' })
      if (r.ok) { const d = await r.json(); setUser(d.user || null) }
      else setUser(null)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const login = async (email, password) => {
    const r = await fetch('/api/auth/login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error || 'Login failed')
    setUser(d.user)
    return d.user
  }

  const register = async (name, email, password) => {
    const r = await fetch('/api/auth/register', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error || 'Signup failed')
    setUser(d.user)
    return d.user
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
