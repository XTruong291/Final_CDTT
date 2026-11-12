import logoDongson from '../../assets/logo-dongson.jpg'

/**
 * Layout 2 cột dùng chung cho toàn bộ màn hình Admin Authentication
 * (Login / Forgot Password / Reset Password / trạng thái thành công).
 *
 * Cột trái: hero trang trí tĩnh - họa tiết Trống Đồng chìm, nền Nâu Trầm.
 * Cột phải: `children` - nội dung riêng của từng trang.
 */
export default function AdminAuthLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full bg-[#FAF5EC]">
      {/* Cột trái - hero trang trí */}
      <div className="relative hidden w-[45%] shrink-0 overflow-hidden bg-gradient-to-br from-[#2A1610] to-[#110B09] md:flex md:flex-col md:justify-between">
        
        {/* Họa tiết Trống Đồng (Geometric/Minimalist) */}
        <svg
          className="pointer-events-none absolute -left-48 top-1/2 h-[800px] w-[800px] -translate-y-1/2 opacity-[0.07] motion-safe:animate-[spin_120s_linear_infinite]"
          viewBox="0 0 800 800"
          fill="none"
          aria-hidden="true"
        >
          {/* Vòng ngoài cùng */}
          <circle cx="400" cy="400" r="380" stroke="#CAA46A" strokeWidth="2" />
          <circle cx="400" cy="400" r="360" stroke="#CAA46A" strokeWidth="1" strokeDasharray="4 8" />
          
          {/* Các vòng trong */}
          <circle cx="400" cy="400" r="280" stroke="#CAA46A" strokeWidth="2" />
          <circle cx="400" cy="400" r="200" stroke="#CAA46A" strokeWidth="1" />
          <circle cx="400" cy="400" r="120" stroke="#CAA46A" strokeWidth="3" />
          
          {/* Ngôi sao 14 cánh ở giữa (Mặt trời) */}
          <g transform="translate(400, 400)">
            {Array.from({ length: 14 }).map((_, i) => {
              const angle = (i * 360) / 14
              return (
                <polygon
                  key={i}
                  points="0,-15 10,-50 0,-100 -10,-50"
                  fill="#CAA46A"
                  transform={`rotate(${angle})`}
                />
              )
            })}
          </g>

          {/* Các họa tiết hình học cách điệu vòng ngoài */}
          <g transform="translate(400, 400)">
            {Array.from({ length: 28 }).map((_, i) => {
              const angle = (i * 360) / 28
              return (
                <line
                  key={`ray-${i}`}
                  x1="0"
                  y1="-280"
                  x2="0"
                  y2="-360"
                  stroke="#CAA46A"
                  strokeWidth="2"
                  transform={`rotate(${angle})`}
                />
              )
            })}
          </g>
        </svg>

        <div className="relative z-10 flex items-center gap-3 px-12 pt-12">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
            <img src={logoDongson} alt="E-Spirit" className="h-full w-full object-cover mix-blend-screen scale-[1.18]" />
          </div>
          <span className="font-serif text-xl font-semibold tracking-[0.25em] text-[#CAA46A]">
            E-SPIRIT
          </span>
        </div>

        <div className="relative z-10 px-12 pb-16">
          <span className="inline-block border-b border-[#CAA46A]/30 pb-1 text-xs font-medium uppercase tracking-[0.2em] text-[#CAA46A]/80">
            Di sản · Công nghệ
          </span>
          <h2 className="mt-6 max-w-md font-serif text-4xl font-bold leading-snug text-white/95">
            Gìn giữ tinh thần Việt trong kỷ nguyên số
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
            Nền tảng tổ chức tri thức về phong tục và nghi lễ thờ cúng Việt Nam — rõ ràng, đáng tin
            và gần gũi với thế hệ hôm nay.
          </p>
          <p className="mt-12 font-serif text-xs italic text-white/30">
            © 2026 E-SPIRIT · Hệ thống quản trị nội bộ
          </p>
        </div>
      </div>

      {/* Cột phải - nội dung riêng từng trang */}
      <div className="flex w-full flex-1 items-center justify-center px-6 py-12 md:justify-start md:px-16 lg:px-24">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
