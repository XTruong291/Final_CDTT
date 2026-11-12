import { useState } from 'react';
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/useAuthStore';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginAction = useAuthStore((state) => state.login);
  
  const [formData, setFormData] = useState({
    username: '', // Đổi từ email sang username để đúng với yêu cầu Backend
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Lấy đường dẫn gốc mà user muốn vào
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast.error('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    setIsLoading(true);
    
    try {
      // Gọi API đăng nhập thực tế
      const data = await authService.loginUser({
        username: formData.username,
        password: formData.password
      });

      const token = data.access_token || data.token;
      let userPayload = data.user;

      // Nếu Backend chỉ trả về token mà không có user info, gọi thêm API lấy /me
      if (!userPayload && token) {
        try {
          userPayload = await authService.getCurrentUser(token);
        } catch (meError) {
          console.warn("Could not fetch user /me. Using fallback.", meError);
          userPayload = { 
            username: formData.username, 
            role: 'user' 
          };
        }
      } else if (!userPayload) {
        // Fallback hoàn toàn nếu không có cả token và user
        userPayload = { 
          username: formData.username, 
          role: 'user' 
        };
      }

      // Lưu state vào Zustand & LocalStorage
      loginAction(userPayload, token);
      
      toast.success('Đăng nhập thành công!', { id: 'auth-login-success' });
      
      // Phân luồng điều hướng dựa trên role
      if (userPayload.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        const targetPath = (!from || from === '/login' || from === '/admin/login') ? '/' : from;
        navigate(targetPath, { replace: true });
      }
    } catch (error) {
      console.error("Login Error:", error.response); // Phải log ra để debug
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || "Sai thông tin đăng nhập hoặc lỗi máy chủ!";
      toast.error(typeof errorMsg === 'string' ? errorMsg : "Đăng nhập thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 p-6 sm:p-10">
      <div className="mb-10 text-center">
        <h2 className="font-serif text-[32px] leading-tight font-bold text-[#2B1D12]">Đăng nhập</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username Input */}
        <div className="relative group mb-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 z-10 transition-colors group-focus-within:text-[#C9A15A]">
            <User size={18} className="text-[#8A7A68] transition-colors group-focus-within:text-[#C9A15A]" />
          </div>
          <input
            type="text"
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="peer w-full rounded-[14px] border border-[#E5DCC8] bg-transparent py-3.5 pl-11 pr-4 text-[15px] font-semibold text-[#8A7A68] focus:text-[#C9A15A] transition-all focus:border-[#C9A15A] focus:bg-transparent focus:outline-none focus:ring-[4px] focus:ring-[#C9A15A]/25 placeholder-transparent"
            placeholder="Tên đăng nhập"
          />
          <label 
            htmlFor="username"
            className="absolute -translate-y-1/2 bg-transparent text-[#8A7A68] transition-all duration-200 pointer-events-none
            peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-10 peer-placeholder-shown:text-[15px] 
            peer-focus:top-0 peer-focus:left-4 peer-focus:text-[12px] peer-focus:font-semibold peer-focus:text-[#C9A15A] peer-focus:bg-[#FAF5EC] peer-focus:px-1
            top-0 left-4 text-[12px] font-semibold text-[#8A7A68] bg-[#FAF5EC] px-1"
          >
            Tên đăng nhập
          </label>
        </div>

        {/* Password Input */}
        <div className="relative group mb-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 z-10 transition-colors group-focus-within:text-[#C9A15A]">
            <Lock size={18} className="text-[#8A7A68] transition-colors group-focus-within:text-[#C9A15A]" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="peer w-full rounded-[14px] border border-[#E5DCC8] bg-transparent py-3.5 pl-11 pr-11 text-[15px] font-semibold text-[#8A7A68] focus:text-[#C9A15A] transition-all focus:border-[#C9A15A] focus:bg-transparent focus:outline-none focus:ring-[4px] focus:ring-[#C9A15A]/25 placeholder-transparent"
            placeholder="Mật khẩu"
          />
          <label 
            htmlFor="password"
            className="absolute -translate-y-1/2 bg-transparent text-[#8A7A68] transition-all duration-200 pointer-events-none
            peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-10 peer-placeholder-shown:text-[15px] 
            peer-focus:top-0 peer-focus:left-4 peer-focus:text-[12px] peer-focus:font-semibold peer-focus:text-[#C9A15A] peer-focus:bg-[#FAF5EC] peer-focus:px-1
            top-0 left-4 text-[12px] font-semibold text-[#8A7A68] bg-[#FAF5EC] px-1"
          >
            Mật khẩu
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#8A7A68] hover:text-[#2B1D12] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A15A] rounded-r-[14px] transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex w-full items-center justify-end px-2">
          <Link to="/forgot-password" className="text-[13px] font-semibold text-[#8A7A68] transition-colors hover:text-[#C9A15A] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A15A] rounded-[4px] px-1">
            Quên mật khẩu?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 flex w-full items-center justify-center rounded-[14px] bg-gradient-to-br from-[#3D2817] to-[#6B3F23] py-4 text-[17px] font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_20px_rgba(201,161,90,0.3)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#E8C77A] active:scale-98 disabled:scale-100 disabled:opacity-70 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
          {isLoading ? 'Đang xác thực...' : 'Đăng nhập'}
        </button>

        {/* Google Login */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5DCC8]"></div>
          </div>
          <div className="relative flex justify-center text-[12px] uppercase tracking-widest font-semibold">
            <span className="bg-[#FAF5EC] px-4 text-[#8A7A68]">Hoặc tiếp tục với</span>
          </div>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-[14px] border border-[#E5DCC8] bg-white py-3.5 text-[15px] font-semibold text-[#2B1D12] shadow-sm transition-all hover:bg-stone-50 hover:border-[#C9A15A]/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#C9A15A]/20"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
          Đăng nhập bằng Google
        </button>
      </form>

      <div className="mt-8 text-center text-[14.5px] text-[#8A7A68]">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="font-bold text-[#C9A15A] transition-colors hover:text-[#2B1D12] focus-visible:ring-2 focus-visible:ring-[#C9A15A] rounded">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}
