import { create } from 'zustand';
import { initialChatMessages } from '../data/mockData';
import { createSession, fetchSessions, getChatMessages, sendMessage, deleteChatSession } from '../services/chatService';
import toast from 'react-hot-toast';

export const useChatStore = create((set, get) => ({
  // State khởi tạo
  messages: initialChatMessages,
  isSending: false,
  
  // State quản lý danh sách cuộc hội thoại
  chatSessions: [],
  currentSessionId: null,
  isLoadingSessions: false,
  isMessagesLoading: false, // State mới

  // Action: Thêm một tin nhắn mới
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  // Action: Cập nhật trạng thái typing của Bot
  setSending: (status) => set({ isSending: status }),

  // Action: Lưu lại session hiện tại vào danh sách (Lưu nội bộ Frontend)
  saveCurrentSession: () => {
    const { messages, currentSessionId, chatSessions } = get();
    if (messages.length === 0) return;

    // Lấy tin nhắn đầu tiên của user để làm title
    const firstUserMsg = messages.find((m) => m.sender === 'user')?.content || 'Cuộc trò chuyện mới';
    const title = firstUserMsg.length > 20 ? firstUserMsg.substring(0, 20) + '...' : firstUserMsg;

    if (currentSessionId) {
      // Cập nhật session hiện tại
      set({
        chatSessions: chatSessions.map((session) =>
          session.id === currentSessionId
            ? { ...session, title, messages: [...messages] }
            : session
        ),
      });
    } else {
      // Nếu chưa có currentSessionId (ví dụ trước khi có API tạo session)
      const newSession = {
        id: Date.now().toString(),
        title,
        isPinned: false,
        messages: [...messages],
      };
      set({ chatSessions: [newSession, ...chatSessions], currentSessionId: newSession.id });
    }
  },

  // Action: Tạo phiên trò chuyện mới qua API
  createNewChat: async (customTitle) => {
    // Lưu lại session hiện tại trước khi tạo mới
    get().saveCurrentSession();
    
    try {
      const title = typeof customTitle === 'string' ? customTitle : "Phiên trò chuyện mới";
      const newSessionData = await createSession(title);
      
      const newSession = {
        id: newSessionData.id,
        title: newSessionData.title || "Phiên trò chuyện mới",
        isPinned: false,
        messages: [],
      };

      set((state) => ({
        chatSessions: [newSession, ...state.chatSessions],
        currentSessionId: newSession.id,
        messages: [], // Trả về Empty State
      }));
      
    } catch (error) {
      console.error("Lỗi khi tạo phiên mới:", error);
      toast.error("Không thể tạo đoạn chat mới lúc này!");
      throw error;
    }
  },

  // Action: Tải lại một session cũ vào màn hình chat (Lấy từ Backend API)
  selectSession: async (sessionId) => {
    const { currentSessionId } = get();
    if (currentSessionId === sessionId) return; // Nếu đang mở thì bỏ qua

    // 1. Reset màn hình và set state loading
    set({ currentSessionId: sessionId, messages: [], isMessagesLoading: true });
    
    try {
      // 2. Gọi API lấy danh sách tin nhắn
      const data = await getChatMessages(sessionId);
      
      const rawMessages = data.messages || [];
      const mappedMessages = rawMessages.map(msg => ({
        id: msg.id || Math.random().toString(),
        sender: msg.sender || (msg.role === 'user' ? 'user' : 'bot'), 
        content: msg.content,
        type: 'text'
      }));

      // 3. Set dữ liệu vào store
      set({ messages: mappedMessages });
    } catch (error) {
      console.error("Lỗi lấy danh sách tin nhắn:", error);
      if (error.response && error.response.status === 404) {
        toast.error("Phiên trò chuyện không tồn tại hoặc đã bị xóa!");
        set({ currentSessionId: null, messages: [] });
      } else {
        toast.error("Không thể tải tin nhắn của phiên này!");
      }
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Action: Lấy danh sách session từ API
  fetchSessionsAction: async () => {
    set({ isLoadingSessions: true });
    try {
      const data = await fetchSessions();
      set({ chatSessions: data.items || [] });
    } catch (error) {
      console.error("Lỗi khi tải lịch sử chat:", error);
    } finally {
      set({ isLoadingSessions: false });
    }
  },

  // Action: Reset toàn bộ chat store (Dọn dẹp lúc logout)
  clearChatStore: () => {
    set({
      chatSessions: [],
      messages: [],
      currentSessionId: null,
      isMessagesLoading: false,
      isLoadingSessions: false
    });
  },

  // Action: Gắn cờ / Bỏ gắn cờ ghim cho session
  togglePinSession: (sessionId) => {
    set((state) => ({
      chatSessions: state.chatSessions.map((s) =>
        s.id === sessionId ? { ...s, isPinned: !s.isPinned } : s
      ),
    }));
  },

  // Action: Xóa một phiên trò chuyện
  removeSession: async (sessionId) => {
    try {
      await deleteChatSession(sessionId);
      
      set((state) => {
        // Xóa khỏi danh sách sidebar
        const updatedSessions = state.chatSessions.filter(s => s.id !== sessionId);
        
        // Nếu phiên đang mở bị xóa thì reset màn hình
        if (state.currentSessionId === sessionId) {
          return {
            chatSessions: updatedSessions,
            currentSessionId: null,
            messages: []
          };
        }
        
        return { chatSessions: updatedSessions };
      });
      
      toast.success("Đã xóa cuộc trò chuyện");
    } catch (error) {
      console.error("Lỗi khi xóa phiên chat:", error);
      toast.error("Không thể xóa cuộc trò chuyện lúc này!");
    }
  },

  // Action: Đổi tên session
  renameSession: (sessionId, newTitle) => {
    set((state) => ({
      chatSessions: state.chatSessions.map((s) =>
        s.id === sessionId ? { ...s, title: newTitle } : s
      ),
    }));
  },

  // Action: Giả lập Bot phản hồi (Legacy)
  simulateBotResponse: () => {
    set({ isSending: true });
    
    setTimeout(() => {
      set((state) => ({
        isSending: false,
        messages: [
          ...state.messages,
          {
            sender: 'bot',
            type: 'text',
            content: 'Đây là câu trả lời mẫu từ E-SPIRIT cho câu hỏi của bạn. Tính năng AI thực tế sẽ được tích hợp ở các bước sau.',
          }
        ]
      }));
    }, 1500);
  },

  // Action: Gửi tin nhắn thật qua API
  sendChatMessage: async (content) => {
    let { currentSessionId, isSending } = get();
    const { addMessage, createNewChat, fetchSessionsAction } = get();
    
    if (isSending || !content.trim()) return; // Chặn spam click gửi đúp
    
    // Tự động tạo phiên trò chuyện nếu chưa có
    if (!currentSessionId) {
      try {
        const title = content.length > 30 ? content.substring(0, 30) + '...' : content;
        await createNewChat(title);
        currentSessionId = get().currentSessionId;
      } catch (error) {
        return; // Bỏ qua vì đã bắt lỗi và hiện toast trong createNewChat
      }
    }

    // 1. Optimistic Update: Hiển thị ngay tin nhắn user lên UI
    const tempUserMessage = {
      id: Date.now().toString(),
      sender: 'user',
      type: 'text',
      content
    };
    addMessage(tempUserMessage);
    
    // 2. Hiển thị bot đang "typing" và khóa input
    set({ isSending: true });

    try {
      // 3. Gọi API gửi tin nhắn
      await sendMessage(currentSessionId, content);
      
      // 4. Đồng bộ lại toàn bộ tin nhắn từ Backend để tránh lỗi trùng lặp (hiện 2 tin)
      const data = await getChatMessages(currentSessionId);
      const rawMessages = data.messages || [];
      const mappedMessages = rawMessages.map(msg => ({
        id: msg.id || Math.random().toString(),
        sender: msg.sender || (msg.role === 'user' ? 'user' : 'bot'), 
        content: msg.content,
        type: 'text'
      }));
      set({ messages: mappedMessages });

      // 5. Cập nhật lại Sidebar (Backend tự đổi title nếu là tin nhắn đầu tiên)
      fetchSessionsAction();

    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      toast.error("Không thể gửi tin nhắn lúc này!");
      // Rollback tin nhắn tạm nếu gọi API lỗi
      set((state) => ({ messages: state.messages.filter(m => m.id !== tempUserMessage.id) }));
    } finally {
      set({ isSending: false });
    }
  }
}));
