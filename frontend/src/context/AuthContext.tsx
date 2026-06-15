import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { loginUser, registerUser, googleAuth, fetchProfile } from '../api/auth'

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  phone_number: string | null
  is_email_verified: boolean
  date_joined: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (payload: { login_identifier: string; password: string }) => Promise<void>
  register: (payload: { email: string; phone_number?: string; password: string }) => Promise<boolean>
  googleLogin: (accessToken: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

const INACTIVITY_TIMEOUT = 5 * 60 * 1000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inactivityTimer, setInactivityTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer) clearTimeout(inactivityTimer)
    if (user) {
      const timer = setTimeout(() => {
        logout()
      }, INACTIVITY_TIMEOUT)
      setInactivityTimer(timer)
    }
  }, [user])

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach((event) => document.addEventListener(event, resetInactivityTimer))
    return () => {
      events.forEach((event) => document.removeEventListener(event, resetInactivityTimer))
      if (inactivityTimer) clearTimeout(inactivityTimer)
    }
  }, [resetInactivityTimer])

  const initAuth = useCallback(async () => {
    const accessToken = sessionStorage.getItem('access_token')
    if (!accessToken) {
      setLoading(false)
      return
    }

    try {
      const profile = await fetchProfile()
      setUser(profile)
    } catch {
      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('refresh_token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    initAuth()
  }, [initAuth])

  useEffect(() => {
    if (user) resetInactivityTimer()
  }, [user, resetInactivityTimer])

  const login = async (payload: { login_identifier: string; password: string }) => {
    setError(null)
    try {
      const data = await loginUser(payload)
      sessionStorage.setItem('access_token', data.tokens.access)
      sessionStorage.setItem('refresh_token', data.tokens.refresh)
      setUser(data.user)
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Login failed'
      setError(message)
      throw err
    }
  }

  const register = async (payload: { email: string; phone_number?: string; password: string }) => {
    setError(null)
    try {
      await registerUser(payload)
      return true
    } catch (err: any) {
      const errors = err?.response?.data?.errors
      if (errors && typeof errors === 'object') {
        setError(Object.values(errors)[0] as string)
      } else {
        setError(err?.response?.data?.error || 'Registration failed')
      }
      return false
    }
  }

  const googleLogin = async (accessToken: string) => {
    setError(null)
    try {
      const data = await googleAuth(accessToken)
      sessionStorage.setItem('access_token', data.tokens.access)
      sessionStorage.setItem('refresh_token', data.tokens.refresh)
      setUser(data.user)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Google authentication failed')
      throw err
    }
  }

  const logout = () => {
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('refresh_token')
    if (inactivityTimer) clearTimeout(inactivityTimer)
    setUser(null)
    window.location.href = '/'
  }

  const clearError = () => setError(null)

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, googleLogin, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}
