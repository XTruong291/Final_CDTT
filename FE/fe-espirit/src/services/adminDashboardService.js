import api from './api.js';

/**
 * Kiểm tra xem JWT Token có còn hiệu lực không
 */
export const isTokenValid = (token) => {
  if (!token || typeof token !== 'string') return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true; // Nếu không phải định dạng JWT thì giữ nguyên
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false; // Token đã hết hạn
    }
    return true;
  } catch (e) {
    return true;
  }
};

/**
 * Helper trích xuất Admin Token an toàn từ LocalStorage hoặc SessionStorage
 * Ưu tiên access_token mới nhất và tự động dọn dẹp token cũ đã hết hạn
 */
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
        // Token trong espirit_auth đã hết hạn, xóa dọn dẹp để không gây lỗi 401
        localStorage.removeItem('espirit_auth');
        sessionStorage.removeItem('espirit_auth');
      }
    } catch (e) {
      // Bỏ qua lỗi parse JSON nếu có
    }
  }

  // 3. Fallback cuối cùng
  return accessToken || null;
};

/**
 * Lấy số liệu thống kê Dashboard Admin
 * @param {Object} options
 * @param {number} [options.days=7] - Khoảng thời gian thống kê (7, 14, 30 ngày)
 * @param {number} [options.recentLimit=10] - Số lượng câu hỏi gần nhất cần lấy
 * @returns {Promise<Object>}
 */
export const getDashboardStats = async ({ days = 7, recentLimit = 10 } = {}) => {
  const token = getAdminToken();
  if (!token) {
    throw new Error('Không tìm thấy Token xác thực. Vui lòng đăng nhập lại!');
  }

  const response = await api.get('/api/v1/admin/dashboard', {
    params: {
      days,
      recent_limit: recentLimit,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};

export default {
  isTokenValid,
  getAdminToken,
  getDashboardStats,
};
