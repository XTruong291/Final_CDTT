import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Users, Bot, Home, X } from 'lucide-react';
import logoDongson from '../../assets/logo-dongson.jpg';

const menuItems = [
  { name: 'Tổng quan', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Sự kiện', path: '/admin/events', icon: CalendarDays },
  { name: 'Người dùng', path: '/admin/users', icon: Users },
  { name: 'Trang chủ', path: '/admin/home-content', icon: Home },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 transform flex-col bg-[#2A1610] text-white transition-transform duration-300 ease-in-out md:static md:flex md:translate-x-0 ${
        isOpen ? 'translate-x-0 flex' : '-translate-x-full hidden'
      }`}
    >
      {/* Logo & Brand */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#CAA46A]/20 px-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full">
            <img src={logoDongson} alt="Logo" className="h-full w-full object-cover mix-blend-screen scale-[1.18]" />
          </div>
          <span className="font-serif text-lg font-bold tracking-widest text-[#CAA46A]">
            E-SPIRIT
          </span>
        </div>
        <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
        <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Menu Quản Trị
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#CAA46A]/10 text-[#CAA46A]'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={20} className="shrink-0" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Sidebar */}
      <div className="border-t border-white/10 p-4 text-xs text-gray-500">
        © 2026 E-SPIRIT
      </div>
    </aside>
  );
}
