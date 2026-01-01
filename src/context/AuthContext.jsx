import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/mock/authService'

const AuthContext = createContext(null)

const STORAGE_KEY = 'happyclass_auth_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore session (mock)
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) setUser(JSON.parse(raw))
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  async function login({ username, password }) {
    const u = await authService.login({ username, password })
    setUser(u)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    return u
  }

  function updateUser(patch) {
    setUser((prev) => {
      const next = prev ? { ...prev, ...patch } : prev
      if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  function logout() {
    setUser(null)
    window.localStorage.removeItem(STORAGE_KEY)
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
      updateUser,
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
