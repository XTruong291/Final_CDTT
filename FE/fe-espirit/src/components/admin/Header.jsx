import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, KeyRound, ChevronDown } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import ChangePasswordModal from './ChangePasswordModal';

export default function Header({ onMenuClick }) {
  const { admin, logoutAdmin } = useAdminAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Xử lý click ra ngoài để đóng dropdown mà không bị block UI
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="text-gray-500 hover:text-gray-700 md:hidden"
          aria-label="Mở menu"
        >
          <Menu size={24} />
        </button>
        
        {/* Tiêu đề trang */}
        <h1 className="hidden font-serif text-xl font-bold text-[#2A1610] md:block">
          Quản trị hệ thống
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 transition-colors hover:bg-gray-100 focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2A1610] font-bold text-white">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-gray-700">{admin?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500">Quản trị viên</p>
            </div>
            <ChevronDown size={16} className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu (Chuyển sang Click) */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 flex w-48 origin-top-right flex-col rounded-xl border border-gray-100 bg-white py-1 shadow-lg z-50">
              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsPasswordModalOpen(true);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <KeyRound size={16} className="text-gray-400" />
                Đổi mật khẩu
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button 
                onClick={logoutAdmin}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </header>
  );
}
