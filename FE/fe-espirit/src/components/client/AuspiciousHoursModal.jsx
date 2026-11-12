import { useState, useEffect } from 'react';
import { X, Search, Loader2, Star, Clock } from 'lucide-react';
import { getAuspiciousHours } from '../../services/calendarService';
import toast from 'react-hot-toast';

export default function AuspiciousHoursModal({ onClose }) {
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [hoursData, setHoursData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const fetchHours = async (date) => {
    setIsSearching(true);
    setHoursData(null);
    try {
      const data = await getAuspiciousHours(date);
      setHoursData(data);
    } catch (err) {
      console.error('Lỗi lấy giờ hoàng đạo:', err);
      toast.error('Không thể tra cứu giờ cho ngày này!');
    } finally {
      setIsSearching(false);
    }
  };

  // Tự động tải giờ của ngày hôm nay khi mở modal
  useEffect(() => {
    fetchHours(dateInput);
  }, []);

  const handleSearch = () => {
    if (!dateInput) return;
    fetchHours(dateInput);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-gradient-to-br from-white to-[#FFF9F5] shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100/80 text-stone-500 transition-colors hover:bg-red-100 hover:text-red-500"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 border-b border-[#8C2A2D]/10 bg-[#8C2A2D]/5 px-6 py-4">
          <Clock className="h-5 w-5 text-[#8C2A2D]" />
          <div>
            <h3 className="font-serif text-lg font-medium text-[#8C2A2D]">Giờ Hoàng Đạo & Hắc Đạo</h3>
            {hoursData && (
              <p className="text-xs text-stone-500">
                {hoursData.solar_date} · Can chi: <span className="font-medium text-amber-700">{hoursData.can_chi_day}</span>
              </p>
            )}
          </div>
        </div>

        {/* Form chọn ngày */}
        <div className="flex gap-2 px-6 pt-4 pb-3 border-b border-stone-100">
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-2 text-stone-700 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !dateInput}
            className="flex items-center gap-2 rounded-xl bg-[#8C2A2D] px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-[#6b1e20] focus:outline-none disabled:opacity-70"
          >
            {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            <span className="hidden sm:inline">Xem giờ</span>
          </button>
        </div>

        {/* Danh sách 12 canh giờ */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isSearching ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 opacity-60">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <p className="text-sm font-medium text-stone-600">Đang tra cứu giờ Hoàng Đạo...</p>
            </div>
          ) : !hoursData ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 opacity-50">
              <Clock className="h-10 w-10 text-stone-400" />
              <p className="text-sm text-stone-500 text-center">Chọn ngày để xem 12 canh giờ trong ngày</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hoursData.hours?.map((hour, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                    hour.is_auspicious
                      ? 'border-amber-300/60 bg-gradient-to-r from-amber-50 to-yellow-50/50 shadow-sm'
                      : 'border-gray-200/80 bg-gray-50/50'
                  }`}
                >
                  {/* Icon */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    hour.is_auspicious
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {hour.is_auspicious
                      ? <Star size={18} className="fill-amber-400 text-amber-500" />
                      : <Clock size={18} />
                    }
                  </div>

                  {/* Nội dung */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${
                        hour.is_auspicious ? 'text-amber-900' : 'text-gray-700'
                      }`}>
                        {hour.name}
                      </span>
                      <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                        hour.is_auspicious
                          ? 'bg-amber-200/70 text-amber-800'
                          : 'bg-gray-200/70 text-gray-600'
                      }`}>
                        {hour.is_auspicious ? 'Hoàng Đạo' : 'Hắc Đạo'}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-stone-500 mt-0.5">{hour.time_range}</p>
                    <p className={`text-xs mt-0.5 truncate ${
                      hour.is_auspicious ? 'text-amber-700' : 'text-gray-500'
                    }`}>
                      Sao: {hour.star_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
