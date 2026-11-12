import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  // Lấy trạng thái auth từ hook dùng riêng cho Admin
  const { isAuthenticated, isLoading } = useAdminAuth();

  // Hiển thị trạng thái loading chờ check token
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#FAF5EC]">
        <Loader2 size={40} className="animate-spin text-[#2A1610]" />
      </div>
    );
  }

  // Chuyển hướng nếu chưa đăng nhập hoặc cho phép truy cập qua Outlet
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
