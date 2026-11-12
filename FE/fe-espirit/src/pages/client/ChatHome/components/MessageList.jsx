import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import logo from '../../../../assets/logo-dongson.jpg';

export default function MessageList({ messages, isSending }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  return (
    <div className="flex w-full flex-col py-6">
      {messages.map((msg, index) => (
        <MessageBubble key={index} message={msg} />
      ))}

      {/* Typing Indicator */}
      {isSending && (
        <div className="flex w-full justify-start mb-6">
          <div className="mr-3 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-amber-200/50 shadow-sm text-amber-500 overflow-hidden">
            <img src={logo} alt="Bot" className="h-full w-full object-cover" />
          </div>
          <div className="flex items-center rounded-2xl rounded-tl-sm border border-gray-100 bg-white px-4 py-3 shadow-sm">
            <div className="flex gap-1.5">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></span>
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></span>
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"></span>
            </div>
          </div>
        </div>
      )}

      {/* Invisible element to auto-scroll to */}
      <div ref={messagesEndRef} className="h-1" />
    </div>
  );
}
