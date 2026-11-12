import { ScrollText, Package, Compass, Sparkles, Calendar, Clock } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../../../store/useAuthStore';
import { useCalendarStore } from '../../../../store/useCalendarStore';
import DateLookupModal from '../../../../components/client/DateLookupModal';
import MonthlyCalendarModal from '../../../../components/client/MonthlyCalendarModal';
import AuspiciousHoursModal from '../../../../components/client/AuspiciousHoursModal';

export default function EmptyState() {
  const { user, isAuthenticated } = useAuthStore();
  const { todayData } = useCalendarStore();
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
  const [isMonthlyCalendarOpen, setIsMonthlyCalendarOpen] = useState(false);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);

  const suggestions = [
    {
      id: 1,
      text: 'Bài cúng Mùng 1',
      icon: <ScrollText size={18} className="text-amber-600/70" />,
    },
    {
      id: 2,
      text: 'Combo mâm cúng Rằm',
      icon: <Package size={18} className="text-amber-600/70" />,
    },
    {
      id: 3,
      text: 'Tra cứu ngày Âm Dương',
      icon: <Compass size={18} className="text-amber-600/70" />,
      onClick: () => setIsLookupModalOpen(true)
    },
    {
      id: 4,
      text: 'Xem Lịch Tháng',
      icon: <Calendar size={18} className="text-amber-600/70" />,
      onClick: () => setIsMonthlyCalendarOpen(true)
    },
    {
      id: 5,
      text: 'Giờ Hoàng Đạo Hôm Nay',
      icon: <Clock size={18} className="text-amber-600/70" />,
      onClick: () => setIsHoursModalOpen(true)
    },
  ];

  const dateText = todayData 
    ? `Hôm nay là ${todayData.lunar_day}/${todayData.lunar_month} Âm lịch`
    : `Hôm nay`;

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-8">
      {/* Lời chào cá nhân hóa */}
      <div className="mb-12 max-w-2xl px-4 text-center">
        <h2 className="font-serif text-2xl leading-relaxed text-[#2A1610] md:text-3xl lg:leading-loose">
          <span className="font-bold">
            Xin chào {isAuthenticated && user?.username ? user.username : 'tín chủ'},
          </span><br />
          {dateText}. Bạn cần mình trợ giúp gì cho các nghi lễ tâm linh hôm nay không?
        </h2>
      </div>

      {/* Prompt Chips (Grid Gợi ý nhanh) */}
      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 px-4 md:grid-cols-2">
        {suggestions.map((item) => (
          <button
            key={item.id}
            onClick={item?.onClick}
            className="group relative flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all duration-200 ease-in-out hover:border-amber-400/50 hover:bg-gray-50 hover:shadow-md focus:outline-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 transition-colors group-hover:bg-amber-100/50">
              {item.icon}
            </div>
            <span className="font-medium text-gray-700 transition-colors group-hover:text-gray-900">
              {item.text}
            </span>
          </button>
        ))}
      </div>

      {isLookupModalOpen && (
        <DateLookupModal onClose={() => setIsLookupModalOpen(false)} />
      )}

      {isMonthlyCalendarOpen && (
        <MonthlyCalendarModal onClose={() => setIsMonthlyCalendarOpen(false)} />
      )}

      {isHoursModalOpen && (
        <AuspiciousHoursModal onClose={() => setIsHoursModalOpen(false)} />
      )}
    </div>
  );
}
