import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Users,
  CalendarDays,
  MessageSquare,
  Activity,
  ChevronRight,
  RefreshCw,
  Search,
  X,
  Bot,
  User,
  Clock,
  Sparkles,
  ArrowUpRight,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { getDashboardStats } from '../../services/adminDashboardService';

// Bảng màu chủ đạo E-Spirit
const COLORS = ['#2A1610', '#CAA46A', '#A3684B', '#7A5C43', '#D4AF37', '#8C7A6B', '#5A3825'];

/**
 * Format thời gian tương đối tiếng Việt
 */
function formatRelativeTime(dateInput) {
  if (!dateInput) return 'Vừa xong';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 45) return 'Vừa xong';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày trước`;

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format ngày giờ đầy đủ
 */
function formatFullDateTime(dateInput) {
  if (!dateInput) return 'Không xác định';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function Dashboard() {
  const navigate = useNavigate();

  // State chính
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [daysFilter, setDaysFilter] = useState(7); // 7, 14, 30

  // State Modal Chi tiết câu hỏi
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // State Modal Xem tất cả lịch sử câu hỏi
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyQuestions, setHistoryQuestions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState('');

  // Fetch dữ liệu Dashboard
  const fetchDashboard = useCallback(
    async (showRefreshIndicator = false) => {
      try {
        if (showRefreshIndicator) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const data = await getDashboardStats({ days: daysFilter, recentLimit: 10 });
        setDashboardData(data);

        if (showRefreshIndicator) {
          toast.success('Dữ liệu bảng điều khiển đã được làm mới!');
        }
      } catch (error) {
        console.error('LỖI FETCH DASHBOARD:', error);
        if (error.response) {
          if (error.response.status === 403) {
            toast.error('Truy cập bị từ chối: Bạn không có quyền Quản trị viên!');
            navigate('/');
            return;
          }
          if (error.response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_info');
            localStorage.removeItem('espirit_auth');
            sessionStorage.removeItem('espirit_auth');
            toast.error('Phiên đăng nhập hết hạn!', { id: 'auth-session-expired' });
            navigate('/login');
            return;
          }
          toast.error(`Lỗi ${error.response.status}: Không thể tải dữ liệu dashboard!`);
        } else {
          toast.error(error.message || 'Lỗi kết nối máy chủ!');
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [daysFilter, navigate]
  );

  useEffect(() => {
    fetchDashboard(false);
  }, [fetchDashboard]);

  // Xử lý mở Modal xem tất cả lịch sử câu hỏi
  const handleOpenHistoryModal = async () => {
    setIsHistoryModalOpen(true);
    setIsLoadingHistory(true);
    try {
      // Tải tối đa 30 câu hỏi mới nhất cho modal lịch sử
      const fullData = await getDashboardStats({ days: daysFilter, recentLimit: 30 });
      setHistoryQuestions(fullData?.recent_questions || []);
    } catch (err) {
      console.warn('Không thể tải lịch sử mở rộng, dùng danh sách hiện tại:', err);
      setHistoryQuestions(dashboardData?.recent_questions || []);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Lọc danh sách trong Modal Lịch sử
  const filteredHistoryQuestions = useMemo(() => {
    if (!historySearchTerm.trim()) return historyQuestions;
    const term = historySearchTerm.toLowerCase();
    return historyQuestions.filter((q) => {
      const questionText = (q.question || q.user_query || '').toLowerCase();
      const userName = (q.user_name || q.user || q.full_name || '').toLowerCase();
      const email = (q.user_email || q.email || '').toLowerCase();
      const answer = (q.ai_response || q.answer || '').toLowerCase();
      const title = (q.session_title || q.title || '').toLowerCase();
      return (
        questionText.includes(term) ||
        userName.includes(term) ||
        email.includes(term) ||
        answer.includes(term) ||
        title.includes(term)
      );
    });
  }, [historyQuestions, historySearchTerm]);

  // Chuẩn hóa KPI dữ liệu
  const kpi = useMemo(() => {
    const raw = dashboardData?.kpi || {};
    return {
      total_users: Number(raw.total_users ?? 0),
      new_users_this_month: Number(raw.new_users_this_month ?? 0),
      user_growth_percent: Number(raw.user_growth_percent ?? 0),
      total_knowledge_articles: Number(raw.total_knowledge_articles ?? 0),
      total_knowledge_categories: Number(raw.total_knowledge_categories ?? 0),
      total_user_queries: Number(raw.total_user_queries ?? 0),
      queries_today: Number(raw.queries_today ?? 0),
      upcoming_lunar_note: raw.upcoming_lunar_note || 'Đang cập nhật lịch sự kiện',
      active_users_24h: Number(raw.active_users_24h ?? 0),
      total_chat_sessions: Number(raw.total_chat_sessions ?? 0),
    };
  }, [dashboardData]);

  // Chuẩn hóa dữ liệu LineChart
  const lineChartData = useMemo(() => {
    const raw = dashboardData?.chat_activity || [];
    return raw.map((item) => ({
      name: item.name || item.date || item.day || '',
      queries: Number(item.queries ?? item.total_queries ?? 0),
      sessions: Number(item.sessions ?? item.total_sessions ?? 0),
    }));
  }, [dashboardData]);

  // Chuẩn hóa dữ liệu PieChart
  const pieChartData = useMemo(() => {
    const raw = dashboardData?.knowledge_distribution || [];
    const valid = raw.map((item) => {
      const val = Number(item.value ?? item.count ?? item.articles_count ?? 0);
      return {
        name: item.name || item.category || 'Chưa phân loại',
        value: val,
        count: item.count ?? val,
      };
    }).filter(item => item.value > 0);

    const total = valid.reduce((acc, curr) => acc + curr.value, 0);

    return valid.map((item) => ({
      ...item,
      percent: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0',
    }));
  }, [dashboardData]);

  const recentQuestions = useMemo(() => {
    return dashboardData?.recent_questions || [];
  }, [dashboardData]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2A1610]">Tổng quan hệ thống</h1>
          <p className="mt-1 text-sm text-gray-500">
            Giám sát thời gian thực hoạt động của E-SPIRIT và Trợ lý Tâm Linh AI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Nút Làm mới */}
          <button
            onClick={() => fetchDashboard(true)}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-[#CAA46A]/40 bg-white px-4 py-2.5 text-sm font-medium text-[#2A1610] shadow-sm transition hover:bg-[#FAF5EC] hover:border-[#CAA46A] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            title="Làm mới dữ liệu mới nhất từ máy chủ"
          >
            <RefreshCw
              size={16}
              className={`text-[#CAA46A] ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>{isRefreshing ? 'Đang làm mới...' : 'Làm mới'}</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton khi tải lần đầu */}
      {isLoading && !dashboardData ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-gray-200/70" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-80 rounded-xl bg-gray-200/70 lg:col-span-2" />
            <div className="h-80 rounded-xl bg-gray-200/70" />
          </div>
          <div className="h-64 rounded-xl bg-gray-200/70" />
        </div>
      ) : (
        <>
          {/* 2. TOP SECTION: 4 KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Tổng người dùng */}
            <div className="group rounded-xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Tổng người dùng</p>
                  <h3 className="mt-1 font-serif text-2xl font-bold text-[#2A1610]">
                    {kpi.total_users.toLocaleString('vi-VN')}
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:scale-105">
                  <Users size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span
                  className={`font-semibold ${
                    kpi.user_growth_percent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  +{kpi.new_users_this_month} người dùng tháng này
                </span>
                <span className="ml-1 text-xs text-gray-500">
                  ({kpi.user_growth_percent >= 0 ? '+' : ''}
                  {kpi.user_growth_percent}%)
                </span>
              </div>
            </div>

            {/* Card 2: Sự kiện & Bài viết */}
            <div className="group rounded-xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Sự kiện & Bài viết</p>
                  <h3 className="mt-1 font-serif text-2xl font-bold text-[#2A1610]">
                    {kpi.total_knowledge_articles.toLocaleString('vi-VN')}
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-[#A3684B] transition group-hover:scale-105">
                  <CalendarDays size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <BookOpen size={14} className="mr-1.5 text-[#CAA46A]" />
                <span className="truncate">
                  Trên <strong className="text-gray-900 font-semibold">{kpi.total_knowledge_categories}</strong> chủ đề văn hóa & tâm linh
                </span>
              </div>
            </div>

            {/* Card 3: Lượt hỏi Chatbot */}
            <div className="group rounded-xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Lượt hỏi Chatbot</p>
                  <h3 className="mt-1 font-serif text-2xl font-bold text-[#2A1610]">
                    {kpi.total_user_queries.toLocaleString('vi-VN')}
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FAF5EC] text-[#2A1610] transition group-hover:scale-105">
                  <MessageSquare size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="font-semibold text-emerald-600">
                  +{kpi.queries_today.toLocaleString('vi-VN')}
                </span>
                <span className="ml-1 text-gray-500 truncate">
                  hôm nay • {kpi.upcoming_lunar_note}
                </span>
              </div>
            </div>

            {/* Card 4: Hoạt động 24h */}
            <div className="group rounded-xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Hoạt động 24h</p>
                  <h3 className="mt-1 font-serif text-2xl font-bold text-[#2A1610]">
                    {kpi.active_users_24h.toLocaleString('vi-VN')}{' '}
                    <span className="text-sm font-normal text-gray-500">người dùng</span>
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:scale-105">
                  <Activity size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="relative mr-2 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                </span>
                <span className="font-medium text-gray-700">
                  {kpi.total_chat_sessions.toLocaleString('vi-VN')} tổng phiên chat
                </span>
              </div>
            </div>
          </div>

          {/* 3. MIDDLE SECTION: 2 Biểu đồ Recharts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Line Chart: Lượng tương tác Chatbot */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] lg:col-span-2">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#2A1610]">
                    Lượng tương tác Chatbot
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Số lượt câu hỏi và phiên tương tác theo thời gian
                  </p>
                </div>

                {/* Bộ lọc 7 / 14 / 30 ngày */}
                <div className="inline-flex rounded-lg bg-gray-100 p-1 text-xs font-medium">
                  {[
                    { value: 7, label: '7 ngày qua' },
                    { value: 14, label: '14 ngày qua' },
                    { value: 30, label: '30 ngày qua' },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setDaysFilter(filter.value)}
                      className={`rounded-md px-3 py-1.5 transition-all cursor-pointer ${
                        daysFilter === filter.value
                          ? 'bg-[#2A1610] text-[#FAF5EC] shadow-sm font-semibold'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[320px] w-full">
                {lineChartData.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-gray-400">
                    <MessageSquare size={36} className="mb-2 stroke-1 text-gray-300" />
                    <p className="text-sm">Chưa có dữ liệu tương tác trong khoảng thời gian này.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={lineChartData}
                      margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0ECE1" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        dy={8}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #E5E7EB',
                          boxShadow: '0 8px 16px -4px rgba(42, 22, 16, 0.1)',
                          backgroundColor: '#FFFFFF',
                          padding: '10px 14px',
                        }}
                        labelStyle={{ fontWeight: 600, color: '#2A1610', marginBottom: 4 }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ paddingBottom: '16px', fontSize: '13px' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="queries"
                        name="Lượt hỏi (Queries)"
                        stroke="#2A1610"
                        strokeWidth={2.8}
                        dot={{ r: 4, fill: '#2A1610', strokeWidth: 0 }}
                        activeDot={{ r: 6, stroke: '#FAF5EC', strokeWidth: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="sessions"
                        name="Số phiên (Sessions)"
                        stroke="#CAA46A"
                        strokeWidth={2.4}
                        strokeDasharray="4 4"
                        dot={{ r: 3.5, fill: '#CAA46A', strokeWidth: 0 }}
                        activeDot={{ r: 5.5, stroke: '#FAF5EC', strokeWidth: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Pie Chart: Phân bố Tri thức & Sự kiện */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] lg:col-span-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2A1610]">
                  Phân loại Sự kiện & Kiến thức
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tỷ lệ phân bổ bài viết theo từng danh mục
                </p>
              </div>

              <div className="my-4 h-[220px] w-full flex items-center justify-center">
                {pieChartData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-4">
                    <BookOpen size={36} className="mb-2 text-gray-300 stroke-1" />
                    <p className="text-sm font-medium text-gray-600">Chưa có dữ liệu bài viết</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Các danh mục văn hóa tâm linh sẽ được hiển thị tại đây khi có bài viết.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value} bài (${props.payload.percent}%)`,
                          name,
                        ]}
                        contentStyle={{
                          borderRadius: '10px',
                          border: 'none',
                          boxShadow: '0 6px 12px -2px rgba(42, 22, 16, 0.12)',
                          backgroundColor: '#FFFFFF',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Custom Legend */}
              {pieChartData.length > 0 && (
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 border-t border-gray-100 pt-3 text-xs">
                  {pieChartData.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#FAF5EC]/60 transition"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium text-gray-700 truncate" title={entry.name}>
                          {entry.name}
                        </span>
                      </div>
                      <span className="shrink-0 font-semibold text-gray-600 ml-2">
                        {entry.value} bài ({entry.percent}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4. BOTTOM SECTION: Recent Questions */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2A1610]">
                  Các câu hỏi Chatbot mới nhất
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Nhấp vào câu hỏi bất kỳ để xem toàn bộ phản hồi của Trợ lý E-Spirit AI
                </p>
              </div>

              <button
                onClick={handleOpenHistoryModal}
                className="group flex items-center gap-1.5 text-sm font-semibold text-[#CAA46A] hover:text-[#2A1610] transition-colors cursor-pointer"
              >
                <span>Xem tất cả lịch sử</span>
                <ChevronRight size={16} className="transition group-hover:translate-x-0.5" />
              </button>
            </div>

            {recentQuestions.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <HelpCircle size={40} className="mx-auto mb-2 text-gray-300 stroke-1" />
                <p className="font-medium text-gray-600">Chưa có câu hỏi nào từ người dùng</p>
                <p className="text-xs text-gray-400 mt-1">
                  Khi người dùng gửi tin nhắn cho AI Chatbot, danh sách câu hỏi sẽ hiển thị tại đây.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentQuestions.map((q, idx) => {
                  const userName = q.user_name || q.user || q.full_name || 'Khách vãng lai';
                  const userEmail = q.user_email || q.email || '';
                  const questionText = q.question || q.user_query || q.content || 'Nội dung câu hỏi';
                  const timeFormatted = formatRelativeTime(q.created_at || q.time || q.timestamp);

                  return (
                    <div
                      key={q.id || idx}
                      onClick={() => setSelectedQuestion(q)}
                      className="group flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between -mx-6 px-6 transition-all duration-150 hover:bg-[#FAF5EC]/70 cursor-pointer"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF5EC] text-[#CAA46A] border border-[#CAA46A]/20 group-hover:bg-[#CAA46A] group-hover:text-white transition">
                          <MessageSquare size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 group-hover:text-[#2A1610] transition line-clamp-1">
                            {questionText}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                            <span className="font-medium text-gray-700">{userName}</span>
                            {userEmail && (
                              <>
                                <span>•</span>
                                <span className="text-gray-400 truncate max-w-[160px]">
                                  {userEmail}
                                </span>
                              </>
                            )}
                            {q.session_title && (
                              <>
                                <span>•</span>
                                <span className="text-[#A3684B] truncate max-w-[180px]">
                                  {q.session_title}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:shrink-0 text-xs text-gray-400 sm:text-right">
                        <Clock size={13} className="text-gray-400" />
                        <span>{timeFormatted}</span>
                        <ArrowUpRight
                          size={15}
                          className="opacity-0 group-hover:opacity-100 text-[#CAA46A] transition-opacity ml-1"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: CHI TIẾT CÂU HỎI & PHẢN HỒI AI */}
      {/* ========================================================================= */}
      {selectedQuestion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedQuestion(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-[#FAF5EC]/70 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2A1610] text-[#CAA46A]">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#2A1610]">
                    Chi tiết Hội thoại AI
                  </h3>
                  <p className="text-xs text-gray-500">
                    Mã câu hỏi: #{selectedQuestion.id || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Thông tin người hỏi & Phiên */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <User size={15} className="text-[#CAA46A] shrink-0" />
                    <span className="text-gray-500">Người hỏi:</span>
                    <strong className="text-gray-800 font-semibold truncate">
                      {selectedQuestion.user_name ||
                        selectedQuestion.user ||
                        selectedQuestion.full_name ||
                        'Khách vãng lai'}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Email:</span>
                    <span className="text-gray-700 truncate">
                      {selectedQuestion.user_email || selectedQuestion.email || 'Chưa cung cấp'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <MessageSquare size={15} className="text-[#CAA46A] shrink-0" />
                    <span className="text-gray-500">Tiêu đề phiên:</span>
                    <span className="text-[#2A1610] font-medium truncate">
                      {selectedQuestion.session_title ||
                        selectedQuestion.title ||
                        'Phiên hỏi đáp tâm linh'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2 text-xs text-gray-400 border-t border-gray-200/50 pt-2">
                    <Clock size={13} className="shrink-0" />
                    <span>
                      Thời gian gửi: {formatFullDateTime(selectedQuestion.created_at || selectedQuestion.time)} (
                      {formatRelativeTime(selectedQuestion.created_at || selectedQuestion.time)})
                    </span>
                  </div>
                </div>
              </div>

              {/* 1. Câu hỏi của User */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <User size={14} className="text-[#2A1610]" />
                  <span>Câu hỏi của người dùng</span>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 text-gray-900 shadow-sm leading-relaxed text-sm">
                  {selectedQuestion.question ||
                    selectedQuestion.user_query ||
                    selectedQuestion.content ||
                    'Không có nội dung câu hỏi.'}
                </div>
              </div>

              {/* 2. Câu trả lời của E-Spirit AI */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#CAA46A]">
                  <Bot size={15} className="text-[#CAA46A]" />
                  <span>Phản hồi từ Trợ lý E-Spirit AI</span>
                </div>
                <div className="rounded-xl border border-[#CAA46A]/30 bg-[#FAF5EC]/90 p-4 text-gray-800 shadow-sm leading-relaxed text-sm whitespace-pre-wrap">
                  {selectedQuestion.ai_response ||
                    selectedQuestion.answer ||
                    selectedQuestion.response ||
                    'Trợ lý AI chưa có phản hồi hoặc phản hồi đang được xử lý.'}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-gray-100 bg-gray-50 px-6 py-3.5">
              <button
                type="button"
                onClick={() => setSelectedQuestion(null)}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: XEM TẤT CẢ LỊCH SỬ CÂU HỎI (MỞ RỘNG & TÌM KIẾM) */}
      {/* ========================================================================= */}
      {isHistoryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsHistoryModalOpen(false)}
        >
          <div
            className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-[#FAF5EC]/80 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2A1610] text-[#CAA46A]">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#2A1610]">
                    Lịch sử Câu hỏi Chatbot
                  </h3>
                  <p className="text-xs text-gray-500">
                    Danh sách 30 câu hỏi mới nhất từ người dùng trên toàn hệ thống
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Ô tìm kiếm nhanh */}
            <div className="border-b border-gray-100 p-4 bg-gray-50/50">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo nội dung câu hỏi, người hỏi, email hoặc từ khóa câu trả lời..."
                  value={historySearchTerm}
                  onChange={(e) => setHistorySearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#CAA46A] focus:ring-2 focus:ring-[#CAA46A]/20"
                />
                {historySearchTerm && (
                  <button
                    onClick={() => setHistorySearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Nội dung danh sách */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {isLoadingHistory ? (
                <div className="py-16 text-center text-gray-500 space-y-3">
                  <RefreshCw size={28} className="animate-spin mx-auto text-[#CAA46A]" />
                  <p className="text-sm font-medium">Đang tải lịch sử câu hỏi...</p>
                </div>
              ) : filteredHistoryQuestions.length === 0 ? (
                <div className="py-16 text-center text-gray-500">
                  <HelpCircle size={40} className="mx-auto mb-2 text-gray-300 stroke-1" />
                  <p className="font-medium text-gray-600">
                    {historySearchTerm
                      ? 'Không tìm thấy câu hỏi nào phù hợp với từ khóa'
                      : 'Chưa có dữ liệu câu hỏi'}
                  </p>
                  {historySearchTerm && (
                    <button
                      onClick={() => setHistorySearchTerm('')}
                      className="mt-2 text-xs font-semibold text-[#CAA46A] hover:underline"
                    >
                      Xóa bộ lọc tìm kiếm
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredHistoryQuestions.map((q, idx) => {
                    const userName = q.user_name || q.user || q.full_name || 'Khách vãng lai';
                    const userEmail = q.user_email || q.email || '';
                    const questionText =
                      q.question || q.user_query || q.content || 'Nội dung câu hỏi';
                    const timeFormatted = formatRelativeTime(q.created_at || q.time);

                    return (
                      <div
                        key={q.id || idx}
                        onClick={() => {
                          setSelectedQuestion(q);
                        }}
                        className="group flex flex-col gap-2 p-3.5 rounded-xl hover:bg-[#FAF5EC]/80 transition cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FAF5EC] text-[#CAA46A] group-hover:bg-[#CAA46A] group-hover:text-white transition">
                              <MessageSquare size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 group-hover:text-[#2A1610] line-clamp-2">
                                {questionText}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                                <span className="font-medium text-gray-800">{userName}</span>
                                {userEmail && <span>• {userEmail}</span>}
                                {q.session_title && (
                                  <span className="text-[#A3684B] font-medium">
                                    • {q.session_title}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 text-xs text-gray-400">
                            <Clock size={12} />
                            <span>{timeFormatted}</span>
                            <ArrowUpRight
                              size={15}
                              className="text-[#CAA46A] opacity-0 group-hover:opacity-100 transition"
                            />
                          </div>
                        </div>

                        {/* Rút gọn câu trả lời nếu có */}
                        {(q.ai_response || q.answer) && (
                          <div className="ml-12 pl-2 border-l-2 border-[#CAA46A]/30 text-xs text-gray-600 line-clamp-1 italic">
                            AI: {q.ai_response || q.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-3.5">
              <span className="text-xs text-gray-500">
                Hiển thị {filteredHistoryQuestions.length} / {historyQuestions.length} câu hỏi
              </span>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
