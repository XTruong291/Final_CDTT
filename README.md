# E-SPIRIT — Nền Tảng Trợ Lý AI Văn Hóa & Tâm Linh Việt Nam

> **E-Spirit** là hệ thống trợ lý thông minh kết hợp giữa công nghệ AI hiện đại (**Google Gemini 3.8 Flash**, **Hybrid RAG**) và văn hóa truyền thống Việt Nam. Dự án cung cấp giải pháp toàn diện cho việc tư vấn văn khấn, nghi lễ thờ cúng, mâm cỗ tâm linh cùng tiện ích tra cứu **Lịch Âm – Dương & Giờ Hoàng Đạo** chuẩn thiên văn học Việt Nam.

---

## 🏛️ Kiến Trúc Tổng Thể & Công Nghệ (Tech Stack)

Dự án được cấu trúc theo mô hình phân tách độc lập giữa **Backend (API)** và **Frontend (SPA Client & Admin Portal)**:

```
CDTT/
├── fastapi-app/               # Hệ thống Backend API (FastAPI, Python Async, MySQL)
│   ├── alembic/               # Database Migration Scripts
│   ├── app/                   # Mã nguồn chính theo Layered Clean Architecture
│   │   ├── api/               # API Routers & Dependencies (Auth, Chat, Calendar, Users)
│   │   ├── core/              # Config (.env), Database Engine, Security & Error Handlers
│   │   ├── data/              # Kho tri thức tâm linh (spiritual_knowledge.json cho RAG)
│   │   ├── models/            # SQLAlchemy 2.0 Declarative Models (User, ChatSession, ChatMessage)
│   │   ├── repositories/      # Data Access Layer (CRUD DB độc lập)
│   │   ├── schemas/           # Pydantic V2 DTOs (Request / Response validation)
│   │   ├── services/          # Business Logic (AI Gemini, RAG, Chat, Auth, Lịch Âm Dương)
│   │   └── utils/             # Thuật toán Âm Dương Hồ Ngọc Đức (UTC+7 tính thuần RAM)
│   ├── Dockerfile             # Container hóa Backend
│   ├── docker-compose.yaml    # Cụm dịch vụ MySQL 8.0, phpMyAdmin & Backend API
│   └── requirements.txt       # Danh sách thư viện Python
│
└── FE/fe-espirit/             # Giao diện người dùng & Admin (React + Vite)
    ├── public/                # Static assets
    ├── src/
    │   ├── components/        # UI Components (Client Modals, Admin Table, Form, Common)
    │   ├── layouts/           # Layouts (ClientChatLayout, AdminLayout, AuthLayout)
    │   ├── pages/             # Các trang người dùng (ChatHome, Lịch) & Quản trị (Dashboard, Users)
    │   ├── routes/            # Hệ thống điều hướng & Route Guards (Role-based)
    │   ├── services/          # Lớp giao tiếp HTTP Client (Axios)
    │   ├── store/             # Global State Management với Zustand (Chat, Auth, Calendar)
    │   └── styles/            # Tailwind CSS & Typography truyền thống
    ├── package.json           # Danh sách dependencies Node.js
    └── vite.config.ts         # Cấu hình Vite Dev Server
```

### 1. Phân hệ Backend (`fastapi-app`)
- **Ngôn ngữ & Framework**: Python 3.11+, FastAPI (bất đồng bộ `async`/`await`).
- **Cơ sở dữ liệu & ORM**: MySQL 8.0, SQLAlchemy 2.0 (Async), `aiomysql`, Alembic.
- **AI & RAG Engine**: Google GenAI SDK (`gemini-3.8-flash`), Vector Cosine Similarity & Keyword matching với kho tri thức tâm linh `spiritual_knowledge.json`.
- **Thiên văn học**: Thuật toán Âm Dương Hồ Ngọc Đức (Múi giờ `Asia/Ho_Chi_Minh` UTC+7, tính toán thuần trên RAM với latency < 1ms).
- **Bảo mật & Tích hợp**: JWT (PyJWT), Bcrypt, Cloudinary Media Storage, SMTP Gmail OTP.

