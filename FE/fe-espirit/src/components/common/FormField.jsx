/**
 * Wrapper cho 1 trường form: label + input (children) + thông báo lỗi.
 * Không tự render input để có thể tái sử dụng với AuthInput, PasswordInput hoặc input thường.
 */
export default function FormField({ label, htmlFor, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
