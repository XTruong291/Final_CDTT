import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { X, Save, Loader2, AlertTriangle, Camera, Upload, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/authService';
import { deleteUser } from '../../services/adminUserService'; // Hàm delete đã có sẵn ở đây
import { uploadImage } from '../../services/uploadService';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile, logout } = useAuthStore();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar_url: '',
    password: ''
  });
  const [initialData, setInitialData] = useState(null); // Để đối chiếu Dirty state
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // State cho nút xóa tài khoản
  const [isUploading, setIsUploading] = useState(false); // State upload ảnh
  const [uploadProgress, setUploadProgress] = useState(0); // Tiến trình upload
  const [previewUrl, setPreviewUrl] = useState(null); // Preview ảnh trước khi upload
  const [isDragging, setIsDragging] = useState(false); // Drag & drop state
  const [uploadError, setUploadError] = useState(''); // Lỗi upload hiển thị trên giao diện

  // Sync data khi mở modal
  useEffect(() => {
    if (isOpen && user) {
      const init = {
        username: user.username || '',
        email: user.email || '',
        avatar_url: user.avatar_url || '',
        password: '' // Luôn bỏ trống khi mở
      };
      setFormData(init);
      setInitialData(init);
      setPreviewUrl(null);
      setUploadProgress(0);
      setIsUploading(false);
      setUploadError('');
    }
  }, [isOpen, user]);

  // Cleanup preview URL khi unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate trước khi upload
    setUploadError('');
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadError(`Ảnh quá lớn (${sizeMB}MB)! Vui lòng chọn ảnh dưới 5MB.`);
      return;
    }

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Định dạng không hỗ trợ. Chỉ chấp nhận JPG, PNG, WebP, GIF.');
      return;
    }

    // Tạo preview ngay lập tức
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Upload lên Cloudinary
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const cloudUrl = await uploadImage(file, (progress) => {
        setUploadProgress(progress);
      });

      // Upload thành công -> cập nhật avatar_url
      setFormData(prev => ({ ...prev, avatar_url: cloudUrl }));
      toast.success('Tải ảnh lên thành công!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Tải ảnh lên thất bại!');
      // Xoá preview nếu upload thất bại
      setPreviewUrl(null);
      URL.revokeObjectURL(preview);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveAvatar = () => {
    setFormData(prev => ({ ...prev, avatar_url: '' }));
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleClose = () => {
    if (!initialData) {
      onClose();
      return;
    }

    const isDirty = 
      formData.username !== initialData.username ||
      formData.email !== initialData.email ||
      formData.avatar_url !== initialData.avatar_url ||
      (formData.password && formData.password.trim() !== '');

    if (isDirty) {
      const confirmClose = window.confirm("Bạn có những thay đổi chưa được lưu. Bạn có chắc chắn muốn thoát không?");
      if (confirmClose) {
        setFormData(initialData); // reset state trước khi đóng
        setPreviewUrl(null);
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleOverlayMouseDown = (e) => {
    // Chỉ đóng khi click chính xác vào viền mờ (chứ không phải click bên trong Modal form)
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isUploading) {
      toast.error('Vui lòng chờ ảnh tải lên xong!');
      return;
    }
    
    const isDirty = 
      formData.username !== initialData.username ||
      formData.email !== initialData.email ||
      formData.avatar_url !== initialData.avatar_url ||
      (formData.password && formData.password.trim() !== '');

    if (!isDirty) {
      toast.error('Không có thông tin nào được thay đổi.');
      return;
    }

    // BẢO MẬT: Tuyệt đối chỉ nhặt các trường cho phép, Không bao giờ gửi Role
    // Vì là PUT request, ta luôn gửi kèm username và email hiện hành
    const updatePayload = {
      username: formData.username,
      email: formData.email
    };

    if (formData.avatar_url !== initialData.avatar_url) {
      updatePayload.avatar_url = formData.avatar_url;
    }
    if (formData.password && formData.password.trim() !== '') {
      updatePayload.password = formData.password;
    }

    if (!user?.id) {
      toast.error('Lỗi: Không tìm thấy ID người dùng!');
      return;
    }

    setIsLoading(true);

    try {
      await updateProfile(updatePayload);

      toast.success('Cập nhật thông tin thành công!');
      setPreviewUrl(null);
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Cập nhật thất bại. Vui lòng thử lại sau.';
      if (Array.isArray(errorMsg)) {
        toast.error(errorMsg[0]?.msg || 'Dữ liệu không hợp lệ!');
      } else if (typeof errorMsg === 'string') {
        toast.error(errorMsg);
      } else {
        toast.error('Cập nhật thất bại!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const isConfirm = window.confirm("CẢNH BÁO ĐỎ: Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản của mình không?\nToàn bộ dữ liệu sẽ bị mất và không thể khôi phục!");
    if (!isConfirm) return;

    setIsDeleting(true);
    try {
      await deleteUser(user.id);
      toast.success("Tài khoản của bạn đã được xóa vĩnh viễn.");
      onClose();
      logout(); // Xóa sạch token và user info
      navigate('/login'); // Chuyển hướng về đăng nhập
    } catch (error) {
      console.error("LỖI XÓA TÀI KHOẢN:", error);
      if (error.response) {
        toast.error(`Lỗi: ${error.response.data?.detail || 'Không thể xóa tài khoản!'}`);
      } else {
        toast.error(error.message || 'Lỗi kết nối khi xóa tài khoản!');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // URL ảnh hiển thị: ưu tiên preview local -> avatar_url từ formData
  const displayAvatarUrl = previewUrl || formData.avatar_url;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onMouseDown={handleOverlayMouseDown}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#FAF5EC] shadow-2xl animate-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/50 px-6 py-4 bg-white/50">
          <h2 className="font-serif text-xl font-bold text-[#2A1610]">
            Thông tin tài khoản
          </h2>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-200/50 hover:text-stone-800 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* === Avatar Upload Section === */}
          <div className="flex flex-col items-center gap-3 mb-2">
            {/* Avatar Preview + Upload Overlay */}
            <div 
              className={`group relative h-24 w-24 shrink-0 rounded-full overflow-hidden shadow-lg cursor-pointer transition-all duration-200 ${
                isDragging 
                  ? 'ring-4 ring-[#CAA46A] ring-offset-2 scale-105' 
                  : 'hover:ring-2 hover:ring-[#CAA46A]/50 hover:ring-offset-1'
              }`}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Ảnh đại diện hoặc chữ cái */}
              {displayAvatarUrl ? (
                <img 
                  src={displayAvatarUrl} 
                  alt="Avatar" 
                  className="h-full w-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#2A1610] text-2xl font-bold text-white">
                  {formData.username ? formData.username.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              {/* Overlay khi hover */}
              {!isUploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera size={20} className="text-white mb-0.5" />
                  <span className="text-[10px] font-medium text-white">Đổi ảnh</span>
                </div>
              )}

              {/* Progress overlay khi đang upload */}
              {isUploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                  <Loader2 size={22} className="text-white animate-spin mb-1" />
                  <span className="text-xs font-semibold text-white">{uploadProgress}%</span>
                </div>
              )}
            </div>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="w-full max-w-[200px]">
                <div className="h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-[#CAA46A] to-[#E8C97A] transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Nút chọn ảnh & xoá ảnh */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 transition-all hover:border-[#CAA46A] hover:text-[#2A1610] hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={14} />
                {isUploading ? 'Đang tải...' : 'Chọn ảnh từ máy'}
              </button>

              {displayAvatarUrl && !isUploading && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-100 hover:border-red-300"
                >
                  <Trash2 size={14} />
                  Xoá ảnh
                </button>
              )}
            </div>

            {/* Cảnh báo lỗi upload */}
            {uploadError && (
              <div className="flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs text-red-600 font-medium animate-in fade-in duration-200">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
          
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              Tên hiển thị
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-800 focus:border-[#CAA46A] focus:outline-none focus:ring-2 focus:ring-[#CAA46A]/20 transition-all"
              placeholder="Nhập tên hiển thị..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-800 focus:border-[#CAA46A] focus:outline-none focus:ring-2 focus:ring-[#CAA46A]/20 transition-all"
              placeholder="Nhập địa chỉ email..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              Mật khẩu mới (Tùy chọn)
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-800 focus:border-[#CAA46A] focus:outline-none focus:ring-2 focus:ring-[#CAA46A]/20 transition-all"
              placeholder="Nhập mật khẩu mới nếu muốn đổi..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading || isDeleting || isUploading}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 focus:outline-none"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || isDeleting || isUploading}
              className="flex items-center gap-2 rounded-xl bg-[#2A1610] px-6 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-[#1A0D09] focus:outline-none focus:ring-2 focus:ring-[#CAA46A] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              <span>{isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        </form>

        {/* Modern Delete Account Button */}
        <div className="px-6 pb-6 pt-2 flex justify-center">
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isDeleting || isLoading}
            className="group flex items-center gap-1.5 text-xs font-medium text-stone-400 transition-colors hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} className="transition-transform group-hover:scale-110" />
            )}
            <span>{isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn tài khoản'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

