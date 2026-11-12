import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function PasswordInput({ error, showLockIcon = true, className = '', ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border bg-white px-4 py-3 transition focus-within:ring-2 ${
        error
          ? 'border-red-300 focus-within:ring-red-100'
          : 'border-gray-200 focus-within:border-primary-400 focus-within:ring-primary-100'
      } ${className}`}
    >
      {showLockIcon && <Lock size={18} className="shrink-0 text-gray-400" aria-hidden="true" />}
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        aria-invalid={!!error}
        className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        aria-pressed={visible}
        className="shrink-0 text-gray-400 hover:text-gray-600"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}
