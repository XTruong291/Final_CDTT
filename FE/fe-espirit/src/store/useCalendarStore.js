import { create } from 'zustand';
import { getTodayCalendar } from '../services/calendarService';

export const useCalendarStore = create((set) => ({
  todayData: null,
  isLoadingCalendar: true,

  fetchToday: async () => {
    set({ isLoadingCalendar: true });
    try {
      const data = await getTodayCalendar();
      set({ todayData: data });
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu lịch:", error);
    } finally {
      set({ isLoadingCalendar: false });
    }
  },
}));
