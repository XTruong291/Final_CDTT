import api from './api';

export const getTodayCalendar = async () => {
  const token = localStorage.getItem('access_token');
  const response = await api.get('/api/v1/calendar/today', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data;
};

export const lookupSolarToLunar = async (dateString) => {
  const token = localStorage.getItem('access_token');
  const response = await api.get('/api/v1/calendar/convert-solar', {
    params: { date: dateString },
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data;
};

export const lookupLunarToSolar = async (day, month, year, isLeapMonth = false) => {
  const token = localStorage.getItem('access_token');
  const response = await api.get('/api/v1/calendar/convert-lunar', {
    params: { day, month, year, is_leap_month: isLeapMonth },
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data;
};

export const getMonthlyCalendar = async (year, month) => {
  const token = localStorage.getItem('access_token');
  const response = await api.get('/api/v1/calendar/month', {
    params: { year, month },
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data;
};

export const getAuspiciousHours = async (dateString) => {
  const token = localStorage.getItem('access_token');
  const response = await api.get('/api/v1/calendar/auspicious-hours', {
    params: { date: dateString },
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data;
};
