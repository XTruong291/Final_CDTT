import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import AdminAuthLayout from '../../components/admin/AdminAuthLayout'
import AdminPortalBadge from '../../components/admin/AdminPortalBadge'
import FormField from '../../components/common/FormField'
import AuthInput from '../../components/common/AuthInput'
import PasswordInput from '../../components/common/PasswordInput'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { validateRequiredPassword } from '../../utils/validators'

const initialForm = { username: '', password: '', rememberMe: true }

export default function AdminLogin() {
  const { loginAdmin } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    // Xoá lỗi field ngay khi người dùng bắt đầu sửa (real-time validation).
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const next = {
      username: form.username.trim() ? '' : 'Vui lòng nhập tên đăng nhập hoặc email.',
      password: validateRequiredPassword(form.password),
    }
    setErrors(next)
    return !next.username && !next.password
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      await loginAdmin(
        { username: form.username.trim(), password: form.password },
        { rememberMe: form.rememberMe },
      )
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setSubmitError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminAuthLayout>
      <div className="w-full max-w-[400px] mx-auto">
        <AdminPortalBadge />

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-[#A36D24]">
          Admin Portal
        </p>
        <h1 className="mt-2 font-serif text-[32px] font-bold text-gray-900 leading-tight">
          Chào mừng trở lại
        </h1>
        <p className="mt-2 text-sm text-gray-600">Đăng nhập để quản lý hệ thống E-SPIRIT.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          <FormField label="Tên đăng nhập / Email" htmlFor="admin-username" error={errors.username}>
            <AuthInput
              id="admin-username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="admin"
              icon={Mail}
              error={errors.username}
              value={form.username}
              onChange={(e) => setField('username', e.target.value)}
              disabled={submitting}
              className="bg-white/70 shadow-sm border-gray-200 focus-within:bg-white"
            />
          </FormField>

          <FormField label="Mật khẩu" htmlFor="admin-password" error={errors.password}>
            <PasswordInput
              id="admin-password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password}
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              disabled={submitting}
              className="bg-white/70 shadow-sm border-gray-200 focus-within:bg-white"
            />
          </FormField>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2.5 text-gray-700 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(e) => setField('rememberMe', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#2A1610] focus:ring-[#2A1610] transition-colors cursor-pointer"
              />
              <span className="group-hover:text-gray-900 transition-colors">Ghi nhớ đăng nhập</span>
            </label>
            <Link
              to="/admin/forgot-password"
              className="font-medium text-[#2A1610] hover:text-[#1A0D09] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CAA46A] rounded px-1 -mx-1"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {submitError && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-[#2A1610] py-3.5 text-sm font-semibold tracking-wide text-white shadow-md transition-all hover:bg-[#1A0D09] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CAA46A] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-md"
          >
            {submitting ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}
          </button>

          <p className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Lock size={14} className="text-[#CAA46A]" />
            Kết nối mã hóa an toàn · Dành cho Quản trị viên
          </p>
        </form>
      </div>
    </AdminAuthLayout>
  )
}
