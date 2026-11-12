// Component dùng chung: LoadingSpinner
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-maroon-600"></div>
    </div>
  )
}