### 2. Phân hệ Frontend (`FE/fe-espirit`)
- **Core Framework**: React 18, Vite.
- **Styling & UI**: Tailwind CSS (Tone màu đồng cổ Đông Sơn `#2A1610`, `#CAA46A`, `#FAF5EC`), Lucide React Icons, React Hot Toast.
- **Trực quan hóa dữ liệu**: Recharts (LineChart & PieChart cho Admin Dashboard).
- **Quản lý trạng thái (State)**: Zustand (`useChatStore`, `useAuthStore`, `useCalendarStore`).
- **Giao thức mạng**: Axios (cấu hình Base URL và Bearer Token interceptor).

---

## 📋 Yêu Cầu Môi Trường (Prerequisites)

Trước khi khởi chạy, máy chủ/máy trạm của bạn cần cài đặt sẵn:
- **Python**: Phiên bản `>= 3.10` (khuyến nghị Python 3.11).
- **Node.js**: Phiên bản `>= 18.x` và **npm** `>= 9.x`.
- **Cơ sở dữ liệu**: MySQL Server `8.0` (cài trực tiếp trên máy hoặc chạy thông qua Docker).
- **Git** (nếu clone từ repository).

---

## ⚙️ Cấu Hình Biến Môi Trường (Environment Variables)

### 1. Cấu hình Backend (`fastapi-app/.env`)
Tạo file `.env` tại thư mục `fastapi-app/` dựa theo mẫu `fastapi-app/.env.example`:

```env
# Kết nối MySQL
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_SERVER=127.0.0.1
MYSQL_PORT=3306
MYSQL_DB=e_spirit_db

# Bảo mật JWT
SECRET_KEY=your_super_secret_jwt_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=180

# Cloudinary (Lưu trữ ảnh đại diện người dùng)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Cấu hình gửi mã OTP kích hoạt tài khoản qua Gmail
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your_email@gmail.com
SENDER_PASSWORD=your_16_digit_app_password

# Google Gemini AI & RAG
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
CHAT_HISTORY_LIMIT=10
RAG_TOP_K=3
```

