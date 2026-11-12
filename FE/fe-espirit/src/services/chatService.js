import api from './api.js';

// Hàm tạo phiên chat mới
export const createSession = async (title = "Phiên trò chuyện mới") => {
  const token = localStorage.getItem('access_token');
  const response = await api.post(
    '/api/v1/chat/sessions',
    { title },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

// Hàm lấy danh sách các phiên chat
export const fetchSessions = async (skip = 0, limit = 100) => {
  const token = localStorage.getItem('access_token');
  const response = await api.get('/api/v1/chat/sessions', {
    params: { skip, limit },
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data; // Trả về { items: [], total: 0 }
};

// Hàm lấy danh sách tin nhắn của 1 phiên chat
export const getChatMessages = async (sessionId) => {
  const token = localStorage.getItem('access_token');
  const response = await api.get(`/api/v1/chat/sessions/${sessionId}/messages`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data; // Trả về nguyên object chứa messages
};

// Hàm gửi tin nhắn
export const sendMessage = async (sessionId, content) => {
  const token = localStorage.getItem('access_token');
  const response = await api.post(`/api/v1/chat/sessions/${sessionId}/messages`, 
    { content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Hàm xóa phiên trò chuyện
export const deleteChatSession = async (sessionId) => {
  const token = localStorage.getItem('access_token');
  const response = await api.delete(`/api/v1/chat/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
