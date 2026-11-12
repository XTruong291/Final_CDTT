# E-SPIRIT — Frontend

Ứng dụng tâm linh & văn hóa truyền thống Việt Nam, tích hợp trợ lý AI, lịch Âm — Dương và các công cụ tra cứu ngày giờ tốt xấu.

---

## ✨ Tính năng nổi bật

### 🤖 Trợ lý AI (Chat)
- Giao diện chat hiện đại với Sidebar lịch sử trò chuyện
- Tạo phiên trò chuyện mới tự động khi gửi tin nhắn đầu tiên
- Lưu & tải lại lịch sử tin nhắn từng phiên
- Xóa phiên trò chuyện trực tiếp từ Sidebar
- Optimistic UI: tin nhắn hiển thị ngay, typing indicator khi AI đang trả lời
- Tự động cập nhật tiêu đề phiên từ nội dung tin nhắn đầu tiên

### 📅 Lịch Âm — Dương
| Tính năng | Mô tả |
|---|---|
| **Lịch hôm nay** | Widget & Modal hiển thị ngày Dương, Âm lịch, Can Chi, Giờ Hoàng Đạo |
| **Lịch tháng** | Dạng lưới Calendar Grid đầy đủ, highlight ngày hôm nay, Mùng 1, Rằm |
| **Tra cứu Dương → Âm** | Chọn ngày Dương, hệ thống trả về ngày Âm, Can Chi, Giờ Hoàng Đạo |
| **Tra cứu Âm → Dương** | Nhập ngày Âm lịch (kèm tháng nhuận), hệ thống trả về ngày Dương |
| **Giờ Hoàng Đạo** | Tra cứu 12 canh giờ bất kỳ ngày nào, phân biệt rõ Hoàng Đạo / Hắc Đạo và tên Sao trực nhật |

### 👤 Quản lý tài khoản
- Đăng ký / Đăng nhập (JWT)
- Xem & chỉnh sửa hồ sơ cá nhân (ProfileModal)
- Tự xóa tài khoản (self-delete)
- Gửi phản hồi (FeedbackModal)

### 🛡️ Khu vực Admin
- Quản lý danh sách người dùng (khoá, xoá, xem chi tiết)
- Dashboard thống kê
- Xác thực quyền Admin riêng biệt

---

## 🛠 Công nghệ sử dụng

| Công nghệ | Mục đích |
|---|---|
| **React 18 + Vite** | SPA, dev server nhanh |
| **React Router v6** | Routing, phân tách khu vực `/` (user) và `/admin` |
| **Zustand** | Global state management (Auth, Chat, Calendar) |
| **Axios** | Giao tiếp API với Backend |
| **Tailwind CSS** | Styling toàn bộ giao diện |
| **Lucide React** | Icon library |
| **react-hot-toast** | Thông báo (Toast notifications) |

---

## 📁 Cấu trúc thư mục

```
e-spirit-frontend/
├── public/
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── routes/
    │   ├── AppRoutes.jsx          # Toàn bộ route (user + admin)
    │   └── PrivateRoute.jsx       # Guard route (đăng nhập / quyền admin)
    ├── layouts/
    │   ├── ClientChatLayout.jsx   # Layout chính cho User (Sidebar + Header + Outlet)
    │   └── AdminLayout.jsx        # Layout Admin (Sidebar + Outlet)
    ├── pages/
    │   ├── client/                # Các trang phía người dùng
    │   │   ├── ChatHome/          # Trang chat chính
    │   │   │   ├── ChatHome.jsx
    │   │   │   └── components/    # ChatSidebar, ChatHeader, ChatInput, MessageList, EmptyState...
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   └── admin/                 # Các trang Admin
    ├── components/
    │   └── client/                # Component tái sử dụng phía user
    │       ├── CalendarModal.jsx         # Modal chi tiết lịch hôm nay
    │       ├── DateLookupModal.jsx       # Tra cứu Dương ↔ Âm (2 chiều, có Tabs)
    │       ├── MonthlyCalendarModal.jsx  # Lịch tháng dạng grid
    │       ├── AuspiciousHoursModal.jsx  # 12 canh giờ Hoàng Đạo / Hắc Đạo
    │       ├── FeedbackModal.jsx
    │       ├── ProfileModal.jsx
    │       └── UserDropdown.jsx
    ├── services/                  # Lớp gọi API
    │   ├── api.js                 # Axios instance với baseURL từ .env
    │   ├── authService.js
    │   ├── chatService.js         # Chat sessions & messages
    │   ├── calendarService.js     # Tất cả API lịch âm dương
    │   └── userService.js
    ├── store/                     # Zustand stores
    │   ├── useAuthStore.js
    │   ├── useChatStore.js
    │   └── useCalendarStore.js
    └── context/
        └── AuthContext.jsx
```

---

## 🚀 Bắt đầu

```bash
# Cài dependencies
npm install

# Tạo file .env từ mẫu và điền URL backend
cp .env.example .env

# Chạy dev server
npm run dev
```

---

## 🔗 Tích hợp API Backend

Toàn bộ API call đi qua `src/services/api.js` (Axios instance). URL Backend được cấu hình qua biến môi trường:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Các nhóm API đã được tích hợp:

| Service | Endpoint group |
|---|---|
| `authService.js` | `/api/v1/auth/*` |
| `userService.js` | `/api/v1/users/*` |
| `chatService.js` | `/api/v1/chat/sessions/*` |
| `calendarService.js` | `/api/v1/calendar/*` |
