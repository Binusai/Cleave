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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const initAuth = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token')
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

  const login = async (payload: { login_identifier: string; password: string }) => {
    setError(null)
    try {
      const data = await loginUser(payload)
      sessionStorage.setItem('access_token', data.tokens.access)
      sessionStorage.setItem('refresh_token', data.tokens.refresh)
      setUser(data.user)
    } catch (err: unknown) {
      const message =
        err instanceof Error && 'response' in err
          ? (err as { response: { data: { error: string } } }).response.data.error
          : 'Login failed'
      setError(message)
      throw err
    }
  }

  const register = async (payload: { email: string; phone_number?: string; password: string }) => {
    setError(null)
    try {
      await registerUser(payload)
      return true
    } catch (err: unknown) {
      const message =
        err instanceof Error && 'response' in err
          ? (err as { response: { data: { errors: Record<string, string> } } }).response.data.errors
          : 'Registration failed'
      if (typeof message === 'object') {
        setError(Object.values(message)[0] as string)
      } else {
        setError(message as string)
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
    } catch (err: unknown) {
      const message =
        err instanceof Error && 'response' in err
          ? (err as { response: { data: { error: string } } }).response.data.error
          : 'Google authentication failed'
      setError(message)
      throw err
    }
  }

  const logout = () => {
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('refresh_token')
    setUser(null)
  }

  const clearError = () => setError(null)

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, googleLogin, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  )
}