import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Header from '../components/admin/Header';

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF5EC] font-sans text-gray-800">
      {/* Background Watermark Trống Đồng (nằm ở Main Layout) */}
      <div className="pointer-events-none fixed bottom-0 right-0 z-0 translate-x-1/3 translate-y-1/3 opacity-[0.03]">
        <svg width="600" height="600" viewBox="0 0 800 800" fill="none" aria-hidden="true">
          <circle cx="400" cy="400" r="380" stroke="#2A1610" strokeWidth="2" />
          <circle cx="400" cy="400" r="360" stroke="#2A1610" strokeWidth="1" strokeDasharray="4 8" />
          <circle cx="400" cy="400" r="280" stroke="#2A1610" strokeWidth="2" />
          <circle cx="400" cy="400" r="120" stroke="#2A1610" strokeWidth="3" />
          <g transform="translate(400, 400)">
            {Array.from({ length: 14 }).map((_, i) => (
              <polygon key={i} points="0,-15 10,-50 0,-100 -10,-50" fill="#2A1610" transform={`rotate(${(i * 360) / 14})`} />
            ))}
          </g>
        </svg>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
