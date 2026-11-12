import { useState, useRef, useEffect } from 'react';
import { RefreshCcw, Send, Image as ImageIcon, Copy, CheckCircle2, User, Sparkles } from 'lucide-react';

// --- SUBCOMPONENT: Message Bubble ---
const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';

  // Hàm xử lý copy văn khấn
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Đã copy văn khấn vào khay nhớ tạm!');
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[85%] gap-3 sm:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm mt-1
          ${isUser ? 'bg-[#2A1610] text-white' : 'bg-white border border-[#CAA46A]/30 text-[#CAA46A]'}`}
        >
          {isUser ? <User size={16} /> : <Sparkles size={16} />}
        </div>

        {/* Bubble Content */}
        <div className="flex flex-col gap-2">
          {isUser ? (
            // Tin nhắn của User
            <div className="rounded-2xl rounded-tr-none bg-[#2A1610] px-4 py-3 text-sm text-white shadow-sm">
              <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
            </div>
          ) : (
            // Tin nhắn của Bot
            <div className="rounded-2xl rounded-tl-none bg-white p-4 shadow-sm border border-gray-100 text-sm text-gray-800">
              
              {/* Đoạn text giới thiệu / bình thường */}
              {message.text && (
                <p className="leading-relaxed whitespace-pre-wrap mb-3">{message.text}</p>
              )}

              {/* Dạng List (ví dụ Mâm cúng) */}
              {message.list && message.list.length > 0 && (
                <ul className="mb-4 space-y-2">
                  {message.list.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#CAA46A]" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Dạng Khung Văn Khấn */}
              {message.ritualText && (
                <div className="relative mt-2 overflow-hidden rounded-xl border border-[#CAA46A]/30 bg-[#Fdfbf7] p-5 shadow-inner">
                  {/* Nút Copy */}
                  <button 
                    onClick={() => handleCopy(message.ritualText)}
                    className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-white/80 px-2.5 py-1.5 text-xs font-medium text-gray-600 shadow-sm border border-gray-200 transition-colors hover:bg-gray-50 hover:text-[#2A1610]"
                    title="Copy văn khấn"
                  >
                    <Copy size={14} /> Copy
                  </button>
                  
                  {/* Nội dung Văn khấn */}
                  <div className="mt-4 font-serif text-[15px] leading-loose text-[#2A1610] text-justify whitespace-pre-wrap px-2">
                    {message.ritualText}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// --- MAIN COMPONENT ---
export default function AIAssistant() {
  // Mock data khởi tạo
  const initialMessages = [
    {
      id: 'msg_1',
      sender: 'user',
      text: 'Cho tôi xin bài văn khấn mùng 1 hàng tháng và mâm cúng cơ bản nhé.'
    },
    {
      id: 'msg_2',
      sender: 'bot',
      text: 'Dạ, chào bạn. Đây là gợi ý mâm cúng cơ bản và bài văn khấn ngày mùng 1 hàng tháng (Sóc vọng) tại nhà:',
      list: [
        'Hương, hoa tươi (thường là hoa cúc, hoa huệ).',
        'Trầu cau, rượu, nước mạn, nước trà.',
        'Trái cây tươi (ngũ quả).',
        'Bánh kẹo, vàng mã (tùy tâm sắm sửa).'
      ],
      ritualText: 'Nam mô A Di Đà Phật! (3 lần)\n\nCon lạy chín phương Trời, mười phương Chư Phật.\nKính lạy ngài Bản cảnh Thành Hoàng, ngài Bản xứ Thổ địa, ngài Bản gia Táo Quân cùng chư vị Tôn Thần.\n\nHôm nay là ngày mùng 1 tháng... năm...\nTín chủ con là: [Tên của bạn]\nNgụ tại: [Địa chỉ nhà]\n\nThành tâm sắm sửa hương hoa lễ vật, dâng lên trước án. Cúi xin các ngài thương xót tín chủ, giáng lâm trước án, chứng giám lòng thành, thụ hưởng lễ vật. Phù hộ độ trì cho gia đạo bình an, công việc hanh thông, vạn sự tốt lành.\n\nNam mô A Di Đà Phật! (3 lần)'
    }
  ];

  const suggestedPrompts = [
    'Văn khấn mùng 1',
    'Mâm cúng rằm tháng 7',
    'Xem ngày tốt xuất hành',
    'Giải hạn sao La Hầu'
  ];

  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  
  const messagesEndRef = useRef(null);

  // Auto-scroll xuống cuối khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Xử lý Gửi tin nhắn
  const handleSend = (text) => {
    if (!text.trim()) return;

    // Add User message
    const newUserMsg = { id: Date.now().toString(), sender: 'user', text: text.trim() };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');

    // Mock Bot reply after 1s
    setTimeout(() => {
      const newBotMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'E-SPIRIT AI đang trong quá trình thử nghiệm, hiện tại chỉ hiển thị demo giao diện. Tính năng trò chuyện trực tiếp sẽ sớm được cập nhật!'
      };
      setMessages(prev => [...prev, newBotMsg]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[#FAF5EC] font-sans">
      
      {/* 1. Header (Top Nav) */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#CAA46A]/20 bg-white/80 px-4 shadow-sm backdrop-blur-md sm:px-6 z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2A1610] text-white shadow-sm">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-[#2A1610]">Trợ lý Tâm Linh AI</h1>
            <p className="text-xs font-medium text-[#CAA46A]">Hôm nay: 15/7 Âm lịch - Lễ Vu Lan</p>
          </div>
        </div>
        
        <button 
          onClick={() => setMessages([])}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
          title="Làm mới hội thoại"
        >
          <RefreshCcw size={16} />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </header>

      {/* 2. Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:px-8 custom-scrollbar">
        <div className="mx-auto max-w-4xl flex flex-col min-h-full">
          
          {/* Messages */}
          {messages.length > 0 ? (
            <div className="flex-1 pb-4">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            /* Trạng thái rỗng: Cột chính giữa */
            <div className="flex flex-1 flex-col items-center justify-center text-center opacity-80 mt-10">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#CAA46A]/10 text-[#2A1610]">
                <Sparkles size={40} />
              </div>
              <h2 className="mb-2 font-serif text-2xl font-bold text-[#2A1610]">Xin chào, tôi có thể giúp gì cho bạn?</h2>
              <p className="mb-10 text-sm text-gray-500 max-w-md">
                Trợ lý AI chuyên hỗ trợ các vấn đề về tâm linh, phong tục, nghi lễ và văn khấn truyền thống Việt Nam.
              </p>
              
              {/* Suggested Prompts (Khi chưa có chat) */}
              <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-[#CAA46A] hover:text-[#2A1610] hover:shadow-md"
                  >
                    {prompt}
                    <Send size={14} className="text-gray-300" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 3. Chat Input */}
      <footer className="shrink-0 bg-white p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] sm:px-6">
        <div className="mx-auto max-w-4xl">
          {/* Suggested Prompts (Gợi ý thu gọn ngay trên ô input khi ĐÃ CÓ chat) */}
          {messages.length > 0 && messages.length < 3 && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-[#CAA46A] hover:bg-white hover:text-[#2A1610]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div className="relative flex items-end gap-2 rounded-3xl border border-gray-200 bg-[#FAF5EC]/30 p-2 shadow-sm focus-within:border-[#CAA46A] focus-within:bg-white focus-within:shadow-md transition-all">
            
            {/* Upload Ảnh */}
            <button 
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
              title="Đính kèm hình ảnh"
            >
              <ImageIcon size={20} />
            </button>

            {/* Input Textarea */}
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Nhập câu hỏi của bạn (Ví dụ: Xin bài văn khấn mùng 1)..."
              className="max-h-32 min-h-[40px] w-full resize-none bg-transparent py-2.5 text-sm text-gray-800 focus:outline-none custom-scrollbar"
              rows={1}
              style={{ overflowY: 'auto' }}
            />

            {/* Nút Send */}
            <button
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim()}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all focus:outline-none ${
                inputValue.trim() 
                  ? 'bg-[#2A1610] text-white shadow-md hover:bg-[#1A0D09]' 
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Send size={18} className={inputValue.trim() ? 'ml-0.5' : ''} />
            </button>
          </div>
          
          <p className="mt-3 text-center text-[10px] text-gray-400">
            Trợ lý AI có thể cung cấp thông tin chưa chính xác. Vui lòng tham khảo thêm từ các nguồn uy tín.
          </p>
        </div>
      </footer>
      
      {/* CSS Inline cho Custom Scrollbar mỏng */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
}
