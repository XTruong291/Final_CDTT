import { useEffect } from 'react'
import AppRoutes from './routes/AppRoutes'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/useAuthStore'
import { Loader2 } from 'lucide-react'

export default function App() {
  const { initializeAuth, isCheckingAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FAF5EC]">
        <Loader2 className="h-8 w-8 animate-spin text-[#CAA46A]" />
      </div>
    )
  }

  return (
    <>
      {/* Khởi tạo Toaster ở Root để gọi toast() ở bất kỳ đâu */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#ffffff',
            color: '#333333',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid #f3f4f6'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <AppRoutes />
    </>
  )
}
