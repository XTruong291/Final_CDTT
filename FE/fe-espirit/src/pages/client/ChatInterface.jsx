import { useState, useRef, useEffect } from 'react';
import { RefreshCcw, Send, Paperclip, Copy, Sparkles, User, CheckCircle2, Circle } from 'lucide-react';

// --- SUBCOMPONENT: Checkbox Item ---
const ChecklistItem = ({ item }) => {
  const [checked, setChecked] = useState(false);
  return (
    <li 
      onClick={() => setChecked(!checked)}
      className="flex cursor-pointer items-start gap-3 py-1.5 transition-colors hover:bg-gray-50/50 rounded-lg px-2 -mx-2"
    >
      <div className={`mt-0.5 shrink-0 transition-colors ${checked ? 'text-emerald-500' : 'text-gray-300'}`}>
        {checked ? <CheckCircle2 size={18} /> : <Circle size={18} />}
      </div>
      <span className={`leading-relaxed text-sm transition-all ${checked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
        {item}
      </span>
    </li>
  );
};

// --- SUBCOMPONENT: Message Bubble ---
const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Đã copy văn khấn!');
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm mt-1
          ${isUser ? 'bg-white text-[#2A1610]' : 'bg-[#2A1610] text-white'}`}
        >
          {isUser ? <User size={16} /> : <Sparkles size={16} />}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2 w-full">
          {isUser ? (
            <div className="rounded-2xl rounded-tr-none bg-[#2A1610] px-4 py-3 text-[15px] text-white shadow-sm break-words">
              {message.text}
            </div>
          ) : (
            <div className="rounded-2xl rounded-tl-none bg-white p-4 md:p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 text-[15px] text-gray-800 break-words w-full">
              
              {/* Text bình thường */}
              {message.text && (
                <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
              )}

              {/* Dạng Checklist (Mâm cúng) */}
              {message.checklist && message.checklist.length > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <p className="mb-2 font-medium text-[#2A1610]">Danh sách chuẩn bị:</p>
                  <ul className="space-y-1">
                    {message.checklist.map((item, idx) => (
                      <ChecklistItem key={idx} item={item} />
                    ))}
                  </ul>
                </div>
              )}

              {/* Dạng Khung Văn Khấn */}
              {message.ritualText && (
                <div className="relative mt-4 overflow-hidden rounded-xl border border-[#CAA46A]/40 bg-[#Fdfbf7] p-5 md:p-6 shadow-inner">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#CAA46A] to-[#2A1610] opacity-50"></div>
                  
                  <button 
                    onClick={() => handleCopy(message.ritualText)}
                    className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-xs font-medium text-[#2A1610] shadow-sm border border-[#CAA46A]/20 transition-colors hover:bg-[#FAF5EC]"
                  >
                    <Copy size={14} /> Sao chép
                  </button>
                  
                  <div className="mt-6 font-serif text-[15px] md:text-base leading-[1.8] text-[#2A1610] text-justify whitespace-pre-wrap px-2 md:px-4">
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
export default function ChatInterface() {
  const initialMessages = [
    {
      id: '1',
      sender: 'user',
      text: 'Cho tôi xin bài văn khấn mùng 1 hàng tháng và mâm cúng cơ bản.'
    },
    {
      id: '2',
      sender: 'bot',
      text: 'Dạ, chào bạn. Đây là gợi ý mâm cúng cơ bản và bài văn khấn ngày mùng 1 hàng tháng (Sóc vọng) tại nhà:',
      checklist: [
        'Hương, hoa tươi (hoa cúc, hoa huệ)',
        'Trầu cau, rượu trắng, nước lọc',
        'Trái cây tươi (ngũ quả)',
        'Bánh kẹo, vàng mã'
      ],
      ritualText: 'Nam mô A Di Đà Phật! (3 lần)\n\nCon lạy chín phương Trời, mười phương Chư Phật, Chư Phật mười phương.\nKính lạy ngài Bản cảnh Thành Hoàng, ngài Bản xứ Thổ địa, ngài Bản gia Táo Quân cùng chư vị Tôn Thần.\n\nHôm nay là ngày mùng 1 tháng... năm...\nTín chủ con là: [Tên của bạn]\nNgụ tại: [Địa chỉ nhà]\n\nThành tâm sắm sửa hương hoa lễ vật, kim ngân trà quả, dâng lên trước án. Cúi xin các ngài thương xót tín chủ, giáng lâm trước án, chứng giám lòng thành, thụ hưởng lễ vật. Phù hộ độ trì cho gia đạo bình an, công việc hanh thông, vạn sự tốt lành.\n\nNam mô A Di Đà Phật! (3 lần)'
    }
  ];

  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text) => {
    if (!text.trim()) return;

    // Add user message
    const newUserMsg = { id: Date.now().toString(), sender: 'user', text: text.trim() };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Mock bot reply after 3 seconds
    setTimeout(() => {
      setIsTyping(false);
      const newBotMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'E-SPIRIT AI đã ghi nhận câu hỏi của bạn. Tính năng AI đang được hoàn thiện và sẽ trả lời chính xác trong phiên bản tới!'
      };
      setMessages(prev => [...prev, newBotMsg]);
    }, 3000);
  };

  const handleRefresh = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen flex-col bg-[#FAF5EC] font-sans">
      
      {/* 1. Header */}
      <header className="flex h-14 md:h-16 shrink-0 items-center justify-between border-b border-[#CAA46A]/20 bg-white/90 px-4 shadow-sm backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2A1610] text-white shadow-sm">
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="font-serif text-base md:text-lg font-bold text-[#2A1610]">E-SPIRIT / Trợ lý Tâm Linh</h1>
            <p className="text-[10px] md:text-xs font-medium text-[#CAA46A]">Hôm nay: 15/7 Âm lịch</p>
          </div>
        </div>
        
        <button 
          onClick={handleRefresh}
          className="flex items-center justify-center h-9 w-9 rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          title="Làm mới hội thoại"
        >
          <RefreshCcw size={18} />
        </button>
      </header>

      {/* 2. Message Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div className="mx-auto max-w-3xl flex flex-col min-h-full">
          
          {messages.length === 0 ? (
            /* Empty State / Suggested Prompts */
            <div className="flex flex-1 flex-col items-center justify-center text-center mt-10">
              <div className="relative mb-8 flex items-center justify-center">
                {/* Giả lập họa tiết trống đồng mờ */}
                <div className="absolute h-40 w-40 rounded-full border-4 border-dashed border-[#CAA46A]/20 animate-[spin_60s_linear_infinite]"></div>
                <div className="absolute h-24 w-24 rounded-full border-2 border-[#CAA46A]/20"></div>
                <Sparkles size={48} className="text-[#CAA46A]/40" />
              </div>
              <h2 className="mb-2 font-serif text-2xl font-bold text-[#2A1610]">Xin chào!</h2>
              <p className="mb-10 text-sm text-gray-500 max-w-sm">
                Trợ lý AI chuyên hỗ trợ các vấn đề về tâm linh, phong tục và văn khấn truyền thống.
              </p>
              
              <div className="flex flex-col gap-3 w-full max-w-xs">
                {['Văn khấn mùng 1', 'Mâm cúng rằm', 'Xem ngày xuất hành'].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="rounded-xl border border-[#CAA46A]/30 bg-white/50 px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-[#CAA46A] hover:bg-white hover:text-[#2A1610]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message List */
            <div className="flex-1 pb-4">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex w-full justify-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2A1610] text-white shadow-sm mt-1">
                      <Sparkles size={16} />
                    </div>
                    <div className="rounded-2xl rounded-tl-none bg-white px-5 py-4 shadow-sm border border-gray-100 flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>
      </main>

      {/* 3. Chat Box Input */}
      <footer className="shrink-0 bg-white p-3 md:p-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] border-t border-gray-100">
        <div className="mx-auto max-w-3xl">
          <div className="relative flex items-end gap-2 rounded-3xl border border-gray-200 bg-[#FAF5EC]/50 p-1.5 shadow-inner transition-colors focus-within:border-[#CAA46A] focus-within:bg-white">
            
            <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700">
              <Paperclip size={20} />
            </button>

            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(inputValue);
                }
              }}
              placeholder="Hỏi trợ lý tâm linh..."
              className="max-h-24 min-h-[40px] w-full resize-none bg-transparent py-2.5 text-[15px] text-gray-800 focus:outline-none scrollbar-hide"
              rows={1}
            />

            <button
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim()}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
                inputValue.trim() 
                  ? 'bg-[#2A1610] text-white shadow-md hover:bg-[#1A0D09]' 
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Send size={18} className={inputValue.trim() ? 'ml-0.5' : ''} />
            </button>
          </div>
        </div>
      </footer>
      
      {/* Hide Scrollbar CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
