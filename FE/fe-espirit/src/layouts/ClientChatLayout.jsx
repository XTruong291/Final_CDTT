import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import ChatSidebar from '../pages/client/ChatHome/components/ChatSidebar';
import ChatHeader from '../pages/client/ChatHome/components/ChatHeader';
import FeedbackModal from '../components/client/FeedbackModal';
import ProfileModal from '../components/client/ProfileModal';
import { useCalendarStore } from '../store/useCalendarStore';

export default function ClientChatLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  const fetchToday = useCalendarStore((state) => state.fetchToday);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleNewChat = () => {
    // Tăng biến đếm để trigger useEffect reset messages ở ChatHome
    setResetTrigger((prev) => prev + 1);
    
    // Nếu đang ở mobile thì tự động đóng sidebar sau khi tạo mới
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#FAF5EC] font-sans relative">
      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* 1. Mobile Backdrop / Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* 2. Chat Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={handleNewChat}
      />

      {/* 3. Main Content Area (Chiếm phần còn lại flex-1 flex flex-col relative) */}
      <div className="flex flex-1 flex-col relative overflow-hidden h-full transition-all duration-300">
        {/* Header tích hợp Lịch Âm Widget & User Avatar Popup */}
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
          onOpenFeedback={() => setIsFeedbackModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Nội dung trang Chat (Render qua React Router Outlet) */}
        <main className="flex-1 overflow-y-auto relative">
          <Outlet context={{ resetTrigger }} />
        </main>
      </div>
    </div>
  );
}
