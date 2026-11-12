import { useEffect } from 'react';
import { useCalendarStore } from '../../store/useCalendarStore';
import { Calendar, Moon, Star, Clock, X } from 'lucide-react';

export default function CalendarModal({ onClose }) {
  const { todayData, isLoadingCalendar, fetchToday } = useCalendarStore();

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-white to-[#FFF9F5] shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút Close */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100/80 text-stone-500 transition-colors hover:bg-red-100 hover:text-red-500"
        >
          <X size={18} />
        </button>

        {/* Header Modal */}
        <div className="flex items-center gap-2 border-b border-[#8C2A2D]/10 bg-[#8C2A2D]/5 px-6 py-4">
          <Calendar className="h-5 w-5 text-[#8C2A2D]" />
          <h3 className="font-serif text-lg font-medium text-[#8C2A2D]">Chi Tiết Lịch Hôm Nay</h3>
        </div>

        <div className="p-6">
          {isLoadingCalendar ? (
            <div className="animate-pulse">
              <div className="mb-4 h-6 w-1/3 rounded bg-stone-200"></div>
              <div className="mb-2 h-4 w-2/3 rounded bg-stone-200"></div>
              <div className="mb-6 h-4 w-1/2 rounded bg-stone-200"></div>
              <div className="flex gap-2">
                <div className="h-8 w-24 rounded-full bg-stone-200"></div>
                <div className="h-8 w-24 rounded-full bg-stone-200"></div>
              </div>
            </div>
          ) : !todayData ? (
            <div className="text-center text-stone-500 py-4">Không thể tải dữ liệu lịch</div>
          ) : (
            <>
              {/* Dương Lịch */}
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#8C2A2D] to-[#6b1e20] text-white shadow-inner">
                  <span className="text-sm font-medium opacity-90">Tháng {todayData.month}</span>
                  <span className="text-3xl font-bold leading-none">{todayData.day}</span>
                </div>
                <div>
                  <h4 className="font-serif text-xl font-medium text-stone-800">
                    {todayData.day_of_week}
                  </h4>
                  <p className="text-sm text-stone-500">
                    Ngày {todayData.day} tháng {todayData.month} năm {todayData.year}
                  </p>
                </div>
              </div>

              {/* Âm Lịch & Can Chi */}
              <div className="mb-6 rounded-xl border border-amber-200/50 bg-amber-50/50 p-4">
                <div className="mb-3 flex items-center gap-2 text-[#8C2A2D]">
                  <Moon className="h-5 w-5" />
                  <span className="font-semibold">Âm lịch & Can chi</span>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-stone-700">
                    <span className="inline-block w-20 text-stone-500">Ngày Âm:</span> 
                    Ngày <span className="font-medium text-stone-900">{todayData.lunar_day}</span> tháng <span className="font-medium text-stone-900">{todayData.lunar_month}</span> năm <span className="font-medium text-stone-900">{todayData.lunar_year}</span>
                  </p>
                  <p className="text-sm text-stone-700">
                    <span className="inline-block w-20 text-stone-500">Can chi:</span> 
                    Ngày {todayData.can_chi_day}, Tháng {todayData.can_chi_month}, Năm {todayData.can_chi_year}
                  </p>
                </div>
                
                {/* Sự kiện tâm linh */}
                {(todayData.special_event || todayData.spiritual_reminder) && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-100/80 px-4 py-2.5 text-sm font-medium text-amber-800">
                    <Star className="h-4 w-4 shrink-0 text-amber-600" />
                    <span>{todayData.special_event || todayData.spiritual_reminder}</span>
                  </div>
                )}
              </div>

              {/* Giờ Hoàng Đạo */}
              {todayData.auspicious_hours && todayData.auspicious_hours.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2 text-stone-700">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <span className="font-semibold">Giờ Hoàng Đạo</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar pr-2 flex flex-wrap gap-2">
                    {todayData.auspicious_hours.filter(h => h.is_auspicious).map((hour, idx) => (
                      <div 
                        key={idx} 
                        className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-sm font-medium text-amber-700 shadow-sm transition-colors hover:bg-amber-50"
                        title={hour.star_name || "Giờ Hoàng Đạo"}
                      >
                        {hour.name} ({hour.time_range})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
