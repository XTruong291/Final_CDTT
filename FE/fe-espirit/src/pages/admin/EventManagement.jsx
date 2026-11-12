import { useState } from 'react';
import { Search, Plus, Edit2, Eye, EyeOff, Trash2, Filter, X } from 'lucide-react';
import { useEvents } from '../../hooks/useEvents';

// --- SUBCOMPONENT: Event Modal Form ---
const EventModal = ({ isOpen, onClose, onSave, initialData }) => {
  // Local state cho form
  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      category: 'Ngày lễ',
      region: 'Toàn quốc',
      religion: 'Phật giáo',
      content: ''
    }
  );

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose(); // Đóng modal sau khi save
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-[#FAF5EC]">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#2A1610]">
              {initialData ? 'Chỉnh sửa sự kiện' : 'Thêm bài viết mới'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Modal (Form) */}
        <div className="overflow-y-auto p-6 flex-1">
          <form id="event-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tiêu đề bài viết <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm text-gray-800 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
                placeholder="Nhập tiêu đề..."
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Loại bài viết</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
                >
                  <option value="Ngày lễ">Ngày lễ</option>
                  <option value="Cúng giỗ">Cúng giỗ</option>
                  <option value="Văn khấn">Văn khấn</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Vùng miền</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
                >
                  <option value="Bắc">Bắc</option>
                  <option value="Trung">Trung</option>
                  <option value="Nam">Nam</option>
                  <option value="Toàn quốc">Toàn quốc</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tôn giáo</label>
                <select
                  value={formData.religion}
                  onChange={(e) => setFormData({...formData, religion: e.target.value})}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
                >
                  <option value="Phật giáo">Phật giáo</option>
                  <option value="Đạo Mẫu">Đạo Mẫu</option>
                  <option value="Tín ngưỡng dân gian">Tín ngưỡng dân gian</option>
                  <option value="Không phân biệt">Không phân biệt</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Nội dung chi tiết / Đường dẫn giỏ hàng</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={5}
                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm text-gray-800 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
                placeholder="Nhập nội dung bài viết..."
              />
            </div>
          </form>
        </div>

        {/* Footer Modal */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors focus:outline-none"
          >
            Hủy
          </button>
          <button 
            type="submit"
            form="event-form"
            className="rounded-lg bg-[#2A1610] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1A0D09] transition-colors focus:outline-none focus:ring-2 focus:ring-[#CAA46A] focus:ring-offset-1"
          >
            Lưu sự kiện
          </button>
        </div>
        
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function EventManagement() {
  // Dùng Custom Hook thay vì local state cứng
  const { events, addEvent, updateEvent, deleteEvent, toggleVisibility } = useEvents();

  // States cho filters & search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [religionFilter, setReligionFilter] = useState('');
  
  // State quản lý Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Logic Xóa với Confirm
  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này? Thao tác không thể hoàn tác!')) {
      deleteEvent(id);
    }
  };

  // Logic mở Modal Thêm
  const handleOpenAddModal = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  // Logic mở Modal Sửa
  const handleOpenEditModal = (evt) => {
    setEditingEvent(evt);
    setIsModalOpen(true);
  };

  // Logic Lưu Modal (Add hoặc Edit)
  const handleSaveModal = (formData) => {
    if (editingEvent) {
      updateEvent({ ...editingEvent, ...formData });
    } else {
      addEvent(formData);
    }
  };

  // Lọc dữ liệu thật (Real-time filtering)
  const filteredEvents = events.filter(evt => {
    const matchSearch = evt.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter ? evt.category === categoryFilter : true;
    const matchRegion = regionFilter ? evt.region === regionFilter : true;
    const matchReligion = religionFilter ? evt.religion === religionFilter : true;
    return matchSearch && matchCategory && matchRegion && matchReligion;
  });

  return (
    <div className="space-y-6">
      {/* 1. Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2A1610]">Quản lý sự kiện</h1>
          <p className="mt-1 text-sm text-gray-500">Quản lý bài viết, lễ hội, nghi thức tín ngưỡng.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#2A1610] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1A0D09] focus:outline-none focus:ring-2 focus:ring-[#CAA46A] focus:ring-offset-1"
        >
          <Plus size={18} />
          Thêm bài viết mới
        </button>
      </div>

      {/* 2. Filter & Search Section */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2 mb-4 text-[#2A1610] font-medium text-sm">
          <Filter size={18} />
          <span>Bộ lọc & Tìm kiếm</span>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Search Input */}
          <div className="relative md:col-span-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm tiêu đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
            />
          </div>

          {/* Dropdown Phân loại */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
          >
            <option value="">Tất cả phân loại</option>
            <option value="Ngày lễ">Ngày lễ</option>
            <option value="Cúng giỗ">Cúng giỗ</option>
            <option value="Văn khấn">Văn khấn</option>
          </select>

          {/* Dropdown Vùng miền */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
          >
            <option value="">Tất cả vùng miền</option>
            <option value="Bắc">Bắc</option>
            <option value="Trung">Trung</option>
            <option value="Nam">Nam</option>
            <option value="Toàn quốc">Toàn quốc</option>
          </select>

          {/* Dropdown Tôn giáo */}
          <select
            value={religionFilter}
            onChange={(e) => setReligionFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
          >
            <option value="">Tất cả tôn giáo</option>
            <option value="Phật giáo">Phật giáo</option>
            <option value="Đạo Mẫu">Đạo Mẫu</option>
            <option value="Tín ngưỡng dân gian">Tín ngưỡng dân gian</option>
            <option value="Không phân biệt">Không phân biệt</option>
          </select>
        </div>
      </div>

      {/* 3. Data Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 min-w-[800px]">
            <thead className="bg-[#FAF5EC]/60 text-xs font-medium uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">STT</th>
                <th className="px-6 py-4">Tiêu đề</th>
                <th className="px-6 py-4">Phân loại bài viết</th>
                <th className="px-6 py-4">Phân loại vùng miền</th>
                <th className="px-6 py-4">Phân loại tôn giáo</th>
                <th className="px-6 py-4">Ngày đăng bài</th>
                <th className="px-6 py-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-400">
                    Không tìm thấy dữ liệu phù hợp.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt, index) => (
                  <tr key={evt.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4">
                      <p className={`font-medium ${!evt.isVisible && 'text-gray-400 line-through'}`}>
                        {evt.title}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 border border-orange-100">
                        {evt.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">{evt.region}</td>
                    <td className="px-6 py-4">{evt.religion}</td>
                    <td className="px-6 py-4 text-gray-500">{evt.datePosted}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(evt)}
                          title="Chỉnh sửa"
                          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          title={evt.isVisible ? "Ẩn bài viết" : "Hiện bài viết"}
                          onClick={() => toggleVisibility(evt.id)}
                          className={`rounded p-1.5 transition-colors ${
                            evt.isVisible 
                              ? 'text-gray-400 hover:bg-yellow-50 hover:text-yellow-600' 
                              : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                          }`}
                        >
                          {evt.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button 
                          title="Xóa"
                          onClick={() => handleDelete(evt.id)}
                          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Render Modal */}
      <EventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingEvent}
      />
    </div>
  );
}
