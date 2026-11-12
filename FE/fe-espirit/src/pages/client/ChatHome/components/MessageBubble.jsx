import RitualCard from './RitualCard';
import ChecklistCard from './ChecklistCard';
import LocationCard from './LocationCard';
import logo from '../../../../assets/logo-dongson.jpg';

export default function MessageBubble({ message }) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      {/* Bot Avatar */}
      {!isUser && (
        <div className="mr-3 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-amber-200/50 shadow-sm text-amber-500 overflow-hidden">
          <img src={logo} alt="Bot" className="h-full w-full object-cover" />
        </div>
      )}

      {/* Message Content */}
      <div className={`flex max-w-[85%] flex-col md:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Text Bubble */}
        {message.type === 'text' && (
          <div
            className={`px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
              isUser
                ? 'bg-[#2A1610] text-white rounded-2xl rounded-tr-sm'
                : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm'
            }`}
          >
            {message.content}
          </div>
        )}

        {/* Rich-UI Cards */}
        {message.type === 'ritual' && (
          <RitualCard data={message.data} />
        )}
        
        {message.type === 'checklist' && (
          <ChecklistCard data={message.data} />
        )}

        {message.type === 'location' && (
          <LocationCard data={message.data} />
        )}
      </div>
    </div>
  );
}
