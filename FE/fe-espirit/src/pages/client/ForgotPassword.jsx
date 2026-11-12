import { useState } from 'react';
import { Mail, KeyRound, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập địa chỉ email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email không hợp lệ');
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      toast.success('Mã xác nhận đã được gửi (Giả lập)');
    }, 1000);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Mã OTP phải gồm 6 chữ số');
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
      toast.success('Xác thực thành công (Giả lập)');
    }, 1000);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Mật khẩu không khớp');
      return;
    }
    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Đổi mật khẩu thành công! (Mock)');
      navigate('/login');
    }, 1500);
  };

  const isMatch = confirmPassword && password === confirmPassword;

  return (
    <div className="w-full max-w-[440px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 p-6 sm:p-10">
      
      {/* Bước 1: Nhập Email */}
      {step === 1 && (
        <>
          <div className="mb-10 text-center animate-in fade-in slide-in-from-left-4 duration-300">
            <h2 className="font-serif text-[32px] leading-tight font-bold text-[#2B1D12] mb-3">Quên mật khẩu?</h2>
            <p className="text-[14px] text-[#8A7A68]">
              Nhập địa chỉ email của bạn, chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu.
            </p>
          </div>

          <form onSubmit={handleSendEmail} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
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
                placeholder="Email của bạn"
              />
              <label 
                htmlFor="email"
                className="absolute -translate-y-1/2 bg-transparent text-[#8A7A68] transition-all duration-200 pointer-events-none
                peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-10 peer-placeholder-shown:text-[15px] 
                peer-focus:top-0 peer-focus:left-4 peer-focus:text-[12px] peer-focus:font-semibold peer-focus:text-[#C9A15A] peer-focus:bg-[#FAF5EC] peer-focus:px-1
                top-0 left-4 text-[12px] font-semibold text-[#8A7A68] bg-[#FAF5EC] px-1"
              >
                Email của bạn
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex w-full items-center justify-center rounded-[14px] bg-[#7A1E24] py-4 text-[16px] font-bold text-white transition-all duration-200 hover:bg-[#5D161B] hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7A1E24]/30 active:scale-[0.98] disabled:scale-100 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
              {isLoading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
            </button>
            
            <div className="text-center mt-6">
              <Link to="/login" className="text-[14px] font-medium text-[#8A7A68] hover:text-[#C9A15A] transition-colors">
                Quay lại Đăng nhập
              </Link>
            </div>
          </form>
        </>
      )}

      {/* Bước 2: Nhập OTP */}
      {step === 2 && (
        <>
          <div className="mb-10 text-center animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="font-serif text-[32px] leading-tight font-bold text-[#2B1D12] mb-3">Xác thực Email</h2>
            <p className="text-[14px] text-[#8A7A68]">
              Nhập mã gồm 6 chữ số đã được gửi đến <span className="font-bold text-[#2B1D12]">{email}</span>.
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* OTP Input */}
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 z-10 transition-colors group-focus-within:text-[#C9A15A]">
                <KeyRound size={18} className="text-[#8A7A68] transition-colors group-focus-within:text-[#C9A15A]" />
              </div>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 6) setOtp(val);
                }}
                className="peer w-full rounded-[14px] border border-[#E5DCC8] bg-transparent py-3.5 pl-11 pr-4 text-center text-[20px] tracking-[0.5em] font-bold text-[#8A7A68] focus:text-[#C9A15A] transition-all focus:border-[#C9A15A] focus:bg-transparent focus:outline-none focus:ring-[4px] focus:ring-[#C9A15A]/25 placeholder-transparent"
                placeholder="000000"
              />
              <label 
                htmlFor="otp"
                className="absolute -translate-y-1/2 bg-transparent text-[#8A7A68] transition-all duration-200 pointer-events-none
                peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-10 peer-placeholder-shown:text-[15px] 
                peer-focus:top-0 peer-focus:left-4 peer-focus:text-[12px] peer-focus:font-semibold peer-focus:text-[#C9A15A] peer-focus:bg-[#FAF5EC] peer-focus:px-1
                top-0 left-4 text-[12px] font-semibold text-[#8A7A68] bg-[#FAF5EC] px-1"
              >
                Mã xác nhận (6 số)
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="mt-6 flex w-full items-center justify-center rounded-[14px] bg-[#7A1E24] py-4 text-[16px] font-bold text-white transition-all duration-200 hover:bg-[#5D161B] hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7A1E24]/30 active:scale-[0.98] disabled:scale-100 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
              {isLoading ? 'Đang xác thực...' : 'Xác nhận mã'}
            </button>
            
            <div className="text-center mt-6">
              <button 
                type="button" 
                className="text-[13px] font-medium text-[#8A7A68] hover:text-[#C9A15A] transition-colors"
                onClick={() => {
                  toast.success('Đã gửi lại mã xác nhận (Mock)');
                }}
              >
                Chưa nhận được mã? Gửi lại
              </button>
            </div>
          </form>
        </>
      )}

      {/* Bước 3: Đổi Mật Khẩu */}
      {step === 3 && (
        <>
          <div className="mb-10 text-center animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="font-serif text-[32px] leading-tight font-bold text-[#2B1D12] mb-3">Tạo mật khẩu mới</h2>
            <p className="text-[14px] text-[#8A7A68]">
              Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
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
                placeholder="Mật khẩu mới"
              />
              <label 
                htmlFor="password"
                className="absolute -translate-y-1/2 bg-transparent text-[#8A7A68] transition-all duration-200 pointer-events-none
                peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-10 peer-placeholder-shown:text-[15px] 
                peer-focus:top-0 peer-focus:left-4 peer-focus:text-[12px] peer-focus:font-semibold peer-focus:text-[#C9A15A] peer-focus:bg-[#FAF5EC] peer-focus:px-1
                top-0 left-4 text-[12px] font-semibold text-[#8A7A68] bg-[#FAF5EC] px-1"
              >
                Mật khẩu mới
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#8A7A68] hover:text-[#2B1D12] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A15A] rounded-r-[14px] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex w-full items-center justify-center rounded-[14px] bg-[#7A1E24] py-4 text-[16px] font-bold text-white transition-all duration-200 hover:bg-[#5D161B] hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7A1E24]/30 active:scale-[0.98] disabled:scale-100 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
              {isLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </>
      )}

    </div>
  );
}
