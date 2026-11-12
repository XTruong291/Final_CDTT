import { useState } from 'react';
import toast from 'react-hot-toast';
import { X, Send } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose }) {
  const [feedbackType, setFeedbackType] = useState('Báo lỗi nội dung');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung chi tiết.');
      return;
    }

    setIsLoading(true);

    // Giả lập API call 1s
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Cảm ơn bạn đã đóng góp, Admin sẽ xem xét sớm nhất!');
      setContent('');
      setFeedbackType('Báo lỗi nội dung');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#FAF5EC] shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/50 px-6 py-4">
          <h2 className="font-serif text-xl font-bold text-[#2A1610]">
            Đóng góp Nội dung Tâm linh
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-200/50 hover:text-stone-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Loại phản hồi
            </label>
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="Báo lỗi nội dung">Báo lỗi nội dung</option>
              <option value="Yêu cầu thêm bài cúng mới">Yêu cầu thêm bài cúng mới</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Nội dung chi tiết
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập tên bài văn khấn hoặc nghi lễ bạn muốn E-SPIRIT bổ sung..."
              rows={4}
              className="w-full resize-none rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200/50 focus:outline-none"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-[#2A1610] px-6 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-[#1A0D09] focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <Send size={18} />
              )}
              <span>Gửi yêu cầu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
