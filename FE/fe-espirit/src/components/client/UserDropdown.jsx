import { useRef, useEffect } from 'react';
import { Calendar, MessageCircle, KeyRound, LogOut, UserCog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';

export default function UserDropdown({ isOpen, onClose, onOpenFeedback, onOpenProfile }) {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  // Lấy dữ liệu và action từ Zustand store
  const { user, logout } = useAuthStore();

  // Xử lý Click Outside để tự động đóng dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
    toast.success('Đã đăng xuất thành công!');
    navigate('/login');
  };

  // Tạo chữ cái đầu cho Avatar, fallback nếu không có username
  const initial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

  return (
    <div
      ref={dropdownRef}
      className="absolute right-4 top-14 z-50 w-64 rounded-xl bg-white p-2 shadow-xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Top Section: Thông tin User tóm tắt */}
      <div className="flex items-center gap-3 border-b border-gray-100 px-3 py-2.5 pb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2A1610] text-white font-semibold text-sm shadow-sm overflow-hidden">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="truncate text-sm font-semibold text-gray-900">
            {user?.username || 'Khách viếng thăm'}
          </span>
          <span className="truncate text-xs text-gray-500">
            {user?.email || 'Chưa cập nhật email'}
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        {/* (Hidden)
        <button
          onClick={() => {
            console.log('Sync Calendar clicked');
            onClose();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-stone-100 hover:text-gray-900"
        >
          <Calendar size={18} className="text-gray-500" />
          <span>Đồng bộ Calendar</span>
        </button>
        */}

        <button
          onClick={() => {
            if (onOpenFeedback) onOpenFeedback();
            onClose();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-stone-100 hover:text-gray-900"
        >
          <MessageCircle size={18} className="text-gray-500" />
          <span>Phản hồi nội dung</span>
        </button>

        <button
          onClick={() => {
            if (onOpenProfile) onOpenProfile();
            onClose();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-stone-100 hover:text-gray-900"
        >
          <UserCog size={18} className="text-gray-500" />
          <span>Thông tin tài khoản</span>
        </button>
      </div>

      {/* Logout Section */}
      <div className="border-t border-gray-100 pt-1 mt-1">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
