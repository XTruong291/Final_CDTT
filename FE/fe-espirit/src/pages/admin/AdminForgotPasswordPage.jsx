import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MailCheck, Info, ArrowLeft } from 'lucide-react'
import AdminAuthLayout from '../../components/admin/AdminAuthLayout'
import AdminPortalBadge from '../../components/admin/AdminPortalBadge'
import FormField from '../../components/common/FormField'
import AuthInput from '../../components/common/AuthInput'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { validateEmail } from '../../utils/validators'

export default function AdminForgotPassword() {
  const { forgotPassword } = useAdminAuth()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    const err = validateEmail(email)
    setError(err)
    if (err) return

    setSubmitting(true)
    try {
      await forgotPassword(email.trim())
      setSubmitted(true)
    } catch (err2) {
      setSubmitError(err2.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      await forgotPassword(email.trim())
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <AdminAuthLayout>
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
            <MailCheck size={26} className="text-primary-600" />
          </span>
          <h1 className="mt-5 font-serif text-2xl font-bold text-gray-900">Kiểm tra hộp thư của bạn</h1>
          <p className="mt-2 max-w-xs text-sm text-gray-500">
            Nếu email được liên kết với tài khoản quản trị, bạn sẽ nhận được hướng dẫn khôi phục mật khẩu.
          </p>

          <p className="mt-5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700">
            {email}
          </p>

          <p className="mt-5 text-sm text-gray-500">
            Chưa nhận được email?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={submitting}
              className="font-medium text-maroon-600 hover:underline disabled:opacity-60"
            >
              {submitting ? 'Đang gửi lại...' : 'Gửi lại'}
            </button>
          </p>

          <Link
            to="/admin/login"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={15} /> Quay lại đăng nhập
          </Link>
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
      <h1 className="mt-1 font-serif text-3xl font-bold text-gray-900">Khôi phục quyền truy cập</h1>
      <p className="mt-2 text-sm text-gray-500">
        Nhập email quản trị của bạn. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
        <FormField label="Email quản trị" htmlFor="admin-forgot-email" error={error}>
          <AuthInput
            id="admin-forgot-email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="admin@espirit.vn"
            icon={Mail}
            error={error}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError('')
            }}
            disabled={submitting}
          />
        </FormField>

        <div className="flex items-start gap-2.5 rounded-xl bg-primary-50/60 px-3.5 py-3 text-sm text-gray-500">
          <Info size={16} className="mt-0.5 shrink-0 text-primary-500" />
          Vì lý do bảo mật, hệ thống không tiết lộ email này có tồn tại hay không.
        </div>

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
          {submitting ? 'Đang gửi...' : 'Gửi liên kết khôi phục'}
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
