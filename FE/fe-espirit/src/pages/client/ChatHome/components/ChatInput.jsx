import { useState, useRef, useEffect } from 'react';
import { Camera, Mic, ArrowUp, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useChatStore } from '../../../../store/useChatStore';

export default function ChatInput() {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  
  // Lấy actions từ Zustand store
  const sendChatMessage = useChatStore((state) => state.sendChatMessage);
  const isSending = useChatStore((state) => state.isSending);

  // Khởi tạo Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        toast.success("Đang nghe... Hãy nói gì đó!", { duration: 2000 });
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => prev + (prev ? ' ' : '') + transcript);
      };

      recognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
          toast.error("Lỗi nhận diện hoặc chưa cấp quyền Micro!");
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Xử lý tự động điều chỉnh chiều cao của textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`; // Max height 120px
    }
  }, [inputText]);

  const handleKeyDown = (e) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return; // Bỏ qua sự kiện khi đang gõ tiếng Việt (IME)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isSending && (inputText.trim() || selectedImage)) {
        handleSend();
      }
    }
  };

  const handleSend = () => {
    if (isSending) return; // Khóa gửi nếu hệ thống đang xử lý
    const contentToSend = inputText.trim() || 'Đã gửi một hình ảnh';
    if (contentToSend || selectedImage) {
      // Dùng action gửi tin nhắn thật qua API
      sendChatMessage(contentToSend);
    }
    
    setInputText('');
    setSelectedImage(null);
    
    // Reset height manually after send
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      // Xóa value để có thể chọn lại cùng 1 file nếu lỡ xóa
      e.target.value = '';
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói!");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const hasContent = inputText.trim().length > 0 || selectedImage !== null;

  return (
    <div className="flex w-full flex-col">
      {/* Box Nhập Liệu */}
      <div className="relative flex w-full flex-col rounded-[32px] border border-stone-200 bg-white p-2 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all focus-within:border-amber-300 focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
        
        {/* Vùng Preview Ảnh (Hiển thị ngay trên ô nhập text) */}
        {selectedImage && (
          <div className="relative ml-2 mt-2 mb-1 inline-block w-max">
            <img 
              src={selectedImage} 
              alt="Preview" 
              className="h-16 w-16 rounded-xl object-cover border border-stone-200 shadow-sm"
            />
            <button
              onClick={removeImage}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-stone-700 text-white shadow hover:bg-stone-800 transition-colors"
              title="Xóa ảnh"
            >
              <X size={12} strokeWidth={3} />
            </button>
          </div>
        )}

        <div className="flex items-end w-full">
          {/* Nút Upload Ảnh */}
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mb-1 ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
            title="Tải ảnh lên"
          >
            <Camera size={20} />
          </button>

          {/* Textarea nhập nội dung */}
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi AI về văn khấn, đồ cúng, địa điểm..."
            className="mx-2 max-h-[120px] min-h-[24px] w-full resize-none self-center bg-transparent py-2.5 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-[15px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            rows={1}
          />

          {/* Cụm Nút Phải: Mic & Send */}
          <div className="mb-1 mr-1 flex shrink-0 items-center gap-1">
            {/* Nút Voice */}
            {!hasContent && (
              <button
                onClick={toggleRecording}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors focus:outline-none ${
                  isRecording 
                    ? 'text-red-500 bg-red-50 animate-pulse hover:bg-red-100 ring-2 ring-red-200' 
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                }`}
                title="Nhập bằng giọng nói"
              >
                <Mic size={20} />
              </button>
            )}

            {/* Nút Gửi */}
            {(hasContent || isRecording) && (
              <button
                onClick={handleSend}
                disabled={!hasContent || isSending}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 focus:outline-none ${
                  hasContent && !isSending
                    ? 'bg-[#2A1610] text-white shadow-md hover:bg-[#1A0D09]'
                    : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                }`}
                title="Gửi tin nhắn"
              >
                <ArrowUp size={20} className={hasContent ? 'stroke-[2.5]' : 'stroke-2'} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-3 px-4 text-center text-xs text-stone-400/80">
        AI có thể đưa ra thông tin chưa chính xác. Xin hoan hỉ tự kiểm chứng.
      </p>
    </div>
  );
}
