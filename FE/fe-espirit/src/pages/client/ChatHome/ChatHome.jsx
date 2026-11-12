import ChatInput from './components/ChatInput';
import EmptyState from './components/EmptyState';
import MessageList from './components/MessageList';
import { useChatStore } from '../../../store/useChatStore';
import { Loader2 } from 'lucide-react';

export default function ChatHome() {
  // Kết nối với Zustand store
  const messages = useChatStore((state) => state.messages);
  const isSending = useChatStore((state) => state.isSending);
  const isMessagesLoading = useChatStore((state) => state.isMessagesLoading);

  return (
    <div className="flex h-full w-full flex-col relative">
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col relative">
        
        <div className="flex-1 overflow-y-auto px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex h-full flex-col">
            {isMessagesLoading ? (
              <div className="flex h-full w-full flex-col items-center justify-center pt-32">
                <Loader2 className="h-10 w-10 animate-spin text-amber-500 mb-4" />
                <span className="text-stone-500 text-[15px] font-medium">Đang tải lịch sử trò chuyện...</span>
              </div>
            ) : messages.length === 0 ? (
              <EmptyState />
            ) : (
              <MessageList messages={messages} isSending={isSending} />
            )}
          </div>
        </div>

        <div className="w-full shrink-0 px-4 pb-6 md:pb-8">
          <ChatInput />
        </div>

      </div>
    </div>
  );
}
