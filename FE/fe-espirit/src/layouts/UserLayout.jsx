import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';

// Layout dùng chung cho toàn bộ trang phía người dùng (user).
function UserLayout() {
  return (
    <div className="user-layout">
      <Header />
      <main className="user-layout__content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default UserLayout;
