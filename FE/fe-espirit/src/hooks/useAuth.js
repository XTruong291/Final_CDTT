import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

// Hook tiện dùng để lấy trạng thái đăng nhập / hàm login-logout.
export function useAuth() {
  return useContext(AuthContext);
}
