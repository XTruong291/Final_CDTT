// Dữ liệu mẫu dùng cho phát triển frontend độc lập với backend.
// Khi tích hợp API thật, các services sẽ gọi `api.get/post/...` thay vì đọc từ đây.

export const mockRituals = [
  {
    id: 'r1',
    title: 'Nghi thức cúng Giao thừa',
    region: 'Toàn quốc',
    religion: 'Tín ngưỡng dân gian',
    occasion: 'Tết Nguyên Đán',
    summary: 'Hướng dẫn chuẩn bị mâm cúng và văn khấn đêm giao thừa.',
    image: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=600',
    rating: 4.7,
    reviewCount: 128,
  },
  {
    id: 'r2',
    title: 'Lễ cúng ông Công ông Táo',
    region: 'Miền Bắc',
    religion: 'Tín ngưỡng dân gian',
    occasion: '23 tháng Chạp',
    summary: 'Cách chuẩn bị cá chép, mâm lễ và bài khấn tiễn Táo quân.',
    image: 'https://images.unsplash.com/photo-1600189261867-30e5ffe7b8da?w=600',
    rating: 4.5,
    reviewCount: 96,
  },
  {
    id: 'r3',
    title: 'Nghi thức Vu Lan báo hiếu',
    region: 'Toàn quốc',
    religion: 'Phật giáo',
    occasion: 'Rằm tháng 7',
    summary: 'Nghi lễ cài hoa hồng, tụng kinh báo hiếu cha mẹ.',
    image: 'https://images.unsplash.com/photo-1602526432608-1e2b8b3c1a1a?w=600',
    rating: 4.9,
    reviewCount: 210,
  },
]

export const mockHandbook = [
  {
    id: 'h1',
    title: 'Cách bày mâm ngũ quả 3 miền',
    category: 'Mâm cúng',
    excerpt: 'Sự khác biệt trong cách chọn và bày trí mâm ngũ quả giữa Bắc - Trung - Nam.',
  },
  {
    id: 'h2',
    title: 'Thứ tự thắp hương đúng cách',
    category: 'Nghi lễ cơ bản',
    excerpt: 'Hướng dẫn số lượng nén hương, thứ tự khấn vái tại gia.',
  },
]

export const mockProducts = [
  {
    id: 'p1',
    name: 'Bộ đồ thờ men lam cao cấp',
    price: 1250000,
    occasion: 'Tết Nguyên Đán',
    image: 'https://images.unsplash.com/photo-1620207418302-439b387441b0?w=400',
    affiliateUrl: 'https://shopee.vn/product/example-1',
    platform: 'Shopee',
  },
  {
    id: 'p2',
    name: 'Mâm ngũ quả trang trí nhựa cao cấp',
    price: 320000,
    occasion: 'Tết Nguyên Đán',
    image: 'https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?w=400',
    affiliateUrl: 'https://tiki.vn/product/example-2',
    platform: 'Tiki',
  },
  {
    id: 'p3',
    name: 'Nến thơm thờ cúng không khói',
    price: 89000,
    occasion: 'Rằm tháng 7',
    image: 'https://images.unsplash.com/photo-1602874801007-bd36c294bd47?w=400',
    affiliateUrl: 'https://shopee.vn/product/example-3',
    platform: 'Shopee',
  },
]

export const mockLocations = [
  {
    id: 'l1',
    name: 'Chùa Trấn Quốc',
    address: 'Thanh Niên, Yên Phụ, Tây Hồ, Hà Nội',
    type: 'Chùa',
    lat: 21.0469,
    lng: 105.8412,
  },
  {
    id: 'l2',
    name: 'Đền Ngọc Sơn',
    address: 'Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội',
    type: 'Đền',
    lat: 21.0333,
    lng: 105.8524,
  },
]

export const mockChecklists = [
  {
    id: 'c1',
    title: 'Chuẩn bị Tết Nguyên Đán 2026',
    dueDate: '2026-02-16',
    progress: 45,
    items: [
      { id: 'i1', label: 'Mua mâm ngũ quả', done: true },
      { id: 'i2', label: 'Dọn dẹp bàn thờ', done: true },
      { id: 'i3', label: 'Chuẩn bị văn khấn giao thừa', done: false },
      { id: 'i4', label: 'Mua vàng mã', done: false },
    ],
    sharedWith: ['me@example.com'],
  },
]

export const mockAdminEvents = [
  {
    id: 'e1',
    title: 'Nghi thức cúng Giao thừa',
    category: 'Ngày lễ',
    region: 'Toàn quốc',
    religion: 'Dân gian',
    publishedAt: '2026-01-10',
    status: 'published',
  },
  {
    id: 'e2',
    title: 'Lễ Vu Lan báo hiếu',
    category: 'Ngày lễ',
    region: 'Toàn quốc',
    religion: 'Phật giáo',
    publishedAt: '2026-07-01',
    status: 'draft',
  },
]

export const mockAdminUsers = [
  {
    id: 'u1',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    status: 'active',
    lastLogin: '2026-08-28',
    loginFrequency: '5 lần/tuần',
  },
  {
    id: 'u2',
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    status: 'locked',
    lastLogin: '2026-07-15',
    loginFrequency: '1 lần/tháng',
  },
]

export const mockChatbotSamples = [
  {
    id: 'cb1',
    question: 'Mâm cúng giao thừa cần những gì?',
    answer: 'Mâm cúng giao thừa thường gồm: gà luộc, bánh chưng, xôi, hoa quả, vàng mã...',
  },
  {
    id: 'cb2',
    question: 'Ngày nào tốt để cúng ông Công ông Táo?',
    answer: 'Thường cúng trước 12h trưa ngày 23 tháng Chạp âm lịch.',
  },
]

export const mockDashboardStats = {
  totalUsers: 12480,
  activeUsers7d: 3120,
  totalEvents: 86,
  totalFeedback: 342,
  monthlyVisits: [
    { month: 'T3', visits: 4200 },
    { month: 'T4', visits: 4800 },
    { month: 'T5', visits: 5100 },
    { month: 'T6', visits: 6300 },
    { month: 'T7', visits: 7100 },
    { month: 'T8', visits: 8400 },
  ],
}