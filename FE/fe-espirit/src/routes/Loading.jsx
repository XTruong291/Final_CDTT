import LoadingSpinner from '../components/common/LoadingSpinner'

export default function Loading({ label = 'Đang tải...' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf5ec]">
      <LoadingSpinner />
      {label && <p className="mt-4 text-sm font-medium text-primary-700 animate-pulse">{label}</p>}
    </div>
  )
}
