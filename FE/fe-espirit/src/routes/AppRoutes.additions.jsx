import { Routes, Route, Navigate } from 'react-router-dom'

// ⚠️ FILE NÀY LÀ BẢN DỰNG THEO SUY ĐOÁN.
// Mình chỉ thấy TÊN FILE trong ảnh cây thư mục (một số bị cắt bởi dấu "..."), không thấy:
//   - path thật của từng route bạn đang dùng (/rituals hay /nghi-thuc? /products hay /san-pham?...)
//   - layout nào đang bọc route nào (route nào cần đăng nhập, route nào public)
//   - tên đầy đủ chính xác của các file bị cắt (ForgotPass..., LocationSu..., ProductDet...,
//     ProductSea..., RitualDetail...., RitualSearc..., ChatbotCon..., EventManag..., HomeConte...,
//     UserManag..., AdminLayout....)
// => Hãy đối chiếu lại với AppRoutes.jsx thật của bạn, sửa path/tên import cho khớp.

import UserLayout from '../layouts/UserLayout'
import AdminLayout from '../layouts/AdminLayout'
import PrivateRoute from './PrivateRoute'

// ---- User pages ----
import Home from '../pages/user/Home'
import Login from '../pages/user/Login'
import Register from '../pages/user/Register'
import ForgotPassword from '../pages/user/ForgotPassword'
import Profile from '../pages/user/Profile'
import RitualSearch from '../pages/user/RitualSearch'
import RitualDetail from '../pages/user/RitualDetail'
import Guidebook from '../pages/user/Guidebook'
import LunarCalendar from '../pages/user/LunarCalendar'
import Checklist from '../pages/user/Checklist'
import AIAssistant from '../pages/user/AIAssistant'
import Feedback from '../pages/user/Feedback'
import ProductSearch from '../pages/user/ProductSearch'
import ProductDetail from '../pages/user/ProductDetail'
import LocationSuggestion from '../pages/user/LocationSuggestion'
import NotFound from '../pages/user/NotFound'

// ---- Admin pages ----
import AdminLogin from '../pages/admin/AdminLogin'
import AdminForgotPassword from '../pages/admin/AdminForgotPassword'
import AdminResetPassword from '../pages/admin/AdminResetPassword'
import Dashboard from '../pages/admin/Dashboard'
import EventManagement from '../pages/admin/EventManagement'
import EventForm from '../pages/admin/EventForm'
import UserManagement from '../pages/admin/UserManagement'
import UserDetail from '../pages/admin/UserDetail'
import HomeContent from '../pages/admin/HomeContent'
import Reports from '../pages/admin/Reports'

export default function AppRoutes() {
  return (
    <Routes>
      {/* ================= KHU VỰC NGƯỜI DÙNG ================= */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/rituals" element={<RitualSearch />} />
        <Route path="/rituals/:id" element={<RitualDetail />} />
        <Route path="/guidebook" element={<Guidebook />} />
        <Route path="/lunar-calendar" element={<LunarCalendar />} />
        <Route path="/products" element={<ProductSearch />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/locations" element={<LocationSuggestion />} />
        <Route path="/assistant" element={<AIAssistant />} />
        <Route path="/feedback" element={<Feedback />} />

        {/* Route cần đăng nhập user */}
        <Route element={<PrivateRoute requireRole="user" />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/checklist" element={<Checklist />} />
        </Route>
      </Route>

      {/* ================= ADMIN AUTHENTICATION ================= */}
      {/* Full-screen 2 cột riêng, KHÔNG bọc trong AdminLayout */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
      <Route path="/admin/reset-password" element={<AdminResetPassword />} />

      {/* ================= KHU VỰC QUẢN TRỊ (được bảo vệ) ================= */}
      <Route element={<PrivateRoute requireRole="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />

          <Route path="/admin/events" element={<EventManagement />} />
          <Route path="/admin/events/new" element={<EventForm />} />
          <Route path="/admin/events/:id/edit" element={<EventForm />} />

          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/users/:id" element={<UserDetail />} />
          <Route path="/admin/home-content" element={<HomeContent />} />
          <Route path="/admin/reports" element={<Reports />} />
        </Route>
      </Route>

      {/* ================= 404 ================= */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
