import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

/**
 * Cung cấp trạng thái đăng nhập cho toàn app.
 * role: 'user' | 'admin' | null
 * Trong thực tế, token nên được lưu ở httpOnly cookie thay vì localStorage.
 * Ở đây dùng localStorage để đơn giản hoá cho môi trường demo/dev.
 */
const STORAGE_KEY = 'espirit_auth'

// "Ghi nhớ đăng nhập" -> lưu ở localStorage (tồn tại qua các phiên trình duyệt).
// Bỏ chọn -> lưu ở sessionStorage (mất khi đóng tab), vẫn giữ đăng nhập khi F5.
function persistAccount(account, rememberMe) {
  const target = rememberMe ? localStorage : sessionStorage
  const other = rememberMe ? sessionStorage : localStorage
  other.removeItem(STORAGE_KEY)
  target.setItem(STORAGE_KEY, JSON.stringify(account))
}

function readPersistedAccount() {
  const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(readPersistedAccount())
    setLoading(false)
  }, [])

  const login = async (credentials, { asAdmin = false, rememberMe = true } = {}) => {
    const account = asAdmin
      ? await authService.adminLogin(credentials)
      : await authService.login(credentials)
    setUser(account)
    persistAccount(account, rememberMe)
    const token = account?.access_token || account?.token
    if (token) {
      localStorage.setItem('access_token', token)
      localStorage.setItem('user_info', JSON.stringify(account))
    }
    return account
  }

  const register = async (payload) => {
    const account = await authService.register(payload)
    setUser(account)
    persistAccount(account, true)
    const token = account?.access_token || account?.token
    if (token) {
      localStorage.setItem('access_token', token)
      localStorage.setItem('user_info', JSON.stringify(account))
    }
    return account
  }

  const logout = () => {
    const wasAdmin = user?.role === 'admin'
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_info')
    if (wasAdmin) authService.logoutAdmin().catch(() => {})
  }

  const updateProfile = async (payload) => {
    const updated = await authService.updateProfile(user.id, payload)
    setUser(updated)
    persistAccount(updated, !!localStorage.getItem(STORAGE_KEY))
    return updated
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>')
  return ctx
}
