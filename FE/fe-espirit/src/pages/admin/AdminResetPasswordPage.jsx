import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, CheckCircle2, ArrowLeft } from 'lucide-react'
import AdminAuthLayout from '../../components/admin/AdminAuthLayout'
import AdminPortalBadge from '../../components/admin/AdminPortalBadge'
import FormField from '../../components/common/FormField'
import PasswordInput from '../../components/common/PasswordInput'
import PasswordStrengthMeter from '../../components/common/PasswordStrengthMeter'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { validateNewPassword, validateConfirmPassword } from '../../utils/validators'

// Không có mockup thiết kế riêng cho màn hình này - xây dựng theo đúng ngôn ngữ thị giác
// (bố cục, màu sắc, khoảng cách) của màn hình Đăng nhập / Quên mật khẩu đã cung cấp.
export default function AdminResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const { resetPassword } = useAdminAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const next = {
      password: validateNewPassword(form.password),
      confirm: validateConfirmPassword(form.password, form.confirm),
    }
    setErrors(next)
    return !next.password && !next.confirm
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (!token) {
      setSubmitError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.')
      return
    }
    if (!validate()) return

    setSubmitting(true)
    try {
      await resetPassword({ token, password: form.password })
      setSuccess(true)
      setTimeout(() => navigate('/admin/login', { replace: true }), 2000)
    } catch (err) {
      setSubmitError(err.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <AdminAuthLayout>
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 size={26} className="text-green-600" />
          </span>
          <h1 className="mt-5 font-serif text-2xl font-bold text-gray-900">Đặt lại mật khẩu thành công</h1>
          <p className="mt-2 max-w-xs text-sm text-gray-500">
            Đang chuyển bạn về trang đăng nhập...
          </p>
        </div>
      </AdminAuthLayout>
    )
  }

  return (
    <AdminAuthLayout>
      <AdminPortalBadge />

      <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-primary-600">
        Admin portal
      </p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-gray-900">Đặt lại mật khẩu</h1>
      <p className="mt-2 text-sm text-gray-500">Tạo mật khẩu mới cho tài khoản quản trị của bạn.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
        {!token && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Không tìm thấy mã đặt lại mật khẩu trong đường dẫn. Vui lòng dùng liên kết mới nhất được gửi qua email.
          </p>
        )}

        <FormField label="Mật khẩu mới" htmlFor="new-password" error={errors.password}>
          <PasswordInput
            id="new-password"
            name="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.password}
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            disabled={submitting}
          />
          <PasswordStrengthMeter password={form.password} />
        </FormField>

        <FormField label="Xác nhận mật khẩu" htmlFor="confirm-password" error={errors.confirm}>
          <PasswordInput
            id="confirm-password"
            name="confirm"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.confirm}
            value={form.confirm}
            onChange={(e) => setField('confirm', e.target.value)}
            disabled={submitting}
          />
        </FormField>

        {submitError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-maroon-600 py-3.5 text-sm font-semibold text-white transition hover:bg-maroon-700 disabled:opacity-60"
        >
          {submitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
        </button>

        <Link
          to="/admin/login"
          className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={15} /> Quay lại đăng nhập
        </Link>
      </form>
    </AdminAuthLayout>
  )
}
