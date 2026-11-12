import axios from 'axios'

// Axios instance dùng chung cho toàn bộ services.
// TODO: gắn interceptor thêm token auth, xử lý lỗi 401 chuyển hướng login.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

export default api