> [!TIP]
> Để lấy Google Gemini API Key, bạn truy cập [Google AI Studio](https://aistudio.google.com/).

### 2. Cấu hình Frontend (`FE/fe-espirit/.env`)
Tạo file `.env` tại thư mục `FE/fe-espirit/` dựa theo mẫu `.env.example`:

```env
# Địa chỉ gốc trỏ tới Backend FastAPI
VITE_API_BASE_URL=http://localhost:8000

# Cloudinary Unsigned Upload Preset (Tùy chọn)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

---

## 🚀 Hướng Dẫn Khởi Chạy Dự Án (Getting Started)

Bạn có thể lựa chọn 1 trong 2 cách khởi chạy dưới đây:

### Cách 1: Khởi chạy thủ công (Dành cho Lập trình viên / Development)

#### Bước 1: Khởi động MySQL Database
- Tạo database tên `e_spirit_db` trong MySQL:
```sql
CREATE DATABASE e_spirit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Bước 2: Thiết lập và chạy Backend (`fastapi-app`)
Mở cửa sổ dòng lệnh thứ nhất:

```bash
# 1. Di chuyển vào thư mục backend
cd fastapi-app

# 2. Khởi tạo môi trường ảo Python (Virtual Environment)
# Trên Windows:
python -m venv venv
venv\Scripts\activate
# Trên macOS / Linux:
# python3 -m venv venv
# source venv/bin/activate

# 3. Cập nhật pip và cài đặt thư viện
python -m pip install -U pip
pip install -r requirements.txt

# 4. Chạy migration tạo bảng trong database
alembic upgrade head

# 5. Khởi động server FastAPI ở chế độ live-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend API sẽ hoạt động tại: `http://localhost:8000`
- **Swagger UI Interactive Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`
- **Healthcheck Database**: `http://localhost:8000/db-check`

---

#### Bước 3: Thiết lập và chạy Frontend (`FE/fe-espirit`)
Mở cửa sổ dòng lệnh thứ hai:

```bash
# 1. Di chuyển vào thư mục frontend
cd FE/fe-espirit

# 2. Cài đặt các gói npm phụ thuộc
npm install

# 3. Khởi chạy Vite Dev Server
npm run dev
```
Giao diện ứng dụng sẽ chạy tại: `http://localhost:5173`

---

### Cách 2: Khởi chạy Backend và Database bằng Docker Compose

Nếu máy bạn đã cài sẵn **Docker & Docker Desktop**, bạn có thể khởi chạy toàn bộ cụm MySQL, phpMyAdmin và Backend chỉ với 1 câu lệnh:

```bash
cd fastapi-app
docker compose up -d --build
```

- **Backend API**: `http://localhost:8000`
- **phpMyAdmin**: `http://localhost:8080` (User: `root`, Password: `123456`)
- **MySQL Server**: Cổng `3306`

Sau đó chỉ cần khởi động Frontend như Bước 3 ở Cách 1.

---

## 🌟 Các Tính Năng Trọng Tâm

### 1. Trợ Lý AI Tâm Linh (E-Spirit Chatbot)
- Giao diện trò chuyện thời gian thực, tự động đặt tiêu đề theo ngữ cảnh câu hỏi đầu tiên.
- Tích hợp **Hybrid RAG**: Tự động tra cứu tài liệu từ kho dữ liệu chuẩn cổ truyền để trích xuất nguyên văn bài văn khấn, mâm lễ, kiêng kỵ bàn thờ.
- Tích hợp **Tool Calling thông minh**: Khi người dùng hỏi đổi ngày, AI tự động gọi các hàm thiên văn để chuyển đổi chính xác tuyệt đối mà không phụ thuộc vào tri thức ngẫu nhiên của mô hình ngôn ngữ.

### 2. Bộ Công Cụ Lịch Âm – Dương & Giờ Hoàng Đạo
- **Hôm nay**: Chi tiết ngày Dương, ngày Âm, Tiết khí, Trực, Can Chi Năm/Tháng/Ngày.
- **Tra cứu 2 chiều**: Chuyển đổi linh hoạt Dương $\leftrightarrow$ Âm (hỗ trợ tháng nhuận).
- **12 Khung Giờ**: Phân định 6 giờ Hoàng Đạo và 6 giờ Hắc Đạo kèm tên sao trực nhật.
- **Lịch Tháng**: Grid trực quan đánh dấu Mùng Một, Ngày Rằm và các ngày lễ truyền thống.

### 3. Phân Hệ Quản Trị (Admin Portal)
- Đường dẫn: `/admin/login` $\rightarrow$ `/admin/dashboard`.
- **Giám sát Dashboard**: Biểu đồ thống kê lượng tương tác Chatbot theo ngày, phân loại chủ đề người dùng quan tâm, theo dõi các câu hỏi mới nhất của người dùng.
- **Quản lý tài khoản**: Khóa/mở khóa, phân quyền `user` / `admin`, xem lịch sử người dùng.

---

## 🔒 Tài Khoản & Phân Quyền
1. Đăng ký tài khoản người dùng tại `/register` (nhập mã OTP gửi qua email).
2. Tài khoản sau khi đăng ký mặc định có vai trò `role = "user"`.
3. Để cấp quyền Quản trị viên (`admin`) cho tài khoản, thực hiện câu lệnh trong MySQL:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your_admin_email@example.com';
   ```
4. Đăng nhập tại `/admin/login` để truy cập các tính năng quản trị.

---

## 📄 Bản Quyền & Giấy Phép
Dự án được phát triển phục vụ mục đích nghiên cứu, học tập và bảo tồn văn hóa tín ngưỡng truyền thống Việt Nam. Mọi đóng góp xin vui lòng gửi Pull Request hoặc liên hệ qua bộ phận quản trị dự án.

