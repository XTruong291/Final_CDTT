import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loading from './Loading'

/**
 * requireRole: 'user' | 'admin' | undefined (undefined = chỉ cần đăng nhập, không phân biệt role)
 */
export default function PrivateRoute({ requireRole }) {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loading label="Đang xác thực..." />

  if (!isAuthenticated) {
    const loginPath = requireRole === 'admin' ? '/admin/login' : '/login'
    return <Navigate to={loginPath} replace state={{ from: location }} />
  }

  if (requireRole && user.role !== requireRole) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
