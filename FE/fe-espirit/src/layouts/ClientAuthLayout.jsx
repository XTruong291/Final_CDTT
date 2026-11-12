import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logoDongson from '../assets/logo-dongson.jpg';

const BACKGROUND_IMAGES = [
  '/Gio_to.png',
  '/Le_vu_lan.png',
  '/anh_ngay_tet.png',
  '/ong_cong_ong_tao.png',
  '/Quoc_khanh.png',
  '/trung_thu.png'
];

export default function ClientAuthLayout() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 4000); // Đổi ảnh mỗi 4 giây
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => setMousePos({ x: 0, y: 0 });

  return (
    <div className="flex min-h-screen w-full bg-[#FAF5EC] font-sans">
      {/* 
        CỘT TRÁI: Hình ảnh / Branding (Chỉ hiện trên Desktop lg trở lên) - Chiếm 70%
      */}
      <div 
        className="hidden w-full lg:w-[70%] relative lg:flex flex-col items-center justify-center bg-[#2A1610] overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        
        {/* Slideshow Background */}
        {BACKGROUND_IMAGES.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={src}
              alt="Cultural Background"
              className="h-full w-full object-cover scale-105"
            />
            {/* Lớp phủ tối màu để nổi bật chữ */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
          </div>
        ))}
        
        {/* Họa tiết Trống Đồng mờ ở Background (Parallax Layer) */}
        <div 
          className="absolute inset-0 z-0 opacity-25 pointer-events-none transition-transform duration-100 ease-out"
          style={{
            backgroundImage: 'radial-gradient(circle at center, #CAA46A 2px, transparent 2px)',
            backgroundSize: '40px 40px',
            transform: `translate(${mousePos.x}px, ${mousePos.y}px)`
          }}
        ></div>
        
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.07] pointer-events-none">
          <svg viewBox="0 0 200 200" className="w-[800px] h-[800px] animate-[spin_120s_linear_infinite]">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#CAA46A" strokeWidth="2" strokeDasharray="10 5" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="#CAA46A" strokeWidth="1" />
            <polygon points="100,20 120,80 180,100 120,120 100,180 80,120 20,100 80,80" fill="none" stroke="#CAA46A" strokeWidth="1" />
          </svg>
        </div>

        {/* Nội dung Cột trái */}
        <div className="relative z-10 flex flex-col items-center text-center px-12">
          <div className="mb-8 h-[120px] w-[120px] overflow-hidden rounded-full shadow-[0_0_40px_rgba(201,161,90,0.4)] border border-white/20">
            <img
              src={logoDongson}
              alt="E-SPIRIT Logo"
              className="h-full w-full object-cover mix-blend-screen scale-[1.18]"
            />
          </div>
          <h1 className="font-serif text-5xl font-bold leading-tight text-white mb-2 tracking-wide">
            E-SPIRIT
          </h1>
          <p className="font-serif text-2xl text-[#CAA46A] italic mb-6">
            "Gieo duyên lành, gặt bình an"
          </p>
          <p className="text-white/85 max-w-md leading-relaxed text-[15px]">
            Nền tảng kết nối tâm linh và bảo tồn các di sản tín ngưỡng truyền thống Việt Nam.
          </p>
        </div>
      </div>

      {/* 
        CỘT PHẢI: Form nhập liệu (Chứa Outlet) - Chiếm 30%
      */}
      <div className="flex w-full lg:w-[30%] flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Nền Gradient mờ (Blobs) tăng chiều sâu */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-[#CAA46A]/20 to-transparent rounded-full blur-[80px] pointer-events-none animate-pulse opacity-60"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-[#2A1610]/10 to-transparent rounded-full blur-[80px] pointer-events-none opacity-60"></div>

        <div className="w-full max-w-[420px] relative z-10">
          {/* Logo E-SPIRIT (Chỉ hiển thị trên Mobile/Tablet vì Desktop đã có ở cột trái) */}
          <div className="mb-10 flex flex-col items-center justify-center lg:hidden animate-in zoom-in duration-500">
            <div className="mb-4 h-24 w-24 overflow-hidden rounded-full shadow-[0_0_40px_rgba(42,22,16,0.15)] ring-4 ring-white/50">
              <img
                src={logoDongson}
                alt="E-SPIRIT Logo"
                className="h-full w-full object-cover scale-[1.05]"
              />
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#2A1610]">
              E-SPIRIT
            </h1>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
