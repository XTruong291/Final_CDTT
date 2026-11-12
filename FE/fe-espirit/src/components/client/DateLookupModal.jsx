import { useState } from 'react';
import { Calendar, Moon, Star, Clock, X, Search, Loader2, Sun } from 'lucide-react';
import { lookupSolarToLunar, lookupLunarToSolar } from '../../services/calendarService';
import toast from 'react-hot-toast';

export default function DateLookupModal({ onClose }) {
  const [mode, setMode] = useState('solarToLunar'); // 'solarToLunar' | 'lunarToSolar'
  
  // State Dương lịch
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  
  // State Âm lịch
  const [lunarDay, setLunarDay] = useState('');
  const [lunarMonth, setLunarMonth] = useState('');
  const [lunarYear, setLunarYear] = useState('');
  const [isLeapMonth, setIsLeapMonth] = useState(false);

  const [lookupResult, setLookupResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleTabChange = (newMode) => {
    setMode(newMode);
    setLookupResult(null);
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setLookupResult(null);
    try {
      if (mode === 'solarToLunar') {
        if (!dateInput) return;
        const data = await lookupSolarToLunar(dateInput);
        setLookupResult(data);
      } else {
        if (!lunarDay || !lunarMonth || !lunarYear) {
          toast.error("Vui lòng nhập đầy đủ Ngày, Tháng, Năm Âm lịch!");
          setIsSearching(false);
          return;
        }
        const data = await lookupLunarToSolar(
          parseInt(lunarDay), 
          parseInt(lunarMonth), 
          parseInt(lunarYear), 
          isLeapMonth
        );
        setLookupResult(data);
      }
    } catch (error) {
      console.error("Lỗi tra cứu:", error);
      toast.error("Không thể tra cứu ngày này hoặc định dạng không hợp lệ.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-white to-[#FFF9F5] shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100/80 text-stone-500 transition-colors hover:bg-red-100 hover:text-red-500"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 border-b border-[#8C2A2D]/10 bg-[#8C2A2D]/5 px-6 py-4">
          <Calendar className="h-5 w-5 text-[#8C2A2D]" />
          <h3 className="font-serif text-lg font-medium text-[#8C2A2D]">Tra Cứu Ngày Âm Dương</h3>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-4 gap-2">
          <button
            onClick={() => handleTabChange('solarToLunar')}
            className={`flex-1 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
              mode === 'solarToLunar' 
                ? 'border-[#8C2A2D] text-[#8C2A2D] bg-[#8C2A2D]/5' 
                : 'border-transparent text-stone-500 hover:text-stone-700 hover:bg-stone-50'
            }`}
          >
            Dương ➔ Âm
          </button>
          <button
            onClick={() => handleTabChange('lunarToSolar')}
            className={`flex-1 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
              mode === 'lunarToSolar' 
                ? 'border-[#8C2A2D] text-[#8C2A2D] bg-[#8C2A2D]/5' 
                : 'border-transparent text-stone-500 hover:text-stone-700 hover:bg-stone-50'
            }`}
          >
            Âm ➔ Dương
          </button>
        </div>

        <div className="p-6 pt-5">
          {/* Form Input */}
          <div className="mb-6">
            {mode === 'solarToLunar' ? (
              <div className="flex gap-2">
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
                  <span className="hidden sm:inline">Tra cứu</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Ngày (1-30)"
                    min="1" max="30"
                    value={lunarDay}
                    onChange={(e) => setLunarDay(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <input 
                    type="number" 
                    placeholder="Tháng (1-12)"
                    min="1" max="12"
                    value={lunarMonth}
                    onChange={(e) => setLunarMonth(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <input 
                    type="number" 
                    placeholder="Năm (2026)"
                    min="1800" max="2199"
                    value={lunarYear}
                    onChange={(e) => setLunarYear(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isLeapMonth}
                      onChange={(e) => setIsLeapMonth(e.target.checked)}
                      className="rounded border-stone-300 text-[#8C2A2D] focus:ring-[#8C2A2D]"
                    />
                    Là tháng nhuận
                  </label>
                  <button 
                    onClick={handleSearch}
                    disabled={isSearching || !lunarDay || !lunarMonth || !lunarYear}
                    className="flex items-center gap-2 rounded-xl bg-[#8C2A2D] px-5 py-2 font-medium text-white shadow-sm transition-colors hover:bg-[#6b1e20] focus:outline-none disabled:opacity-70"
                  >
                    {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    <span>Tra cứu</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="min-h-[200px]">
            {isSearching ? (
              <div className="flex h-full flex-col items-center justify-center py-10 opacity-60">
                <Loader2 className="mb-3 h-8 w-8 animate-spin text-amber-600" />
                <p className="text-sm font-medium text-stone-600">Đang phân tích dữ liệu...</p>
              </div>
            ) : !lookupResult ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center opacity-60">
                {mode === 'solarToLunar' ? (
                  <Moon className="mb-3 h-10 w-10 text-stone-400" />
                ) : (
                  <Sun className="mb-3 h-10 w-10 text-stone-400" />
                )}
                <p className="text-sm font-medium text-stone-600">
                  {mode === 'solarToLunar' 
                    ? 'Chọn một ngày Dương lịch để xem chi tiết Âm lịch'
                    : 'Nhập ngày Âm lịch để xem ngày Dương lịch tương ứng'}
                </p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {mode === 'lunarToSolar' && lookupResult.solar_day ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
                    <div className="mb-2 flex items-center gap-2 text-amber-700">
                      <Sun className="h-5 w-5" />
                      <span className="font-serif font-medium">Ngày Dương Lịch Tương Ứng</span>
                    </div>
                    <div className="text-5xl font-bold text-[#8C2A2D] mb-1">
                      {lookupResult.solar_day}
                    </div>
                    <div className="text-lg font-medium text-stone-700">
                      Tháng {lookupResult.solar_month} Năm {lookupResult.solar_year}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Dương Lịch */}
                    <div className="mb-5 flex items-center gap-4">
                      <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#8C2A2D] to-[#6b1e20] text-white shadow-inner">
                        <span className="text-sm font-medium opacity-90">Tháng {lookupResult.month}</span>
                        <span className="text-3xl font-bold leading-none">{lookupResult.day}</span>
                      </div>
                      <div>
                        <h4 className="font-serif text-xl font-medium text-stone-800">
                          {lookupResult.day_of_week}
                        </h4>
                        <p className="text-sm text-stone-500">
                          Ngày {lookupResult.day} tháng {lookupResult.month} năm {lookupResult.year}
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
                          Ngày <span className="font-medium text-stone-900">{lookupResult.lunar_day}</span> tháng <span className="font-medium text-stone-900">{lookupResult.lunar_month}</span> năm <span className="font-medium text-stone-900">{lookupResult.lunar_year}</span>
                        </p>
                        <p className="text-sm text-stone-700">
                          <span className="inline-block w-20 text-stone-500">Can chi:</span> 
                          Ngày {lookupResult.can_chi_day}, Tháng {lookupResult.can_chi_month}, Năm {lookupResult.can_chi_year}
                        </p>
                      </div>
                      
                      {/* Sự kiện tâm linh */}
                      {(lookupResult.special_event || lookupResult.spiritual_reminder) && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-100/80 px-4 py-2.5 text-sm font-medium text-amber-800">
                          <Star className="h-4 w-4 shrink-0 text-amber-600" />
                          <span>{lookupResult.special_event || lookupResult.spiritual_reminder}</span>
                        </div>
                      )}
                    </div>

                    {/* Giờ Hoàng Đạo */}
                    {lookupResult.auspicious_hours && lookupResult.auspicious_hours.length > 0 && (
                      <div>
                        <div className="mb-3 flex items-center gap-2 text-stone-700">
                          <Clock className="h-5 w-5 text-amber-600" />
                          <span className="font-semibold">Giờ Hoàng Đạo</span>
                        </div>
                        <div className="max-h-40 overflow-y-auto custom-scrollbar pr-2 flex flex-wrap gap-2">
                          {lookupResult.auspicious_hours.filter(h => h.is_auspicious).map((hour, idx) => (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
