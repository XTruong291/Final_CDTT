import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authService } from '@/features/authentication/shared/services/auth.service'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Account {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  token: string
}

interface LoginOptions {
  asAdmin?: boolean
  rememberMe?: boolean
}

interface AuthContextValue {
  user: Account | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (credentials: { email: string; password: string }, options?: LoginOptions) => Promise<Account>
  register: (payload: { name?: string; email: string; password: string }) => Promise<Account>
  logout: () => void
  updateProfile: (payload: Partial<Account>) => Promise<Account>
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Persistence helpers ──────────────────────────────────────────────────────

const STORAGE_KEY = 'espirit_auth'

// "Ghi nhớ đăng nhập" → localStorage (tồn tại qua phiên trình duyệt).
// Bỏ chọn → sessionStorage (mất khi đóng tab), vẫn giữ đăng nhập khi F5.
function persistAccount(account: Account, rememberMe: boolean): void {
  const target = rememberMe ? localStorage : sessionStorage
  const other = rememberMe ? sessionStorage : localStorage
  other.removeItem(STORAGE_KEY)
  target.setItem(STORAGE_KEY, JSON.stringify(account))
}

function readPersistedAccount(): Account | null {
  const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Account
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    return null
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(readPersistedAccount())
    setLoading(false)
  }, [])

  const login = async (
    credentials: { email: string; password: string },
    { asAdmin = false, rememberMe = true }: LoginOptions = {},
  ): Promise<Account> => {
    const account = asAdmin
      ? await authService.adminLogin(credentials)
      : await authService.login(credentials)
    setUser(account)
    persistAccount(account, rememberMe)
    return account
  }

  const register = async (payload: { name?: string; email: string; password: string }): Promise<Account> => {
    const account = await authService.register(payload)
    setUser(account)
    persistAccount(account, true)
    return account
  }

  const logout = (): void => {
    const wasAdmin = user?.role === 'admin'
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    if (wasAdmin) authService.logoutAdmin().catch(() => {})
  }

  const updateProfile = async (payload: Partial<Account>): Promise<Account> => {
    const updated = await authService.updateProfile(user!.id, payload)
    setUser(updated)
    persistAccount(updated, !!localStorage.getItem(STORAGE_KEY))
    return updated
  }

  const value: AuthContextValue = {
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

// ─── Hook (re-exported for convenience from provider) ─────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>')
  return ctx
}
