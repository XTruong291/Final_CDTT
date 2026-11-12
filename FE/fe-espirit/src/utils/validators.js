// Các hàm validate dùng chung cho form xác thực (login/forgot/reset password).
// Trả về chuỗi lỗi (tiếng Việt) hoặc '' nếu hợp lệ, để component tự quyết định cách hiển thị.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(value) {
  if (!value || !value.trim()) return 'Vui lòng nhập email.'
  if (!EMAIL_REGEX.test(value.trim())) return 'Email không hợp lệ.'
  return ''
}

export function validateRequiredPassword(value) {
  if (!value) return 'Vui lòng nhập mật khẩu.'
  return ''
}

export function validateNewPassword(value) {
  if (!value) return 'Vui lòng nhập mật khẩu.'
  if (value.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự.'
  return ''
}

export function validateConfirmPassword(password, confirm) {
  if (!confirm) return 'Vui lòng nhập lại mật khẩu.'
  if (password !== confirm) return 'Mật khẩu xác nhận không khớp.'
  return ''
}

/**
 * Ước lượng độ mạnh mật khẩu đơn giản (0-4) để hiển thị thanh strength indicator.
 * Không thay thế cho việc validate bắt buộc ở trên.
 */
export function getPasswordStrength(value = '') {
  let score = 0
  if (value.length >= 8) score++
  if (value.length >= 12) score++
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++
  if (/\d/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++

  if (score <= 1) return { level: 1, label: 'Yếu' }
  if (score <= 3) return { level: 2, label: 'Trung bình' }
  return { level: 3, label: 'Mạnh' }
}