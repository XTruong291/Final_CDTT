export default function AuthInput({ icon: Icon, error, className = '', ...props }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border bg-white px-4 py-3 transition focus-within:ring-2 ${
        error
          ? 'border-red-300 focus-within:ring-red-100'
          : 'border-gray-200 focus-within:border-primary-400 focus-within:ring-primary-100'
      } ${className}`}
    >
      {Icon && <Icon size={18} className="shrink-0 text-gray-400" aria-hidden="true" />}
      <input
        {...props}
        aria-invalid={!!error}
        className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
      />
    </div>
  )
}
