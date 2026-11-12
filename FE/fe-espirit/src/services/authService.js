import api from './api.js';

// Đăng ký, đăng nhập, đăng xuất, khôi phục mật khẩu (user & admin)
export const authService = {
  loginUser: async (credentials) => {
    // Backend yêu cầu chuẩn JSON với ĐÚNG 2 trường: username và password.
    const response = await api.post('/api/v1/auth/login', {
      username: credentials.username, // Phải truyền đúng username (không phải email)
      password: credentials.password
    });
    return response.data;
  },

  getCurrentUser: async (token) => {
    const accessToken = token || localStorage.getItem('access_token');
    if (!accessToken) throw new Error("No token found");
    
    const response = await api.get('/api/v1/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data;
  },

  login: async ({ username, password }) => {
    const response = await api.post('/api/v1/auth/login', { username, password })
    return response.data
  },

  adminLogin: async (credentials) => {
    const response = await api.post('/api/v1/auth/login', {
      username: credentials.username || credentials.email,
      password: credentials.password
    });
    
    const data = response.data;
    data.role = 'admin'; // Fallback nếu backend không trả về
    return data;
  },

  register: async (payload) => {
    const response = await api.post('/api/v1/auth/register', payload);
    return response.data;
  },

  logoutAdmin: async () => {
    return { success: true };
  },

  updateProfile: async (data) => {
    const token = localStorage.getItem('access_token');
    // Lọc bỏ password nếu chuỗi rỗng
    const payload = { ...data };
    if (!payload.password) {
      delete payload.password;
    }
    
    const response = await api.put('/api/v1/users/me', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  forgotAdminPassword: async (email) => {
    await new Promise((r) => setTimeout(r, 800));
    if (email !== 'admin@espirit.vn') {
      throw new Error('Email quản trị không tồn tại trong hệ thống.');
    }
    return { success: true };
  },

  resetAdminPassword: async ({ token, password }) => {
    await new Promise((r) => setTimeout(r, 800));
    return { success: true };
  },
};

export default authService;
