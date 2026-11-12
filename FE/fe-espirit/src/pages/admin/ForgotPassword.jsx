import { useState } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Mô phỏng API delay 1.5s
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#FAF5EC] overflow-hidden">
      
      {/* Background Hoa Văn Trống Đồng */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #2A1610 2px, transparent 2px)',
          backgroundSize: '40px 40px'
        }}
      ></div>
      
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-[800px] h-[800px] animate-[spin_120s_linear_infinite]">
          <circle cx="100" cy="100" r="90" fill="none" stroke="#2A1610" strokeWidth="2" strokeDasharray="10 5" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="#2A1610" strokeWidth="1" />
          <polygon points="100,20 120,80 180,100 120,120 100,180 80,120 20,100 80,80" fill="none" stroke="#2A1610" strokeWidth="1" />
        </svg>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md p-6">
        <div className="rounded-2xl bg-white/80 p-8 shadow-2xl backdrop-blur-md border border-white/40">
          
          <div className="mb-8 text-center">
            <h1 className="font-serif text-3xl font-bold text-[#2A1610]">E-SPIRIT</h1>
            <p className="mt-2 text-sm font-medium uppercase tracking-widest text-[#CAA46A]">
              Quản trị viên
            </p>
          </div>

          {!isSuccess ? (
            <>
              <h2 className="mb-2 text-xl font-bold text-gray-900 text-center">Quên mật khẩu?</h2>
              <p className="mb-6 text-sm text-gray-500 text-center">
                Nhập địa chỉ email liên kết với tài khoản của bạn để nhận liên kết đặt lại mật khẩu.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white/50 py-3 pl-11 pr-4 text-sm text-gray-800 transition-all focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CAA46A]/20"
                    placeholder="Nhập email của bạn"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="flex w-full items-center justify-center rounded-xl bg-[#2A1610] py-3 text-sm font-bold text-white shadow-lg shadow-[#2A1610]/20 transition-all hover:bg-[#1A0D09] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#2A1610] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Gửi link khôi phục'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center py-4 animate-in fade-in zoom-in duration-300">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-900 text-center">Đã gửi thành công!</h2>
              <p className="text-sm text-gray-500 text-center">
                Chúng tôi đã gửi hướng dẫn khôi phục vào email <br/>
                <span className="font-medium text-gray-900">{email}</span>
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link 
              to="/admin/login" 
              className="inline-flex items-center gap-2 text-sm font-medium text-[#CAA46A] hover:text-[#2A1610] transition-colors"
            >
              <ArrowLeft size={16} /> Quay lại đăng nhập
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}
