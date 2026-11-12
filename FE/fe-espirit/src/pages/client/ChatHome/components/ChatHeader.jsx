import { useState } from 'react';
import { Menu, ChevronDown, Bell, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserDropdown from '../../../../components/client/UserDropdown';
import CalendarModal from '../../../../components/client/CalendarModal';
import { useAuthStore } from '../../../../store/useAuthStore';
import { useCalendarStore } from '../../../../store/useCalendarStore';

export default function ChatHeader({ isSidebarOpen, onToggleSidebar, onOpenFeedback, onOpenProfile }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const navigate = useNavigate();
  
  // Lấy trạng thái từ store
  const { user, isAuthenticated } = useAuthStore();
  const { todayData } = useCalendarStore();

  // Khởi tạo chữ cái đầu của username nếu đã đăng nhập
  const initial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

  return (
    <header className="relative z-30 flex h-16 w-full shrink-0 items-center justify-between bg-transparent px-4 py-2">
      {/* Bên Trái: Nút Hamburger Menu */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-gray-700 shadow-sm border border-stone-200/60 transition-colors hover:bg-white hover:text-[#2A1610] ${
            isSidebarOpen ? 'lg:hidden' : ''
          }`}
          title={isSidebarOpen ? 'Đóng menu' : 'Mở menu'}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Ở Giữa: Widget Lịch Âm Mini */}
      <div className="flex items-center">
        {todayData ? (
          <div 
            onClick={() => setIsCalendarOpen(true)}
            className="flex items-center gap-2 rounded-full border border-amber-200/60 bg-gradient-to-r from-amber-50 to-white px-3 sm:px-4 py-1.5 shadow-sm backdrop-blur-md transition-all hover:shadow-md cursor-pointer"
          >
            <Calendar size={14} className="text-amber-600 shrink-0" />
            <span className="font-serif text-xs font-medium text-amber-900 sm:text-sm whitespace-nowrap">
              {todayData.day}/{todayData.month}/{todayData.year} <span className="hidden sm:inline">({todayData.lunar_day}/{todayData.lunar_month} Âm)</span>
            </span>
            {(todayData.is_first_day || todayData.is_full_moon || todayData.special_event) && (
              <div className="flex items-center gap-1.5 border-l border-amber-200/80 pl-2 sm:pl-2.5">
                <span className="text-xs font-semibold text-amber-700 hidden sm:inline-block whitespace-nowrap">
                  {todayData.special_event || (todayData.is_first_day ? 'Mùng 1' : 'Ngày Rằm')}
                </span>
                <span className="inline-flex items-center justify-center text-amber-500 animate-[bounce_2s_infinite]">
                  🔔
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-8 w-32 sm:w-48 animate-pulse items-center rounded-full bg-stone-100/80 px-4 py-1.5" />
        )}
      </div>

      {/* Bên Phải: User Action Area */}
      <div className="relative flex items-center">
        {isAuthenticated ? (
          <>
            {/* User Avatar & ChevronDown mở Dropdown Menu */}
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full bg-white/80 p-1.5 pl-2 pr-3 border border-stone-200/80 shadow-sm transition-all hover:bg-white focus:outline-none"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2A1610] text-xs font-bold text-white shadow-xs overflow-hidden">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <span className="hidden text-xs font-semibold text-gray-700 sm:inline-block max-w-[120px] truncate">
                {user?.username || 'Người dùng'}
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-500 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Account Dropdown Menu */}
            <UserDropdown
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
              onOpenFeedback={onOpenFeedback}
              onOpenProfile={onOpenProfile}
            />
          </>
        ) : (
          /* Khối nút Đăng nhập / Đăng ký mới */
          <div className="flex items-center gap-3">
            {/* Nút Đăng nhập */}
            <button 
              onClick={() => navigate('/login')}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-transparent rounded-full hover:bg-gray-100 hover:text-gray-900 transition-all duration-300"
            >
              Đăng nhập
            </button>
            
            {/* Nút Đăng ký */}
            <button 
              onClick={() => navigate('/register')}
              className="px-5 py-2 text-sm font-medium text-white bg-[#2A1610] rounded-full shadow-md hover:bg-[#1A0D09] hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
            >
              Đăng ký
              {/* Icon mũi tên hiện đại */}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Calendar Modal */}
      {isCalendarOpen && (
        <CalendarModal onClose={() => setIsCalendarOpen(false)} />
      )}
    </header>
  );
}
