import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'

/**
 * Hook chuyên biệt cho khu vực Admin, xây trên nền useAuth() dùng chung.
 * Giữ UI components không phải biết chi tiết "asAdmin: true" hay cấu trúc AuthContext bên dưới -
 * đồng thời để lại chỗ mở rộng riêng cho admin (ví dụ: quyền hạn, audit log...) sau này.
 */
export function useAdminAuth() {
  const { user, isAuthenticated, isAdmin, loading, login, logout } = useAuth()

  const loginAdmin = (credentials, options) => login(credentials, { ...options, asAdmin: true })

  const forgotPassword = (email) => authService.forgotAdminPassword(email)

  const resetPassword = ({ token, password }) => authService.resetAdminPassword({ token, password })

  return {
    admin: isAdmin ? user : null,
    isAuthenticated: isAuthenticated && isAdmin,
    isLoading: loading,
    loginAdmin,
    forgotPassword,
    resetPassword,
    logoutAdmin: logout,
  }
}