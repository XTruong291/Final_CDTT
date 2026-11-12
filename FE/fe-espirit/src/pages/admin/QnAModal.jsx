import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function QnAModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    question: '',
    answer: ''
  });

  // Reset form khi modal mở ra
  useEffect(() => {
    if (initialData) {
      setFormData({
        question: initialData.question,
        answer: initialData.answer
      });
    } else {
      setFormData({ question: '', answer: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert('Vui lòng nhập đầy đủ câu hỏi và câu trả lời!');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-[#FAF5EC]">
          <h3 className="font-serif text-xl font-bold text-[#2A1610]">
            {initialData ? 'Chỉnh sửa Câu trả lời mẫu' : 'Thêm Câu trả lời mẫu mới'}
          </h3>
          <button 
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-6 flex-1">
          <form id="qna-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Câu hỏi của người dùng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({...formData, question: e.target.value})}
                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
                placeholder="VD: Mâm cúng rằm tháng 7 gồm những gì?"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Câu trả lời của Chatbot (Bao gồm Văn khấn nếu có) <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({...formData, answer: e.target.value})}
                rows={8}
                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A] leading-relaxed"
                placeholder="Nhập nội dung trả lời chi tiết hoặc đoạn văn khấn dài..."
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors focus:outline-none"
          >
            Hủy
          </button>
          <button 
            type="submit"
            form="qna-form"
            className="rounded-lg bg-[#2A1610] px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1A0D09] transition-colors focus:outline-none focus:ring-2 focus:ring-[#CAA46A] focus:ring-offset-1"
          >
            Lưu nội dung
          </button>
        </div>

      </div>
    </div>
  );
}
