import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!username || !email || !password) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc!');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = {
        username: username,
        email: email,
        password: password
      };
      await authService.register(payload);
      
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login'); // Chuyển hướng sang trang đăng nhập
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Đăng ký thất bại. Vui lòng thử lại sau.';
      // Xử lý trường hợp detail là mảng các object (thường thấy trong FastAPI/Pydantic validation)
      if (Array.isArray(errorMsg)) {
        toast.error(errorMsg[0]?.msg || 'Dữ liệu không hợp lệ!');
      } else if (typeof errorMsg === 'string') {
        toast.error(errorMsg);
      } else {
        toast.error('Đăng ký thất bại!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStrength = (pass) => {
    if (!pass) return 0;
    let s = 1;
    if (pass.length >= 6 && /[a-z]/.test(pass) && /[0-9]/.test(pass)) s = 2;
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) s = 3;
    return s;
  };
  const strength = getStrength(password);
  const isMatch = confirmPassword && password === confirmPassword;

  return (
    <div className="w-full max-w-[440px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 p-6 sm:p-10">
      <div className="mb-10 text-center">
        <h2 className="font-serif text-[32px] leading-tight font-bold text-[#2B1D12]">Đăng ký</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username Input */}
        <div className="relative group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 z-10 transition-colors group-focus-within:text-[#C9A15A]">
            <User size={18} className="text-[#8A7A68] transition-colors group-focus-within:text-[#C9A15A]" />
          </div>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="peer w-full rounded-[14px] border border-[#E5DCC8] bg-transparent py-3.5 pl-11 pr-4 text-[15px] font-semibold text-[#8A7A68] focus:text-[#C9A15A] transition-all focus:border-[#C9A15A] focus:bg-transparent focus:outline-none focus:ring-[4px] focus:ring-[#C9A15A]/25 placeholder-transparent"
            placeholder="Tên người dùng"
          />
          <label 
            htmlFor="username"
            className="absolute -translate-y-1/2 bg-transparent text-[#8A7A68] transition-all duration-200 pointer-events-none
            peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-10 peer-placeholder-shown:text-[15px] 
            peer-focus:top-0 peer-focus:left-4 peer-focus:text-[12px] peer-focus:font-semibold peer-focus:text-[#C9A15A] peer-focus:bg-[#FAF5EC] peer-focus:px-1
            top-0 left-4 text-[12px] font-semibold text-[#8A7A68] bg-[#FAF5EC] px-1"
          >
            Tên người dùng
          </label>
        </div>

        {/* Email Input */}
        <div className="relative group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 z-10 transition-colors group-focus-within:text-[#C9A15A]">
            <Mail size={18} className="text-[#8A7A68] transition-colors group-focus-within:text-[#C9A15A]" />
          </div>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="peer w-full rounded-[14px] border border-[#E5DCC8] bg-transparent py-3.5 pl-11 pr-4 text-[15px] font-semibold text-[#8A7A68] focus:text-[#C9A15A] transition-all focus:border-[#C9A15A] focus:bg-transparent focus:outline-none focus:ring-[4px] focus:ring-[#C9A15A]/25 placeholder-transparent"
            placeholder="Email hoặc Số điện thoại"
          />
          <label 
            htmlFor="email"
            className="absolute -translate-y-1/2 bg-transparent text-[#8A7A68] transition-all duration-200 pointer-events-none
            peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-10 peer-placeholder-shown:text-[15px] 
            peer-focus:top-0 peer-focus:left-4 peer-focus:text-[12px] peer-focus:font-semibold peer-focus:text-[#C9A15A] peer-focus:bg-[#FAF5EC] peer-focus:px-1
            top-0 left-4 text-[12px] font-semibold text-[#8A7A68] bg-[#FAF5EC] px-1"
          >
            Email hoặc Số điện thoại
          </label>
        </div>

        {/* Password Input */}
        <div className="relative group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 z-10 transition-colors group-focus-within:text-[#C9A15A]">
            <Lock size={18} className="text-[#8A7A68] transition-colors group-focus-within:text-[#C9A15A]" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {/* Mật khẩu Strength */}
          <div className="flex gap-1 mt-2 h-1 px-1">
            {[1, 2, 3].map((level) => (
              <div 
                key={level} 
                className={`flex-1 rounded-sm transition-colors duration-300 ${
                  strength >= level 
                    ? (strength === 1 ? 'bg-red-500' : strength === 2 ? 'bg-orange-500' : 'bg-green-600') 
                    : 'bg-[#E5DCC8]'
                }`}
              />
            ))}
          </div>

        {/* Confirm Password Input */}
        <div>
          <div className="relative group">
            <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 z-10 transition-colors ${confirmPassword && password !== confirmPassword ? 'text-red-500' : 'group-focus-within:text-[#C9A15A]'}`}>
              <Lock size={18} className={`${confirmPassword && password !== confirmPassword ? 'text-red-400' : 'text-[#8A7A68]'} transition-colors group-focus-within:text-[#C9A15A]`} />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`peer w-full rounded-[14px] border ${confirmPassword && password !== confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : isMatch ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20' : 'border-[#E5DCC8] focus:border-[#C9A15A] focus:ring-[#C9A15A]/25'} bg-transparent py-3.5 pl-11 pr-11 text-[15px] font-semibold text-[#8A7A68] focus:text-[#C9A15A] transition-all focus:bg-transparent focus:outline-none focus:ring-[4px] placeholder-transparent`}
              placeholder="Xác nhận mật khẩu"
            />
            <label 
              htmlFor="confirmPassword"
              className={`absolute -translate-y-1/2 bg-transparent transition-all duration-200 pointer-events-none
              peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-10 peer-placeholder-shown:text-[15px] 
              peer-focus:top-0 peer-focus:left-4 peer-focus:text-[12px] peer-focus:font-semibold peer-focus:bg-[#FAF5EC] peer-focus:px-1
              top-0 left-4 text-[12px] font-semibold bg-[#FAF5EC] px-1
              ${confirmPassword && password !== confirmPassword ? 'text-red-500 peer-focus:text-red-500' : isMatch ? 'text-green-600 peer-focus:text-green-600' : 'text-[#8A7A68] peer-focus:text-[#C9A15A]'}`}
            >
              Xác nhận mật khẩu
            </label>
            
            {/* Match Icon / Toggle visibility */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              {isMatch ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-[#8A7A68] hover:text-[#2B1D12] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A15A] rounded-[4px] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            </div>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="mt-2 text-[13px] font-medium text-red-500 ml-1">Mật khẩu xác nhận không khớp.</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-8 flex w-full items-center justify-center rounded-[14px] bg-gradient-to-br from-[#3D2817] to-[#6B3F23] py-4 text-[17px] font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_20px_rgba(201,161,90,0.3)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#E8C77A] active:scale-98 disabled:scale-100 disabled:opacity-70 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
          {isLoading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
        </button>
      </form>

      <div className="mt-8 text-center text-[14.5px] text-[#8A7A68]">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-bold text-[#C9A15A] transition-colors hover:text-[#2B1D12] focus-visible:ring-2 focus-visible:ring-[#C9A15A] rounded">
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
