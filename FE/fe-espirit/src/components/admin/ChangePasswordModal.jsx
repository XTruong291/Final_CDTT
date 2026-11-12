import { useState } from 'react';
import { X, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // States toggle show/hide password
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Trạng thái toast giả lập trong modal
  const [showToast, setShowToast] = useState(false);

  if (!isOpen) return null;

  const isMatched = newPassword && confirmPassword && newPassword === confirmPassword;
  const isFormValid = currentPassword.length >= 6 && newPassword.length >= 6 && isMatched;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    // Giả lập lưu
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      onClose(); // Đóng modal
    }, 1500);
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden relative">
        
        {/* Toast Notification (Trong Modal) */}
        {showToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 border border-emerald-200 shadow-lg animate-in slide-in-from-top-4">
            <CheckCircle2 size={16} className="text-emerald-500" />
            Đổi mật khẩu thành công!
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-[#FAF5EC]/50">
          <h3 className="font-serif text-lg font-bold text-[#2A1610]">Đổi mật khẩu</h3>
          <button 
            onClick={handleClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6">
          <form id="change-pwd-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Mật khẩu hiện tại */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm text-gray-800 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm text-gray-800 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Nhập lại mật khẩu mới */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Nhập lại mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full rounded-lg border ${confirmPassword && !isMatched ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#CAA46A] focus:ring-[#CAA46A]'} bg-gray-50/50 px-4 py-2 text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-1`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && !isMatched && (
                <p className="mt-1 text-xs text-red-500">Mật khẩu mới không khớp.</p>
              )}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button 
            type="button"
            onClick={handleClose}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button 
            type="submit"
            form="change-pwd-form"
            disabled={!isFormValid || showToast}
            className={`rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-colors ${
              isFormValid && !showToast
                ? 'bg-[#2A1610] text-white hover:bg-[#1A0D09]' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Lưu thay đổi
          </button>
        </div>

      </div>
    </div>
  );
}
