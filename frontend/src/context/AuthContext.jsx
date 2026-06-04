import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    authApi.me().then(setUser).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const { access_token } = await authApi.login(email, password)
    localStorage.setItem('token', access_token)
    const me = await authApi.me()
    setUser(me)
  }

  const register = async (email, password) => {
    const { access_token } = await authApi.register(email, password)
    localStorage.setItem('token', access_token)
    const me = await authApi.me()
    setUser(me)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
