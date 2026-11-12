import { useState, useEffect } from 'react';
import { Search, Filter, Loader2, Trash2, Pencil, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllUsers, getUserById, deleteUser, updateUser } from '../../services/adminUserService';
import { useAuthStore } from '../../store/useAuthStore';

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null); // Track ID đang xóa
  
  // State cho Modal Xem Chi Tiết
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [isViewingLoading, setIsViewingLoading] = useState(false);

  // State cho Modal Sửa
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [initialEditUser, setInitialEditUser] = useState(null); // Lưu state mốc để check Dirty
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  
  // Dùng useAuthStore theo yêu cầu
  const { user: clientUser } = useAuthStore();
  
  // Thông minh hỗ trợ cả trường hợp Admin login bằng luồng AuthContext cũ (espirit_auth)
  let currentUser = clientUser;
  if (!currentUser) {
    const espiritAuthRaw = localStorage.getItem('espirit_auth') || sessionStorage.getItem('espirit_auth');
    if (espiritAuthRaw) {
      try {
        currentUser = JSON.parse(espiritAuthRaw);
      } catch (e) {}
    }
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data = await getAllUsers();
        // Kiểm tra xem data là mảng hay bị bọc trong 1 object (vd: data.users)
        const usersArray = Array.isArray(data) ? data : (data.items || data.data || []);
        setUsers(usersArray);
      } catch (error) {
        console.error("LỖI FETCH USERS:", error);
        if (error.response) {
          if (error.response.status === 403) {
            toast.error("Truy cập bị từ chối: Bạn không có quyền Quản trị viên!");
            navigate('/'); // Đá người dùng về trang chủ (Client)
            return;
          }
          if (error.response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_info');
            localStorage.removeItem('espirit_auth');
            sessionStorage.removeItem('espirit_auth');
            toast.error("Phiên đăng nhập hết hạn!", { id: 'auth-session-expired' });
            navigate('/login');
            return;
          }
          console.error("Chi tiết từ Server:", error.response.status, error.response.data);
          toast.error(`Lỗi ${error.response.status}: Không thể lấy danh sách!`);
        } else {
          toast.error(error.message || "Lỗi kết nối đến máy chủ!");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [navigate]);

  const handleViewClick = async (id) => {
    setIsViewModalOpen(true);
    setIsViewingLoading(true);
    setViewingUser(null);
    try {
      const data = await getUserById(id);
      setViewingUser(data);
    } catch (error) {
      console.error("LỖI LẤY CHI TIẾT USER:", error);
      toast.error("Không thể lấy thông tin chi tiết người dùng!");
      setIsViewModalOpen(false);
    } finally {
      setIsViewingLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Thông báo xác nhận Xóa gắt gao hơn
    const isConfirm = window.confirm("CẢNH BÁO: Hành động này không thể hoàn tác!\nBạn có chắc chắn muốn xóa vĩnh viễn người dùng này không?");
    if (!isConfirm) return;

    try {
      setIsDeleting(id); // Set trạng thái loading mờ trên dòng
      await deleteUser(id);
      
      // Xóa thành công, cập nhật state trực tiếp để UI mượt mà
      setUsers(prevUsers => prevUsers.filter(u => u.id !== id));
      toast.success("Xóa người dùng thành công!");
    } catch (error) {
      console.error("LỖI DELETE USER:", error);
      if (error.response) {
        if (error.response.status === 403) {
          toast.error("Bạn không có quyền thực hiện hành động này!");
        } else {
          toast.error(`Lỗi ${error.response.status}: Xóa người dùng thất bại!`);
        }
      } else {
        toast.error(error.message || "Lỗi kết nối đến máy chủ khi xóa!");
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditClick = (user) => {
    const editPayload = {
      ...user,
      password: '' // Reset password trường trống
    };
    setEditingUser(editPayload);
    setInitialEditUser(editPayload); // Lưu mốc dữ liệu cũ
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    // Kiểm tra Dirty State
    if (!editingUser || !initialEditUser) {
      setIsEditModalOpen(false);
      return;
    }

    const isDirty = 
      editingUser.username !== initialEditUser.username ||
      editingUser.email !== initialEditUser.email ||
      editingUser.role !== initialEditUser.role ||
      (editingUser.password && editingUser.password.trim() !== '');

    if (isDirty) {
      const confirmClose = window.confirm("Bạn có những thay đổi chưa được lưu. Bạn có chắc chắn muốn thoát không?");
      if (confirmClose) {
        setIsEditModalOpen(false);
      }
    } else {
      setIsEditModalOpen(false); // Chưa sửa gì thì tắt luôn
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setIsSubmitting(true);
      
      const payload = {
        username: editingUser.username,
        email: editingUser.email,
        role: editingUser.role
      };
      
      // Chỉ gửi password nếu user có nhập mật khẩu mới
      if (editingUser.password && editingUser.password.trim() !== '') {
        payload.password = editingUser.password;
      }

      const updatedUser = await updateUser(editingUser.id, payload);
      
      // Cập nhật mảng tại chỗ
      setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
      toast.success("Cập nhật người dùng thành công!");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("LỖI UPDATE USER:", error);
      if (error.response) {
        let msg = `Lỗi ${error.response.status}: Không thể cập nhật!`;
        if (error.response.data && error.response.data.detail) {
           // Có thể là mảng detail hoặc string
           msg = Array.isArray(error.response.data.detail) 
             ? error.response.data.detail[0]?.msg 
             : error.response.data.detail;
        }
        toast.error(msg);
      } else {
        toast.error(error.message || "Lỗi kết nối đến máy chủ khi cập nhật!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logic Lọc (Real-time filtering)
  const filteredUsers = users.filter(user => {
    const matchSearch = 
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchRole = roleFilter ? user.role === roleFilter : true;
    return matchSearch && matchRole;
  });

  // Helper cho Avatar Text
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* 1. Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2A1610]">Quản lý người dùng</h1>
          <p className="mt-1 text-sm text-gray-500">Giám sát và quản trị tài khoản hệ thống.</p>
        </div>
      </div>

      {/* 2. Filter & Search Section */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2 mb-4 text-[#2A1610] font-medium text-sm">
          <Filter size={18} />
          <span>Bộ lọc & Tìm kiếm</span>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo Username hoặc Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
            />
          </div>

          {/* Dropdown Role */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
          >
            <option value="">Tất cả vai trò</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* 3. Data Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 min-w-[900px]">
            <thead className="bg-[#FAF5EC]/60 text-xs font-medium uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Tên người dùng</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Vai trò (Role)</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-[#CAA46A] mb-2" />
                      <span className="text-gray-500">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-400">
                    Không có người dùng nào.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  // Đảm bảo so sánh chính xác id (dù là string hay number)
                  const isSelf = currentUser && String(currentUser.id) === String(user.id);
                  const isRowDeleting = isDeleting === user.id;
                  
                  return (
                    <tr 
                      key={user.id} 
                      className={`transition-colors hover:bg-gray-50/50 ${isRowDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">{user.id}</td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#CAA46A]/20 text-xs font-bold text-[#2A1610]">
                            {getInitials(user.username)}
                          </div>
                          <span className="font-medium text-gray-900">{user.username}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="text-gray-900">{user.email}</span>
                      </td>
                      
                      <td className="px-6 py-4">
                        {user.role === 'admin' ? (
                          <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 border border-red-200">
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                            User
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 text-gray-500">{formatDate(user.created_at)}</td>
                      
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewClick(user.id)}
                            disabled={isRowDeleting}
                            title="Xem chi tiết"
                            className="p-2 rounded-full transition-colors flex items-center justify-center text-teal-600 hover:bg-teal-50 hover:text-teal-800 disabled:opacity-50"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleEditClick(user)}
                            disabled={isRowDeleting}
                            title="Sửa người dùng"
                            className="p-2 rounded-full transition-colors flex items-center justify-center text-blue-600 hover:bg-blue-50 hover:text-blue-800 disabled:opacity-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={isSelf || isRowDeleting}
                            title={isSelf ? "Không thể tự xóa chính mình" : "Xóa người dùng"}
                            className={`p-2 rounded-full transition-colors flex items-center justify-center ${
                              isSelf 
                                ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
                                : 'text-red-600 hover:bg-red-50 hover:text-red-800'
                            }`}
                          >
                            {isRowDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Edit Modal overlay (z-50) */}
      {isEditModalOpen && editingUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={handleCloseEditModal}
        >
          <div 
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-5 text-xl font-bold text-gray-900 border-b pb-3 border-gray-100">Chỉnh sửa người dùng</h2>
            
            <form onSubmit={handleUpdateUser} className="space-y-4 pt-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Tên người dùng</label>
                <input
                  type="text"
                  required
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 focus:border-[#CAA46A] focus:outline-none focus:ring-2 focus:ring-[#CAA46A]/20 transition-all"
                />
              </div>
              
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 focus:border-[#CAA46A] focus:outline-none focus:ring-2 focus:ring-[#CAA46A]/20 transition-all"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Mật khẩu mới</label>
                <input
                  type="password"
                  placeholder="Để trống nếu không muốn đổi mật khẩu"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 focus:border-[#CAA46A] focus:outline-none focus:ring-2 focus:ring-[#CAA46A]/20 transition-all"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Vai trò</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 focus:border-[#CAA46A] focus:outline-none focus:ring-2 focus:ring-[#CAA46A]/20 transition-all"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  disabled={isSubmitting}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-[#2A1610] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#1A0D09] focus:outline-none focus:ring-2 focus:ring-[#CAA46A] focus:ring-offset-1 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. View Modal overlay (z-50) */}
      {isViewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="mb-5 text-xl font-bold text-gray-900 border-b pb-3 border-gray-100">Chi tiết người dùng</h2>
            
            <div className="min-h-[150px] flex flex-col justify-center">
              {isViewingLoading ? (
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <Loader2 className="h-8 w-8 animate-spin text-[#CAA46A] mb-3" />
                  <p className="text-sm">Đang tải dữ liệu...</p>
                </div>
              ) : viewingUser ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="text-sm font-medium text-gray-500">ID:</span>
                    <span className="col-span-2 text-sm font-semibold text-gray-900">{viewingUser.id}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="text-sm font-medium text-gray-500">Username:</span>
                    <span className="col-span-2 text-sm font-semibold text-gray-900">{viewingUser.username}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <span className="col-span-2 text-sm text-gray-900">{viewingUser.email}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="text-sm font-medium text-gray-500">Vai trò:</span>
                    <div className="col-span-2">
                      {viewingUser.role === 'admin' ? (
                        <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 border border-red-200">
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                          User
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="text-sm font-medium text-gray-500">Ngày tạo:</span>
                    <span className="col-span-2 text-sm text-gray-700">
                      {viewingUser.created_at ? new Date(viewingUser.created_at).toLocaleString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="text-sm font-medium text-gray-500">Cập nhật lúc:</span>
                    <span className="col-span-2 text-sm text-gray-700">
                      {viewingUser.updated_at ? new Date(viewingUser.updated_at).toLocaleString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-500 text-sm font-medium">Không tìm thấy dữ liệu.</div>
              )}
            </div>

            <div className="mt-8 flex justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
