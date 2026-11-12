import { ShieldCheck } from 'lucide-react'

export default function AdminPortalBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-primary-700">
      <ShieldCheck size={14} />
      Khu vực quản trị
    </span>
  )
}
