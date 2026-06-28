import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginRequest, register as registerRequest } from '../services/auth.service'
import { setAuthToken, setLogoutHandler } from '../api/client'
import { useQueryClient } from '@tanstack/react-query'

type Credentials = { email: string; password: string }

type AuthContextType = {
  token: string | null
  user: any | null
  isAuthenticated: boolean
  loading: boolean
  login: (cred: Credentials) => Promise<void>
  register: (cred: Credentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => {
    const existing = localStorage.getItem('auth_token')
    if (existing) {
      setToken(existing)
      setAuthToken(existing)
      // optionally decode user from token
    }
    setLoading(false)
    // register logout handler for 401 responses
    setLogoutHandler(() => {
      // clear local state and redirect to login
      setToken(null)
      setUser(null)
      setAuthToken(null)
      try {
        queryClient.clear()
      } catch (e) {
        // ignore
      }
      navigate('/login')
    })
  }, [])

  const login = async (cred: Credentials) => {
    try {
      const data = await loginRequest(cred)

      if (!data.access_token) {
        throw new Error('Invalid response from server: missing token')
      }

      const tokenValue = String(data.access_token)
      setToken(tokenValue)
      setAuthToken(tokenValue)
      setUser((data as any).user ?? null)
      navigate('/dashboard')
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw new Error('Invalid email or password')
      }
      throw err
    }
  }

  const register = async (cred: Credentials) => {
    try {
      const data = await registerRequest(cred)

      const maybeToken = (data &&
        (data.token || data.access_token || data.accessToken || data.jwt || data.data?.access_token || data.data?.token)) ?? null

      if (!maybeToken) {
        throw new Error('Invalid response from server: missing token')
      }

      const tokenValue = String(maybeToken)
      setToken(tokenValue)
      setAuthToken(tokenValue)
      setUser((data as any).user ?? null)
      navigate('/dashboard')
    } catch (err: any) {
      if (err?.response?.status === 400) {
        // bubble validation errors to the caller
        throw err
      }
      throw err
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setAuthToken(null)
    try {
      queryClient.clear()
    } catch (e) {
      // ignore
    }
    navigate('/login')
  }

  if (loading) {
    // Full page loading screen while auth state is restored
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-slate-700">Loading...</div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
