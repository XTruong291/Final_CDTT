import api from './api.js';

/**
 * Kiểm tra xem JWT Token có còn hiệu lực không
 */
const isTokenValid = (token) => {
  if (!token || typeof token !== 'string') return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false; // Token đã hết hạn
    }
    return true;
  } catch (e) {
    return true;
  }
};

// Helper dùng chung để trích xuất Admin Token an toàn
export const getAdminToken = () => {
  // 1. Ưu tiên access_token mới nhất (từ phiên đăng nhập gần nhất)
  const accessToken = localStorage.getItem('access_token');
  if (accessToken && isTokenValid(accessToken)) {
    return accessToken;
  }

  // 2. Kiểm tra espirit_auth nếu có
  const espiritAuthRaw = localStorage.getItem('espirit_auth') || sessionStorage.getItem('espirit_auth');
  if (espiritAuthRaw) {
    try {
      const espiritAuth = JSON.parse(espiritAuthRaw);
      const token = espiritAuth?.access_token || espiritAuth?.token;
      if (token && isTokenValid(token)) {
        return token;
      } else if (token) {
        localStorage.removeItem('espirit_auth');
        sessionStorage.removeItem('espirit_auth');
      }
    } catch (e) {}
  }

  // 3. Fallback cuối cùng
  return accessToken || null;
};

export const getAllUsers = async (skip = 0, limit = 100) => {
  const token = getAdminToken();
  if (!token) throw new Error("Không tìm thấy Token. Vui lòng đăng nhập lại!");

  const response = await api.get('/api/v1/users/', {
    params: { skip, limit },
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const getUserById = async (id) => {
  const token = getAdminToken();
  if (!token) throw new Error("Không tìm thấy Token. Vui lòng đăng nhập lại!");

  const response = await api.get(`/api/v1/users/${id}`, {
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const deleteUser = async (id) => {
  const token = getAdminToken();
  if (!token) throw new Error("Không tìm thấy Token. Vui lòng đăng nhập lại!");

  const response = await api.delete(`/api/v1/users/${id}`, {
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  // API xóa thành công sẽ trả về 204 No Content
  return response.status === 204;
};

export const updateUser = async (id, updateData) => {
  const token = getAdminToken();
  if (!token) throw new Error("Không tìm thấy Token. Vui lòng đăng nhập lại!");

  const response = await api.patch(`/api/v1/users/${id}`, updateData, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export default {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser
};
