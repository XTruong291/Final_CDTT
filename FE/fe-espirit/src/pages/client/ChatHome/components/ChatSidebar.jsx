import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Pin, PanelLeftClose, X, Edit2, Loader2, Trash2 } from 'lucide-react';
import { useChatStore } from '../../../../store/useChatStore';
import { useAuthStore } from '../../../../store/useAuthStore';
import logoDongson from '../../../../assets/logo-dongson.jpg';

export default function ChatSidebar({ isOpen, onClose, onNewChat }) {
  const { 
    createNewChat, 
    chatSessions, 
    currentSessionId, 
    selectSession, // Dùng hàm mới lấy data API thay vì loadSession nội bộ
    togglePinSession, 
    renameSession, 
    fetchSessionsAction, 
    isLoadingSessions,
    removeSession
  } = useChatStore();
  const { user } = useAuthStore();

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchSessionsAction();
  }, [fetchSessionsAction]);

  const pinnedSessions = chatSessions.filter((session) => session.isPinned);
  const recentSessions = chatSessions.filter((session) => !session.isPinned);

  const handleCreateNewChat = async () => {
    setIsCreating(true);
    try {
      await createNewChat();
      if (onNewChat) onNewChat();
    } catch (error) {
      // Lỗi đã được store catch và bắn toast
    } finally {
      setIsCreating(false);
    }
  };

  const startEditing = (e, session) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const saveEditing = (sessionId) => {
    if (editTitle.trim()) {
      renameSession(sessionId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e, sessionId) => {
    if (e.key === 'Enter') {
      saveEditing(sessionId);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Chặn nổi bọt sự kiện
    if (window.confirm("Bạn có chắc chắn muốn xóa cuộc trò chuyện này? Dữ liệu không thể khôi phục.")) {
      await removeSession(id);
    }
  };

  const initial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

  const renderSessionItem = (chat, iconMode) => {
    const isEditing = editingId === chat.id;
    
    return (
      <div
        key={chat.id}
        className={`group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors cursor-pointer ${
          currentSessionId === chat.id
            ? 'bg-white/15 text-white shadow-inner font-semibold'
            : 'text-red-100/90 font-medium hover:bg-white/10 hover:text-white'
        }`}
        onClick={() => {
          if (!isEditing) selectSession(chat.id);
        }}
      >
        {iconMode === 'pin' ? (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              togglePinSession(chat.id);
            }}
            className="focus:outline-none shrink-0"
            title="Bỏ ghim hội thoại"
          >
            <Pin size={14} className="text-amber-300" />
          </button>
        ) : (
          <MessageSquare size={16} className="shrink-0 text-red-200/80 group-hover:text-white" />
        )}

        {isEditing ? (
          <input
            type="text"
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={() => saveEditing(chat.id)}
            onKeyDown={(e) => handleKeyDown(e, chat.id)}
            className="flex-1 bg-black/20 text-white border border-amber-500/50 rounded px-1.5 py-0.5 outline-none text-sm w-full"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate flex-1">{chat.title}</span>
        )}

        {!isEditing && (
          <div className="ml-auto flex shrink-0 opacity-0 group-hover:opacity-100 transition-opacity items-center gap-1.5">
            <button
              onClick={(e) => startEditing(e, chat)}
              className="focus:outline-none flex items-center justify-center text-red-200/80 hover:text-white"
              title="Đổi tên"
            >
              <Edit2 size={14} />
            </button>
            {iconMode !== 'pin' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePinSession(chat.id);
                }}
                className="focus:outline-none flex items-center justify-center text-red-200/80 hover:text-white"
                title="Ghim hội thoại"
              >
                <Pin size={14} />
              </button>
            )}
            {/* Nút Xóa */}
            <button
              onClick={(e) => handleDelete(e, chat.id)}
              className="focus:outline-none flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
              title="Xóa hội thoại"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[#2A1610] text-white shadow-2xl transition-all duration-300 ease-in-out lg:static overflow-hidden ${
        isOpen ? 'w-[260px] translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex flex-col h-full w-[260px] shrink-0">
        {/* Top Section */}
        <div className="flex flex-col gap-4 p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Logo Trống Đồng */}
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                <img
                  src={logoDongson}
                  alt="E-Spirit Logo"
                  className="h-full w-full object-cover mix-blend-screen opacity-90 scale-[1.18]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-base font-bold tracking-wider text-amber-100">
                  E-SPIRIT
                </span>
                <span className="text-[10px] text-red-200/80 uppercase tracking-widest">
                  Trợ Lý Tâm Linh
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-red-200/80 transition-colors hover:bg-white/10 hover:text-white"
              title="Thu gọn menu"
            >
              <PanelLeftClose size={18} className="hidden lg:block" />
              <X size={18} className="block lg:hidden" />
            </button>
          </div>

          <button
            onClick={handleCreateNewChat}
            disabled={isCreating}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 font-medium text-stone-900 shadow-md transition-all hover:from-amber-400 hover:to-amber-500 hover:shadow-lg active:scale-[0.99] disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={18} className="stroke-[2.5]" />
            )}
            <span>{isCreating ? 'Đang tạo...' : 'Tạo mới đoạn chat'}</span>
          </button>
        </div>

        {/* Middle Section: Chat Session Management */}
        <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          {isLoadingSessions ? (
            <div className="flex flex-col gap-3 px-2 mt-2">
              <div className="animate-pulse h-10 w-full rounded-xl bg-white/10"></div>
              <div className="animate-pulse h-10 w-full rounded-xl bg-white/10"></div>
              <div className="animate-pulse h-10 w-full rounded-xl bg-white/10"></div>
              <div className="text-center text-red-200/60 text-[11px] mt-2">
                Đang tải lịch sử trò chuyện...
              </div>
            </div>
          ) : chatSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-60 px-4 text-center mt-10">
              <MessageSquare size={32} className="text-red-200/50 mb-3" />
              <p className="text-sm text-red-200/80 font-medium">Chưa có cuộc trò chuyện nào</p>
              <p className="text-xs text-red-200/60 mt-1">Hãy tạo đoạn chat mới để bắt đầu khám phá hệ thống.</p>
            </div>
          ) : (
            <>
              {/* Mục Các Cuộc Hội Thoại Đã Ghim */}
              {pinnedSessions.length > 0 && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center gap-1.5 px-2 text-[11px] font-semibold text-red-200/70 uppercase tracking-wider">
                    <Pin size={12} className="rotate-45" />
                    <span>Đã ghim</span>
                  </div>
                  <div className="space-y-1">
                    {pinnedSessions.map((chat) => renderSessionItem(chat, 'pin'))}
                  </div>
                </div>
              )}

              {/* Viền phân cách section mờ nếu có cả 2 mảng */}
              {pinnedSessions.length > 0 && recentSessions.length > 0 && (
                <div className="my-3 border-t border-white/10" />
              )}

              {/* Mục Các Cuộc Hội Thoại Gần Đây */}
              {recentSessions.length > 0 && (
                <div>
                  <div className="mb-2 px-2 text-[11px] font-semibold text-red-200/70 uppercase tracking-wider">
                    Gần đây
                  </div>
                  <div className="space-y-1">
                    {recentSessions.map((chat) => renderSessionItem(chat, 'recent'))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Section: Thông tin User tóm tắt */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2 transition-colors hover:bg-white/10 cursor-pointer">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-stone-900 font-bold text-xs shadow-sm overflow-hidden">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate text-xs font-semibold text-white">
                {user?.username || 'Khách viếng thăm'}
              </span>
              <span className="truncate text-[10px] text-red-200/70">
                {user ? 'Người dùng hệ thống' : 'Phiên bản miễn phí'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
