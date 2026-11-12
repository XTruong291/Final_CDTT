import { useState, useRef } from 'react';
import { Save, Image as ImageIcon, Upload, Plus, Trash2, Type, LayoutTemplate, MapPin, Phone, Mail, Link as LinkIcon, Loader2, CheckCircle2 } from 'lucide-react';
import SelectionModal from './SelectionModal';

// --- SUBCOMPONENTS (Để giữ file gọn gàng và dễ bảo trì) ---

// Section 1: Banner
const BannerSection = ({ banner, onChange }) => {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onChange({ ...banner, imageUrl });
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4">
        <ImageIcon className="text-[#CAA46A]" size={20} />
        <h2 className="font-serif text-lg font-bold text-[#2A1610]">Quản lý Banner (Hero Section)</h2>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Cột Trái: Upload Ảnh */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Hình ảnh Banner</label>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <div 
            onClick={handleUploadClick}
            className="group relative mt-1 flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-[#FAF5EC]/30 transition-colors hover:border-[#CAA46A] hover:bg-[#FAF5EC]/80 overflow-hidden"
          >
            {banner.imageUrl ? (
              <>
                <img src={banner.imageUrl} alt="Banner" className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/30 text-white font-medium">
                  Đổi ảnh khác
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-gray-400 group-hover:text-[#CAA46A]">
                <Upload size={32} className="mb-2" />
                <span className="text-sm font-medium">Tải ảnh lên (Khuyên dùng 1920x1080)</span>
              </div>
            )}
          </div>
        </div>

        {/* Cột Phải: Text Content */}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tiêu đề Banner</label>
            <input
              type="text"
              value={banner.title}
              onChange={(e) => onChange({ ...banner, title: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
              placeholder="VD: Khám phá văn hoá tâm linh Việt Nam..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Mô tả ngắn</label>
            <textarea
              value={banner.description}
              onChange={(e) => onChange({ ...banner, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
              placeholder="Nhập mô tả ngắn hiển thị dưới tiêu đề banner..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Section 2: Bài viết nổi bật
const FeaturedArticlesSection = ({ articles, onRemove, onOpenModal }) => {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <Type className="text-[#CAA46A]" size={20} />
          <h2 className="font-serif text-lg font-bold text-[#2A1610]">Bài viết nổi bật</h2>
        </div>
        <button 
          onClick={onOpenModal}
          className="flex items-center gap-2 rounded-lg bg-[#FAF5EC] px-3 py-1.5 text-sm font-medium text-[#2A1610] transition-colors hover:bg-[#CAA46A]/20"
        >
          <Plus size={16} /> Chọn bài viết
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <div key={article.id} className="group relative flex flex-col justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:border-[#CAA46A]/50 hover:shadow-md">
            <div>
              <span className="mb-2 inline-block rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-700">
                {article.category}
              </span>
              <h3 className="mb-1 font-medium text-gray-900 line-clamp-2">{article.title}</h3>
              <p className="text-xs text-gray-500">{article.date}</p>
            </div>
            <button 
              onClick={() => onRemove(article.id)}
              className="absolute right-3 top-3 rounded-full bg-white p-1.5 text-gray-400 opacity-0 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
              title="Gỡ khỏi danh sách nổi bật"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Section 3: Đề xuất hàng hóa
const ProductRecommendationsSection = ({ products, holiday, onHolidayChange, onRemove, onOpenModal }) => {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      <div className="mb-5 flex flex-col gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="text-[#CAA46A]" size={20} />
          <h2 className="font-serif text-lg font-bold text-[#2A1610]">Đề xuất mâm lễ / Hàng hóa</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">Dịp lễ sắp tới:</label>
          <select 
            value={holiday}
            onChange={(e) => onHolidayChange(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-[#2A1610] focus:border-[#CAA46A] focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
          >
            <option value="Rằm tháng 7">Rằm tháng 7 (Vu Lan)</option>
            <option value="Tết Trung Thu">Tết Trung Thu</option>
            <option value="Mùng 1">Mùng 1 đầu tháng</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
            <div className="h-32 w-full bg-[#FAF5EC]/50 flex items-center justify-center">
              {/* Giả lập ảnh sản phẩm */}
              <ImageIcon className="text-[#CAA46A]/30" size={32} />
            </div>
            <div className="p-3">
              <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
              <p className="mt-1 text-sm font-semibold text-[#2A1610]">{product.price}</p>
            </div>
            <button 
              onClick={() => onRemove(product.id)}
              className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-gray-400 opacity-0 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
              title="Gỡ khỏi danh sách"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        
        <button 
          onClick={onOpenModal}
          className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 text-gray-500 transition-colors hover:border-[#CAA46A] hover:bg-[#FAF5EC]/30 hover:text-[#2A1610]"
        >
          <Plus size={24} />
          <span className="text-sm font-medium">Thêm mâm lễ</span>
        </button>
      </div>
    </div>
  );
};

// Section 4: Footer
const FooterSection = ({ footer, onChange }) => (
  <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
    <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4">
      <MapPin className="text-[#CAA46A]" size={20} />
      <h2 className="font-serif text-lg font-bold text-[#2A1610]">Nội dung Footer (Liên hệ)</h2>
    </div>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Phone size={14} className="text-gray-400"/> Số điện thoại hỗ trợ
          </label>
          <input
            type="text"
            value={footer.phone}
            onChange={(e) => onChange({ ...footer, phone: e.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
          />
        </div>
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Mail size={14} className="text-gray-400"/> Email liên hệ
          </label>
          <input
            type="email"
            value={footer.email}
            onChange={(e) => onChange({ ...footer, email: e.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
          />
        </div>
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <LinkIcon size={14} className="text-gray-400"/> Link Fanpage Facebook
          </label>
          <input
            type="text"
            value={footer.facebook}
            onChange={(e) => onChange({ ...footer, facebook: e.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
            placeholder="https://facebook.com/..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Địa chỉ Văn phòng</label>
          <input
            type="text"
            value={footer.address}
            onChange={(e) => onChange({ ...footer, address: e.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Mô tả ngắn gọn về E-SPIRIT</label>
          <textarea
            value={footer.description}
            onChange={(e) => onChange({ ...footer, description: e.target.value })}
            rows={4}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-[#CAA46A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CAA46A]"
          />
        </div>
      </div>
    </div>
  </div>
);


// --- MAIN COMPONENT ---
export default function HomeContentManagement() {
  // 1. Centralized State
  const [homeConfig, setHomeConfig] = useState({
    banner: {
      title: 'Gìn giữ giá trị văn hoá Việt',
      description: 'Nền tảng kết nối tâm linh và bảo tồn các di sản tín ngưỡng truyền thống.',
      imageUrl: '' 
    },
    featuredArticles: [],
    holidayEvent: 'Rằm tháng 7',
    recommendedProducts: [],
    footer: {
      phone: '1900 1234',
      email: 'support@e-spirit.vn',
      facebook: 'https://facebook.com/espirit.vn',
      address: '123 Đường Văn Hoá, Quận 1, TP. HCM',
      description: 'E-SPIRIT - Nền tảng công nghệ tâm linh tiên phong tại Việt Nam, mang đến trải nghiệm tín ngưỡng chuẩn mực, hiện đại nhưng vẫn giữ gìn bản sắc truyền thống.'
    }
  });

  // Action States
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // Modal States
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'article' }); // type: 'article' | 'product'

  // Update Handlers
  const handleUpdateConfig = (key, value) => {
    setHomeConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleRemoveArticle = (id) => {
    setHomeConfig(prev => ({
      ...prev,
      featuredArticles: prev.featuredArticles.filter(art => art.id !== id)
    }));
  };

  const handleRemoveProduct = (id) => {
    setHomeConfig(prev => ({
      ...prev,
      recommendedProducts: prev.recommendedProducts.filter(prod => prod.id !== id)
    }));
  };

  const handleConfirmSelection = (selectedItems) => {
    if (modalConfig.type === 'article') {
      setHomeConfig(prev => ({
        ...prev,
        featuredArticles: [...prev.featuredArticles, ...selectedItems]
      }));
    } else {
      setHomeConfig(prev => ({
        ...prev,
        recommendedProducts: [...prev.recommendedProducts, ...selectedItems]
      }));
    }
  };

  // Nút Lưu thay đổi
  const handleSaveAll = () => {
    setIsSaving(true);
    // Giả lập gọi API 1.5s
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      // Ẩn toast sau 3s
      setTimeout(() => setShowToast(false), 3000);
    }, 1500);
  };

  return (
    <div className="relative pb-24">
      {/* Toast Notification */}
      <div className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-xl bg-emerald-50 px-5 py-3 text-emerald-800 shadow-lg border border-emerald-200 transition-all duration-300 ${showToast ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <CheckCircle2 size={20} className="text-emerald-500" />
        <span className="text-sm font-medium">Đã cập nhật giao diện Trang chủ thành công!</span>
      </div>

      {/* Top Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2A1610]">Quản lý nội dung trang chủ</h1>
          <p className="mt-1 text-sm text-gray-500">Tùy chỉnh các khu vực hiển thị (Banner, Bài viết, Hàng hóa, Footer) cho End-User.</p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        <BannerSection 
          banner={homeConfig.banner} 
          onChange={(newBanner) => handleUpdateConfig('banner', newBanner)} 
        />
        
        <FeaturedArticlesSection 
          articles={homeConfig.featuredArticles} 
          onRemove={handleRemoveArticle} 
          onOpenModal={() => setModalConfig({ isOpen: true, type: 'article' })}
        />
        
        <ProductRecommendationsSection 
          products={homeConfig.recommendedProducts} 
          holiday={homeConfig.holidayEvent}
          onHolidayChange={(newHoliday) => handleUpdateConfig('holidayEvent', newHoliday)}
          onRemove={handleRemoveProduct} 
          onOpenModal={() => setModalConfig({ isOpen: true, type: 'product' })}
        />
        
        <FooterSection 
          footer={homeConfig.footer} 
          onChange={(newFooter) => handleUpdateConfig('footer', newFooter)} 
        />
      </div>

      {/* Sticky Save Button (Gắn cố định phía dưới màn hình) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/90 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] backdrop-blur-md md:left-64">
        <div className="mx-auto flex max-w-7xl justify-end px-4">
          <button 
            onClick={handleSaveAll}
            disabled={isSaving}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#CAA46A] focus:ring-offset-2 ${
              isSaving 
                ? 'bg-[#1A0D09] opacity-80 cursor-wait' 
                : 'bg-[#2A1610] hover:bg-[#1A0D09] hover:shadow-lg'
            }`}
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
          </button>
        </div>
      </div>

      {/* Modal Chọn Item */}
      <SelectionModal 
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        existingItems={modalConfig.type === 'article' ? homeConfig.featuredArticles : homeConfig.recommendedProducts}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={handleConfirmSelection}
      />
    </div>
  );
}
