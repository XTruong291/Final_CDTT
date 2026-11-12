import { Check } from 'lucide-react'
import { getPasswordStrength } from '../../utils/validators'

const BAR_COLORS = {
  1: 'bg-red-400',
  2: 'bg-amber-400',
  3: 'bg-green-500',
}

export default function PasswordStrengthMeter({ password }) {
  if (!password) return null
  const strength = getPasswordStrength(password)

  const requirements = [
    { label: 'Tối thiểu 8 ký tự', met: password.length >= 8 },
    { label: 'Có chữ hoa và chữ thường', met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { label: 'Có ít nhất 1 chữ số', met: /\d/.test(password) },
  ]

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex h-1.5 flex-1 gap-1">
          {[1, 2, 3].map((level) => (
            <div
              key={level}
              className={`h-full flex-1 rounded-full transition-colors ${
                level <= strength.level ? BAR_COLORS[strength.level] : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-gray-500">{strength.label}</span>
      </div>
      <ul className="space-y-1">
        {requirements.map((r) => (
          <li key={r.label} className={`flex items-center gap-1.5 text-xs ${r.met ? 'text-green-600' : 'text-gray-400'}`}>
            <Check size={13} className={r.met ? 'opacity-100' : 'opacity-30'} />
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
