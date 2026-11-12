import { create } from 'zustand';
import { authService } from '../services/authService';
import { useChatStore } from './useChatStore';

// Lấy thông tin user và token từ localStorage (nếu có) khi khởi tạo app
const storedUser = JSON.parse(localStorage.getItem('user_info')) || null;
const storedToken = localStorage.getItem('access_token') || null;

export const useAuthStore = create((set, get) => ({
  user: storedUser,
  isAuthenticated: !!storedToken,
  isCheckingAuth: true, // Thêm state loading cho lần đầu check auth

  // Action: Kiểm tra và duy trì đăng nhập
  initializeAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isAuthenticated: false, user: null, isCheckingAuth: false });
      return;
    }

    try {
      const userData = await authService.getCurrentUser();
      set({ user: userData, isAuthenticated: true, isCheckingAuth: false });
    } catch (error) {
      // Token hết hạn hoặc lỗi
      get().logout();
      set({ isCheckingAuth: false });
    }
  },

  // Action: Đăng nhập
  login: (userData, token) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_info', JSON.stringify(userData));
    // Đồng bộ sang espirit_auth để hệ thống Admin / ProtectedRoute nhận diện được token mới
    localStorage.setItem('espirit_auth', JSON.stringify({
      ...userData,
      access_token: token,
      token: token,
    }));
    sessionStorage.removeItem('espirit_auth');
    set({ user: userData, isAuthenticated: true });
  },

  // Action: Cập nhật thông tin cá nhân
  updateProfile: async (data) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      localStorage.setItem('user_info', JSON.stringify(updatedUser));
      const currentToken = localStorage.getItem('access_token');
      localStorage.setItem('espirit_auth', JSON.stringify({
        ...updatedUser,
        access_token: currentToken,
        token: currentToken,
      }));
      set({ user: updatedUser });
      return updatedUser;
    } catch (error) {
      throw error;
    }
  },

  // Action: Đăng xuất
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('espirit_auth');
    sessionStorage.removeItem('espirit_auth');
    set({ user: null, isAuthenticated: false });
    
    // Xóa sạch trạng thái chat cũ để không bị rò rỉ dữ liệu sang tài khoản khác
    useChatStore.getState().clearChatStore();
  },
}));
