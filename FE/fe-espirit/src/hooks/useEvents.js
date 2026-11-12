import { useState } from 'react';

// Mock data ban đầu
const initialEvents = [
  {
    id: 'evt_1',
    title: 'Nghi thức Cúng Rằm tháng 7 (Lễ Vu Lan)',
    category: 'Ngày lễ',
    region: 'Toàn quốc',
    religion: 'Phật giáo',
    datePosted: '2026-08-10',
    content: 'Chi tiết mâm cúng và bài khấn...',
    isVisible: true,
  },
  {
    id: 'evt_2',
    title: 'Giỗ Tổ Hùng Vương - Mùng 10 tháng 3',
    category: 'Cúng giỗ',
    region: 'Bắc',
    religion: 'Tín ngưỡng dân gian',
    datePosted: '2026-04-15',
    content: 'Nghi thức dâng hương...',
    isVisible: true,
  },
  {
    id: 'evt_3',
    title: 'Văn khấn ngày Tết Hàn Thực',
    category: 'Văn khấn',
    region: 'Toàn quốc',
    religion: 'Không phân biệt',
    datePosted: '2026-03-01',
    content: 'Bánh trôi bánh chay...',
    isVisible: false,
  },
  {
    id: 'evt_4',
    title: 'Lễ hội Phủ Dầy',
    category: 'Ngày lễ',
    region: 'Trung',
    religion: 'Đạo Mẫu',
    datePosted: '2026-04-10',
    content: 'Tháng 3 giỗ Mẹ...',
    isVisible: true,
  },
  {
    id: 'evt_5',
    title: 'Nghi lễ cúng Đất Đai',
    category: 'Văn khấn',
    region: 'Nam',
    religion: 'Tín ngưỡng dân gian',
    datePosted: '2026-01-20',
    content: 'Cúng đất đai nhà cửa...',
    isVisible: true,
  },
];

export const useEvents = () => {
  const [events, setEvents] = useState(initialEvents);

  const addEvent = (newEvent) => {
    const event = {
      ...newEvent,
      id: `evt_${Date.now()}`,
      datePosted: new Date().toISOString().split('T')[0],
      isVisible: true,
    };
    setEvents((prev) => [event, ...prev]);
  };

  const updateEvent = (updatedEvent) => {
    setEvents((prev) =>
      prev.map((evt) => (evt.id === updatedEvent.id ? updatedEvent : evt))
    );
  };

  const deleteEvent = (id) => {
    setEvents((prev) => prev.filter((evt) => evt.id !== id));
  };

  const toggleVisibility = (id) => {
    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === id ? { ...evt, isVisible: !evt.isVisible } : evt
      )
    );
  };

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleVisibility,
  };
};
