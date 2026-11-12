import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { getMonthlyCalendar } from '../../services/calendarService';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const DOW_MAP = {
  'Thứ Hai': 0,
  'Thứ Ba': 1,
  'Thứ Tư': 2,
  'Thứ Năm': 3,
  'Thứ Sáu': 4,
  'Thứ Bảy': 5,
  'Chủ Nhật': 6,
};

const todayStr = new Date().toISOString().split('T')[0];

export default function MonthlyCalendarModal({ onClose }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState(null);
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    const fetchMonth = async () => {
      setIsLoadingMonth(true);
      setCalendarData(null);
      try {
        const data = await getMonthlyCalendar(year, month);
        setCalendarData(data);
      } catch (err) {
        console.error('Lỗi tải lịch tháng:', err);
      } finally {
        setIsLoadingMonth(false);
      }
    };
    fetchMonth();
  }, [year, month]);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(1);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(1);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const startPadding =
    calendarData?.days?.length > 0
      ? (DOW_MAP[calendarData.days[0].day_of_week] ?? 0)
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-2 py-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* === HEADER === */}
        <div className="relative flex items-center justify-center px-6 py-5 border-b border-gray-100">
          {/* Nút < lật tháng trước */}
          <button
            onClick={handlePrevMonth}
            className="absolute left-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
            title="Tháng trước"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Tiêu đề giữa */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#2A1610] font-serif">
              Tháng {month} Năm {year}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">Lịch Âm – Dương</p>
          </div>

          {/* Nút > lật tháng sau */}
          <button
            onClick={handleNextMonth}
            className="absolute right-14 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
            title="Tháng sau"
          >
            <ChevronRight size={20} />
          </button>

          {/* Nút X đóng Modal — tách riêng, absolute phải */}
          <button
            onClick={onClose}
            className="absolute right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* === WEEKDAY HEADERS === */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className={`py-3 text-center text-xs font-semibold uppercase tracking-wider ${
                d === 'CN' ? 'text-[#2A1610]' : 'text-gray-500'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* === GRID NGÀY === */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingMonth ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 opacity-60">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <p className="text-sm font-medium text-stone-600">Đang tải lịch tháng...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {/* Ô trống đầu tháng */}
              {Array.from({ length: startPadding }).map((_, i) => (
                <div
                  key={`pad-${i}`}
                  className="min-h-[80px] border-b border-r border-gray-100 bg-gray-50/30"
                />
              ))}

              {/* Các ngày trong tháng */}
              {calendarData?.days?.map((day) => {
                const isToday = day.solar_date === todayStr;
                const isSunday = day.day_of_week === 'Chủ Nhật';
                const isSaturday = day.day_of_week === 'Thứ Bảy';
                const isSpecialLunar = day.lunar_day === 1 || day.lunar_day === 15;
                const hasEvent = day.is_first_day || day.is_full_moon || day.special_event;

                // Màu chữ Ngày Dương
                let solarTextClass = 'text-gray-800';
                if (!isToday) {
                  if (isSunday) solarTextClass = 'text-red-600';
                  else if (isSaturday) solarTextClass = 'text-blue-600';
                }

                return (
                  <div
                    key={day.solar_date}
                    className={`relative min-h-[80px] border-b border-r border-gray-100 p-2 flex flex-col items-center justify-center transition-colors hover:bg-amber-50/40 ${
                      isToday ? 'bg-red-50/30' : ''
                    }`}
                  >
                    {/* Chấm sự kiện */}
                    {hasEvent && (
                      <span
                        className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-400"
                        title={day.special_event || ''}
                      />
                    )}

                    {/* Ngày Dương */}
                    {isToday ? (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2A1610] text-white text-sm font-semibold shadow-sm">
                        {day.day}
                      </span>
                    ) : (
                      <span className={`text-base font-medium ${solarTextClass}`}>
                        {day.day}
                      </span>
                    )}

                    {/* Ngày Âm */}
                    <span
                      className={`mt-1 text-xs leading-none ${
                        isSpecialLunar
                          ? 'font-bold text-[#2A1610]'
                          : 'text-gray-400'
                      }`}
                    >
                      {day.lunar_day === 1
                        ? `M.1`
                        : day.lunar_day === 15
                        ? 'Rằm'
                        : day.lunar_day}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>


      </div>
    </div>
  );
}
