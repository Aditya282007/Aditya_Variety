import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { authAPI } from '../services/api'

interface User {
  _id: string
  name: string
  phone: string
  role: 'customer' | 'admin'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (phone: string, password: string) => Promise<void>
  register: (name: string, phone: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: { name?: string; phone?: string; password?: string }) => Promise<void>
  refreshUser: () => Promise<void>
}

function toUser(data: { _id: string; name: string; phone: string; role: string }): User {
  return {
    _id: data._id,
    name: data.name,
    phone: data.phone,
    role: data.role as 'customer' | 'admin',
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const refreshUser = useCallback(async () => {
    try {
      const res = await authAPI.getMe()
      setUser(toUser(res.data))
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser)
          setUser(toUser(parsed))
          await refreshUser()
        } catch {
          localStorage.removeItem('user')
          setUser(null)
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
      setInitialized(true)
    }
    initAuth()
  }, [refreshUser])

  const login = async (phone: string, password: string) => {
    const res = await authAPI.login({ phone, password })
    const userData = toUser(res.data)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const register = async (name: string, phone: string, password: string) => {
    const res = await authAPI.register({ name, phone, password })
    const userData = toUser(res.data)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = async () => {
    await authAPI.logout()
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateProfile = async (data: { name?: string; phone?: string; password?: string }) => {
    const res = await authAPI.updateProfile(data)
    const userData = toUser(res.data)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}